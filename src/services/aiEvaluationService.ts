import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Evaluation, { IEvaluation, EvaluationProvider } from "@/models/Evaluation";
import PerformanceService from "./performanceService";
import { IPerformanceSummary, ITopicPerformance, IWeakArea, IAIEvaluationResult } from "@/types";

export interface GenerateEvaluationOptions {
  studentId: string;
  forceFresh?: boolean;
  saveToDb?: boolean;
}

/**
 * AI Evaluation Service Layer
 * Connects to external AI (e.g. Gemini) when configured, or transparently falls back
 * to a pedagogically rigorous rule-based evaluation engine.
 *
 * NOTE: Never falsely labels simple calculations as AI.
 * If no external AI provider is configured, provider is explicitly marked "rule_based_fallback".
 */
export class AIEvaluationService {
  /**
   * Generates or retrieves evaluation for a student.
   */
  static async evaluateStudentPerformance(
    options: GenerateEvaluationOptions
  ): Promise<IAIEvaluationResult> {
    const { studentId, forceFresh = false, saveToDb = true } = options;

    try {
      await connectToDatabase();
    } catch (connErr) {
      // Offline fallback
    }

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;

    // Check if an evaluation was performed recently (within the last 2 hours) unless forceFresh is requested
    if (!forceFresh && studentObjectId && mongoose.connection?.readyState === 1) {
      try {
        const recentEvaluation = await Evaluation.findOne({
          studentId: studentObjectId,
          evaluationType: "performance",
        })
          .sort({ createdAt: -1 })
          .lean();

        if (recentEvaluation) {
          const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
          if (new Date(recentEvaluation.createdAt) > twoHoursAgo) {
            return this.formatEvaluationResult(recentEvaluation as any);
          }
        }
      } catch (findErr) {
        console.warn("[AIEvaluationService]: Could not retrieve recent evaluation from DB:", findErr);
      }
    }

    // 1. Gather comprehensive student performance metrics from PerformanceService
    const [summary, topics, weakAreas, readiness] = await Promise.all([
      PerformanceService.getSummary(studentId),
      PerformanceService.getTopicWisePerformance(studentId),
      PerformanceService.getWeakAreas(studentId),
      PerformanceService.getReadiness(studentId),
    ]);

    // 2. Check if a real AI Provider API key is configured
    const geminiApiKey = process.env.GEMINI_API_KEY || process.env.AI_PROVIDER_API_KEY;

    let evalResult: IAIEvaluationResult;

    if (geminiApiKey && geminiApiKey.trim() !== "") {
      try {
        evalResult = await this.callGeminiEvaluation({
          apiKey: geminiApiKey,
          summary,
          topics,
          weakAreas,
          readiness,
        });
      } catch (aiErr) {
        console.warn("[AIEvaluationService]: AI Provider call failed, falling back to rule-based engine:", aiErr);
        evalResult = this.generateRuleBasedEvaluation(summary, topics, weakAreas, readiness);
      }
    } else {
      // Clean, separated rule-based fallback
      evalResult = this.generateRuleBasedEvaluation(summary, topics, weakAreas, readiness);
    }

    // 3. Store evaluation result in MongoDB if requested and student ID is valid
    if (saveToDb && studentObjectId && mongoose.connection?.readyState === 1) {
      try {
        const savedDoc = await Evaluation.create({
          studentId: studentObjectId,
          evaluationType: "performance",
          strengths: evalResult.strengths,
          weakAreas: evalResult.weakAreas,
          recommendedPractice: evalResult.recommendedPractice,
          accuracyImprovement: evalResult.accuracyImprovement,
          speedImprovement: evalResult.speedImprovement,
          readiness: {
            score: readiness.readinessScore,
            status: readiness.readinessStatus,
            summary: evalResult.readinessFeedback,
          },
          overallFeedback: evalResult.overallFeedback,
          provider: evalResult.provider,
          modelName: evalResult.isAIRated ? "gemini-1.5-flash" : "heuristic-v1",
          metricsSnapshot: {
            totalQuestions: summary.totalQuestions,
            correctAnswers: summary.correctAnswers,
            accuracy: summary.accuracy,
            avgTimePerQuestion: summary.averageResponseTime,
            totalAttempts: summary.totalAttempts,
            strongTopicsCount: summary.strongTopicsCount,
            weakTopicsCount: summary.weakTopicsCount,
          },
        });

        evalResult.evaluationId = savedDoc._id.toString();
      } catch (saveErr) {
        console.warn("[AIEvaluationService]: Failed to save evaluation record to MongoDB:", saveErr);
      }
    }

    return evalResult;
  }

  /**
   * Rule-Based Evaluation Engine (Fallback when no AI API is configured).
   * Generates authentic, constructive abacus feedback without falsely claiming to be an LLM.
   */
  static generateRuleBasedEvaluation(
    summary: IPerformanceSummary,
    topics: ITopicPerformance[],
    weakAreas: IWeakArea[],
    readiness: { readinessScore: number; readinessStatus: string }
  ): IAIEvaluationResult {
    const strengths: string[] = [];
    const weakList: string[] = [];
    const recommendedPractice: IAIEvaluationResult["recommendedPractice"] = [];

    // Analyze Strengths
    const strongTopics = topics.filter((t) => t.status === "strong");
    if (strongTopics.length > 0) {
      for (const st of strongTopics.slice(0, 3)) {
        strengths.push(
          `High accuracy (${st.accuracy}%) in ${st.topicName} with consistent finger movement on unit rods.`
        );
      }
    } else if (summary.accuracy >= 70) {
      strengths.push("Good foundational grasp of bead manipulation across initial practice sets.");
    } else {
      strengths.push("Developing active familiarity with the soroban abacus frame and single-digit representations.");
    }

    if (summary.averageResponseTime > 0 && summary.averageResponseTime <= 6) {
      strengths.push(`Fast calculation tempo (${summary.averageResponseTime}s/problem), indicating strong number-to-bead reflex.`);
    }

    // Analyze Weak Areas
    if (weakAreas.length > 0) {
      for (const wa of weakAreas.slice(0, 3)) {
        const formulas = wa.commonFormulas.length > 0 ? ` (${wa.commonFormulas.join(", ")})` : "";
        weakList.push(
          `Struggles with ${wa.topicName}${formulas}. Error rate: ${wa.errorRate}%.`
        );

        recommendedPractice.push({
          topicId: wa.topicId,
          title: `Drill: ${wa.topicName}`,
          category: wa.category,
          reason: wa.recommendedAction,
          type: wa.suggestedLessonId ? "lesson" : "practice",
          link: wa.suggestedLessonId ? `/learning?lesson=${wa.suggestedLessonId}` : `/learning/practice`,
        });
      }
    } else if (summary.accuracy < 80 && summary.totalAttempts > 0) {
      weakList.push("Minor bead miscounts during multi-row arithmetic transitions.");
    } else if (summary.totalAttempts === 0) {
      weakList.push("Insufficient practice data logged yet. Complete Level 1 lessons and practice sets.");
    }

    // Accuracy Guidance
    let accuracyImprovement = "Review the upper deck 5-bead position before pushing earth beads to avoid accidental miscounts.";
    if (summary.accuracy >= 90) {
      accuracyImprovement = "Excellent precision! Continue focusing on zero-clearing after each calculation.";
    } else if (summary.accuracy >= 75) {
      accuracyImprovement = "Double check multi-operation sequences. Ensure you clear the beam completely before starting each new sum.";
    } else if (summary.accuracy > 0) {
      accuracyImprovement = "Slow down bead movement slightly and verify the unit rod total with your index finger before entering your answer.";
    }

    // Speed Guidance
    let speedImprovement = "Practice 2-minute timed speed sprints on single-digit direct addition to sharpen finger dexterity.";
    if (summary.averageResponseTime > 10) {
      speedImprovement = "Current pace is deliberate. Use the simultaneous thumb-up and index-down finger pinch to speed up bead placement.";
    } else if (summary.averageResponseTime <= 5 && summary.averageResponseTime > 0) {
      speedImprovement = "Speed is exceptional! Maintain this rhythm while keeping bead placement deliberate and crisp.";
    }

    // Readiness Feedback
    let readinessFeedback = "Complete at least 5 practice and homework worksheets to generate a reliable readiness assessment.";
    if (readiness.readinessStatus === "ready") {
      readinessFeedback = `Ready to advance! The student has achieved ${summary.accuracy}% accuracy with strong topic mastery and consistent speed.`;
    } else if (readiness.readinessStatus === "almost_ready") {
      readinessFeedback = `Almost ready to advance (${readiness.readinessScore}%). Address remaining weak topics to reach the 80% benchmark.`;
    } else if (readiness.readinessStatus === "needs_more_practice") {
      readinessFeedback = `Needs more practice (${readiness.readinessScore}%). Focus on targeted homework worksheets in identified weak areas.`;
    }

    // Overall feedback synthesis
    let overallFeedback = "Solid start on your abacus journey. Regular daily 10-minute practice will build strong mental visualization.";
    if (summary.accuracy >= 85) {
      overallFeedback = "Outstanding progress! Your mental math coordination and abacus fluency are developing exceptionally well.";
    } else if (summary.accuracy >= 70) {
      overallFeedback = "Commendable effort. Target the recommended practice topics below to turn your moderate skills into mastery.";
    }

    return {
      provider: "rule_based_fallback",
      isAIRated: false,
      strengths,
      weakAreas: weakList,
      recommendedPractice,
      accuracyImprovement,
      speedImprovement,
      readinessFeedback,
      overallFeedback,
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Real AI Provider connector (Gemini API format).
   */
  private static async callGeminiEvaluation(context: {
    apiKey: string;
    summary: IPerformanceSummary;
    topics: ITopicPerformance[];
    weakAreas: IWeakArea[];
    readiness: { readinessScore: number; readinessStatus: string };
  }): Promise<IAIEvaluationResult> {
    const { apiKey, summary, topics, weakAreas, readiness } = context;

    const prompt = `
You are an expert Abacus Math Sensei evaluating a student's performance on the AbacusMind e-learning platform.
Analyze the following student performance data and return a JSON object with constructive, encouraging, and specific evaluation feedback:

STUDENT PERFORMANCE DATA:
- Total Questions Attempted: ${summary.totalQuestions}
- Overall Accuracy: ${summary.accuracy}%
- Average Response Time per Question: ${summary.averageResponseTime} seconds
- Total Attempts: ${summary.totalAttempts} (Practice: ${summary.totalPracticeAttempts}, Homework: ${summary.totalHomeworkAttempts})
- Strong Topics Count: ${summary.strongTopicsCount}
- Weak Topics Count: ${summary.weakTopicsCount}
- Performance Trend: ${summary.recentTrend} (${summary.recentTrendPercentage > 0 ? "+" : ""}${summary.recentTrendPercentage}%)
- Readiness Score: ${readiness.readinessScore}/100 (${readiness.readinessStatus})
- Topic Breakdown: ${JSON.stringify(topics.map((t) => ({ name: t.topicName, accuracy: t.accuracy, status: t.status })))}
- Identified Weak Areas: ${JSON.stringify(weakAreas.map((w) => ({ topic: w.topicName, errorRate: w.errorRate, formulas: w.commonFormulas })))}

Respond with ONLY valid JSON with no markdown wrapping or code blocks matching this exact schema:
{
  "strengths": ["string", "string"],
  "weakAreas": ["string", "string"],
  "recommendedPractice": [
    {
      "title": "string",
      "reason": "string",
      "type": "practice"
    }
  ],
  "accuracyImprovement": "string",
  "speedImprovement": "string",
  "readinessFeedback": "string",
  "overallFeedback": "string"
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Gemini API returned status ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error("No response content from Gemini API");
    }

    const parsed = JSON.parse(text);

    return {
      provider: "gemini",
      isAIRated: true,
      strengths: Array.isArray(parsed.strengths) ? parsed.strengths : [],
      weakAreas: Array.isArray(parsed.weakAreas) ? parsed.weakAreas : [],
      recommendedPractice: Array.isArray(parsed.recommendedPractice)
        ? parsed.recommendedPractice.map((rp: any) => ({
            title: rp.title || "Practice Topic",
            reason: rp.reason || "Recommended based on performance",
            type: rp.type || "practice",
            link: "/learning/practice",
          }))
        : [],
      accuracyImprovement: parsed.accuracyImprovement || "Focus on deliberate finger movements.",
      speedImprovement: parsed.speedImprovement || "Practice rhythmic bead flicks.",
      readinessFeedback: parsed.readinessFeedback || `Readiness score: ${readiness.readinessScore}%.`,
      overallFeedback: parsed.overallFeedback || "Great effort! Keep practicing daily.",
      evaluatedAt: new Date().toISOString(),
    };
  }

  /**
   * Helper: Formats an existing MongoDB Evaluation document into the public response interface.
   */
  private static formatEvaluationResult(doc: IEvaluation): IAIEvaluationResult {
    return {
      evaluationId: doc._id.toString(),
      provider: doc.provider || "rule_based_fallback",
      isAIRated: doc.provider === "gemini" || doc.provider === "openai",
      strengths: doc.strengths || [],
      weakAreas: doc.weakAreas || [],
      recommendedPractice: doc.recommendedPractice || [],
      accuracyImprovement: doc.accuracyImprovement || "",
      speedImprovement: doc.speedImprovement || "",
      readinessFeedback: doc.readiness?.summary || "",
      overallFeedback: doc.overallFeedback || "",
      evaluatedAt: doc.createdAt ? new Date(doc.createdAt).toISOString() : new Date().toISOString(),
    };
  }
}

export default AIEvaluationService;
