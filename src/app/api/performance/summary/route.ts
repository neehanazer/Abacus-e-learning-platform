import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import PerformanceService from "@/services/performanceService";

export const dynamic = "force-dynamic";

/**
 * GET /api/performance/summary
 * Retrieves aggregated performance summary across Practice and Homework attempts:
 * - total questions, correct, incorrect
 * - accuracy
 * - average score, best score
 * - average response time
 * - strong topics count, weak topics count
 * - recent improvement trend
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    // Use authenticated student or check query parameter for dev inspection
    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");

    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    const summary = await PerformanceService.getSummary(targetStudentId);

    return NextResponse.json(
      {
        success: true,
        data: summary,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/performance/summary Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
