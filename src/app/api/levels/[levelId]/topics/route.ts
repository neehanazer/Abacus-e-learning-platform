import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import { getCatalogLevel, getCatalogTopics } from "@/lib/seedData";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    levelId: string;
  }>;
}

/**
 * GET /api/levels/[levelId]/topics
 * Returns all topics associated with the specified level ID or order number,
 * ordered by topic order ascending.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { levelId } = await params;

    if (!levelId) {
      return NextResponse.json(
        {
          success: false,
          error: "Level ID parameter is required.",
        },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();

      const isObjectId = mongoose.Types.ObjectId.isValid(levelId);
      const numericOrder = Number(levelId);

      const queryConditions: any[] = [];
      if (isObjectId) {
        queryConditions.push({ _id: levelId });
      }
      if (!isNaN(numericOrder) && numericOrder > 0) {
        queryConditions.push({ order: numericOrder });
      }

      if (queryConditions.length > 0) {
        const level = await Level.findOne({
          $or: queryConditions,
        }).lean();

        if (level) {
          const topics = await Topic.find({
            levelId: level._id,
          })
            .sort({ order: 1 })
            .lean();

          if (topics && topics.length > 0) {
            return NextResponse.json(
              {
                success: true,
                level: {
                  _id: level._id,
                  levelName: level.levelName,
                  order: level.order,
                },
                count: topics.length,
                data: topics,
                source: "database",
              },
              { status: 200 }
            );
          }
        }
      }
    } catch (dbErr) {
      console.warn("[GET /api/levels/[levelId]/topics]: DB offline, trying catalog fallback...");
    }

    // Catalog fallback
    const fallbackLevel = getCatalogLevel(levelId);
    if (fallbackLevel) {
      const fallbackTopics = getCatalogTopics(levelId) || [];
      return NextResponse.json(
        {
          success: true,
          level: {
            _id: fallbackLevel._id,
            levelName: fallbackLevel.levelName,
            order: fallbackLevel.order,
          },
          count: fallbackTopics.length,
          data: fallbackTopics,
          source: "catalog",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Level '${levelId}' not found.`,
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/levels/[levelId]/topics Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch topics";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
