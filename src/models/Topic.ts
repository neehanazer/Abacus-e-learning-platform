import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITopic extends Document {
  topicName: string;
  description: string;
  levelId: mongoose.Types.ObjectId;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

const TopicSchema = new Schema<ITopic>(
  {
    topicName: {
      type: String,
      required: [true, "Topic name is required"],
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
    order: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// Index topics by level and order
TopicSchema.index({ levelId: 1, order: 1 });

const Topic: Model<ITopic> =
  mongoose.models.Topic || mongoose.model<ITopic>("Topic", TopicSchema);

export default Topic;
export { Topic };
