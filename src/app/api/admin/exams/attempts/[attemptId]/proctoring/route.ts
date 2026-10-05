import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import { authenticateAdminRoute } from "@/lib/adminAuth";
import { ProctoringEvent, ExamAttempt, Student, Exam } from "@/models";

interface RouteParams {
  params: Promise<{ attemptId: string }>;
}

export async function GET(req: NextRequest, { params }: RouteParams) {
  const auth = await authenticateAdminRoute(req);
  if (auth.errorResponse) {
    return auth.errorResponse;
  }

  try {
    const { attemptId } = await params;

    if (!mongoose.Types.ObjectId.isValid(attemptId)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid exam attempt ID format.",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const attempt = await ExamAttempt.findById(attemptId)
      .populate("studentId", "name email selectedLevel")
      .populate("examId", "title type totalMarks")
      .lean();

    if (!attempt) {
      return NextResponse.json(
        {
          success: false,
          error: "Exam attempt not found.",
        },
        { status: 404 }
      );
    }

    const events = await ProctoringEvent.find({
      examAttemptId: new mongoose.Types.ObjectId(attemptId),
    })
      .sort({ timestamp: 1 })
      .lean();

    // Summary counts for review (not auto-guilty)
    const severityCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0,
    };

    for (const ev of events) {
      if (ev.severity && severityCounts[ev.severity as keyof typeof severityCounts] !== undefined) {
        severityCounts[ev.severity as keyof typeof severityCounts]++;
      }
    }

    const totalEvents = events.length;
    // Calculate a suggestive integrity score (informational for admin review)
    let reviewRecommendation = "Clean session - No significant anomalies detected.";
    if (severityCounts.critical > 0 || severityCounts.high >= 3) {
      reviewRecommendation = "Recommended for Manual Admin Review - Multiple high-priority anomalies detected.";
    } else if (severityCounts.high > 0 || severityCounts.medium >= 3) {
      reviewRecommendation = "Notice - Minor anomalies flagged during session.";
    }

    const formattedEvents = events.map((ev: any) => ({
      id: String(ev._id),
      eventType: ev.eventType,
      timestamp: ev.timestamp ? new Date(ev.timestamp).toISOString() : new Date().toISOString(),
      confidence: ev.confidence ?? 0.9,
      severity: ev.severity || "medium",
      description: ev.description || "",
      metadata: ev.metadata || {},
    }));

    const student: any = attempt.studentId || {};
    const exam: any = attempt.examId || {};

    return NextResponse.json({
      success: true,
      attemptInfo: {
        attemptId: String(attempt._id),
        studentName: student.name || "Student",
        studentEmail: student.email || "",
        examTitle: exam.title || "Abacus Exam",
        score: attempt.score,
        totalMarks: attempt.totalMarks,
        percentage: attempt.percentage,
        isPassed: attempt.isPassed,
        startedAt: attempt.startedAt,
        submittedAt: attempt.submittedAt,
      },
      proctoringReview: {
        totalEvents,
        severityCounts,
        recommendation: reviewRecommendation,
        events: formattedEvents,
      },
    });
  } catch (error: unknown) {
    console.error("[Admin Proctoring Review Error]:", error);
    const message = error instanceof Error ? error.message : "Failed to load proctoring events.";
    return NextResponse.json(
      {
        success: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
