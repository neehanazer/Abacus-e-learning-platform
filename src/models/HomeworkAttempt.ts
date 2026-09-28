import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomeworkAttemptAnswer {
  questionId: mongoose.Types.ObjectId;
  studentAnswer: string | number | null;
  userAnswer?: string | number | null;
  correctAnswer?: string | number;
  isCorrect: boolean;
  timeSpent?: number; // seconds
}

export type HomeworkAttemptStatus = "inProgress" | "submitted" | "evaluated";

export interface IHomeworkAttempt extends Document {
  studentId: mongoose.Types.ObjectId;
  homeworkId: mongoose.Types.ObjectId;
  answers: IHomeworkAttemptAnswer[];
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  accuracy: number; // percentage 0 to 100
  timeTaken: number; // seconds
  submittedAt: Date | null;
  status: HomeworkAttemptStatus;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkAttemptAnswerSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "HomeworkQuestion",
      required: true,
    },
    studentAnswer: {
      type: Schema.Types.Mixed,
      default: null,
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
    timeSpent: {
      type: Number,
      default: 0,
    },
  },
  { _id: false }
);

const HomeworkAttemptSchema = new Schema<IHomeworkAttempt>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: "Homework",
      required: [true, "Homework ID is required"],
      index: true,
    },
    answers: {
      type: [HomeworkAttemptAnswerSchema],
      default: [],
    },
    attemptNumber: {
      type: Number,
      required: [true, "Attempt number is required"],
      default: 1,
    },
    score: {
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
    timeTaken: {
      type: Number,
      default: 0, // in seconds
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["inProgress", "submitted", "evaluated"],
      default: "inProgress",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

HomeworkAttemptSchema.index({ studentId: 1, homeworkId: 1, attemptNumber: 1 });
HomeworkAttemptSchema.index({ studentId: 1, updatedAt: -1 });

const HomeworkAttempt: Model<IHomeworkAttempt> =
  mongoose.models.HomeworkAttempt ||
  mongoose.model<IHomeworkAttempt>("HomeworkAttempt", HomeworkAttemptSchema);

export default HomeworkAttempt;
export { HomeworkAttempt };
