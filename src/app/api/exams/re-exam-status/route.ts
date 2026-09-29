import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

/**
 * GET /api/exams/re-exam-status
 * Checks the re-examination eligibility and 24-hour cooldown timer for a student on an exam.
 * Preserves and returns complete attempt history.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const examId = searchParams.get("examId") || undefined;
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const statusData = await ExamService.getReExamStatus(examId, targetStudentId);

    return NextResponse.json(
      {
        success: true,
        data: statusData,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/exams/re-exam-status Error]:", error);

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
