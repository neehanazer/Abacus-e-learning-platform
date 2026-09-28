import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ examId: string }>;
}

/**
 * GET /api/exams/[examId]/result
 * Retrieves the evaluated exam result for the student.
 * Optional query parameter: ?attemptId=...
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { examId } = await params;

    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const attemptId = searchParams.get("attemptId") || undefined;
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const result = await ExamService.getExamResult(examId, targetStudentId, attemptId);

    return NextResponse.json(
      {
        success: true,
        data: result,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/exams/[examId]/result Error]:", error);

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
