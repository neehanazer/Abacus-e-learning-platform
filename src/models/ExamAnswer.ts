import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamAnswer extends Document {
  examAttemptId: mongoose.Types.ObjectId;
  questionId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  userAnswer: string | number | null;
  correctAnswer: string | number;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpent: number; // in seconds
  createdAt: Date;
  updatedAt: Date;
}

const ExamAnswerSchema = new Schema<IExamAnswer>(
  {
    examAttemptId: {
      type: Schema.Types.ObjectId,
      ref: "ExamAttempt",
      required: [true, "Exam attempt ID is required"],
      index: true,
    },
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "ExamQuestion",
      required: [true, "Question ID is required"],
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    userAnswer: {
      type: Schema.Types.Mixed,
      default: null,
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: [true, "Correct answer is required"],
    },
    isCorrect: {
      type: Boolean,
      required: true,
      default: false,
    },
    marksAwarded: {
      type: Number,
      default: 0,
    },
    timeSpent: {
      type: Number,
      default: 0, // seconds
    },
  },
  {
    timestamps: true,
  }
);

ExamAnswerSchema.index({ examAttemptId: 1, questionId: 1 }, { unique: true });

const ExamAnswer: Model<IExamAnswer> =
  mongoose.models.ExamAnswer ||
  mongoose.model<IExamAnswer>("ExamAnswer", ExamAnswerSchema);

export default ExamAnswer;
