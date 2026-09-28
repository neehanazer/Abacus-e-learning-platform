import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import PerformanceService from "@/services/performanceService";

export const dynamic = "force-dynamic";

/**
 * GET /api/performance/weak-areas
 * Diagnoses areas where the student is struggling based on practice & homework error rates:
 * - problematic topics
 * - common calculation formulas causing mistakes
 * - priority ranking (high, medium, low)
 * - targeted actionable recommendations
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const priorityFilter = searchParams.get("priority"); // "high" | "medium" | "low"

    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    let weakAreas = await PerformanceService.getWeakAreas(targetStudentId);

    if (priorityFilter && ["high", "medium", "low"].includes(priorityFilter)) {
      weakAreas = weakAreas.filter((w) => w.priority === priorityFilter);
    }

    const highPriorityCount = weakAreas.filter((w) => w.priority === "high").length;

    return NextResponse.json(
      {
        success: true,
        count: weakAreas.length,
        hasCriticalWeakAreas: highPriorityCount > 0,
        highPriorityCount,
        data: weakAreas,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/performance/weak-areas Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
