import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import {
  Homework,
  HomeworkQuestion,
  HomeworkAttempt,
  Student,
} from "@/models";

interface RouteParams {
  params: Promise<{ homeworkId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { homeworkId } = await params;

    if (!mongoose.Types.ObjectId.isValid(homeworkId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid homework ID.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const homework = await Homework.findById(homeworkId)
      .populate("levelId", "levelName order")
      .populate("topicId", "topicName")
      .populate("lessonId", "title")
      .lean();

    if (!homework) {
      return NextResponse.json(
        {
          success: false,
          error: "Homework not found.",
        },
        { status: 404 }
      );
    }

    // Fetch questions
    const questions = await HomeworkQuestion.find({
      homeworkId: homework._id,
    })
      .sort({ order: 1 })
      .lean();

    // Fetch attempts
    const attempts = await HomeworkAttempt.find({
      homeworkId: homework._id,
    })
      .populate("studentId", "name email phone selectedLevel avatar")
      .sort({ updatedAt: -1 })
      .lean();

    // Calculate assigned students
    let assignedStudents: any[] = [];
    if (homework.assignedStudentIds && homework.assignedStudentIds.length > 0) {
      assignedStudents = await Student.find({
        _id: { $in: homework.assignedStudentIds },
      }).lean();
    } else {
      const levelName = (homework.levelId as any)?.levelName;
      if (levelName) {
        assignedStudents = await Student.find({
          $or: [
            { selectedLevel: new RegExp(levelName, "i") },
            { abacusLevel: new RegExp(levelName, "i") },
          ],
        }).lean();
      }
    }

    // Merge attempts and assigned students
    const attemptMap = new Map<string, any>();
    for (const a of attempts) {
      if (a.studentId) {
        attemptMap.set(String((a.studentId as any)._id || a.studentId), a);
      }
    }

    const studentBreakdown = assignedStudents.map((st: any) => {
      const att = attemptMap.get(String(st._id));
      let status = "pending";
      let score = 0;
      let accuracy = 0;
      let timeTaken = 0;
      let submittedAt: string | null = null;
      let attemptNumber = 1;

      if (att) {
        if (att.status === "evaluated") {
          status = "evaluated";
        } else if (att.status === "submitted") {
          status = "submitted";
        } else if (att.answers && att.answers.length > 0) {
          status = "started";
        } else {
          status = "inProgress";
        }
        score = att.score || 0;
        accuracy = att.accuracy || 0;
        timeTaken = att.timeTaken || 0;
        submittedAt = att.submittedAt ? new Date(att.submittedAt).toISOString() : null;
        attemptNumber = att.attemptNumber || 1;
      }

      return {
        studentId: String(st._id),
        name: st.name,
        email: st.email,
        phone: st.phone || "Not provided",
        level: st.selectedLevel,
        status,
        score,
        accuracy,
        timeTaken,
        submittedAt,
        attemptNumber,
      };
    });

    const totalAssigned = assignedStudents.length > 0 ? assignedStudents.length : attempts.length;
    const startedCount = studentBreakdown.filter(
      (s) => s.status === "started" || s.status === "inProgress"
    ).length;
    const submittedCount = studentBreakdown.filter(
      (s) => s.status === "submitted" || s.status === "evaluated"
    ).length;
    const evaluatedCount = studentBreakdown.filter((s) => s.status === "evaluated").length;
    const pendingCount = Math.max(0, totalAssigned - submittedCount);

    return NextResponse.json({
      success: true,
      homework: {
        id: String(homework._id),
        title: homework.title,
        description: homework.description,
        level: (homework.levelId as any)?.levelName || "Level 1",
        topic: (homework.topicId as any)?.topicName || "General",
        lesson: (homework.lessonId as any)?.title || "Lesson 1",
        recommendedTime: homework.recommendedTime,
        assignedDate: homework.assignedDate
          ? new Date(homework.assignedDate).toISOString()
          : new Date(homework.createdAt).toISOString(),
        dueDate: new Date(homework.dueDate).toISOString(),
        status: homework.status,
        monitoring: {
          assigned: totalAssigned,
          started: startedCount,
          submitted: submittedCount,
          pending: pendingCount,
          evaluated: evaluatedCount,
        },
        questions: questions.map((q: any) => ({
          id: String(q._id),
          question: q.question,
          questionType: q.questionType,
          options: q.options,
          correctAnswer: q.correctAnswer,
          marks: q.marks,
          explanation: q.explanation,
          order: q.order,
        })),
        students: studentBreakdown,
      },
    });
  } catch (error: unknown) {
    console.error("[Admin Homework Monitoring Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load homework details.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
