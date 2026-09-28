import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Topic from "@/models/Topic";
import Lesson from "@/models/Lesson";
import { getCatalogLessons } from "@/lib/seedData";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    topicId: string;
  }>;
}

/**
 * GET /api/topics/[topicId]/lessons
 * Returns all active lessons belonging to a specific topic ID,
 * ordered by lessonNumber and order ascending.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { topicId } = await params;

    if (!topicId) {
      return NextResponse.json(
        {
          success: false,
          error: "Topic ID parameter is required.",
        },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();

      if (mongoose.Types.ObjectId.isValid(topicId)) {
        const topic = await Topic.findById(topicId).lean();
        if (topic) {
          const lessons = await Lesson.find({
            topicId: topic._id,
            status: "active",
          })
            .sort({ lessonNumber: 1, order: 1 })
            .lean();

          if (lessons && lessons.length > 0) {
            return NextResponse.json(
              {
                success: true,
                topic: {
                  _id: topic._id,
                  topicName: topic.topicName,
                  levelId: topic.levelId,
                  order: topic.order,
                },
                count: lessons.length,
                data: lessons,
                source: "database",
              },
              { status: 200 }
            );
          }
        }
      }
    } catch (dbErr) {
      console.warn("[GET /api/topics/[topicId]/lessons]: DB offline, trying catalog fallback...");
    }

    // Catalog fallback
    const fallbackLessons = getCatalogLessons(topicId);
    if (fallbackLessons) {
      return NextResponse.json(
        {
          success: true,
          count: fallbackLessons.length,
          data: fallbackLessons,
          source: "catalog",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Topic '${topicId}' not found.`,
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/topics/[topicId]/lessons Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch lessons";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
