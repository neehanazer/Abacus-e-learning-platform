import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import PerformanceService from "@/services/performanceService";
import AIEvaluationService from "@/services/aiEvaluationService";
import Student from "@/models/Student";
import mongoose from "mongoose";

export const dynamic = "force-dynamic";

/**
 * GET /api/performance/readiness
 * Evaluates student readiness to advance to the next level/stage and provides
 * AI-assisted (or rule-based fallback) evaluation feedback.
 *
 * Query params (optional):
 * - studentId: string (for teacher/admin or dev inspection)
 * - refresh: boolean (if true, forces generation of a fresh evaluation)
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const { searchParams } = new URL(req.url);
    const queryStudentId = searchParams.get("studentId");
    const forceFresh = searchParams.get("refresh") === "true";

    const targetStudentId = student?._id ? student._id.toString() : queryStudentId || "std_demo_101";

    // 1. Get readiness metrics from PerformanceService
    const readinessData = await PerformanceService.getReadiness(targetStudentId);

    // 2. Generate or retrieve AI evaluation from AIEvaluationService
    const aiEvaluation = await AIEvaluationService.evaluateStudentPerformance({
      studentId: targetStudentId,
      forceFresh,
      saveToDb: true,
    });

    // 3. Resolve student current level name
    let currentLevel = "Level 1: Basic Foundations & Friend Rules";
    let recommendedNextLevel = "Level 2: Big Friends & Multi-Row Calculations";

    if (mongoose.Types.ObjectId.isValid(targetStudentId)) {
      try {
        const studentDoc = await Student.findById(targetStudentId).select("selectedLevel abacusLevel").lean();
        if (studentDoc) {
          currentLevel = (studentDoc as any).selectedLevel || (studentDoc as any).abacusLevel || currentLevel;
        }
      } catch {
        // fallback
      }
    }

    if (currentLevel.includes("Level 2")) {
      recommendedNextLevel = "Level 3: Combinations & Rapid Mental Addition";
    } else if (currentLevel.includes("Level 3")) {
      recommendedNextLevel = "Level 4: Advanced Multiplication & Division";
    }

    return NextResponse.json(
      {
        success: true,
        data: {
          readinessScore: readinessData.readinessScore,
          readinessStatus: readinessData.readinessStatus,
          currentLevel,
          recommendedNextLevel,
          criteria: readinessData.criteria,
          aiEvaluation,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/performance/readiness Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
