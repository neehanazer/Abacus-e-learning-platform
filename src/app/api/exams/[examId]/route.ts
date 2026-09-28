import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ examId: string }>;
}

/**
 * GET /api/exams/[examId]
 * Retrieves exam details and questions.
 * If the exam is a 'final' exam, it checks student readiness using PerformanceService.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { examId } = await params;

    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const exam = await ExamService.getExamById(examId, targetStudentId);

    return NextResponse.json(
      {
        success: true,
        data: exam,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/exams/[examId] Error]:", error);

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
