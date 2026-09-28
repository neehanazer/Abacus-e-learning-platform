import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateRoute } from "@/lib/auth";
import Homework from "@/models/Homework";
import HomeworkAttempt from "@/models/HomeworkAttempt";
import StudentLessonProgress from "@/models/StudentLessonProgress";
import Lesson from "@/models/Lesson";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import {
  seedHomeworkData,
  getFallbackHomeworkList,
} from "@/lib/homeworkSeedData";

export const dynamic = "force-dynamic";

/**
 * GET /api/homework
 * Retrieves available homework assignments with lesson linkage and student progress status.
 *
 * Query params:
 * - lessonId: filter by Lesson ObjectId or lessonNumber
 * - levelId: filter by Level ObjectId or order
 * - topicId: filter by Topic ObjectId
 * - status: filter by homework status (pending, inProgress, submitted, evaluated)
 * - availableOnly: if true, returns only homework where the linked lesson is completed
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const lessonParam = searchParams.get("lessonId");
    const levelParam = searchParams.get("levelId");
    const topicParam = searchParams.get("topicId");
    const statusParam = searchParams.get("status");
    const availableOnlyParam = searchParams.get("availableOnly") === "true";

    // Optional authentication to resolve student lesson completion & homework attempts
    const authResult = await authenticateRoute(req);
    const student = authResult.user || null;

    try {
      await connectToDatabase();

      // Ensure seed data exists if database is fresh
      const count = await Homework.countDocuments();
      if (count === 0) {
        await seedHomeworkData();
      }

      // Ensure reference models are registered for populate
      const _lessonModel = Lesson;
      const _levelModel = Level;
      const _topicModel = Topic;

      const filter: Record<string, unknown> = {};

      // Filter by Lesson
      if (lessonParam) {
        if (mongoose.Types.ObjectId.isValid(lessonParam)) {
          filter.lessonId = new mongoose.Types.ObjectId(lessonParam);
        } else {
          const num = Number(lessonParam);
          if (!isNaN(num)) {
            const lessonDoc = await Lesson.findOne({ lessonNumber: num });
            if (lessonDoc) {
              filter.lessonId = lessonDoc._id;
            }
          }
        }
      }

      // Filter by Level
      if (levelParam) {
        if (mongoose.Types.ObjectId.isValid(levelParam)) {
          filter.levelId = new mongoose.Types.ObjectId(levelParam);
        } else {
          const num = Number(levelParam);
          if (!isNaN(num)) {
            const levelDoc = await Level.findOne({ order: num });
            if (levelDoc) {
              filter.levelId = levelDoc._id;
            }
          }
        }
      }

      // Filter by Topic
      if (topicParam && mongoose.Types.ObjectId.isValid(topicParam)) {
        filter.topicId = new mongoose.Types.ObjectId(topicParam);
      }

      const homeworkDocs = await Homework.find(filter)
        .sort({ order: 1, homeworkNumber: 1 })
        .populate("levelId", "levelName order")
        .populate("topicId", "topicName order")
        .populate("lessonId", "title lessonNumber duration objectives")
        .lean();

      // Resolve student's completed lessons and attempts if authenticated
      const completedLessonSet = new Set<string>();
      let studentAttempts: any[] = [];

      if (student && student._id) {
        const studentId = student._id;

        const progressDocs = await StudentLessonProgress.find({
          studentId,
          completed: true,
        }).lean();

        for (const p of progressDocs) {
          completedLessonSet.add(p.lessonId.toString());
        }

        studentAttempts = await HomeworkAttempt.find({
          studentId,
        })
          .sort({ createdAt: -1 })
          .lean();
      }

      // Format response with lesson availability & attempt metrics
      let result = homeworkDocs.map((hw: any) => {
        const hwIdStr = hw._id.toString();
        const linkedLessonId = hw.lessonId?._id?.toString() || hw.lessonId?.toString() || "";
        const lessonNum = hw.lessonId?.lessonNumber || hw.homeworkNumber || 1;

        // Lesson is considered completed if recorded in progress
        const isLessonCompleted = linkedLessonId ? completedLessonSet.has(linkedLessonId) : false;

        // Introductory Lesson 1 homework is always unlocked so new students can begin immediately
        const isAvailable = isLessonCompleted || lessonNum === 1 || hw.homeworkNumber === 1;

        // Compute student's attempts for this homework
        const attemptsForHw = studentAttempts.filter(
          (a) => a.homeworkId.toString() === hwIdStr
        );

        let studentStatus = hw.status || "pending";
        let bestScore = 0;
        let latestScore = 0;
        let latestAttempt = null;

        if (attemptsForHw.length > 0) {
          latestAttempt = attemptsForHw[0];
          latestScore = latestAttempt.score ?? 0;
          bestScore = Math.max(...attemptsForHw.map((a) => a.score ?? 0));

          if (attemptsForHw.some((a) => a.status === "evaluated")) {
            studentStatus = "evaluated";
          } else if (attemptsForHw.some((a) => a.status === "submitted")) {
            studentStatus = "submitted";
          } else if (attemptsForHw.some((a) => a.status === "inProgress")) {
            studentStatus = "inProgress";
          }
        }

        return {
          ...hw,
          id: hwIdStr,
          status: student ? studentStatus : hw.status,
          isAvailable,
          lessonCompleted: isLessonCompleted,
          attemptsCount: attemptsForHw.length,
          bestScore,
          latestScore,
          latestAttempt: latestAttempt
            ? {
                _id: latestAttempt._id,
                attemptNumber: latestAttempt.attemptNumber,
                score: latestAttempt.score,
                totalQuestions: latestAttempt.totalQuestions,
                accuracy: latestAttempt.accuracy,
                timeTaken: latestAttempt.timeTaken,
                status: latestAttempt.status,
                submittedAt: latestAttempt.submittedAt,
              }
            : null,
        };
      });

      // Optional status filter
      if (statusParam) {
        result = result.filter((h) => h.status === statusParam);
      }

      // Optional availableOnly filter
      if (availableOnlyParam) {
        result = result.filter((h) => h.isAvailable);
      }

      return NextResponse.json(
        {
          success: true,
          count: result.length,
          data: result,
          source: "database",
        },
        { status: 200 }
      );
    } catch (dbErr) {
      console.warn("[GET /api/homework]: DB offline, serving fallback catalog...", dbErr);

      let fallbackList = getFallbackHomeworkList();

      if (statusParam) {
        fallbackList = fallbackList.filter((h) => h.status === statusParam);
      }

      return NextResponse.json(
        {
          success: true,
          count: fallbackList.length,
          data: fallbackList.map((h) => ({
            ...h,
            isAvailable: true,
            lessonCompleted: true,
            attemptsCount: 0,
            bestScore: 0,
            latestScore: 0,
            latestAttempt: null,
          })),
          source: "fallback",
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[GET /api/homework Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
