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
import {
  calculateHomeworkSchedule,
  isDueDateOver,
} from "@/data/homeworkData";

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

    // Resolve student's currentLevel
    let studentCurrentLevel = 1;
    if (student) {
      if (typeof (student as any).currentLevel === "number" && (student as any).currentLevel >= 1) {
        studentCurrentLevel = (student as any).currentLevel;
      } else {
        const match = String((student as any).selectedLevel || (student as any).abacusLevel || "").match(/Level\s*(\d+)/i);
        studentCurrentLevel = match ? parseInt(match[1], 10) : 1;
      }
    }

    try {
      await connectToDatabase();

      // Ensure full homework catalog is seeded if fewer than 10 exist
      const count = await Homework.countDocuments();
      if (count < 10) {
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

      // Homework Access Rule: strictly restricted to student's current level!
      if (levelParam) {
        const num = Number(levelParam);
        if (!isNaN(num) && num !== studentCurrentLevel) {
          return NextResponse.json(
            {
              success: false,
              error: `Access denied: Homework is restricted to your current enrolled level (Level ${studentCurrentLevel}). You cannot access Level ${num} homework.`,
              data: [],
            },
            { status: 403 }
          );
        }
      }

      const targetLevelDoc = await Level.findOne({ order: studentCurrentLevel });
      if (targetLevelDoc) {
        filter.levelId = targetLevelDoc._id;
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

      const studentJoinDate = (student as any)?.createdAt || "2026-10-10";

      // Format response with lesson availability & attempt metrics
      let result = homeworkDocs.map((hw: any, idx: number) => {
        const hwIdStr = hw._id.toString();
        const linkedLessonId = hw.lessonId?._id?.toString() || hw.lessonId?.toString() || "";
        const lessonNum = hw.lessonId?.lessonNumber || hw.homeworkNumber || (idx + 1);

        // Lesson is considered completed if recorded in progress
        const isLessonCompleted = linkedLessonId ? completedLessonSet.has(linkedLessonId) : false;

        // Dynamic schedule calculation: HW k is assigned joinDate + (2 * k) days, due + 5 days
        const rankInLevel = typeof hw.order === "number" && hw.order >= 1 ? hw.order : idx + 1;
        const joinDt = new Date(studentJoinDate);
        const assignedDt = new Date(joinDt);
        assignedDt.setDate(assignedDt.getDate() + 2 * rankInLevel);
        const dueDt = new Date(assignedDt);
        dueDt.setDate(dueDt.getDate() + 5);

        const now = new Date();
        let finalAssignedDate = assignedDt.toISOString().split("T")[0];
        let finalDueDate = dueDt.toISOString().split("T")[0];
        let finalIsUpcoming = assignedDt > now;
        let finalIsOverdue = dueDt < now;

        // Check if admin customized dates for this homework assignment
        const customSchedule = Array.isArray((student as any)?.customHomeworkSchedules)
          ? (student as any).customHomeworkSchedules.find(
              (cs: any) => cs.homeworkId === hwIdStr || cs.homeworkId === String(rankInLevel)
            )
          : null;

        if (customSchedule) {
          finalAssignedDate = customSchedule.assignedDate;
          finalDueDate = customSchedule.dueDate;
          finalIsUpcoming = new Date(finalAssignedDate) > now;
          finalIsOverdue = new Date(finalDueDate) < now;
        }

        // Available when assigned date has arrived and lesson is accessible
        const isAvailable = (isLessonCompleted || lessonNum === 1 || hw.homeworkNumber === 1) && !finalIsUpcoming;

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
          assignedDate: finalAssignedDate,
          dueDate: finalDueDate,
          status: student ? studentStatus : hw.status,
          isAvailable,
          isUpcoming: finalIsUpcoming,
          isOverdue: finalIsOverdue,
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

      let fallbackList = getFallbackHomeworkList().filter(
        (h: any) => (h.level || 1) === studentCurrentLevel
      );

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
