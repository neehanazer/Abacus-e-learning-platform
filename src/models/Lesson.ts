import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILesson extends Document {
  title: string;
  description: string;
  levelId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  lessonNumber: number;
  videoUrl: string;
  duration: number; // in seconds
  objectives: string[];
  order: number;
  status: "active" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema<ILesson>(
  {
    title: {
      type: String,
      required: [true, "Lesson title is required"],
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
      required: [true, "Topic ID is required"],
      index: true,
    },
    lessonNumber: {
      type: Number,
      required: [true, "Lesson number is required"],
      index: true,
    },
    videoUrl: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: Number,
      default: 0, // duration in seconds
    },
    objectives: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      default: 1,
    },
    status: {
      type: String,
      enum: ["active", "draft"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for fast lookups
LessonSchema.index({ topicId: 1, order: 1 });
LessonSchema.index({ levelId: 1, lessonNumber: 1 });

const Lesson: Model<ILesson> =
  mongoose.models.Lesson || mongoose.model<ILesson>("Lesson", LessonSchema);

export default Lesson;
export { Lesson };
