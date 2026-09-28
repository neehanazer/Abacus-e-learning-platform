import mongoose, { Schema, Document, Model } from "mongoose";

export interface IHomeworkQuestion extends Document {
  homeworkId: mongoose.Types.ObjectId;
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
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkQuestionSchema = new Schema<IHomeworkQuestion>(
  {
    homeworkId: {
      type: Schema.Types.ObjectId,
      ref: "Homework",
      required: [true, "Homework ID is required"],
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
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

HomeworkQuestionSchema.index({ homeworkId: 1, order: 1 });

const HomeworkQuestion: Model<IHomeworkQuestion> =
  mongoose.models.HomeworkQuestion ||
  mongoose.model<IHomeworkQuestion>("HomeworkQuestion", HomeworkQuestionSchema);

export default HomeworkQuestion;
export { HomeworkQuestion };
