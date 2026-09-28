import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import PracticeWorksheet from "@/models/PracticeWorksheet";
import PracticeQuestion from "@/models/PracticeQuestion";
import Level from "@/models/Level";
import { getFallbackWorksheet } from "@/lib/practiceSeedData";

export const dynamic = "force-dynamic";

interface RouteParams {
  params: Promise<{
    worksheetId: string;
  }>;
}

/**
 * GET /api/practice/worksheets/[worksheetId]
 * Retrieves details for a specific practice worksheet along with all its questions.
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const { worksheetId } = await params;

    if (!worksheetId) {
      return NextResponse.json(
        {
          success: false,
          error: "Worksheet ID parameter is required.",
        },
        { status: 400 }
      );
    }

    try {
      await connectToDatabase();

      if (mongoose.Types.ObjectId.isValid(worksheetId)) {
        const _levelModel = Level;

        const worksheet = await PracticeWorksheet.findById(worksheetId)
          .populate("levelId", "levelName order")
          .lean();

        if (worksheet) {
          const questions = await PracticeQuestion.find({
            worksheetId: worksheet._id,
          })
            .sort({ marks: 1, createdAt: 1 })
            .lean();

          return NextResponse.json(
            {
              success: true,
              data: {
                ...worksheet,
                questions,
              },
              source: "database",
            },
            { status: 200 }
          );
        }
      }
    } catch (dbErr) {
      console.warn("[GET /api/practice/worksheets/[worksheetId]]: DB offline, trying catalog fallback...");
    }

    // Catalog fallback
    const fallbackWorksheet = getFallbackWorksheet(worksheetId);
    if (fallbackWorksheet) {
      return NextResponse.json(
        {
          success: true,
          data: fallbackWorksheet,
          source: "catalog",
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: `Practice worksheet '${worksheetId}' not found.`,
      },
      { status: 404 }
    );
  } catch (error: unknown) {
    console.error("[GET /api/practice/worksheets/[worksheetId] Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to fetch practice worksheet";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
