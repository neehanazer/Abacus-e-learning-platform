import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import Student from "@/models/Student";
import Certificate from "@/models/Certificate";
import {
  calculateStudentProgress,
  getStudentExamHistory,
} from "@/services/adminStudentService";

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

    // Calculate dynamic level progress and metrics
    const progressSummary = await calculateStudentProgress(
      student._id,
      student.selectedLevel
    );

    // Get exam history
    const examHistory = await getStudentExamHistory(student._id);

    // Get student certificates
    const certificates = await Certificate.find({ studentId: student._id })
      .populate("levelId", "levelName order")
      .populate("examId", "title type totalMarks")
      .sort({ issueDate: -1 })
      .lean();

    const formattedCertificates = certificates.map((c: any) => ({
      id: String(c._id),
      certificateId: c.certificateId,
      verificationCode: c.verificationCode,
      levelId: c.levelId ? String(c.levelId._id || c.levelId) : "",
      levelName: c.levelId?.levelName || "Level 1",
      levelOrder: c.levelId?.order || 1,
      examId: c.examId ? String(c.examId._id || c.examId) : "",
      examTitle: c.examId?.title || "Level 1: Official Level Certification Final Exam",
      score: c.score,
      totalMarks: c.totalMarks || 100,
      percentage: c.percentage || Math.round((c.score / (c.totalMarks || 100)) * 100),
      grade: c.grade || "A+ (Distinction)",
      issueDate: c.issueDate ? new Date(c.issueDate).toISOString() : new Date().toISOString(),
      status: c.status || "issued",
    }));

    // Format response matching complete specification
    const responseData = {
      personalInformation: {
        id: String(student._id),
        name: student.name,
        email: student.email,
        phone: student.phone || "Not provided",
        dateJoined: student.createdAt
          ? new Date(student.createdAt).toISOString()
          : new Date().toISOString(),
        age: student.age || 8,
        guardianName: student.guardianName || "Not specified",
        guardianPhone: student.guardianPhone || "Not specified",
        guardianInformation: {
          name: student.guardianName || "Not specified",
          phone: student.guardianPhone || "Not specified",
        },
        accountStatus: student.accountStatus || "active",
        avatar: student.avatar || "🧙‍♂️",
      },
      learningInformation: {
        selectedLevel: student.selectedLevel || "Level 1",
        currentLevel: progressSummary.currentLevel,
        completedLevels: progressSummary.completedLevels,
        levelCompletionDates: progressSummary.levelProgress
          .filter((lp) => lp.status === "Completed" && lp.completionDate)
          .map((lp) => ({
            level: lp.levelName,
            completedDate: lp.completionDate,
          })),
        lessonsCompleted: progressSummary.lessonsCompleted,
        videosWatched: progressSummary.videosWatched,
        practiceAttempts: progressSummary.practiceAttempts,
        homeworkStatus: progressSummary.homeworkSummary,
      },
      levelProgress: progressSummary.levelProgress,
      certificates: formattedCertificates,
      examInformation: {
        examsAttended: examHistory.length,
        examsPassed: examHistory.filter((a) => a.isPassed).length,
        examsFailed: examHistory.filter((a) => a.status !== "in_progress" && !a.isPassed).length,
        attempts: examHistory,
      },
    };

    return NextResponse.json({
      success: true,
      student: responseData,
    });
  } catch (error: unknown) {
    console.error("[Admin Student Details Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load student details.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
