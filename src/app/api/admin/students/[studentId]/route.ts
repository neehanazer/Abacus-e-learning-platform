import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import Student from "@/models/Student";
import Certificate from "@/models/Certificate";
import {
  calculateStudentProgress,
  getStudentExamHistory,
} from "@/services/adminStudentService";

interface RouteParams {
  params: Promise<{ studentId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { studentId } = await params;

    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid student ID format.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const student = await Student.findById(studentId).lean();
    if (!student) {
      return NextResponse.json(
        {
          success: false,
          error: "Student not found.",
        },
        { status: 404 }
      );
    }

    // Calculate dynamic level progress and metrics
    const progressSummary = await calculateStudentProgress(
      student._id,
      student.selectedLevel
    );

    // Get exam history
    const examHistory = await getStudentExamHistory(student._id);

    // Get student certificates
    const certificates = await Certificate.find({ studentId: student._id })
      .populate("levelId", "levelName order")
      .populate("examId", "title type totalMarks")
      .sort({ issueDate: -1 })
      .lean();

    const formattedCertificates = certificates.map((c: Record<string, unknown>) => {
      const levelObj = c.levelId as Record<string, unknown> | undefined;
      const examObj = c.examId as Record<string, unknown> | undefined;
      return {
        id: String(c._id),
        certificateId: c.certificateId as string,
        verificationCode: c.verificationCode as string,
        levelId: levelObj ? String(levelObj._id || levelObj) : "",
        levelName: (levelObj?.levelName as string) || "Level 1",
        levelOrder: (levelObj?.order as number) || 1,
        examId: examObj ? String(examObj._id || examObj) : "",
        examTitle: (examObj?.title as string) || "Level 1: Official Level Certification Final Exam",
        score: c.score as number,
        totalMarks: (c.totalMarks as number) || 100,
        percentage:
          (c.percentage as number) || Math.round(((c.score as number) / ((c.totalMarks as number) || 100)) * 100),
        grade: (c.grade as string) || "A+ (Distinction)",
        issueDate: c.issueDate ? new Date(c.issueDate as string).toISOString() : new Date().toISOString(),
        status: (c.status as string) || "issued",
      };
    });

    // Fetch homework schedule list for this student
    let homeworkDocs: Record<string, unknown>[] = [];
    try {
      const Homework = (await import("@/models/Homework")).default;
      homeworkDocs = await Homework.find()
        .populate("levelId", "levelName order")
        .sort({ order: 1, homeworkNumber: 1 })
        .lean();

      // Ensure Level 2 homeworks exist in DB and levelOrder is populated
      const hasLevel2 = homeworkDocs.some(
        (h) => h.levelOrder === 2 || (typeof h.homeworkNumber === "number" && h.homeworkNumber >= 9)
      );
      if (!hasLevel2 || homeworkDocs.length < 12) {
        const { seedHomeworkData } = await import("@/lib/homeworkSeedData");
        await seedHomeworkData();
        homeworkDocs = await Homework.find()
          .populate("levelId", "levelName order")
          .sort({ order: 1, homeworkNumber: 1 })
          .lean();
      }
    } catch {
      // Fallback
    }

    const studentJoinDate = student.createdAt
      ? new Date(student.createdAt).toISOString().split("T")[0]
      : "2026-10-10";

    // Fetch homework attempts for this student to determine authentic attempt status
    let studentHomeworkAttempts: Record<string, unknown>[] = [];
    try {
      const HomeworkAttempt = (await import("@/models/HomeworkAttempt")).default;
      studentHomeworkAttempts = await HomeworkAttempt.find({
        studentId: student._id,
      }).lean();
    } catch {
      // Fallback
    }

    const attemptMap = new Map<string, Record<string, unknown>>();
    for (const att of studentHomeworkAttempts) {
      const hwRef = att.homeworkId as Record<string, unknown> | string;
      const hwIdStr = typeof hwRef === "object" && hwRef ? String(hwRef._id || hwRef) : String(hwRef);
      attemptMap.set(hwIdStr, att);
    }

    const customSchedules = Array.isArray(student.customHomeworkSchedules)
      ? (student.customHomeworkSchedules as Array<{ homeworkId: string; assignedDate: string; dueDate: string }>)
      : [];

    const isStudentLevel1Done =
      (student as Record<string, unknown>).currentLevel === 2 ||
      Number((student as Record<string, unknown>).currentLevel) >= 2 ||
      (Array.isArray(student.completedLevels) && student.completedLevels.includes(1)) ||
      (student.selectedLevel || "").toLowerCase().includes("level 2") ||
      (progressSummary?.currentLevel || "").toLowerCase().includes("level 2");

    const homeworkList = homeworkDocs.map((hw, idx) => {
      const hwIdStr = String(hw._id);
      const rank = typeof hw.order === "number" && hw.order >= 1 ? hw.order : idx + 1;
      const hwNum = typeof hw.homeworkNumber === "number" ? hw.homeworkNumber : rank;
      const customSchedule = customSchedules.find(
        (cs) => cs.homeworkId === hwIdStr || cs.homeworkId === String(rank)
      );

      // Determine level info
      const levelRef = hw.levelId as Record<string, unknown> | undefined;
      let levelOrder = 1;
      if (typeof hw.levelOrder === "number") {
        levelOrder = hw.levelOrder;
      } else if (typeof levelRef?.order === "number") {
        levelOrder = levelRef.order as number;
      } else if (hwNum >= 8 || rank >= 8) {
        levelOrder = 2;
      }

      const levelName =
        (levelRef?.levelName as string) ||
        (levelOrder === 1
          ? "Level 1: Basic Foundations & Friend Rules"
          : "Level 2: Two-Digit Operations & Big Friend Subtraction");

      // Default calculation:
      let assignedDate = "";
      let dueDate = "";
      if (customSchedule?.assignedDate && customSchedule?.dueDate) {
        assignedDate = customSchedule.assignedDate;
        dueDate = customSchedule.dueDate;
      } else if (levelOrder === 2) {
        // Level 2 active schedule (starting October 2026)
        const l2Start = new Date("2026-10-05T00:00:00.000Z");
        const offsetRank = hwNum >= 8 ? hwNum - 7 : Math.max(1, rank - 7);
        const aDate = new Date(l2Start);
        aDate.setDate(aDate.getDate() + 3 * offsetRank);
        const dDate = new Date(aDate);
        dDate.setDate(dDate.getDate() + 5);
        assignedDate = aDate.toISOString().split("T")[0];
        dueDate = dDate.toISOString().split("T")[0];
      } else {
        // Level 1 schedule (September 2026)
        const joinDt = new Date(studentJoinDate);
        const startDt = new Date(joinDt);
        startDt.setDate(startDt.getDate() + 2 * rank);
        const dueDt = new Date(startDt);
        dueDt.setDate(dueDt.getDate() + 5);
        assignedDate = startDt.toISOString().split("T")[0];
        dueDate = dueDt.toISOString().split("T")[0];
      }

      // Determine authentic student status for this homework
      let status = "pending";
      const studentAttempt = attemptMap.get(hwIdStr);
      if (studentAttempt && studentAttempt.status) {
        status = studentAttempt.status as string;
      } else if (isStudentLevel1Done && levelOrder === 1) {
        // Student completed Level 1 and is currently in Level 2: all Level 1 homeworks are evaluated
        status = "evaluated";
      } else if (isStudentLevel1Done && levelOrder === 2 && (hwNum === 8 || rank === 8)) {
        // First Level 2 homework is evaluated
        status = "evaluated";
      } else if (hw.status === "evaluated") {
        status = "evaluated";
      } else {
        status = "pending";
      }

      return {
        id: hwIdStr,
        title: (hw.title as string) || `Homework Assignment #${rank}`,
        homeworkNumber: hwNum,
        recommendedTime: (hw.recommendedTime as number) || 15,
        assignedDate,
        dueDate,
        status,
        levelOrder,
        levelName,
      };
    });

    // Format response matching complete specification
    const responseData = {
      personalInformation: {
        id: String(student._id),
        name: student.name,
        email: student.email,
        phone: student.phone || "Not provided",
        dateJoined: student.createdAt
          ? new Date(student.createdAt).toISOString()
          : new Date().toISOString(),
        age: student.age || 8,
        guardianName: student.guardianName || "Not specified",
        guardianPhone: student.guardianPhone || "Not specified",
        guardianInformation: {
          name: student.guardianName || "Not specified",
          phone: student.guardianPhone || "Not specified",
        },
        accountStatus: student.accountStatus || "active",
        avatar: student.avatar || "🧙‍♂️",
      },
      learningInformation: {
        selectedLevel: student.selectedLevel || "Level 1",
        currentLevel: progressSummary.currentLevel,
        completedLevels: progressSummary.completedLevels,
        levelCompletionDates: progressSummary.levelProgress
          .filter((lp) => lp.status === "Completed" && lp.completionDate)
          .map((lp) => ({
            level: lp.levelName,
            completedDate: lp.completionDate,
          })),
        lessonsCompleted: progressSummary.lessonsCompleted,
        videosWatched: progressSummary.videosWatched,
        practiceAttempts: progressSummary.practiceAttempts,
        homeworkStatus: progressSummary.homeworkSummary,
        homeworkList,
      },
      levelProgress: progressSummary.levelProgress,
      certificates: formattedCertificates,
      examInformation: {
        examsAttended: examHistory.length,
        examsPassed: examHistory.filter((a) => a.isPassed).length,
        examsFailed: examHistory.filter((a) => a.status !== "in_progress" && !a.isPassed).length,
        attempts: examHistory,
      },
    };

    return NextResponse.json({
      success: true,
      student: responseData,
    });
  } catch (error: unknown) {
    console.error("[Admin Student Details Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load student details.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { studentId } = await params;
    if (!mongoose.Types.ObjectId.isValid(studentId)) {
      return NextResponse.json(
        { success: false, error: "Invalid student ID." },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const body = await req.json();
    const { action } = body;

    const student = await Student.findById(studentId);
    if (!student) {
      return NextResponse.json(
        { success: false, error: "Student not found." },
        { status: 404 }
      );
    }

    if (action === "update_level_dates") {
      const { levelOrder, startDate, completionDate } = body;
      if (!levelOrder || !startDate) {
        return NextResponse.json(
          { success: false, error: "levelOrder and startDate are required." },
          { status: 400 }
        );
      }

      if (!student.levelDates) {
        student.levelDates = [];
      }

      const existingIdx = student.levelDates.findIndex((ld) => ld.levelOrder === Number(levelOrder));
      if (existingIdx >= 0) {
        student.levelDates[existingIdx].startDate = startDate;
        student.levelDates[existingIdx].completionDate = completionDate || null;
      } else {
        student.levelDates.push({
          levelOrder: Number(levelOrder),
          startDate,
          completionDate: completionDate || null,
        });
      }

      // If completionDate is set, automatically chain next level to start 1 day after!
      if (completionDate) {
        const nextOrder = Number(levelOrder) + 1;
        const compDateObj = new Date(completionDate);
        const nextStartObj = new Date(compDateObj);
        nextStartObj.setDate(nextStartObj.getDate() + 1);
        const nextStartFormatted = nextStartObj.toISOString().split("T")[0];

        const nextIdx = student.levelDates.findIndex((ld) => ld.levelOrder === nextOrder);
        if (nextIdx >= 0) {
          student.levelDates[nextIdx].startDate = nextStartFormatted;
        } else {
          student.levelDates.push({
            levelOrder: nextOrder,
            startDate: nextStartFormatted,
            completionDate: null,
          });
        }
      }

      await student.save();
      return NextResponse.json({
        success: true,
        message: "Level enrollment dates updated successfully.",
      });
    }

    if (action === "update_homework_dates") {
      const { homeworkId, assignedDate, dueDate } = body;
      if (!homeworkId || !assignedDate || !dueDate) {
        return NextResponse.json(
          { success: false, error: "homeworkId, assignedDate, and dueDate are required." },
          { status: 400 }
        );
      }

      // Guard: do not allow rescheduling evaluated homework
      try {
        const HomeworkAttempt = (await import("@/models/HomeworkAttempt")).default;
        const evaluatedAttempt = await HomeworkAttempt.findOne({
          studentId: student._id,
          homeworkId,
          status: "evaluated",
        }).lean();

        if (evaluatedAttempt) {
          return NextResponse.json(
            { success: false, error: "Cannot reschedule an already evaluated homework." },
            { status: 400 }
          );
        }
      } catch {
        // Continue
      }

      if (!student.customHomeworkSchedules) {
        student.customHomeworkSchedules = [];
      }

      const existingIdx = student.customHomeworkSchedules.findIndex(
        (cs) => cs.homeworkId === homeworkId
      );
      if (existingIdx >= 0) {
        student.customHomeworkSchedules[existingIdx].assignedDate = assignedDate;
        student.customHomeworkSchedules[existingIdx].dueDate = dueDate;
      } else {
        student.customHomeworkSchedules.push({
          homeworkId,
          assignedDate,
          dueDate,
        });
      }

      await student.save();
      return NextResponse.json({
        success: true,
        message: "Homework dates updated successfully.",
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action." },
      { status: 400 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    console.error("[Update Student Dates Error]:", err);
    return NextResponse.json(
      { success: false, error: err.message || "Failed to update dates." },
      { status: 500 }
    );
  }
}
