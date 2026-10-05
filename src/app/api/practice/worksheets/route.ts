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

    const { authenticateRoute } = await import("@/lib/auth");
    const authResult = await authenticateRoute(req);
    const student = authResult.user || null;

    let studentCurrentLevel = 1;
    if (student) {
      if (typeof (student as any).currentLevel === "number" && (student as any).currentLevel >= 1) {
        studentCurrentLevel = (student as any).currentLevel;
      } else {
        const match = String((student as any).selectedLevel || (student as any).abacusLevel || "").match(/Level\s*(\d+)/i);
        studentCurrentLevel = match ? parseInt(match[1], 10) : 1;
      }
    }

    // Cumulative check: student cannot access practice above their current level
    if (levelParam) {
      const num = Number(levelParam);
      if (!isNaN(num) && num > studentCurrentLevel) {
        return NextResponse.json(
          {
            success: false,
            error: `Access denied: Practice is restricted to levels up to your current enrolled level (Level ${studentCurrentLevel}). Level ${num} is locked.`,
            data: [],
          },
          { status: 403 }
        );
      }
    }

    try {
      await connectToDatabase();

      const filter: any = { status: "active" };

      // Get allowed level IDs (all levels <= studentCurrentLevel)
      const allowedLevelDocs = await Level.find({ order: { $lte: studentCurrentLevel } }).lean();
      const allowedLevelIds = allowedLevelDocs.map((l) => l._id);

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
      } else {
        if (allowedLevelIds.length > 0) {
          filter.levelId = { $in: allowedLevelIds };
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
            currentLevel: studentCurrentLevel,
            source: "database",
          },
          { status: 200 }
        );
      }
    } catch (dbErr) {
      console.warn("[GET /api/practice/worksheets]: DB offline, serving catalog fallback...");
    }

    // Catalog fallback (cumulative: <= studentCurrentLevel)
    let fallbackList = getFallbackWorksheets({
      levelOrder: levelParam ? Number(levelParam) : undefined,
      ruleType: ruleType || undefined,
      difficulty: difficulty || undefined,
    }).filter((w: any) => ((w.level ?? w.levelOrder) || 1) <= studentCurrentLevel);

    return NextResponse.json(
      {
        success: true,
        count: fallbackList.length,
        data: fallbackList,
        currentLevel: studentCurrentLevel,
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
