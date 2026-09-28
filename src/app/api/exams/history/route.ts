import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

/**
 * GET /api/exams/history
 * Retrieves chronological attempt history across mock and final exams for the authenticated student.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const history = await ExamService.getExamHistory(targetStudentId);

    return NextResponse.json(
      {
        success: true,
        count: history.length,
        data: history,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/exams/history Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
