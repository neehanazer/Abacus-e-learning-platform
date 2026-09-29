import mongoose, { Schema, Document, Model } from "mongoose";

export type ExamAttemptStatus = "in_progress" | "submitted" | "evaluated";

export interface IExamAttemptAnswerSummary {
  questionId: mongoose.Types.ObjectId;
  userAnswer: string | number | null;
  correctAnswer?: string | number;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpent: number; // in seconds
}

export interface IExamAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  attemptNumber: number;
  score: number;
  totalMarks: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  timeTaken: number; // in seconds
  isPassed: boolean;
  status: ExamAttemptStatus;
  answers: IExamAttemptAnswerSummary[];
  startedAt: Date;
  submittedAt: Date | null;
  failedAt?: Date | null;
  reExamEligibleAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const ExamAttemptAnswerSummarySchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "ExamQuestion",
      required: true,
    },
    userAnswer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
    },
    isCorrect: {
      type: Boolean,
      default: false,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const ExamAttemptSchema = new Schema<IExamAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam ID is required"],
      index: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    score: {
      type: Number,
      default: 0,
      min: 0,
    },
    totalMarks: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    incorrectAnswers: {
      type: Number,
      default: 0,
    },
    unansweredCount: {
      type: Number,
      default: 0,
    },
    timeTaken: {
      type: Number,
      default: 0, // in seconds
    },
    isPassed: {
      type: Boolean,
      default: false,
      index: true,
    },
    status: {
      type: String,
      enum: ["in_progress", "submitted", "evaluated"],
      default: "in_progress",
      index: true,
    },
    answers: {
      type: [ExamAttemptAnswerSummarySchema],
      default: [],
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    failedAt: {
      type: Date,
      default: null,
    },
    reExamEligibleAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

ExamAttemptSchema.index({ studentId: 1, examId: 1, attemptNumber: -1 });
ExamAttemptSchema.index({ studentId: 1, status: 1 });

const ExamAttempt: Model<IExamAttempt> =
  mongoose.models.ExamAttempt ||
  mongoose.model<IExamAttempt>("ExamAttempt", ExamAttemptSchema);

export default ExamAttempt;
