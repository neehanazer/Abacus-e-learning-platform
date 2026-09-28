import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

/**
 * GET /api/exams/mock
 * Retrieves all active mock exams with student attempt status, best score, and latest performance.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const mockExams = await ExamService.getMockExams(targetStudentId);

    return NextResponse.json(
      {
        success: true,
        count: mockExams.length,
        data: mockExams,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/exams/mock Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
