import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import PracticeWorksheet from "@/models/PracticeWorksheet";
import Level from "@/models/Level";
import { getFallbackWorksheets, seedPracticeData } from "@/lib/practiceSeedData";

export const dynamic = "force-dynamic";

/**
 * GET /api/practice/worksheets
 * Retrieves available practice worksheets with optional filters:
 * - level (order number or ObjectId)
 * - ruleType (direct, small-friend, big-friend, etc.)
 * - difficulty (easy, medium, hard)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const levelParam = searchParams.get("level");
    const ruleType = searchParams.get("ruleType");
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");

    try {
      await connectToDatabase();

      const filter: any = { status: "active" };

      if (levelParam) {
        if (mongoose.Types.ObjectId.isValid(levelParam)) {
          filter.levelId = levelParam;
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

      if (ruleType && ruleType !== "all") {
        filter.ruleType = ruleType;
      }
      if (difficulty && difficulty !== "all") {
        filter.difficulty = difficulty;
      }
      if (category) {
        filter.category = { $regex: category, $options: "i" };
      }

      // Ensure models are registered for populate
      const _levelModel = Level;

      let worksheets = await PracticeWorksheet.find(filter)
        .sort({ order: 1 })
        .populate("levelId", "levelName order")
        .lean();

      // Auto-seed if empty
      if (!worksheets || worksheets.length === 0) {
        const count = await PracticeWorksheet.countDocuments();
        if (count === 0) {
          await seedPracticeData(false).catch(() => null);
          worksheets = await PracticeWorksheet.find(filter)
            .sort({ order: 1 })
            .populate("levelId", "levelName order")
            .lean();
        }
      }

      if (worksheets && worksheets.length > 0) {
        return NextResponse.json(
          {
            success: true,
            count: worksheets.length,
            data: worksheets,
            source: "database",
          },
          { status: 200 }
        );
      }
    } catch (dbErr) {
      console.warn("[GET /api/practice/worksheets]: DB offline, serving catalog fallback...");
    }

    // Catalog fallback
    const fallbackList = getFallbackWorksheets({
      levelOrder: levelParam ? Number(levelParam) : undefined,
      ruleType: ruleType || undefined,
      difficulty: difficulty || undefined,
    });

    return NextResponse.json(
      {
        success: true,
        count: fallbackList.length,
        data: fallbackList,
        source: "catalog",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/practice/worksheets Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch practice worksheets";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
