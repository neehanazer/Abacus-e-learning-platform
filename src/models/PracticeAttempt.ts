import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPracticeAttemptAnswer {
  questionId: mongoose.Types.ObjectId;
  userAnswer: string | number | null;
  correctAnswer?: string | number;
  isCorrect: boolean;
  timeSpent?: number; // seconds
}

export interface IPracticeAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  worksheetId: mongoose.Types.ObjectId;
  answers: IPracticeAttemptAnswer[];
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number; // percentage 0 to 100
  attemptNumber: number;
  timeTaken: number; // seconds
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AnswerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "PracticeQuestion",
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
      required: true,
      default: false,
    },
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const PracticeAttemptSchema = new Schema<IPracticeAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    worksheetId: {
      type: Schema.Types.ObjectId,
      ref: "PracticeWorksheet",
      required: [true, "Worksheet ID is required"],
      index: true,
    },
    answers: {
      type: [AnswerSchema],
      default: [],
    },
    score: {
      type: Number,
      default: 0,
    },
    correctAnswers: {
      type: Number,
      default: 0,
    },
    totalQuestions: {
      type: Number,
      default: 0,
    },
    accuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
    timeTaken: {
      type: Number,
      default: 0, // seconds
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast history and leaderboard lookups
PracticeAttemptSchema.index({ studentId: 1, submittedAt: -1 });
PracticeAttemptSchema.index({ studentId: 1, worksheetId: 1, submittedAt: -1 });

const PracticeAttempt: Model<IPracticeAttempt> =
  mongoose.models.PracticeAttempt ||
  mongoose.model<IPracticeAttempt>("PracticeAttempt", PracticeAttemptSchema);

export default PracticeAttempt;
export { PracticeAttempt };
