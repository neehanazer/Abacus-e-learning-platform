import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";

export const dynamic = "force-dynamic";

/**
 * GET /api/exams/final
 * Retrieves the final certification exam for the student's current enrolled level only.
 * Future or other levels are strictly prohibited.
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    let studentLevel = 1;
    if (student) {
      if (typeof (student as any).currentLevel === "number" && (student as any).currentLevel >= 1) {
        studentLevel = (student as any).currentLevel;
      } else {
        const match = String((student as any).selectedLevel || (student as any).abacusLevel || "").match(/Level\s*(\d+)/i);
        studentLevel = match ? parseInt(match[1], 10) : 1;
      }
    }

    const requestedLevel = searchParams.get("level");
    if (requestedLevel) {
      const parsedLevel = parseInt(requestedLevel, 10);
      if (!isNaN(parsedLevel) && parsedLevel !== studentLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Access denied: Final Certification Exam is restricted to your current enrolled level (Level ${studentLevel}). You cannot access Level ${parsedLevel} final exams.`,
            data: [],
          },
          { status: 403 }
        );
      }
    }

    const finalExams = await ExamService.getFinalExams(targetStudentId, studentLevel);

    return NextResponse.json(
      {
        success: true,
        count: finalExams.length,
        data: finalExams,
        currentLevel: studentLevel,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/exams/final Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
