import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import { Certificate, Student, Level, Exam } from "@/models";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const levelFilter = searchParams.get("level")?.trim();
    const statusFilter = searchParams.get("status")?.trim();
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    if (dateFrom || dateTo) {
      query.issueDate = {};
      if (dateFrom) query.issueDate.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.issueDate.$lte = endDate;
      }
    }

    if (levelFilter && levelFilter !== "all") {
      if (mongoose.Types.ObjectId.isValid(levelFilter)) {
        query.levelId = new mongoose.Types.ObjectId(levelFilter);
      } else {
        const lvl = await Level.findOne({ levelName: new RegExp(levelFilter, "i") });
        if (lvl) query.levelId = lvl._id;
      }
    }

    if (search) {
      query.$or = [
        { studentName: new RegExp(search, "i") },
        { certificateId: new RegExp(search, "i") },
        { verificationCode: new RegExp(search, "i") },
      ];
    }

    const total = await Certificate.countDocuments(query);
    const certificates = await Certificate.find(query)
      .populate("studentId", "name email phone")
      .populate("levelId", "levelName order")
      .populate("examId", "title type totalMarks")
      .sort({ issueDate: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedList = certificates.map((cert: any) => {
      const student = cert.studentId || {};
      const level = cert.levelId || {};
      const exam = cert.examId || {};

      return {
        id: String(cert._id),
        certificateId: cert.certificateId,
        verificationCode: cert.verificationCode,
        student: cert.studentName || student.name || "Student",
        studentName: cert.studentName || student.name || "Student",
        studentEmail: student.email || "",
        studentId: student._id ? String(student._id) : String(cert.studentId),
        level: level.levelName || "Level 1",
        levelId: level._id ? String(level._id) : String(cert.levelId),
        exam: exam.title || "Final Level Exam",
        examId: exam._id ? String(exam._id) : String(cert.examId),
        score: cert.score,
        grade: cert.grade,
        issueDate: cert.issueDate ? new Date(cert.issueDate).toISOString() : new Date().toISOString(),
        status: cert.status || "issued",
      };
    });

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      certificates: formattedList,
    });
  } catch (error: unknown) {
    console.error("[Admin Certificates Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load certificates.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
