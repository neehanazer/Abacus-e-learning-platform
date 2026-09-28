import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPracticeQuestion extends Document {
  levelId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  worksheetId: mongoose.Types.ObjectId;
  question: string;
  questionType: "multipleChoice" | "numberInput" | "abacus";
  options: (string | number)[];
  correctAnswer: string | number;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  explanation: string;
  numbers?: number[];
  operation?: string;
  ruleHint?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PracticeQuestionSchema = new Schema<IPracticeQuestion>(
  {
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: [true, "Level ID is required"],
      index: true,
    },
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      index: true,
    },
    worksheetId: {
      type: Schema.Types.ObjectId,
      ref: "PracticeWorksheet",
      required: [true, "Worksheet ID is required"],
      index: true,
    },
    question: {
      type: String,
      required: [true, "Question text is required"],
      trim: true,
    },
    questionType: {
      type: String,
      enum: ["multipleChoice", "numberInput", "abacus"],
      default: "numberInput",
      index: true,
    },
    options: {
      type: [Schema.Types.Mixed],
      default: [],
    },
    correctAnswer: {
      type: Schema.Types.Mixed,
      required: [true, "Correct answer is required"],
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    marks: {
      type: Number,
      default: 1,
      min: 1,
    },
    explanation: {
      type: String,
      default: "",
      trim: true,
    },
    numbers: {
      type: [Number],
      default: [],
    },
    operation: {
      type: String,
      default: "+",
    },
    ruleHint: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

PracticeQuestionSchema.index({ worksheetId: 1, difficulty: 1 });

const PracticeQuestion: Model<IPracticeQuestion> =
  mongoose.models.PracticeQuestion ||
  mongoose.model<IPracticeQuestion>("PracticeQuestion", PracticeQuestionSchema);

export default PracticeQuestion;
export { PracticeQuestion };
