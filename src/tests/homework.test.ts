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
import Homework from "../models/Homework";
import HomeworkQuestion from "../models/HomeworkQuestion";
import HomeworkAttempt from "../models/HomeworkAttempt";
import { signToken } from "../lib/auth";
import { GET as getHomeworkListHandler } from "../app/api/homework/route";
import { GET as getHomeworkDetailHandler } from "../app/api/homework/[homeworkId]/route";
import { POST as startHomeworkHandler } from "../app/api/homework/[homeworkId]/start/route";
import { POST as saveProgressHandler } from "../app/api/homework/[homeworkId]/save-progress/route";
import { POST as submitHomeworkHandler } from "../app/api/homework/[homeworkId]/submit/route";
import { GET as getAttemptsHandler } from "../app/api/homework/[homeworkId]/attempts/route";
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
  console.log("RUNNING HOMEWORK MANAGEMENT TEST SUITE");
  console.log("==================================================\n");

  const testStudentId = new mongoose.Types.ObjectId().toString();
  const testEmail = "homework_student@abacus.com";
  const validToken = signToken({
    userId: testStudentId,
    email: testEmail,
    role: "student",
  });

  // 1. Mongoose Model Validation Tests
  console.log("1. Model Schema Validation Tests:");
  {
    // Test Homework Model Schema
    const validLevelId = new mongoose.Types.ObjectId();
    const validTopicId = new mongoose.Types.ObjectId();
    const validLessonId = new mongoose.Types.ObjectId();

    const hw = new Homework({
      title: "Test Homework 01",
      description: "Direct addition worksheet",
      levelId: validLevelId,
      topicId: validTopicId,
      lessonId: validLessonId,
      recommendedTime: 15,
      dueDate: new Date(),
      status: "pending",
    });

    const hwValidationErr = hw.validateSync();
    assert(!hwValidationErr, "Homework validates successfully with valid fields");
    assert(hw.status === "pending", "Default homework status is pending");

    // Test Invalid Status on Homework
    const invalidHw = new Homework({
      title: "Invalid Status HW",
      levelId: validLevelId,
      topicId: validTopicId,
      lessonId: validLessonId,
      status: "invalid_status",
    });
    const invalidErr = invalidHw.validateSync();
    assert(!!invalidErr?.errors?.status, "Homework rejects invalid status");

    // Test HomeworkQuestion Model Schema
    const hwQ = new HomeworkQuestion({
      homeworkId: hw._id,
      question: "Calculate: 2 + 3",
      questionType: "numberInput",
      correctAnswer: 5,
      numbers: [2, 3],
      operation: "+",
      marks: 1,
      order: 1,
    });
    const hwQErr = hwQ.validateSync();
    assert(!hwQErr, "HomeworkQuestion validates successfully with required fields");

    // Test HomeworkAttempt Model Schema
    const attempt = new HomeworkAttempt({
      studentId: new mongoose.Types.ObjectId(testStudentId),
      homeworkId: hw._id,
      answers: [
        {
          questionId: hwQ._id,
          studentAnswer: 5,
          correctAnswer: 5,
          isCorrect: true,
          timeSpent: 12,
        },
      ],
      attemptNumber: 1,
      score: 1,
      totalQuestions: 1,
      accuracy: 100,
      timeTaken: 12,
      submittedAt: new Date(),
      status: "submitted",
    });
    const attemptErr = attempt.validateSync();
    assert(!attemptErr, "HomeworkAttempt validates successfully with required fields");
    assert(attempt.status === "submitted", "HomeworkAttempt correctly stores status");
  }

  // 2. API: GET /api/homework
  console.log("\n2. GET /api/homework Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/homework");
    const res = await getHomeworkListHandler(req);
    const data = await res.json();

    assert(res.status === 200, "GET /api/homework returns 200 OK");
    assert(data.success === true, "GET /api/homework returns success: true");
    assert(Array.isArray(data.data), "GET /api/homework returns array of homework");
    assert(data.data.length > 0, "GET /api/homework returns seeded/fallback homework items");

    const firstHw = data.data[0];
    assert(typeof firstHw.title === "string", "Homework item contains title");
    assert(firstHw.isAvailable === true, "Introductory homework item is marked available");
  }

  // 3. API: GET /api/homework/[homeworkId]
  console.log("\n3. GET /api/homework/[homeworkId] Tests:");
  {
    // Test with friendly slug "hw-01" or "1"
    const req = new NextRequest("http://localhost:3000/api/homework/1");
    const params = Promise.resolve({ homeworkId: "1" });
    const res = await getHomeworkDetailHandler(req, { params });
    const data = await res.json();

    assert(res.status === 200, "GET /api/homework/1 returns 200 OK");
    assert(data.success === true, "GET /api/homework/1 returns success: true");
    assert(data.data && Array.isArray(data.data.questions), "Homework detail includes questions array");
    assert(data.data.questions.length > 0, "Homework detail contains seeded questions");

    // Test with invalid homework ID
    const invalidReq = new NextRequest("http://localhost:3000/api/homework/nonexistent-9999");
    const invalidParams = Promise.resolve({ homeworkId: "nonexistent-9999" });
    const invalidRes = await getHomeworkDetailHandler(invalidReq, { params: invalidParams });
    assert(invalidRes.status === 404, "GET /api/homework/nonexistent returns 404 Not Found");
  }

  // 4. API: POST /api/homework/[homeworkId]/start
  console.log("\n4. POST /api/homework/[homeworkId]/start Tests:");
  {
    // Test unauthenticated start
    const unauthReq = new NextRequest("http://localhost:3000/api/homework/1/start", {
      method: "POST",
    });
    const unauthParams = Promise.resolve({ homeworkId: "1" });
    const unauthRes = await startHomeworkHandler(unauthReq, { params: unauthParams });
    assert(unauthRes.status === 401, "POST start requires authentication (401)");

    // Test authenticated start
    const authReq = new NextRequest("http://localhost:3000/api/homework/1/start", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ forceNew: true }),
    });
    const authParams = Promise.resolve({ homeworkId: "1" });
    const authRes = await startHomeworkHandler(authReq, { params: authParams });
    const authData = await authRes.json();

    assert(
      authRes.status === 200 || authRes.status === 201,
      "POST start returns 200/201 on success"
    );
    assert(authData.success === true, "POST start returns success: true");
    assert(authData.data?.attempt?.status === "inProgress", "New attempt status is inProgress");
    assert(authData.data?.attempt?.attemptNumber >= 1, "Attempt number is set");
  }

  // 5. API: POST /api/homework/[homeworkId]/save-progress
  console.log("\n5. POST /api/homework/[homeworkId]/save-progress Tests:");
  {
    // Test unauthenticated save-progress
    const unauthReq = new NextRequest("http://localhost:3000/api/homework/1/save-progress", {
      method: "POST",
    });
    const unauthParams = Promise.resolve({ homeworkId: "1" });
    const unauthRes = await saveProgressHandler(unauthReq, { params: unauthParams });
    assert(unauthRes.status === 401, "POST save-progress requires authentication (401)");

    // Test authenticated save-progress
    const authReq = new NextRequest("http://localhost:3000/api/homework/1/save-progress", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: [
          { questionId: "67aa00000000000000001001", studentAnswer: 3, timeSpent: 15 },
          { questionId: "67aa00000000000000001002", studentAnswer: 4, timeSpent: 12 },
        ],
        timeTaken: 27,
      }),
    });
    const authParams = Promise.resolve({ homeworkId: "1" });
    const authRes = await saveProgressHandler(authReq, { params: authParams });
    const authData = await authRes.json();

    assert(authRes.status === 200, "POST save-progress returns 200 OK");
    assert(authData.success === true, "POST save-progress returns success: true");
    assert(authData.data?.status === "inProgress", "Status remains inProgress after save-progress");
  }

  // 6. API: POST /api/homework/[homeworkId]/submit
  console.log("\n6. POST /api/homework/[homeworkId]/submit Tests:");
  {
    // Test unauthenticated submit
    const unauthReq = new NextRequest("http://localhost:3000/api/homework/1/submit", {
      method: "POST",
    });
    const unauthParams = Promise.resolve({ homeworkId: "1" });
    const unauthRes = await submitHomeworkHandler(unauthReq, { params: unauthParams });
    assert(unauthRes.status === 401, "POST submit requires authentication (401)");

    // Test authenticated submit
    const authReq = new NextRequest("http://localhost:3000/api/homework/1/submit", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        answers: [
          { questionId: "67aa00000000000000001001", studentAnswer: 3, timeSpent: 15 },
          { questionId: "67aa00000000000000001002", studentAnswer: 4, timeSpent: 12 },
          { questionId: "67aa00000000000000001003", studentAnswer: 1, timeSpent: 10 },
        ],
        timeTaken: 95,
      }),
    });
    const authParams = Promise.resolve({ homeworkId: "1" });
    const authRes = await submitHomeworkHandler(authReq, { params: authParams });
    const authData = await authRes.json();

    assert(authRes.status === 200, "POST submit returns 200 OK");
    assert(authData.success === true, "POST submit returns success: true");
    assert(authData.data?.status === "submitted", "Submitted attempt has status 'submitted'");
    assert(typeof authData.data?.score === "number", "Submission returns computed score");
    assert(typeof authData.data?.accuracy === "number", "Submission returns computed accuracy");
    assert(!!authData.data?.submittedAt, "Submission records submittedAt timestamp");
  }

  // 7. API: GET /api/homework/[homeworkId]/attempts
  console.log("\n7. GET /api/homework/[homeworkId]/attempts Tests:");
  {
    // Test unauthenticated attempts
    const unauthReq = new NextRequest("http://localhost:3000/api/homework/1/attempts");
    const unauthParams = Promise.resolve({ homeworkId: "1" });
    const unauthRes = await getAttemptsHandler(unauthReq, { params: unauthParams });
    assert(unauthRes.status === 401, "GET attempts requires authentication (401)");

    // Test authenticated attempts
    const authReq = new NextRequest("http://localhost:3000/api/homework/1/attempts", {
      headers: {
        Authorization: `Bearer ${validToken}`,
      },
    });
    const authParams = Promise.resolve({ homeworkId: "1" });
    const authRes = await getAttemptsHandler(authReq, { params: authParams });
    const authData = await authRes.json();

    assert(authRes.status === 200, "GET attempts returns 200 OK");
    assert(authData.success === true, "GET attempts returns success: true");
    assert(authData.data && Array.isArray(authData.data.attempts), "Returns attempts array");
  }

  console.log("\n==================================================");
  console.log(`TEST RUN COMPLETE: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Test execution failed:", err);
  process.exit(1);
});
