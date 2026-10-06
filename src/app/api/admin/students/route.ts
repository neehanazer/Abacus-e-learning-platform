import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import Student from "@/models/Student";
import { calculateStudentProgress } from "@/services/adminStudentService";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const level = searchParams.get("level")?.trim();
    const status = searchParams.get("status")?.trim();
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    // Build Mongo query
    const query: Record<string, any> = {};

    // Search by name, email, or phone
    if (search) {
      const searchRegex = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      query.$or = [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
      ];
    }

    // Filter by selected level
    if (level && level !== "all") {
      query.selectedLevel = new RegExp(level.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    // Filter by status
    if (status && status !== "all") {
      query.accountStatus = status;
    }

    // Filter by registration date range
    if (dateFrom || dateTo) {
      query.createdAt = {};
      if (dateFrom) {
        query.createdAt.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        // End of the day for dateTo
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.createdAt.$lte = endDate;
      }
    }

    const total = await Student.countDocuments(query);
    const students = await Student.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Map students with dynamic progress metrics
    const studentList = await Promise.all(
      students.map(async (st: any) => {
        let currentLevel = st.selectedLevel || "Level 1";
        let completedLevels: string[] = [];

        try {
          const progress = await calculateStudentProgress(st._id, st.selectedLevel);
          currentLevel = progress.currentLevel;
          completedLevels = progress.completedLevels;
        } catch {
          // Fallback if calculation encounters missing reference
        }

        return {
          id: String(st._id),
          studentId: String(st._id),
          name: st.name,
          email: st.email,
          phone: st.phone || "Not provided",
          dateJoined: st.createdAt ? new Date(st.createdAt).toISOString() : new Date().toISOString(),
          selectedLevel: st.selectedLevel || "Level 1 - Direct Addition & Subtraction",
          currentLevel,
          completedLevels,
          accountStatus: st.accountStatus || "active",
          age: st.age || 8,
          avatar: st.avatar || "🧙‍♂️",
        };
      })
    );

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      students: studentList,
    });
  } catch (error: unknown) {
    console.error("[Admin Students Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to retrieve students.";
    const isDbConnectionIssue =
      message.includes("alert number 80") ||
      message.includes("SSL routines") ||
      message.includes("whitelisted") ||
      message.includes("ECONNREFUSED") ||
      message.includes("MongooseServerSelectionError") ||
      message.includes("MongoNetworkError");

    if (isDbConnectionIssue) {
      return NextResponse.json({
        success: true,
        databaseConnected: false,
        warning: "MongoDB Atlas is currently unreachable (check IP whitelist in Atlas Network Access).",
        total: 0,
        page: 1,
        limit: 20,
        totalPages: 0,
        students: [],
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
