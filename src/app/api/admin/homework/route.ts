import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import {
  Homework,
  HomeworkQuestion,
  HomeworkAttempt,
  Student,
  Level,
  Topic,
  Lesson,
} from "@/models";

// GET /api/admin/homework
export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const levelFilter = searchParams.get("level")?.trim();
    const statusFilter = searchParams.get("status")?.trim();
    const dateFrom = searchParams.get("dateFrom")?.trim();
    const dateTo = searchParams.get("dateTo")?.trim();
    const search = searchParams.get("search")?.trim();

    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const skip = (page - 1) * limit;

    const query: Record<string, any> = {};

    if (search) {
      query.title = new RegExp(search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    }

    if (levelFilter && levelFilter !== "all") {
      if (mongoose.Types.ObjectId.isValid(levelFilter)) {
        query.levelId = new mongoose.Types.ObjectId(levelFilter);
      }
    }

    if (statusFilter && statusFilter !== "all") {
      query.status = statusFilter;
    }

    if (dateFrom || dateTo) {
      query.assignedDate = {};
      if (dateFrom) {
        query.assignedDate.$gte = new Date(dateFrom);
      }
      if (dateTo) {
        const endDate = new Date(dateTo);
        endDate.setHours(23, 59, 59, 999);
        query.assignedDate.$lte = endDate;
      }
    }

    const total = await Homework.countDocuments(query);
    const homeworks = await Homework.find(query)
      .populate("levelId", "levelName order")
      .populate("topicId", "topicName")
      .populate("lessonId", "title")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Compute student stats for each homework
    const list = await Promise.all(
      homeworks.map(async (hw: any) => {
        const hwId = hw._id;
        const attempts = await HomeworkAttempt.find({ homeworkId: hwId }).lean();

        let assignedCount = hw.assignedStudentIds ? hw.assignedStudentIds.length : 0;
        if (assignedCount === 0) {
          // If assigned to all students of the level
          const levelName = hw.levelId?.levelName;
          if (levelName) {
            assignedCount = await Student.countDocuments({
              $or: [
                { selectedLevel: new RegExp(levelName, "i") },
                { abacusLevel: new RegExp(levelName, "i") },
              ],
            });
          }
          if (assignedCount === 0) {
            assignedCount = attempts.length;
          }
        }

        const submittedCount = attempts.filter(
          (a) => a.status === "submitted" || a.status === "evaluated"
        ).length;

        const evaluatedCount = attempts.filter((a) => a.status === "evaluated").length;
        const pendingCount = Math.max(0, assignedCount - submittedCount);

        return {
          id: String(hw._id),
          homeworkId: String(hw._id),
          title: hw.title,
          description: hw.description || "",
          level: hw.levelId?.levelName || "Level 1",
          levelId: hw.levelId?._id ? String(hw.levelId._id) : String(hw.levelId),
          topic: hw.topicId?.topicName || "General",
          lesson: hw.lessonId?.title || "Lesson 1",
          assignedDate: hw.assignedDate
            ? new Date(hw.assignedDate).toISOString()
            : hw.createdAt
            ? new Date(hw.createdAt).toISOString()
            : new Date().toISOString(),
          dueDate: hw.dueDate ? new Date(hw.dueDate).toISOString() : new Date().toISOString(),
          numberStudentsAssigned: assignedCount,
          assignedCount,
          submittedCount,
          pendingCount,
          evaluatedCount,
          status: hw.status || "pending",
          questionsCount: hw.questionIds ? hw.questionIds.length : 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      homework: list,
    });
  } catch (error: unknown) {
    console.error("[Admin Homework GET Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load homework.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/homework
export async function POST(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const body = await req.json();
    const {
      title,
      description,
      level,
      levelId: rawLevelId,
      topicId: rawTopicId,
      lessonId: rawLessonId,
      topic,
      lesson,
      questions,
      assignedStudents,
      assignedLevel,
      assignedDate,
      dueDate,
      recommendedTime,
    } = body;

    if (!title || typeof title !== "string" || !title.trim()) {
      return NextResponse.json(
        {
          success: false,
          error: "Homework title is required.",
        },
        { status: 400 }
      );
    }

    // Resolve Level
    let resolvedLevelId = rawLevelId || level;
    if (resolvedLevelId && !mongoose.Types.ObjectId.isValid(resolvedLevelId)) {
      // Find level by name
      const lvlDoc = await Level.findOne({
        levelName: new RegExp(String(resolvedLevelId).trim(), "i"),
      });
      if (lvlDoc) {
        resolvedLevelId = String(lvlDoc._id);
      }
    }

    if (!resolvedLevelId || !mongoose.Types.ObjectId.isValid(resolvedLevelId)) {
      // Fallback: pick first available level
      const firstLvl = await Level.findOne().sort({ order: 1 });
      if (firstLvl) {
        resolvedLevelId = String(firstLvl._id);
      } else {
        const createdLvl = await Level.create({
          levelName: "Level 1 - Direct Addition & Subtraction",
          order: 1,
          status: "active",
        });
        resolvedLevelId = String(createdLvl._id);
      }
    }

    // Resolve Topic
    let resolvedTopicId = rawTopicId || topic;
    if (!resolvedTopicId || !mongoose.Types.ObjectId.isValid(resolvedTopicId)) {
      const existingTopic = await Topic.findOne({ levelId: resolvedLevelId });
      if (existingTopic) {
        resolvedTopicId = String(existingTopic._id);
      } else {
        const createdTopic = await Topic.create({
          topicName: "Basic Abacus Arithmetic",
          levelId: resolvedLevelId,
          order: 1,
        });
        resolvedTopicId = String(createdTopic._id);
      }
    }

    // Resolve Lesson
    let resolvedLessonId = rawLessonId || lesson;
    if (!resolvedLessonId || !mongoose.Types.ObjectId.isValid(resolvedLessonId)) {
      const existingLesson = await Lesson.findOne({ levelId: resolvedLevelId });
      if (existingLesson) {
        resolvedLessonId = String(existingLesson._id);
      } else {
        const createdLesson = await Lesson.create({
          title: "Introduction to Homework Practice",
          levelId: resolvedLevelId,
          topicId: resolvedTopicId,
          lessonNumber: 1,
          order: 1,
          status: "active",
        });
        resolvedLessonId = String(createdLesson._id);
      }
    }

    // Resolve target students
    let targetStudentIds: mongoose.Types.ObjectId[] = [];
    let assignmentType: "all_level" | "selected_students" = "all_level";

    if (Array.isArray(assignedStudents) && assignedStudents.length > 0) {
      assignmentType = "selected_students";
      targetStudentIds = assignedStudents
        .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
        .map((id: string) => new mongoose.Types.ObjectId(id));
    } else {
      assignmentType = "all_level";
      // Find all students for this level
      const lvlDoc = await Level.findById(resolvedLevelId);
      const lvlName = lvlDoc?.levelName;

      const studentQuery: Record<string, any> = {};
      if (lvlName) {
        studentQuery.$or = [
          { selectedLevel: new RegExp(lvlName, "i") },
          { abacusLevel: new RegExp(lvlName, "i") },
        ];
      }

      const matchingStudents = await Student.find(studentQuery).select("_id").lean();
      targetStudentIds = matchingStudents.map((s: any) => s._id);
    }

    const homeworkAssignedDate = assignedDate ? new Date(assignedDate) : new Date();
    const homeworkDueDate = dueDate
      ? new Date(dueDate)
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    // Create Homework document
    const newHomework = new Homework({
      title: title.trim(),
      description: description ? description.trim() : "",
      levelId: new mongoose.Types.ObjectId(resolvedLevelId),
      topicId: new mongoose.Types.ObjectId(resolvedTopicId),
      lessonId: new mongoose.Types.ObjectId(resolvedLessonId),
      dueDate: homeworkDueDate,
      assignedDate: homeworkAssignedDate,
      assignedType: assignmentType,
      assignedStudentIds: targetStudentIds,
      recommendedTime: recommendedTime || 15,
      status: "pending",
      questionIds: [],
    });

    await newHomework.save();

    // Create Questions if provided
    const createdQuestionIds: mongoose.Types.ObjectId[] = [];
    if (Array.isArray(questions) && questions.length > 0) {
      for (let i = 0; i < questions.length; i++) {
        const q = questions[i];
        const newQ = await HomeworkQuestion.create({
          homeworkId: newHomework._id,
          question: q.question || `Question ${i + 1}`,
          questionType: q.questionType || "numberInput",
          options: q.options || [],
          correctAnswer: q.correctAnswer ?? 0,
          difficulty: q.difficulty || "medium",
          marks: q.marks || 1,
          explanation: q.explanation || "",
          numbers: q.numbers || [],
          operation: q.operation || "+",
          ruleHint: q.ruleHint || "",
          order: q.order || i + 1,
        });
        createdQuestionIds.push(newQ._id as mongoose.Types.ObjectId);
      }

      newHomework.questionIds = createdQuestionIds;
      await newHomework.save();
    }

    // Initialize HomeworkAttempt tracking records for assigned students
    for (const stId of targetStudentIds) {
      const existing = await HomeworkAttempt.findOne({
        studentId: stId,
        homeworkId: newHomework._id,
      });

      if (!existing) {
        await HomeworkAttempt.create({
          studentId: stId,
          homeworkId: newHomework._id,
          answers: [],
          attemptNumber: 1,
          score: 0,
          totalQuestions: createdQuestionIds.length,
          accuracy: 0,
          timeTaken: 0,
          submittedAt: null,
          status: "inProgress",
        });
      }
    }

    return NextResponse.json(
      {
        success: true,
        message: "Homework created and assigned successfully.",
        homework: {
          id: String(newHomework._id),
          title: newHomework.title,
          description: newHomework.description,
          levelId: String(newHomework.levelId),
          assignedType: newHomework.assignedType,
          assignedDate: newHomework.assignedDate,
          dueDate: newHomework.dueDate,
          numberStudentsAssigned: targetStudentIds.length,
          questionsCount: createdQuestionIds.length,
        },
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    console.error("[Admin Homework POST Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to create homework.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
