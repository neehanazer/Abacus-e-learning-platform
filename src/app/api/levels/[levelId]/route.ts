import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import { getCatalogLevel } from "@/lib/seedData";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    levelId: string;
  }>;
}

/**
 * GET /api/levels/[levelId]
 * Fetches a single level by either its MongoDB _id or its numeric order (e.g., 1).
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
          return NextResponse.json(
            {
              success: true,
              data: level,
              source: "database",
            },
            { status: 200 }
          );
        }
      }
    } catch (dbErr) {
      console.warn("[GET /api/levels/[levelId]]: DB offline, trying catalog fallback...");
    }

    // Try catalog fallback
    const fallbackLevel = getCatalogLevel(levelId);
    if (fallbackLevel) {
      return NextResponse.json(
        {
          success: true,
          data: {
            _id: fallbackLevel._id,
            levelName: fallbackLevel.levelName,
            description: fallbackLevel.description,
            objectives: fallbackLevel.objectives,
            order: fallbackLevel.order,
            status: fallbackLevel.status,
          },
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
    console.error("[GET /api/levels/[levelId] Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to fetch level";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
