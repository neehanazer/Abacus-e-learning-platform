import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRoute } from "@/lib/auth";
import Homework from "@/models/Homework";
import HomeworkQuestion from "@/models/HomeworkQuestion";
import HomeworkAttempt from "@/models/HomeworkAttempt";
import StudentLessonProgress from "@/models/StudentLessonProgress";
import Lesson from "@/models/Lesson";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import { getFallbackHomework } from "@/lib/homeworkSeedData";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    homeworkId: string;
  }>;
}

/**
 * GET /api/homework/[homeworkId]
 * Retrieves details for a specific homework assignment, including questions,
 * linked lesson status, and active student attempt.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
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

    // Optional student session to resolve lesson completion & active attempt
    const authResult = await authenticateRoute(req);
    const student = authResult.user || null;

    try {
      await connectToDatabase();

      // Ensure reference models are registered for populate
      const _lessonModel = Lesson;
      const _levelModel = Level;
      const _topicModel = Topic;
      const _questionModel = HomeworkQuestion;

      const isObjectId = mongoose.Types.ObjectId.isValid(homeworkId);

      // Build query to find by ObjectId or friendly homeworkNumber / slug
      let homeworkDoc = null;
      if (isObjectId) {
        homeworkDoc = await Homework.findById(homeworkId)
          .populate("levelId", "levelName order")
          .populate("topicId", "topicName order")
          .populate("lessonId", "title lessonNumber duration objectives")
          .lean();
      }

      if (!homeworkDoc) {
        // Try matching by homeworkNumber (e.g. "hw-01" -> 1, "1" -> 1)
        const match = homeworkId.match(/\d+/);
        if (match) {
          const num = parseInt(match[0], 10);
          homeworkDoc = await Homework.findOne({ homeworkNumber: num })
            .populate("levelId", "levelName order")
            .populate("topicId", "topicName order")
            .populate("lessonId", "title lessonNumber duration objectives")
            .lean();
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

      // Fetch all questions for this homework
      const questions = await HomeworkQuestion.find({
        homeworkId: homeworkDoc._id,
      })
        .sort({ order: 1 })
        .lean();

      // Check student lesson progress and attempts if authenticated
      let isLessonCompleted = false;
      let activeAttempt = null;
      let attemptsCount = 0;
      let bestScore = 0;
      let studentStatus = homeworkDoc.status || "pending";

      if (student && student._id) {
        const studentId = student._id;
        const linkedLesson = homeworkDoc.lessonId as any;
        const linkedLessonId =
          linkedLesson?._id?.toString() || linkedLesson?.toString();

        if (linkedLessonId) {
          const progress = await StudentLessonProgress.findOne({
            studentId,
            lessonId: linkedLessonId,
            completed: true,
          }).lean();
          isLessonCompleted = !!progress;
        }

        const attempts = await HomeworkAttempt.find({
          studentId,
          homeworkId: homeworkDoc._id,
        })
          .sort({ createdAt: -1 })
          .lean();

        attemptsCount = attempts.length;

        if (attempts.length > 0) {
          bestScore = Math.max(...attempts.map((a) => a.score ?? 0));
          const inProgress = attempts.find((a) => a.status === "inProgress");
          if (inProgress) {
            activeAttempt = inProgress;
            studentStatus = "inProgress";
          } else if (attempts.some((a) => a.status === "evaluated")) {
            studentStatus = "evaluated";
          } else if (attempts.some((a) => a.status === "submitted")) {
            studentStatus = "submitted";
          }
        }
      }

      const linkedLesson = homeworkDoc.lessonId as any;
      const lessonNum = linkedLesson?.lessonNumber || homeworkDoc.homeworkNumber || 1;
      const isAvailable = isLessonCompleted || lessonNum === 1 || homeworkDoc.homeworkNumber === 1;

      return NextResponse.json(
        {
          success: true,
          data: {
            ...homeworkDoc,
            id: homeworkDoc._id.toString(),
            status: student ? studentStatus : homeworkDoc.status,
            questions,
            questionCount: questions.length,
            isAvailable,
            lessonCompleted: isLessonCompleted,
            activeAttempt,
            attemptsCount,
            bestScore,
          },
          source: "database",
        },
        { status: 200 }
      );
    } catch (dbErr) {
      console.warn("[GET /api/homework/[homeworkId]]: DB offline, serving fallback...", dbErr);

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

      return NextResponse.json(
        {
          success: true,
          data: {
            ...fallbackHw,
            isAvailable: true,
            lessonCompleted: true,
            activeAttempt: null,
            attemptsCount: 0,
            bestScore: 0,
          },
          source: "fallback",
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/homework/[homeworkId] Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
