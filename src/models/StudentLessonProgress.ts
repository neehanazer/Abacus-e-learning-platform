import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudentLessonProgress extends Document {
  studentId: mongoose.Types.ObjectId;
  lessonId: mongoose.Types.ObjectId;
  videoProgress: number; // 0 to 100 percentage
  lastWatchedPosition: number; // in seconds
  started: boolean;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const StudentLessonProgressSchema = new Schema<IStudentLessonProgress>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    lessonId: {
      type: Schema.Types.ObjectId,
      ref: "Lesson",
      required: [true, "Lesson ID is required"],
      index: true,
    },
    videoProgress: {
      type: Number,
      default: 0,
      min: [0, "Video progress cannot be negative"],
      max: [100, "Video progress cannot exceed 100"],
    },
    lastWatchedPosition: {
      type: Number,
      default: 0,
      min: [0, "Last watched position cannot be negative"],
    },
    started: {
      type: Boolean,
      default: false,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Unique compound index: each student has at most one progress entry per lesson
StudentLessonProgressSchema.index({ studentId: 1, lessonId: 1 }, { unique: true });

// Index for fast query of recent lessons by student
StudentLessonProgressSchema.index({ studentId: 1, updatedAt: -1 });

const StudentLessonProgress: Model<IStudentLessonProgress> =
  mongoose.models.StudentLessonProgress ||
  mongoose.model<IStudentLessonProgress>(
    "StudentLessonProgress",
    StudentLessonProgressSchema
  );

export default StudentLessonProgress;
export { StudentLessonProgress };
