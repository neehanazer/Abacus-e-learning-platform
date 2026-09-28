import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExamQuestion extends Document {
  examId: mongoose.Types.ObjectId;
  questionNumber: number;
  questionText: string;
  numbers?: number[];
  operations?: string[];
  options?: (string | number)[];
  correctAnswer: string | number;
  marks: number;
  explanation?: string;
  ruleType?: string;
  topicId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExamQuestionSchema = new Schema<IExamQuestion>(
  {
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam ID is required"],
      index: true,
    },
    questionNumber: {
      type: Number,
      required: [true, "Question number is required"],
    },
    questionText: {
      type: String,
      required: [true, "Question text/prompt is required"],
      trim: true,
    },
    numbers: {
      type: [Number],
      default: [],
    },
    operations: {
      type: [String],
      default: [],
    },
    options: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: [true, "Correct answer is required"],
    },
    marks: {
      type: Number,
      required: true,
      default: 10,
      min: [1, "Question marks must be at least 1"],
    },
    explanation: {
      type: String,
      default: "",
    },
    ruleType: {
      type: String,
      default: "Direct Addition/Subtraction",
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

ExamQuestionSchema.index({ examId: 1, questionNumber: 1 });

const ExamQuestion: Model<IExamQuestion> =
  mongoose.models.ExamQuestion ||
  mongoose.model<IExamQuestion>("ExamQuestion", ExamQuestionSchema);

export default ExamQuestion;
