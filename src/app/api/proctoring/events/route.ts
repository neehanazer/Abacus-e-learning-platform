import { NextRequest, NextResponse } from "next/server";
import { authenticateRoute } from "@/lib/auth";
import ExamService from "@/services/examService";
import { ProctoringEventType, ProctoringSeverity } from "@/types";

export const dynamic = "force-dynamic";

const VALID_EVENT_TYPES: ProctoringEventType[] = [
  "face_not_detected",
  "multiple_faces",
  "phone_detected",
  "suspicious_object",
  "unusual_head_movement",
  "tab_change",
  "camera_disconnected",
  "microphone_disconnected",
];

const VALID_SEVERITIES: ProctoringSeverity[] = ["low", "medium", "high", "critical"];

/**
 * POST /api/proctoring/events
 * Logs a real-time proctoring anomaly event during an exam attempt.
 *
 * IMPORTANT:
 * - Does NOT automatically fail a student because of one single event.
 * - Stores events for post-session integrity review and rule-based evaluation.
 */
export async function POST(req: NextRequest) {
  try {
    const authResult = await authenticateRoute(req);
    const student = authResult.user;

    const body = await req.json().catch(() => ({}));
    const {
      examAttemptId,
      eventType,
      timestamp,
      confidence = 0.9,
      severity = "medium",
      description,
      metadata = {},
    } = body;

    if (!examAttemptId) {
      return NextResponse.json(
        { success: false, error: "examAttemptId is required" },
        { status: 400 }
      );
    }

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid eventType. Must be one of: ${VALID_EVENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (severity && !VALID_SEVERITIES.includes(severity)) {
      return NextResponse.json(
        {
          success: false,
          error: `Invalid severity. Must be one of: ${VALID_SEVERITIES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    if (!description || typeof description !== "string") {
      return NextResponse.json(
        { success: false, error: "description string is required" },
        { status: 400 }
      );
    }

    const targetStudentId = student?._id ? student._id.toString() : undefined;

    const loggedEvent = await ExamService.recordProctoringEvent({
      examAttemptId,
      studentId: targetStudentId,
      eventType,
      timestamp,
      confidence: Number(confidence) || 0.9,
      severity,
      description,
      metadata,
    });

    return NextResponse.json(
      {
        success: true,
        message: "Proctoring event logged successfully for review",
        data: loggedEvent,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : "Internal Server Error";
    console.error("[POST /api/proctoring/events Error]:", error);
    return NextResponse.json(
      {
        success: false,
        error: errorMsg,
      },
      { status: 500 }
    );
  }
}
