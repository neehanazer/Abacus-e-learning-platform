import { NextRequest, NextResponse } from "next/server";
import { seedSyllabusData } from "@/lib/seedData";
import { seedPracticeData } from "@/lib/practiceSeedData";
import { seedHomeworkData } from "@/lib/homeworkSeedData";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import Lesson from "@/models/Lesson";
import PracticeWorksheet from "@/models/PracticeWorksheet";
import PracticeQuestion from "@/models/PracticeQuestion";
import Homework from "@/models/Homework";
import HomeworkQuestion from "@/models/HomeworkQuestion";
import { connectToDatabase } from "@/lib/mongodb";

export const dynamic = "force-dynamic";

/**
 * GET /api/seed
 * Checks seed status (count of levels, topics, lessons, worksheets, questions, homework).
 */
export async function GET() {
  try {
    await connectToDatabase();
    const levelsCount = await Level.countDocuments();
    const topicsCount = await Topic.countDocuments();
    const lessonsCount = await Lesson.countDocuments();
    const worksheetsCount = await PracticeWorksheet.countDocuments();
    const questionsCount = await PracticeQuestion.countDocuments();
    const homeworkCount = await Homework.countDocuments();
    const homeworkQuestionsCount = await HomeworkQuestion.countDocuments();

    return NextResponse.json({
      success: true,
      source: "database",
      counts: {
        levels: levelsCount,
        topics: topicsCount,
        lessons: lessonsCount,
        worksheets: worksheetsCount,
        practiceQuestions: questionsCount,
        homework: homeworkCount,
        homeworkQuestions: homeworkQuestionsCount,
      },
      seeded: levelsCount > 0,
    });
  } catch (error: unknown) {
    const errorMsg =
      error instanceof Error ? error.message : "Error connecting to MongoDB";
    return NextResponse.json({
      success: true,
      source: "catalog",
      counts: {
        levels: 4,
        topics: 7,
        lessons: 11,
        worksheets: 6,
        practiceQuestions: 50,
        homework: 6,
        homeworkQuestions: 44,
      },
      databaseStatus:
        "MongoDB Atlas IP access pending. Please ensure your current IP or 0.0.0.0/0 is added in MongoDB Atlas -> Network Access.",
      rawError: errorMsg,
      seeded: false,
    });
  }
}

/**
 * POST /api/seed
 * Seeds or re-seeds sample realistic Abacus syllabus & practice data into MongoDB.
 * Body: { "force": true, "type": "all" | "syllabus" | "practice" }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const force = body?.force === true;
    const type = body?.type || "all";

    let syllabusResult: any = null;
    let practiceResult: any = null;
    let homeworkResult: any = null;

    if (type === "all" || type === "syllabus") {
      syllabusResult = await seedSyllabusData(force);
    }
    if (type === "all" || type === "practice") {
      practiceResult = await seedPracticeData(force);
    }
    if (type === "all" || type === "homework") {
      homeworkResult = await seedHomeworkData();
    }

    return NextResponse.json(
      {
        success: true,
        message: "Seed operation completed successfully",
        data: {
          syllabus: syllabusResult,
          practice: practiceResult,
          homework: homeworkResult,
        },
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    console.error("[POST /api/seed Error]:", error);
    const message =
      error instanceof Error ? error.message : "Failed to seed data";
    return NextResponse.json(
      {
        success: false,
        error: message,
        tip: "If this is a server selection error, add your IP in MongoDB Atlas: Network Access -> + Add IP Address -> Allow Access from Anywhere (0.0.0.0/0).",
      },
      { status: 500 }
    );
  }
}
