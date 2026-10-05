import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import { ExamAttempt, Exam } from "@/models";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();

    const matchQuery: Record<string, any> = {
      status: { $in: ["submitted", "evaluated"] },
    };

    if (dateFrom || dateTo) {
      matchQuery.createdAt = {};
      if (dateFrom) matchQuery.createdAt.$gte = new Date(dateFrom);
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        matchQuery.createdAt.$lte = endDate;
      }
    }

    const allAttempts = await ExamAttempt.find(matchQuery)
      .populate({
        path: "examId",
        populate: {
          path: "levelId",
          select: "levelName order",
        },
      })
      .lean();

    // Unique students who attended
    const studentIdsSet = new Set<string>();
    let totalScore = 0;
    let highestMarks = 0;
    let passedCount = 0;
    let failedCount = 0;

    // Exam-wise aggregation map
    const examMap = new Map<string, {
      examId: string;
      examTitle: string;
      examType: string;
      levelName: string;
      totalAttempts: number;
      uniqueStudents: Set<string>;
      passed: number;
      failed: number;
      scores: number[];
    }>();

    for (const att of allAttempts) {
      if (att.studentId) {
        studentIdsSet.add(String(att.studentId));
      }

      const score = att.score || 0;
      totalScore += score;
      if (score > highestMarks) {
        highestMarks = score;
      }

      if (att.isPassed) {
        passedCount++;
      } else {
        failedCount++;
      }

      // Exam group
      const exam: any = att.examId || {};
      const examIdStr = exam._id ? String(exam._id) : "unknown";

      if (!examMap.has(examIdStr)) {
        examMap.set(examIdStr, {
          examId: examIdStr,
          examTitle: exam.title || "Abacus Exam",
          examType: exam.type || "final",
          levelName: exam.levelId?.levelName || "Level 1",
          totalAttempts: 0,
          uniqueStudents: new Set<string>(),
          passed: 0,
          failed: 0,
          scores: [],
        });
      }

      const examGroup = examMap.get(examIdStr)!;
      examGroup.totalAttempts++;
      if (att.studentId) {
        examGroup.uniqueStudents.add(String(att.studentId));
      }
      if (att.isPassed) {
        examGroup.passed++;
      } else {
        examGroup.failed++;
      }
      examGroup.scores.push(score);
    }

    const totalAttemptsCount = allAttempts.length;
    const averageMarks =
      totalAttemptsCount > 0 ? Math.round((totalScore / totalAttemptsCount) * 10) / 10 : 0;

    // Format exam-wise results without exposing personal data
    const examWiseResults = Array.from(examMap.values()).map((eg) => {
      const avg =
        eg.scores.length > 0
          ? Math.round(
              (eg.scores.reduce((a, b) => a + b, 0) / eg.scores.length) * 10
            ) / 10
          : 0;
      const high = eg.scores.length > 0 ? Math.max(...eg.scores) : 0;

      return {
        examId: eg.examId,
        examTitle: eg.examTitle,
        examType: eg.examType,
        level: eg.levelName,
        totalAttempts: eg.totalAttempts,
        totalStudentsAttended: eg.uniqueStudents.size,
        studentsPassed: eg.passed,
        studentsFailed: eg.failed,
        passPercentage:
          eg.totalAttempts > 0
            ? Math.round((eg.passed / eg.totalAttempts) * 100)
            : 0,
        averageMarks: avg,
        highestMarks: high,
      };
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalStudentsAttended: studentIdsSet.size,
        totalAttempts: totalAttemptsCount,
        studentsPassed: passedCount,
        studentsFailed: failedCount,
        overallPassPercentage:
          totalAttemptsCount > 0
            ? Math.round((passedCount / totalAttemptsCount) * 100)
            : 0,
        averageMarks,
        highestMarks,
      },
      examWiseResults,
    });
  } catch (error: unknown) {
    console.error("[Admin Exam Results Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load exam results.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
