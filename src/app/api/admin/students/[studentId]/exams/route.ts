import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import Student from "@/models/Student";
import { getStudentExamHistory } from "@/services/adminStudentService";

interface RouteParams {
  params: Promise<{ studentId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { studentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID format.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found.",
        },
        { status: 404 }
      );
    }

    const examHistory = await getStudentExamHistory(student._id);

    return NextResponse.json({
      success: true,
      studentName: student.name,
      studentEmail: student.email,
      totalExams: examHistory.length,
      exams: examHistory,
    });
  } catch (error: unknown) {
    console.error("[Admin Student Exam History Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load exam history.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
