import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import { ExamAttempt, Exam, Level, Student, ProctoringEvent } from "@/models";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim();
    const levelFilter = searchParams.get("level")?.trim();
    const examTypeFilter = searchParams.get("examType")?.trim();
    const resultFilter = searchParams.get("result")?.trim()?.toLowerCase();
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    // Filter by pass/fail
    if (resultFilter === "pass") {
      query.isPassed = true;
    } else if (resultFilter === "fail") {
      query.isPassed = false;
    }

    // Filter by date
    if (dateFrom || dateTo) {
      query.$or = [
        {
          submittedAt: {
            ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
            ...(dateTo
              ? {
                  $lte: (() => {
                    const d = new Date(dateTo);
                    d.setHours(23, 59, 59, 999);
                    return d;
                  })(),
                }
              : {}),
          },
        },
        {
          createdAt: {
            ...(dateFrom ? { $gte: new Date(dateFrom) } : {}),
            ...(dateTo
              ? {
                  $lte: (() => {
                    const d = new Date(dateTo);
                    d.setHours(23, 59, 59, 999);
                    return d;
                  })(),
                }
              : {}),
          },
        },
      ];
    }

    // Filter by student name/email if searched
    if (search) {
      const studentMatches = await Student.find({
        $or: [
          { name: new RegExp(search, "i") },
          { email: new RegExp(search, "i") },
        ],
      })
        .select("_id")
        .lean();

      const matchedStudentIds = studentMatches.map((s) => s._id);

      // Also search exam title
      const examMatches = await Exam.find({
        title: new RegExp(search, "i"),
      })
        .select("_id")
        .lean();

      const matchedExamIds = examMatches.map((e) => e._id);

      query.$and = query.$and || [];
      query.$and.push({
        $or: [
          { studentId: { $in: matchedStudentIds } },
          { examId: { $in: matchedExamIds } },
        ],
      });
    }

    // Filter by level or examType
    if (levelFilter && levelFilter !== "all") {
      let lvlId: mongoose.Types.ObjectId | null = null;
      if (mongoose.Types.ObjectId.isValid(levelFilter)) {
        lvlId = new mongoose.Types.ObjectId(levelFilter);
      } else {
        const lvlDoc = await Level.findOne({ levelName: new RegExp(levelFilter, "i") });
        if (lvlDoc) lvlId = lvlDoc._id as mongoose.Types.ObjectId;
      }

      if (lvlId) {
        const matchingExams = await Exam.find({ levelId: lvlId }).select("_id").lean();
        const examIds = matchingExams.map((e) => e._id);
        query.examId = { $in: examIds };
      }
    }

    if (examTypeFilter && examTypeFilter !== "all") {
      const matchingExams = await Exam.find({ type: examTypeFilter }).select("_id").lean();
      const examIds = matchingExams.map((e) => e._id);
      if (query.examId) {
        // Intersect
        const prevIn = (query.examId as any).$in || [];
        query.examId = {
          $in: prevIn.filter((id: any) =>
            examIds.some((eid) => String(eid) === String(id))
          ),
        };
      } else {
        query.examId = { $in: examIds };
      }
    }

    const total = await ExamAttempt.countDocuments(query);
    const attempts = await ExamAttempt.find(query)
      .populate("studentId", "name email phone selectedLevel")
      .populate({
        path: "examId",
        populate: {
          path: "levelId",
          select: "levelName order",
        },
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const formattedAttempts = await Promise.all(
      attempts.map(async (att: any) => {
        const student = att.studentId || {};
        const exam = att.examId || {};
        const level = exam.levelId || {};

        const proctoringCount = await ProctoringEvent.countDocuments({
          examAttemptId: att._id,
        });

        const examDate = att.submittedAt
          ? new Date(att.submittedAt).toISOString()
          : att.createdAt
          ? new Date(att.createdAt).toISOString()
          : new Date().toISOString();

        return {
          attemptId: String(att._id),
          studentId: student._id ? String(student._id) : "",
          studentName: student.name || "Student",
          studentEmail: student.email || "",
          examId: exam._id ? String(exam._id) : "",
          examName: exam.title || "Abacus Exam",
          examType: exam.type || "final",
          level: level.levelName || "Level 1",
          levelId: level._id ? String(level._id) : "",
          examDate,
          marks: `${att.score}/${att.totalMarks || 100}`,
          score: att.score,
          totalMarks: att.totalMarks || 100,
          percentage: att.percentage,
          result: att.isPassed ? "PASS" : "FAIL",
          isPassed: att.isPassed,
          attemptNumber: att.attemptNumber || 1,
          timeTaken: att.timeTaken || 0,
          status: att.status,
          proctoringEventsCount: proctoringCount,
        };
      })
    );

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      attempts: formattedAttempts,
    });
  } catch (error: unknown) {
    console.error("[Admin Exam Attempts Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load exam attempts.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
