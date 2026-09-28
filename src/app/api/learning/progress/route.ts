import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { authenticateRoute } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import StudentLessonProgress from "@/models/StudentLessonProgress";
import Lesson from "@/models/Lesson";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import { getAllCatalogLessons } from "@/lib/seedData";

export const dynamic = "force-dynamic";

// In-memory progress cache for development fallback when MongoDB Atlas IP whitelist is pending
const memoryProgressStore = new Map<string, any>();

function getProgressKey(studentId: string, lessonId: string) {
  return `${studentId}_${lessonId}`;
}

/**
 * GET /api/learning/progress
 * Retrieves progress metrics for the currently authenticated student:
 * - Continue Learning (recommended next/current lesson)
 * - Recently Watched (lessons ordered by most recent playback)
 * - Completed Lessons
 * - In Progress Lessons
 * - Not Started Lessons
 * - Overall Progress (% and counts)
 */
export async function GET(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    const studentIdStr = student._id.toString();

    let allLessons: any[] = [];
    let progressList: any[] = [];
    let dataSource = "database";

    try {
      await connectToDatabase();

      const _levelModel = Level;
      const _topicModel = Topic;

      allLessons = await Lesson.find({ status: "active" })
        .sort({ order: 1, lessonNumber: 1 })
        .populate("levelId", "levelName order")
        .populate("topicId", "topicName order")
        .lean();

      if (allLessons.length === 0) {
        allLessons = getAllCatalogLessons();
      }

      progressList = await StudentLessonProgress.find({
        studentId: student._id,
      })
        .sort({ updatedAt: -1 })
        .lean();
    } catch (dbErr) {
      console.warn("[GET /api/learning/progress]: DB offline, serving catalog & in-memory progress...");
      dataSource = "memory_fallback";
      allLessons = getAllCatalogLessons();

      // Retrieve from memory store for this student
      for (const [key, val] of memoryProgressStore.entries()) {
        if (key.startsWith(`${studentIdStr}_`)) {
          progressList.push(val);
        }
      }
    }

    // Create a lookup map for instant O(1) matching by lesson ID
    const progressMap = new Map<string, any>();
    for (const record of progressList) {
      const lessonKey = record.lessonId?.toString?.() || String(record.lessonId);
      progressMap.set(lessonKey, record);
    }

    const completedLessons: any[] = [];
    const inProgressLessons: any[] = [];
    const notStartedLessons: any[] = [];

    for (const lesson of allLessons) {
      const p = progressMap.get(lesson._id.toString());

      if (p && p.completed) {
        completedLessons.push({
          ...lesson,
          progress: {
            videoProgress: p.videoProgress,
            lastWatchedPosition: p.lastWatchedPosition,
            started: p.started,
            completed: p.completed,
            completedAt: p.completedAt,
            updatedAt: p.updatedAt,
          },
        });
      } else if (p && p.started && !p.completed) {
        inProgressLessons.push({
          ...lesson,
          progress: {
            videoProgress: p.videoProgress,
            lastWatchedPosition: p.lastWatchedPosition,
            started: p.started,
            completed: p.completed,
            completedAt: p.completedAt,
            updatedAt: p.updatedAt,
          },
        });
      } else {
        notStartedLessons.push({
          ...lesson,
          progress: {
            videoProgress: 0,
            lastWatchedPosition: 0,
            started: false,
            completed: false,
            completedAt: null,
            updatedAt: null,
          },
        });
      }
    }

    // Recently Watched: progress records with position/progress > 0
    const lessonMap = new Map<string, any>(
      allLessons.map((l) => [l._id.toString(), l])
    );

    const recentlyWatched = progressList
      .filter((p) => p.lastWatchedPosition > 0 || p.videoProgress > 0)
      .map((p) => {
        const lesson = lessonMap.get(p.lessonId?.toString?.() || String(p.lessonId));
        if (!lesson) return null;
        return {
          ...lesson,
          progress: {
            videoProgress: p.videoProgress,
            lastWatchedPosition: p.lastWatchedPosition,
            started: p.started,
            completed: p.completed,
            completedAt: p.completedAt,
            updatedAt: p.updatedAt,
          },
        };
      })
      .filter(Boolean);

    // Determine Continue Learning
    let continueLearning = null;
    if (inProgressLessons.length > 0) {
      const sortedInProgress = [...inProgressLessons].sort((a, b) => {
        const timeA = a.progress?.updatedAt ? new Date(a.progress.updatedAt).getTime() : 0;
        const timeB = b.progress?.updatedAt ? new Date(b.progress.updatedAt).getTime() : 0;
        return timeB - timeA;
      });
      continueLearning = sortedInProgress[0];
    } else if (notStartedLessons.length > 0) {
      continueLearning = notStartedLessons[0];
    } else if (allLessons.length > 0) {
      continueLearning = completedLessons[0] || allLessons[0];
    }

    // Overall Progress statistics
    const totalLessons = allLessons.length;
    const completedCount = completedLessons.length;
    const inProgressCount = inProgressLessons.length;
    const notStartedCount = notStartedLessons.length;
    const completionPercentage =
      totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

    return NextResponse.json(
      {
        success: true,
        source: dataSource,
        data: {
          continueLearning,
          recentlyWatched,
          completedLessons,
          inProgressLessons,
          notStartedLessons,
          overallProgress: {
            totalLessons,
            completedLessonsCount: completedCount,
            inProgressLessonsCount: inProgressCount,
            notStartedLessonsCount: notStartedCount,
            completionPercentage,
          },
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/learning/progress Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to retrieve student progress";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/learning/progress
 * Updates or creates lesson video playback and completion progress for the authenticated student.
 * Request Body:
 * {
 *   "lessonId": string,
 *   "videoProgress": number,       // 0 to 100
 *   "lastWatchedPosition": number, // in seconds
 *   "completed": boolean           // optional, auto-marked true if videoProgress >= 90
 * }
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    if (authResult.errorResponse) {
      return authResult.errorResponse;
    }

    const student = authResult.user;
    const body = await req.json().catch(() => null);

    if (!body || typeof body !== "object") {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid JSON request body.",
        },
        { status: 400 }
      );
    }

    const { lessonId, videoProgress, lastWatchedPosition, completed } = body;

    if (!lessonId || typeof lessonId !== "string") {
      return NextResponse.json(
        {
          success: false,
          error: "Valid lessonId is required.",
        },
        { status: 400 }
      );
    }

    // Clamp progress values
    const progressNum =
      typeof videoProgress === "number"
        ? Math.min(100, Math.max(0, videoProgress))
        : 0;

    const positionNum =
      typeof lastWatchedPosition === "number"
        ? Math.max(0, lastWatchedPosition)
        : 0;

    const isCompleted = completed === true || progressNum >= 90;
    const now = new Date();

    try {
      await connectToDatabase();

      const updatedProgress = await StudentLessonProgress.findOneAndUpdate(
        {
          studentId: student._id,
          lessonId: new mongoose.Types.ObjectId(lessonId),
        },
        {
          $set: {
            videoProgress: progressNum,
            lastWatchedPosition: positionNum,
            started: true,
            completed: isCompleted,
            ...(isCompleted ? { completedAt: now } : {}),
          },
        },
        {
          new: true,
          upsert: true,
          runValidators: true,
          setDefaultsOnInsert: true,
        }
      );

      return NextResponse.json(
        {
          success: true,
          message: isCompleted
            ? "Lesson marked as completed!"
            : "Lesson progress saved successfully.",
          data: updatedProgress,
          source: "database",
        },
        { status: 200 }
      );
    } catch (dbErr) {
      console.warn("[POST /api/learning/progress]: DB offline, saving progress in memory fallback...");

      const progressRecord = {
        studentId: student._id,
        lessonId,
        videoProgress: progressNum,
        lastWatchedPosition: positionNum,
        started: true,
        completed: isCompleted,
        completedAt: isCompleted ? now : null,
        updatedAt: now,
        createdAt: now,
      };

      const key = getProgressKey(student._id.toString(), lessonId);
      memoryProgressStore.set(key, progressRecord);

      return NextResponse.json(
        {
          success: true,
          message: isCompleted
            ? "Lesson marked as completed!"
            : "Lesson progress saved successfully.",
          data: progressRecord,
          source: "memory_fallback",
        },
        { status: 200 }
      );
    }
  } catch (error: unknown) {
    console.error("[POST /api/learning/progress Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to update lesson progress";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
