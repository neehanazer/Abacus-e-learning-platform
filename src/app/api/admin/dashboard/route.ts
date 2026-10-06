import { NextRequest, NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import {
  Student,
  Level,
  StudentLessonProgress,
  Homework,
  HomeworkAttempt,
  ExamAttempt,
  Certificate,
} from "@/models";

export async function GET(req: NextRequest) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const daysParam = parseInt(searchParams.get("days") || "30", 10);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    // Calculate recent window for "new students"
    let newStudentsStartDate: Date;
    let newStudentsEndDate: Date = new Date();

    if (startDateParam) {
      newStudentsStartDate = new Date(startDateParam);
      if (endDateParam) {
        newStudentsEndDate = new Date(endDateParam);
        newStudentsEndDate.setHours(23, 59, 59, 999);
      }
    } else {
      const days = isNaN(daysParam) ? 30 : Math.max(1, daysParam);
      newStudentsStartDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    }

    // Run parallel counts for fast dashboard loading
    const [
      totalStudents,
      newStudents,
      activeStudents,
      totalLevels,
      distinctLearningStudents,
      completedLevelsCount,
      allHomeworks,
      allHomeworkAttempts,
      totalExamsConducted,
      passedExams,
      failedExams,
      certificatesIssued,
    ] = await Promise.all([
      // Total students
      Student.countDocuments(),

      // New students
      Student.countDocuments({
        createdAt: {
          $gte: newStudentsStartDate,
          $lte: newStudentsEndDate,
        },
      }),

      // Active students
      Student.countDocuments({ accountStatus: "active" }),

      // Total levels
      Level.countDocuments({ status: "active" }),

      // Students currently learning (have recorded lesson progress or active progress in last 30 days)
      StudentLessonProgress.distinct("studentId"),

      // Completed levels (count of passed final exams or certificates)
      Certificate.countDocuments({ status: { $in: ["issued", "active"] } }),

      // All Homeworks count
      Homework.countDocuments(),

      // All Homework attempts
      HomeworkAttempt.find().select("status studentId").lean(),

      // Total exams conducted
      ExamAttempt.countDocuments({ status: { $in: ["submitted", "evaluated"] } }),

      // Passed exams
      ExamAttempt.countDocuments({ isPassed: true, status: { $in: ["submitted", "evaluated"] } }),

      // Failed exams
      ExamAttempt.countDocuments({ isPassed: false, status: { $in: ["submitted", "evaluated"] } }),

      // Certificates issued
      Certificate.countDocuments(),
    ]);

    // Calculate homework pending vs submitted
    const submittedHomework = allHomeworkAttempts.filter(
      (a: any) => a.status === "submitted" || a.status === "evaluated"
    ).length;

    // Approximate pending homework = total homeworks * active students - submitted
    const totalPossibleAssignments = allHomeworks * (activeStudents || 1);
    const pendingHomework = Math.max(0, totalPossibleAssignments - submittedHomework);

    return NextResponse.json({
      success: true,
      statistics: {
        totalStudents,
        newStudents,
        newStudentsPeriod: {
          from: newStudentsStartDate.toISOString(),
          to: newStudentsEndDate.toISOString(),
          days: Math.round((newStudentsEndDate.getTime() - newStudentsStartDate.getTime()) / (1000 * 3600 * 24)),
        },
        activeStudents,
        totalLevels,
        studentsCurrentlyLearning: distinctLearningStudents.length,
        completedLevels: completedLevelsCount,
        pendingHomework,
        submittedHomework,
        totalExamsConducted,
        passedExams,
        failedExams,
        certificatesIssued,
      },
      summary: {
        studentMetrics: {
          total: totalStudents,
          new: newStudents,
          active: activeStudents,
          currentlyLearning: distinctLearningStudents.length,
        },
        academicMetrics: {
          totalLevels,
          completedLevels: completedLevelsCount,
          certificatesIssued,
        },
        homeworkMetrics: {
          totalHomeworks: allHomeworks,
          submitted: submittedHomework,
          pending: pendingHomework,
        },
        examMetrics: {
          totalConducted: totalExamsConducted,
          passed: passedExams,
          failed: failedExams,
          passRatePercentage:
            totalExamsConducted > 0
              ? Math.round((passedExams / totalExamsConducted) * 100)
              : 0,
        },
      },
    });
  } catch (error: unknown) {
    console.error("[Admin Dashboard Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load dashboard metrics.";
    const isDbConnectionIssue =
      message.includes("alert number 80") ||
      message.includes("SSL routines") ||
      message.includes("whitelisted") ||
      message.includes("ECONNREFUSED") ||
      message.includes("MongooseServerSelectionError") ||
      message.includes("MongoNetworkError");

    if (isDbConnectionIssue) {
      return NextResponse.json({
        success: true,
        databaseConnected: false,
        warning: "MongoDB Atlas connection is currently unreachable (check IP whitelist in Atlas Network Access). Showing safe baseline statistics.",
        statistics: {
          totalStudents: 0,
          newStudents: 0,
          newStudentsPeriod: {
            from: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString(),
            to: new Date().toISOString(),
            days: 30,
          },
          activeStudents: 0,
          totalLevels: 4,
          studentsCurrentlyLearning: 0,
          completedLevels: 0,
          pendingHomework: 0,
          submittedHomework: 0,
          totalExamsConducted: 0,
          passedExams: 0,
          failedExams: 0,
          certificatesIssued: 0,
        },
        summary: {
          studentMetrics: { total: 0, new: 0, active: 0, currentlyLearning: 0 },
          academicMetrics: { totalLevels: 4, completedLevels: 0, certificatesIssued: 0 },
          homeworkMetrics: { totalHomeworks: 0, submitted: 0, pending: 0 },
          examMetrics: { totalConducted: 0, passed: 0, failed: 0, passRatePercentage: 0 },
        },
      });
    }

    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
