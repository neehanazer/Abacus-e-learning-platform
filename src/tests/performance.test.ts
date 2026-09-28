import fs from "fs";
import path from "path";

// Load environment variables from .env.local if available
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [k, ...v] = trimmed.split("=");
        if (k && v.length > 0) {
          process.env[k.trim()] = v.join("=").trim();
        }
      }
    }
  }
} catch {
  // ignore
}

import mongoose from "mongoose";
import Evaluation from "../models/Evaluation";
import PerformanceService from "../services/performance";
import AIEvaluationService from "../services/aiEvaluation";
import { signToken } from "../lib/auth";
import { GET as getSummaryHandler } from "../app/api/performance/summary/route";
import { GET as getTopicsHandler } from "../app/api/performance/topics/route";
import { GET as getWeakAreasHandler } from "../app/api/performance/weak-areas/route";
import { GET as getHistoryHandler } from "../app/api/performance/history/route";
import { GET as getReadinessHandler } from "../app/api/performance/readiness/route";
import { NextRequest } from "next/server";

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function assert(condition: boolean, testName: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    failedTests++;
    console.error(`  ✗ FAIL: ${testName}`);
  }
}

async function runTests() {
  console.log("==================================================");
  console.log("RUNNING PERFORMANCE ANALYSIS & AI EVALUATION TESTS");
  console.log("==================================================\n");

  const testStudentId = new mongoose.Types.ObjectId().toString();
  const testEmail = "performance_student@abacus.com";
  const validToken = signToken({
    userId: testStudentId,
    email: testEmail,
    role: "student",
  });

  // 1. Model Validation: Evaluation Schema
  console.log("1. Evaluation Model Schema Validation Tests:");
  {
    const evaluation = new Evaluation({
      studentId: new mongoose.Types.ObjectId(testStudentId),
      evaluationType: "performance",
      strengths: ["Strong single-digit accuracy"],
      weakAreas: ["Needs drill on small friend -4"],
      recommendedPractice: [
        {
          title: "Drill Small Friend -4",
          reason: "Error rate in subtraction",
          type: "practice",
          link: "/learning/practice",
        },
      ],
      accuracyImprovement: "Clear beam before each sum",
      speedImprovement: "Use two-hand finger coordination",
      readiness: {
        score: 78,
        status: "almost_ready",
        summary: "Almost ready to advance to Level 2.",
      },
      overallFeedback: "Solid progress overall.",
      provider: "rule_based_fallback",
      metricsSnapshot: {
        totalQuestions: 40,
        correctAnswers: 34,
        accuracy: 85,
        avgTimePerQuestion: 6.5,
        totalAttempts: 4,
        strongTopicsCount: 2,
        weakTopicsCount: 1,
      },
    });

    const err = evaluation.validateSync();
    assert(!err, "Evaluation model validates successfully with required fields");
    assert(evaluation.provider === "rule_based_fallback", "Default provider is rule_based_fallback");
  }

  // 2. PerformanceService Calculations
  console.log("\n2. PerformanceService Calculation Tests:");
  {
    const summary = await PerformanceService.getSummary(testStudentId);

    assert(typeof summary.totalQuestions === "number", "Summary calculates totalQuestions");
    assert(summary.totalQuestionsAttempted === summary.totalQuestions, "Summary calculates totalQuestionsAttempted");
    assert(typeof summary.correctAnswers === "number", "Summary calculates correctAnswers");
    assert(typeof summary.incorrectAnswers === "number", "Summary calculates incorrectAnswers");
    assert(
      summary.totalQuestions === summary.correctAnswers + summary.incorrectAnswers,
      "totalQuestions equals correct + incorrect"
    );
    assert(summary.accuracy >= 0 && summary.accuracy <= 100, "Accuracy is bounded between 0 and 100%");
    assert(typeof summary.averageScore === "number", "Summary calculates averageScore");
    assert(typeof summary.averageResponseTime === "number", "Summary calculates averageResponseTime");
    assert(typeof summary.bestScore === "number", "Summary calculates bestScore");
    assert(Array.isArray(summary.strongTopics), "Summary provides strongTopics array");
    assert(Array.isArray(summary.weakTopics), "Summary provides weakTopics array");
    assert(
      ["improving", "stable", "declining", "insufficient_data"].includes(summary.improvementOverTime.trend),
      "Summary provides improvementOverTime trend"
    );
    assert(
      ["improving", "stable", "declining", "insufficient_data"].includes(summary.recentTrend),
      "Trend matches PerformanceTrend enum"
    );

    // Topic-wise performance
    const topics = await PerformanceService.getTopicWisePerformance(testStudentId);
    assert(Array.isArray(topics), "getTopicWisePerformance returns an array");
    assert(topics.length > 0, "Topic-wise performance contains topics");

    const firstTopic = topics[0];
    assert(typeof firstTopic.topicName === "string", "Topic has topicName");
    assert(typeof firstTopic.accuracy === "number", "Topic has accuracy");
    assert(["strong", "moderate", "weak"].includes(firstTopic.status), "Topic status is strong/moderate/weak");

    // Weak areas
    const weakAreas = await PerformanceService.getWeakAreas(testStudentId);
    assert(Array.isArray(weakAreas), "getWeakAreas returns an array");
    if (weakAreas.length > 0) {
      assert(typeof weakAreas[0].recommendedAction === "string", "Weak area includes recommendedAction");
      assert(["high", "medium", "low"].includes(weakAreas[0].priority), "Weak area has priority rating");
    }

    // Readiness calculation
    const readiness = await PerformanceService.getReadiness(testStudentId);
    assert(readiness.readinessScore >= 0 && readiness.readinessScore <= 100, "Readiness score is bounded (0-100)");
    assert(Array.isArray(readiness.criteria), "Readiness includes criteria checklist");
  }

  // 3. AIEvaluationService Tests
  console.log("\n3. AIEvaluationService Layer Tests:");
  {
    const evaluation = await AIEvaluationService.evaluateStudentPerformance({
      studentId: testStudentId,
      forceFresh: true,
      saveToDb: false,
    });

    assert(typeof evaluation === "object" && evaluation !== null, "evaluateStudentPerformance returns result");
    assert(Array.isArray(evaluation.strengths), "Evaluation includes strengths array");
    assert(Array.isArray(evaluation.weakAreas), "Evaluation includes weakAreas array");
    assert(Array.isArray(evaluation.recommendedPractice), "Evaluation includes recommendedPractice array");
    assert(typeof evaluation.accuracyImprovement === "string", "Evaluation provides accuracyImprovement");
    assert(typeof evaluation.speedImprovement === "string", "Evaluation provides speedImprovement");
    assert(typeof evaluation.readinessFeedback === "string", "Evaluation provides readinessFeedback");

    // Critical Requirement: Do NOT falsely label simple calculations as AI
    if (!process.env.GEMINI_API_KEY) {
      assert(
        evaluation.provider === "rule_based_fallback",
        "Provider is strictly 'rule_based_fallback' when no AI API key is configured"
      );
      assert(evaluation.isAIRated === false, "isAIRated is false when using rule-based fallback");
    }
  }

  // 4. API: GET /api/performance/summary
  console.log("\n4. GET /api/performance/summary API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/performance/summary", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getSummaryHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/performance/summary returns 200 OK");
    assert(body.success === true, "GET /api/performance/summary returns success: true");
    assert(typeof body.data.accuracy === "number", "Summary response includes accuracy");
    assert(typeof body.data.averageResponseTime === "number", "Summary response includes averageResponseTime");
    assert(typeof body.data.bestScore === "number", "Summary response includes bestScore");
  }

  // 5. API: GET /api/performance/topics
  console.log("\n5. GET /api/performance/topics API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/performance/topics", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getTopicsHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/performance/topics returns 200 OK");
    assert(body.success === true, "GET /api/performance/topics returns success: true");
    assert(Array.isArray(body.data), "GET /api/performance/topics returns topics array");
    assert(typeof body.summary.strongTopics === "number", "Includes strongTopics count summary");
  }

  // 6. API: GET /api/performance/weak-areas
  console.log("\n6. GET /api/performance/weak-areas API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/performance/weak-areas", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getWeakAreasHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/performance/weak-areas returns 200 OK");
    assert(body.success === true, "GET /api/performance/weak-areas returns success: true");
    assert(Array.isArray(body.data), "GET /api/performance/weak-areas returns weak areas list");
  }

  // 7. API: GET /api/performance/history
  console.log("\n7. GET /api/performance/history API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/performance/history?limit=10", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getHistoryHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/performance/history returns 200 OK");
    assert(body.success === true, "GET /api/performance/history returns success: true");
    assert(Array.isArray(body.data), "GET /api/performance/history returns history array");
  }

  // 8. API: GET /api/performance/readiness
  console.log("\n8. GET /api/performance/readiness API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/performance/readiness", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getReadinessHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/performance/readiness returns 200 OK");
    assert(body.success === true, "GET /api/performance/readiness returns success: true");
    assert(typeof body.data.readinessScore === "number", "Returns readinessScore");
    assert(typeof body.data.readinessStatus === "string", "Returns readinessStatus");
    assert(Array.isArray(body.data.criteria), "Returns criteria checklist");
    assert(typeof body.data.aiEvaluation === "object", "Returns aiEvaluation result");
    assert(
      Array.isArray(body.data.aiEvaluation.strengths),
      "AI evaluation contains strengths"
    );
    assert(
      Array.isArray(body.data.aiEvaluation.weakAreas),
      "AI evaluation contains weak areas"
    );
    assert(
      Array.isArray(body.data.aiEvaluation.recommendedPractice),
      "AI evaluation contains recommendedPractice"
    );
  }

  console.log("\n==================================================");
  console.log(`TEST RUN COMPLETE: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Performance test execution failed:", err);
  process.exit(1);
});
