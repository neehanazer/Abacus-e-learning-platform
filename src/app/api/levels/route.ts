import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import { seedSyllabusData, getCatalogLevels } from "@/lib/seedData";

export const dynamic = "force-dynamic";

/**
 * GET /api/levels
 * Returns all active Abacus syllabus levels ordered by order ascending.
 * Automatically seeds syllabus data if the levels collection is empty.
 * Falls back to built-in curriculum catalog if database is temporarily unreachable.
 */
export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    let levels = await Level.find({ status: "active" }).sort({ order: 1 }).lean();

    // Auto-seed if database is currently empty
    if (!levels || levels.length === 0) {
      try {
        await seedSyllabusData(false);
        levels = await Level.find({ status: "active" }).sort({ order: 1 }).lean();
      } catch (seedErr) {
        console.warn("[Auto-Seed Warning]:", seedErr);
      }
    }

    if (levels && levels.length > 0) {
      return NextResponse.json(
        {
          success: true,
          count: levels.length,
          data: levels,
          source: "database",
        },
        { status: 200 }
      );
    }

    // Fallback if empty
    const fallback = getCatalogLevels();
    return NextResponse.json(
      {
        success: true,
        count: fallback.length,
        data: fallback,
        source: "catalog",
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.warn("[GET /api/levels]: DB unreachable, serving syllabus catalog fallback:", (error as Error)?.message);
    const fallback = getCatalogLevels();
    return NextResponse.json(
      {
        success: true,
        count: fallback.length,
        data: fallback,
        source: "catalog",
        note: "MongoDB Atlas IP access pending. Displaying curriculum catalog.",
      },
      { status: 200 }
    );
  }
}
