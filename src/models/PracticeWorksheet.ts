import mongoose, { Schema, Document, Model } from "mongoose";

export interface IPracticeWorksheet extends Document {
  title: string;
  description: string;
  levelId: mongoose.Types.ObjectId;
  topicId?: mongoose.Types.ObjectId;
  category: string;
  ruleType: string;
  difficulty: "easy" | "medium" | "hard";
  totalQuestions: number;
  timeLimit: number; // in seconds
  order: number;
  status: "active" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const PracticeWorksheetSchema = new Schema<IPracticeWorksheet>(
  {
    title: {
      type: String,
      required: [true, "Worksheet title is required"],
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
    topicId: {
      type: Schema.Types.ObjectId,
      ref: "Topic",
      index: true,
    },
    category: {
      type: String,
      default: "General Practice",
      trim: true,
      index: true,
    },
    ruleType: {
      type: String,
      default: "direct",
      trim: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "medium",
    },
    totalQuestions: {
      type: Number,
      default: 10,
      min: 1,
    },
    timeLimit: {
      type: Number,
      default: 600, // 10 minutes default
    },
    order: {
      type: Number,
      default: 1,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "active",
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

PracticeWorksheetSchema.index({ levelId: 1, order: 1 });
PracticeWorksheetSchema.index({ ruleType: 1, difficulty: 1 });

const PracticeWorksheet: Model<IPracticeWorksheet> =
  mongoose.models.PracticeWorksheet ||
  mongoose.model<IPracticeWorksheet>("PracticeWorksheet", PracticeWorksheetSchema);

export default PracticeWorksheet;
export { PracticeWorksheet };
