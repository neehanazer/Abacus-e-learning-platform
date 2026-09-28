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
import Exam from "../models/Exam";
import ExamQuestion from "../models/ExamQuestion";
import ExamAttempt from "../models/ExamAttempt";
import ExamAnswer from "../models/ExamAnswer";
import ProctoringEvent from "../models/ProctoringEvent";
import ExamService from "../services/examService";
import { signToken } from "../lib/auth";
import { GET as getMockExamsHandler } from "../app/api/exams/mock/route";
import { GET as getExamByIdHandler } from "../app/api/exams/[examId]/route";
import { POST as startExamHandler } from "../app/api/exams/[examId]/start/route";
import { POST as submitExamHandler } from "../app/api/exams/[examId]/submit/route";
import { GET as getExamResultHandler } from "../app/api/exams/[examId]/result/route";
import { GET as getExamHistoryHandler } from "../app/api/exams/history/route";
import { POST as logProctoringEventHandler } from "../app/api/proctoring/events/route";
import { GET as getProctoringEventsHandler } from "../app/api/proctoring/[examAttemptId]/events/route";
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
  console.log("RUNNING MOCK EXAMS, FINAL EXAMS & PROCTORING TESTS");
  console.log("==================================================");

  const testStudentId = "678900000000000000000099";
  const validToken = signToken({
    userId: testStudentId,
    email: "exam_test_student@example.com",
    role: "student",
  });

  // 1. Model Schema Validation Tests
  console.log("\n1. Schema Validation Tests:");
  {
    // Exam model
    const mockExamDoc = new Exam({
      title: "Test Abacus Mock Exam",
      levelId: new mongoose.Types.ObjectId("678900000000000000000001"),
      type: "mock",
      duration: 30,
      totalQuestions: 10,
      totalMarks: 100,
      passingMarks: 60,
      status: "active",
    });
    const examErr = mockExamDoc.validateSync();
    assert(!examErr, "Exam model validates successfully with required fields");
    assert(mockExamDoc.type === "mock", "Exam type is mock");

    // Final exam model
    const finalExamDoc = new Exam({
      title: "Test Level 1 Final Certification Exam",
      levelId: new mongoose.Types.ObjectId("678900000000000000000001"),
      type: "final",
      duration: 45,
      totalQuestions: 20,
      totalMarks: 100,
      passingMarks: 70,
      status: "active",
    });
    const finalErr = finalExamDoc.validateSync();
    assert(!finalErr, "Final Exam validates successfully");
    assert(finalExamDoc.type === "final", "Exam type is final");

    // ExamQuestion model
    const qDoc = new ExamQuestion({
      examId: mockExamDoc._id,
      questionNumber: 1,
      questionText: "Calculate: 4 + 5",
      numbers: [4, 5],
      operations: ["+"],
      options: [8, 9, 7, 10],
      correctAnswer: 9,
      marks: 10,
      ruleType: "Direct Calculation",
    });
    const qErr = qDoc.validateSync();
    assert(!qErr, "ExamQuestion validates successfully");

    // ExamAttempt model
    const attemptDoc = new ExamAttempt({
      studentId: new mongoose.Types.ObjectId(testStudentId),
      examId: mockExamDoc._id,
      attemptNumber: 1,
      score: 80,
      totalMarks: 100,
      percentage: 80,
      totalQuestions: 10,
      correctAnswers: 8,
      incorrectAnswers: 2,
      timeTaken: 650,
      isPassed: true,
      status: "evaluated",
    });
    const attErr = attemptDoc.validateSync();
    assert(!attErr, "ExamAttempt model validates successfully");
    assert(attemptDoc.isPassed === true, "ExamAttempt correctly stores pass status");

    // ExamAnswer model
    const ansDoc = new ExamAnswer({
      examAttemptId: attemptDoc._id,
      questionId: qDoc._id,
      studentId: new mongoose.Types.ObjectId(testStudentId),
      userAnswer: 9,
      correctAnswer: 9,
      isCorrect: true,
      marksAwarded: 10,
      timeSpent: 15,
    });
    const ansErr = ansDoc.validateSync();
    assert(!ansErr, "ExamAnswer model validates successfully");

    // ProctoringEvent model
    const procDoc = new ProctoringEvent({
      examAttemptId: attemptDoc._id,
      studentId: new mongoose.Types.ObjectId(testStudentId),
      eventType: "face_not_detected",
      timestamp: new Date(),
      confidence: 0.95,
      severity: "high",
      description: "Student face moved out of camera frame for 6 seconds",
    });
    const procErr = procDoc.validateSync();
    assert(!procErr, "ProctoringEvent model validates successfully");
    assert(procDoc.eventType === "face_not_detected", "ProctoringEvent eventType is face_not_detected");
  }

  // 2. ExamService Logic & Readiness Verification
  console.log("\n2. ExamService Methods & Readiness Tests:");
  let mockExamId = "67b100000000000000000001";
  let finalExamId = "67b100000000000000000003";

  {
    // Fetch mock exams
    const mockExams = await ExamService.getMockExams(testStudentId);
    assert(Array.isArray(mockExams), "getMockExams returns an array");
    assert(mockExams.length > 0, "At least one mock exam is available");
    assert(mockExams[0].type === "mock", "Listed exam is of type 'mock'");
    assert(typeof mockExams[0].totalQuestions === "number", "Mock exam defines totalQuestions");
    assert(typeof mockExams[0].passingMarks === "number", "Mock exam defines passingMarks");
    mockExamId = mockExams[0].id;

    // Get exam details for mock exam
    const examDetail = await ExamService.getExamById(mockExamId, testStudentId);
    assert(examDetail.id === mockExamId, "getExamById returns matching exam");
    assert(examDetail.isLocked === false, "Mock exam is not locked");
    assert(Array.isArray(examDetail.questions), "Mock exam returns questions array");
    assert(examDetail.questions.length > 0, "Mock exam contains questions");

    // Check that answers are not leaked in questions
    assert(
      (examDetail.questions[0] as any).correctAnswer === undefined,
      "Question does NOT leak correctAnswer when retrieved for student"
    );

    // Get exam details for final exam (readiness check)
    const finalDetail = await ExamService.getExamById(finalExamId, testStudentId);
    assert(finalDetail.type === "final", "Retrieved final exam");
    assert(typeof finalDetail.isLocked === "boolean", "Final exam evaluates lock status based on readiness");
    assert(finalDetail.readiness !== undefined, "Final exam includes readiness assessment information");
  }

  // 3. API: GET /api/exams/mock
  console.log("\n3. GET /api/exams/mock API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/exams/mock", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getMockExamsHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/exams/mock returns 200 OK");
    assert(body.success === true, "GET /api/exams/mock returns success: true");
    assert(Array.isArray(body.data), "Returns array of mock exams");
    assert(body.data.length > 0, "Contains mock exams");
  }

  // 4. API: GET /api/exams/[examId]
  console.log("\n4. GET /api/exams/[examId] API Tests:");
  {
    const req = new NextRequest(`http://localhost:3000/api/exams/${mockExamId}`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getExamByIdHandler(req, { params: Promise.resolve({ examId: mockExamId }) });
    const body = await res.json();

    assert(res.status === 200, "GET /api/exams/[examId] returns 200 OK");
    assert(body.success === true, "Returns success: true");
    assert(body.data.id === mockExamId, "Returns requested exam ID");
    assert(body.data.type === "mock", "Exam type is mock");
    assert(typeof body.data.passingMarks === "number", "Returns passingMarks");
    assert(Array.isArray(body.data.questions), "Returns questions array");
  }

  // 5. API: POST /api/exams/[examId]/start
  console.log("\n5. POST /api/exams/[examId]/start API Tests:");
  let activeAttemptId = "";
  {
    const req = new NextRequest(`http://localhost:3000/api/exams/${mockExamId}/start`, {
      method: "POST",
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await startExamHandler(req, { params: Promise.resolve({ examId: mockExamId }) });
    const body = await res.json();

    assert(res.status === 201, "POST /api/exams/[examId]/start returns 201 Created");
    assert(body.success === true, "Returns success: true");
    assert(typeof body.data.attemptId === "string", "Returns attemptId");
    assert(Array.isArray(body.data.questions), "Returns exam paper questions");
    assert(body.data.questions.length > 0, "Questions array is populated");
    activeAttemptId = body.data.attemptId;
  }

  // 6. AI Proctoring Events: POST /api/proctoring/events
  console.log("\n6. POST /api/proctoring/events API Tests:");
  {
    // Test logging multiple types of events
    const eventPayloads = [
      {
        examAttemptId: activeAttemptId,
        eventType: "face_not_detected",
        timestamp: new Date().toISOString(),
        confidence: 0.94,
        severity: "medium",
        description: "Student face not in webcam frame",
      },
      {
        examAttemptId: activeAttemptId,
        eventType: "tab_change",
        timestamp: new Date().toISOString(),
        confidence: 1.0,
        severity: "low",
        description: "User switched browser tab for 2 seconds",
      },
      {
        examAttemptId: activeAttemptId,
        eventType: "unusual_head_movement",
        timestamp: new Date().toISOString(),
        confidence: 0.88,
        severity: "medium",
        description: "Head oriented towards side for 8 seconds",
      },
    ];

    for (const ev of eventPayloads) {
      const req = new NextRequest("http://localhost:3000/api/proctoring/events", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${validToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ev),
      });
      const res = await logProctoringEventHandler(req);
      const body = await res.json();

      assert(res.status === 201, `Logged proctoring event: ${ev.eventType}`);
      assert(body.success === true, "Event response returns success: true");
      assert(body.data.eventType === ev.eventType, "Logged event matches sent type");
    }

    // Verify invalid event rejection
    const invalidReq = new NextRequest("http://localhost:3000/api/proctoring/events", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        examAttemptId: activeAttemptId,
        eventType: "invalid_unsupported_event",
        description: "Test invalid",
      }),
    });
    const invalidRes = await logProctoringEventHandler(invalidReq);
    assert(invalidRes.status === 400, "Rejects unsupported eventType with 400 Bad Request");
  }

  // 7. API: GET /api/proctoring/[examAttemptId]/events
  console.log("\n7. GET /api/proctoring/[examAttemptId]/events API Tests:");
  {
    const req = new NextRequest(`http://localhost:3000/api/proctoring/${activeAttemptId}/events`, {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getProctoringEventsHandler(req, {
      params: Promise.resolve({ examAttemptId: activeAttemptId }),
    });
    const body = await res.json();

    assert(res.status === 200, "GET /api/proctoring/[examAttemptId]/events returns 200 OK");
    assert(body.success === true, "Returns success: true");
    assert(typeof body.data.totalEvents === "number", "Returns totalEvents count");
    assert(body.data.totalEvents >= 3, "All logged events are tracked");
    assert(typeof body.data.integrityScore === "number", "Calculates integrityScore (0-100)");
    assert(
      ["verified", "needs_review", "suspicious"].includes(body.data.status),
      "Integrity status is verified/needs_review/suspicious"
    );
    assert(Array.isArray(body.data.events), "Returns array of proctoring events");
  }

  // 8. API: POST /api/exams/[examId]/submit (Grading & Evaluation)
  console.log("\n8. POST /api/exams/[examId]/submit API Tests:");
  {
    // Submit 8 correct answers, 2 incorrect
    const answersPayload = [
      { questionId: "67b200000000000000001001", userAnswer: 9, timeSpent: 12 },  // correct (3+1+5 = 9)
      { questionId: "67b200000000000000001002", userAnswer: 7, timeSpent: 15 },  // correct (2+4+1 = 7)
      { questionId: "67b200000000000000001003", userAnswer: 6, timeSpent: 18 },  // correct (8-5+3 = 6)
      { questionId: "67b200000000000000001004", userAnswer: 5, timeSpent: 10 },  // correct (4+2-1 = 5)
      { questionId: "67b200000000000000001005", userAnswer: 7, timeSpent: 14 },  // correct (4+1+2 = 7)
      { questionId: "67b200000000000000001006", userAnswer: 4, timeSpent: 16 },  // correct (5-4+3 = 4)
      { questionId: "67b200000000000000001007", userAnswer: 5, timeSpent: 11 },  // correct (6-3+2 = 5)
      { questionId: "67b200000000000000001008", userAnswer: 3, timeSpent: 13 },  // correct (7-2-2 = 3)
      { questionId: "67b200000000000000001009", userAnswer: 99, timeSpent: 20 }, // INCORRECT (correct is 29)
      { questionId: "67b200000000000000001010", userAnswer: 99, timeSpent: 22 }, // INCORRECT (correct is 41)
    ];

    const req = new NextRequest(`http://localhost:3000/api/exams/${mockExamId}/submit`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${validToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        attemptId: activeAttemptId,
        timeTaken: 151, // seconds
        answers: answersPayload,
      }),
    });
    const res = await submitExamHandler(req, { params: Promise.resolve({ examId: mockExamId }) });
    const body = await res.json();

    assert(res.status === 200, "POST /api/exams/[examId]/submit returns 200 OK");
    assert(body.success === true, "Submit returns success: true");

    const result = body.data;
    assert(result.score === 80, `Calculated correct score: ${result.score}/100 (expected 80)`);
    assert(result.percentage === 80, `Calculated percentage: ${result.percentage}% (expected 80)`);
    assert(result.correctAnswers === 8, `Counted correct answers: ${result.correctAnswers} (expected 8)`);
    assert(result.incorrectAnswers === 2, `Counted incorrect answers: ${result.incorrectAnswers} (expected 2)`);
    assert(result.timeTaken === 151, `Calculated time taken: ${result.timeTaken}s (expected 151)`);
    assert(result.isPassed === true, "Calculated pass/fail status (80 >= 60 passing marks -> isPassed: true)");
    assert(result.status === "evaluated", "Status marked as 'evaluated'");
    assert(Array.isArray(result.answers), "Returns detailed answers breakdown");
    assert(result.proctoringSummary !== undefined, "Result includes proctoring summary");
    assert(
      result.proctoringSummary.totalEvents >= 3,
      "Proctoring events are preserved and linked to evaluated result"
    );
  }

  // 9. API: GET /api/exams/[examId]/result
  console.log("\n9. GET /api/exams/[examId]/result API Tests:");
  {
    const req = new NextRequest(
      `http://localhost:3000/api/exams/${mockExamId}/result?attemptId=${activeAttemptId}`,
      {
        headers: { Authorization: `Bearer ${validToken}` },
      }
    );
    const res = await getExamResultHandler(req, { params: Promise.resolve({ examId: mockExamId }) });
    const body = await res.json();

    assert(res.status === 200, "GET /api/exams/[examId]/result returns 200 OK");
    assert(body.success === true, "Result endpoint returns success: true");
    assert(body.data.score === 80, "Result retains evaluated score");
    assert(body.data.percentage === 80, "Result retains percentage");
    assert(body.data.isPassed === true, "Result retains isPassed: true");
    assert(Array.isArray(body.data.answers), "Result includes answers with explanations");
    assert(body.data.answers[0].correctAnswer !== undefined, "Result displays correct answers after submission");
  }

  // 10. API: GET /api/exams/history
  console.log("\n10. GET /api/exams/history API Tests:");
  {
    const req = new NextRequest("http://localhost:3000/api/exams/history", {
      headers: { Authorization: `Bearer ${validToken}` },
    });
    const res = await getExamHistoryHandler(req);
    const body = await res.json();

    assert(res.status === 200, "GET /api/exams/history returns 200 OK");
    assert(body.success === true, "Returns success: true");
    assert(Array.isArray(body.data), "Returns array of historical attempts");
    assert(body.data.length > 0, "Contains at least 1 evaluated attempt");

    const latest = body.data[0];
    assert(typeof latest.score === "number", "History item includes score");
    assert(typeof latest.percentage === "number", "History item includes percentage");
    assert(typeof latest.isPassed === "boolean", "History item includes isPassed");
    assert(typeof latest.timeTaken === "number", "History item includes timeTaken");
    assert(typeof latest.examTitle === "string", "History item includes examTitle");
  }

  console.log("\n==================================================");
  console.log(`TEST RUN COMPLETE: ${passedTests}/${totalTests} PASSED, ${failedTests} FAILED`);
  console.log("==================================================");

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTests().catch((err) => {
  console.error("Exams test execution failed:", err);
  process.exit(1);
});
