import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ examId: string }>;
}

/**
 * POST /api/exams/[examId]/re-enroll
 * Allows a student who failed an exam to re-enroll after the 24-hour cooldown period.
 * Preserves the failed attempt and complete exam history, creating a new exam attempt.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { examId } = await params;

    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const reEnrollData = await ExamService.reEnrollExam(examId, targetStudentId);

    return NextResponse.json(
      {
        success: true,
        message: "Successfully re-enrolled for re-examination",
        data: reEnrollData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[POST /api/exams/[examId]/re-enroll Error]:", error);

    const isCooldown = errorMsg.toLowerCase().includes("cooldown");
    const status = isCooldown ? 403 : errorMsg.includes("not found") ? 404 : 400;

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status }
    );
  }
}
