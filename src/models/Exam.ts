import mongoose, { Schema, Document, Model } from "mongoose";

export type ExamType = "mock" | "final";
export type ExamStatus = "active" | "inactive" | "draft" | "archived";

export interface IExam extends Document {
  title: string;
  description: string;
  levelId: mongoose.Types.ObjectId;
  type: ExamType;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  status: ExamStatus;
  questionIds: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    title: {
      type: String,
      required: [true, "Exam title is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: [true, "Level ID is required"],
      index: true,
    },
    type: {
      type: String,
      enum: ["mock", "final"],
      default: "mock",
      required: [true, "Exam type is required (mock or final)"],
      index: true,
    },
    duration: {
      type: Number,
      required: [true, "Exam duration in minutes is required"],
      default: 30, // in minutes
      min: [1, "Duration must be at least 1 minute"],
    },
    totalQuestions: {
      type: Number,
      required: true,
      default: 10,
      min: [1, "Exam must have at least 1 question"],
    },
    totalMarks: {
      type: Number,
      required: true,
      default: 100,
      min: [1, "Total marks must be greater than 0"],
    },
    passingMarks: {
      type: Number,
      required: true,
      default: 60,
      min: [0, "Passing marks cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft", "archived"],
      default: "active",
      index: true,
    },
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "ExamQuestion",
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes for common queries
ExamSchema.index({ type: 1, status: 1 });
ExamSchema.index({ levelId: 1, type: 1, status: 1 });

const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;
