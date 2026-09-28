import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRoute } from "@/lib/auth";
import Homework from "@/models/Homework";
import HomeworkQuestion from "@/models/HomeworkQuestion";
import HomeworkAttempt from "@/models/HomeworkAttempt";
import StudentLessonProgress from "@/models/StudentLessonProgress";
import { getFallbackHomework } from "@/lib/homeworkSeedData";

export const dynamic = "force-dynamic";

// In-memory attempt cache for development fallback when DB is offline
const memoryAttempts: any[] = [];

interface RouteParams {
  params: Promise<{
    homeworkId: string;
  }>;
}

/**
 * POST /api/homework/[homeworkId]/start
 * Starts a new homework attempt for the authenticated student, or resumes
 * an existing in-progress attempt.
 *
 * Body (optional):
 * - forceNew: boolean (if true, creates a new attempt even if one is inProgress)
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    const { homeworkId } = await params;

    if (!homeworkId) {
      return NextResponse.json(
        {
          success: false,
          error: "Homework ID is required.",
        },
        { status: 400 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const forceNew = !!body.forceNew;

    try {
      await connectToDatabase();

      const isObjectId = mongoose.Types.ObjectId.isValid(homeworkId);

      // Find homework by ObjectId or homeworkNumber
      let homeworkDoc = null;
      if (isObjectId) {
        homeworkDoc = await Homework.findById(homeworkId);
      }
      if (!homeworkDoc) {
        const match = homeworkId.match(/\d+/);
        if (match) {
          homeworkDoc = await Homework.findOne({
            homeworkNumber: parseInt(match[0], 10),
          });
        }
      }

      if (!homeworkDoc) {
        return NextResponse.json(
          {
            success: false,
            error: "Homework assignment not found.",
          },
          { status: 404 }
        );
      }

      // Check lesson linkage & completion: if not completed and not lesson 1, advise student
      if (homeworkDoc.lessonId) {
        const progress = await StudentLessonProgress.findOne({
          studentId: student._id,
          lessonId: homeworkDoc.lessonId,
          completed: true,
        }).lean();

        const isIntro = (homeworkDoc.homeworkNumber ?? 1) === 1;
        if (!progress && !isIntro) {
          console.warn(
            `[POST /api/homework/start]: Student starting homework before completing linked lesson ${homeworkDoc.lessonId}`
          );
        }
      }

      // Check for an existing in-progress attempt if not forcing a new one
      if (!forceNew) {
        const existingInProgress = await HomeworkAttempt.findOne({
          studentId: student._id,
          homeworkId: homeworkDoc._id,
          status: "inProgress",
        }).lean();

        if (existingInProgress) {
          return NextResponse.json(
            {
              success: true,
              message: "Resumed existing in-progress attempt.",
              data: {
                attempt: existingInProgress,
                resumed: true,
                homeworkTitle: homeworkDoc.title,
              },
            },
            { status: 200 }
          );
        }
      }

      // Count prior attempts to determine attemptNumber
      const priorAttemptsCount = await HomeworkAttempt.countDocuments({
        studentId: student._id,
        homeworkId: homeworkDoc._id,
      });

      const attemptNumber = priorAttemptsCount + 1;

      // Fetch all questions for this homework
      const questions = await HomeworkQuestion.find({
        homeworkId: homeworkDoc._id,
      })
        .sort({ order: 1 })
        .lean();

      // Initialize empty answers array
      const initialAnswers = questions.map((q) => ({
        questionId: q._id,
        studentAnswer: null,
        userAnswer: null,
        isCorrect: false,
        timeSpent: 0,
      }));

      // Create new HomeworkAttempt
      const newAttempt = await HomeworkAttempt.create({
        studentId: student._id,
        homeworkId: homeworkDoc._id,
        answers: initialAnswers,
        attemptNumber,
        score: 0,
        totalQuestions: questions.length,
        accuracy: 0,
        timeTaken: 0,
        submittedAt: null,
        status: "inProgress",
      });

      return NextResponse.json(
        {
          success: true,
          message: "New homework attempt started.",
          data: {
            attempt: newAttempt,
            resumed: false,
            homeworkTitle: homeworkDoc.title,
          },
        },
        { status: 201 }
      );
    } catch (dbErr) {
      console.warn("[POST /api/homework/start]: DB offline, using memory attempt...", dbErr);

      const fallbackHw = getFallbackHomework(homeworkId);
      if (!fallbackHw) {
        return NextResponse.json(
          {
            success: false,
            error: "Homework assignment not found.",
          },
          { status: 404 }
        );
      }

      const existingMem = memoryAttempts.find(
        (a) =>
          a.studentId === student._id.toString() &&
          a.homeworkId === fallbackHw._id &&
          a.status === "inProgress"
      );

      if (existingMem && !forceNew) {
        return NextResponse.json(
          {
            success: true,
            message: "Resumed existing in-progress attempt (memory).",
            data: {
              attempt: existingMem,
              resumed: true,
              homeworkTitle: fallbackHw.title,
            },
          },
          { status: 200 }
        );
      }

      const studentMemAttempts = memoryAttempts.filter(
        (a) =>
          a.studentId === student._id.toString() &&
          a.homeworkId === fallbackHw._id
      );

      const attemptNumber = studentMemAttempts.length + 1;
      const memAttempt = {
        _id: `mem_attempt_${Date.now()}`,
        studentId: student._id.toString(),
        homeworkId: fallbackHw._id,
        answers: fallbackHw.questions.map((q) => ({
          questionId: q._id,
          studentAnswer: null,
          userAnswer: null,
          isCorrect: false,
          timeSpent: 0,
        })),
        attemptNumber,
        score: 0,
        totalQuestions: fallbackHw.questions.length,
        accuracy: 0,
        timeTaken: 0,
        submittedAt: null,
        status: "inProgress",
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      memoryAttempts.push(memAttempt);

      return NextResponse.json(
        {
          success: true,
          message: "New homework attempt started (memory).",
          data: {
            attempt: memAttempt,
            resumed: false,
            homeworkTitle: fallbackHw.title,
          },
        },
        { status: 201 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[POST /api/homework/start Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
