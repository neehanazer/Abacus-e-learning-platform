import mongoose, { Schema, Document, Model } from "mongoose";

export type ProctoringEventType =
  | "face_not_detected"
  | "multiple_faces"
  | "phone_detected"
  | "suspicious_object"
  | "unusual_head_movement"
  | "tab_change"
  | "camera_disconnected"
  | "microphone_disconnected";

export type ProctoringSeverity = "low" | "medium" | "high" | "critical";

export interface IProctoringEvent extends Document {
  examAttemptId: mongoose.Types.ObjectId;
  studentId?: mongoose.Types.ObjectId;
  eventType: ProctoringEventType;
  timestamp: Date;
  confidence: number;
  severity: ProctoringSeverity;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

const ProctoringEventSchema = new Schema<IProctoringEvent>(
  {
    examAttemptId: {
      type: Schema.Types.ObjectId,
      ref: "ExamAttempt",
      required: [true, "Exam attempt ID is required"],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      index: true,
    },
    eventType: {
      type: String,
      enum: [
        "face_not_detected",
        "multiple_faces",
        "phone_detected",
        "suspicious_object",
        "unusual_head_movement",
        "tab_change",
        "camera_disconnected",
        "microphone_disconnected",
      ],
      required: [true, "Event type is required"],
      index: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
    confidence: {
      type: Number,
      default: 0.9,
      min: [0, "Confidence cannot be less than 0"],
      max: [1, "Confidence cannot exceed 1"],
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
      index: true,
    },
    description: {
      type: String,
      required: [true, "Description of the event is required"],
      trim: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ProctoringEventSchema.index({ examAttemptId: 1, timestamp: 1 });

const ProctoringEvent: Model<IProctoringEvent> =
  mongoose.models.ProctoringEvent ||
  mongoose.model<IProctoringEvent>("ProctoringEvent", ProctoringEventSchema);

export default ProctoringEvent;
