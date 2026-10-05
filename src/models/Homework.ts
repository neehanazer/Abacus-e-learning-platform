import mongoose, { Schema, Document, Model } from "mongoose";

export type HomeworkStatus = "pending" | "inProgress" | "submitted" | "evaluated";

export interface IHomework extends Document {
  title: string;
  description: string;
  levelId: mongoose.Types.ObjectId;
  topicId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  questionIds: mongoose.Types.ObjectId[];
  recommendedTime: number; // in minutes
  dueDate: Date;
  assignedDate?: Date;
  assignedType?: "all_level" | "selected_students";
  assignedStudentIds?: mongoose.Types.ObjectId[];
  status: HomeworkStatus;
  homeworkNumber?: number;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

const HomeworkSchema = new Schema<IHomework>(
  {
    title: {
      type: String,
      required: [true, "Homework title is required"],
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
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson ID is required"],
      index: true,
    },
    questionIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "HomeworkQuestion",
      },
    ],
    recommendedTime: {
      type: Number,
      default: 15, // in minutes
      min: [1, "Recommended time must be at least 1 minute"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
      default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
    },
    assignedDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    assignedType: {
      type: String,
      enum: ["all_level", "selected_students"],
      default: "all_level",
    },
    assignedStudentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Student",
      },
    ],
    status: {
      type: String,
      enum: ["pending", "inProgress", "submitted", "evaluated"],
      default: "pending",
      index: true,
    },
    homeworkNumber: {
      type: Number,
      default: 1,
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

HomeworkSchema.index({ levelId: 1, topicId: 1 });

const Homework: Model<IHomework> =
  mongoose.models.Homework || mongoose.model<IHomework>("Homework", HomeworkSchema);

export default Homework;
export { Homework };
