import mongoose, { Schema, Document, Model } from "mongoose";

export interface ILevel extends Document {
  levelName: string;
  description: string;
  objectives: string[];
  order: number;
  status: "active" | "inactive" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

const LevelSchema = new Schema<ILevel>(
  {
    levelName: {
      type: String,
      required: [true, "Level name is required"],
      trim: true,
    },
    description: {
      type: String,
      default: "",
      trim: true,
    },
    objectives: {
      type: [String],
      default: [],
    },
    order: {
      type: Number,
      required: [true, "Level order is required"],
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "draft"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

const Level: Model<ILevel> =
  mongoose.models.Level || mongoose.model<ILevel>("Level", LevelSchema);

export default Level;
export { Level };
