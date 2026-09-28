import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import { getCatalogLesson } from "@/lib/seedData";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    lessonId: string;
  }>;
}

/**
 * GET /api/lessons/[lessonId]
 * Fetches single lesson details, populated with its Level and Topic info.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { lessonId } = await params;

    if (!lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: "Lesson ID parameter is required.",
        },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();

      if (mongoose.Types.ObjectId.isValid(lessonId)) {
        const _levelModel = Level;
        const _topicModel = Topic;

        const lesson = await Lesson.findById(lessonId)
          .populate("levelId", "levelName order status description")
          .populate("topicId", "topicName order description")
          .lean();

        if (lesson) {
          return NextResponse.json(
            {
              success: true,
              data: lesson,
              source: "database",
            },
            { status: 200 }
          );
        }
      }
    } catch (dbErr) {
      console.warn("[GET /api/lessons/[lessonId]]: DB offline, trying catalog fallback...");
    }

    // Catalog fallback
    const fallbackLesson = getCatalogLesson(lessonId);
    if (fallbackLesson) {
      return NextResponse.json(
        {
          success: true,
          data: fallbackLesson,
          source: "catalog",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Lesson '${lessonId}' not found.`,
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/lessons/[lessonId] Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch lesson";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
