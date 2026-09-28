import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{ examId: string }>;
}

/**
 * POST /api/exams/[examId]/start
 * Initiates an exam attempt for the authenticated student.
 * If the exam is a 'final' exam, strictly verifies readiness criteria before allowing the attempt to start.
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { examId } = await params;

    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const startData = await ExamService.startExam(examId, targetStudentId);

    return NextResponse.json(
      {
        success: true,
        message: "Exam session started successfully",
        data: startData,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[POST /api/exams/[examId]/start Error]:", error);

    const isReadinessError = errorMsg.toLowerCase().includes("readiness");
    const status = isReadinessError ? 403 : errorMsg.includes("not found") ? 404 : 500;

    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status }
    );
  }
}
