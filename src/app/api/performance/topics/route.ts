import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import PerformanceService from "@/services/performanceService";

export const dynamic = "force-dynamic";

/**
 * GET /api/performance/topics
 * Retrieves topic-wise performance breakdown across Practice and Homework attempts:
 * - accuracy per topic
 * - total attempts & questions per topic
 * - average response time per question
 * - classification: strong, moderate, weak
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const statusFilter = searchParams.get("status"); // "strong" | "moderate" | "weak"

    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    let topics = await PerformanceService.getTopicWisePerformance(targetStudentId);

    if (statusFilter && ["strong", "moderate", "weak"].includes(statusFilter)) {
      topics = topics.filter((t) => t.status === statusFilter);
    }

    const strongCount = topics.filter((t) => t.status === "strong").length;
    const moderateCount = topics.filter((t) => t.status === "moderate").length;
    const weakCount = topics.filter((t) => t.status === "weak").length;

    return NextResponse.json(
      {
        success: true,
        count: topics.length,
        summary: {
          strongTopics: strongCount,
          moderateTopics: moderateCount,
          weakTopics: weakCount,
        },
        data: topics,
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/performance/topics Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
