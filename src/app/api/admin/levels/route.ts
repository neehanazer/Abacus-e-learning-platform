import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import { Level, Lesson, Student } from "@/models";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const levels = await Level.find().sort({ order: 1 }).lean();

    const levelsWithCounts = await Promise.all(
      levels.map(async (lvl) => {
        const lessonCount = await Lesson.countDocuments({ levelId: lvl._id });
        const studentCount = await Student.countDocuments({
          $or: [
            { selectedLevel: new RegExp(lvl.levelName, "i") },
            { abacusLevel: new RegExp(lvl.levelName, "i") },
          ],
        });

        return {
          id: String(lvl._id),
          levelName: lvl.levelName,
          order: lvl.order,
          description: lvl.description || "",
          status: lvl.status,
          totalLessons: lessonCount,
          totalEnrolledStudents: studentCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      levels: levelsWithCounts,
    });
  } catch (error: unknown) {
    console.error("[Admin Levels Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load levels.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
