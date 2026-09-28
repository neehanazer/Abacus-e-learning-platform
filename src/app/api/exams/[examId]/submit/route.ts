import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ examId: string }>;
}

/**
 * POST /api/exams/[examId]/submit
 * Submits student's answers for evaluation.
 * Calculates score, percentage, correct/incorrect, time taken, pass/fail,
 * stores the attempt in ExamAttempts and every answer in ExamAnswers.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { examId } = await params;

    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const body = await req.json().catch(() => ({}));
    const { attemptId, timeTaken = 0, answers = [] } = body;

    const result = await ExamService.submitExam(examId, targetStudentId, {
      attemptId,
      timeTaken,
      answers,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Exam submitted and evaluated successfully",
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[POST /api/exams/[examId]/submit Error]:", error);

    const status = errorMsg.includes("not found") ? 404 : 500;
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status }
    );
  }
}
