import mongoose, { Schema, Document, Model } from "mongoose";

export interface IRecommendedPractice {
  topicId?: string;
  title: string;
  category?: string;
  reason: string;
  type: "lesson" | "practice" | "homework";
  link?: string;
}

export interface IReadinessAssessment {
  score: number; // 0 to 100
  status: "ready" | "almost_ready" | "needs_more_practice" | "not_started";
  summary: string;
  recommendedLevel?: string;
}

export type EvaluationProvider = "rule_based_fallback" | "gemini" | "openai" | "claude";

export interface IEvaluation extends Document {
  studentId: mongoose.Types.ObjectId;
  evaluationType: "performance" | "homework" | "practice" | "readiness";
  referenceId?: mongoose.Types.ObjectId;
  strengths: string[];
  weakAreas: string[];
  recommendedPractice: IRecommendedPractice[];
  accuracyImprovement: string;
  speedImprovement: string;
  readiness: IReadinessAssessment;
  overallFeedback: string;
  provider: EvaluationProvider;
  modelName?: string;
  metricsSnapshot: {
    totalQuestions: number;
    correctAnswers: number;
    accuracy: number;
    avgTimePerQuestion: number;
    totalAttempts: number;
    strongTopicsCount: number;
    weakTopicsCount: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const RecommendedPracticeSchema = new Schema(
  {
    topicId: { type: String, default: "" },
    title: { type: String, required: true },
    category: { type: String, default: "" },
    reason: { type: String, required: true },
    type: {
      type: String,
      enum: ["lesson", "practice", "homework"],
      default: "practice",
    },
    link: { type: String, default: "" },
  },
  { _id: false }
);

const ReadinessAssessmentSchema = new Schema(
  {
    score: { type: Number, min: 0, max: 100, default: 0 },
    status: {
      type: String,
      enum: ["ready", "almost_ready", "needs_more_practice", "not_started"],
      default: "not_started",
    },
    summary: { type: String, default: "" },
    recommendedLevel: { type: String, default: "" },
  },
  { _id: false }
);

const EvaluationSchema = new Schema<IEvaluation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    evaluationType: {
      type: String,
      enum: ["performance", "homework", "practice", "readiness"],
      default: "performance",
      index: true,
    },
    referenceId: {
      type: Schema.Types.ObjectId,
      default: null,
    },
    strengths: {
      type: [String],
      default: [],
    },
    weakAreas: {
      type: [String],
      default: [],
    },
    recommendedPractice: {
      type: [RecommendedPracticeSchema],
      default: [],
    },
    accuracyImprovement: {
      type: String,
      default: "",
    },
    speedImprovement: {
      type: String,
      default: "",
    },
    readiness: {
      type: ReadinessAssessmentSchema,
      default: () => ({
        score: 0,
        status: "not_started",
        summary: "No evaluation recorded yet.",
      }),
    },
    overallFeedback: {
      type: String,
      default: "",
    },
    provider: {
      type: String,
      enum: ["rule_based_fallback", "gemini", "openai", "claude"],
      default: "rule_based_fallback",
    },
    modelName: {
      type: String,
      default: "heuristic-v1",
    },
    metricsSnapshot: {
      totalQuestions: { type: Number, default: 0 },
      correctAnswers: { type: Number, default: 0 },
      accuracy: { type: Number, default: 0 },
      avgTimePerQuestion: { type: Number, default: 0 },
      totalAttempts: { type: Number, default: 0 },
      strongTopicsCount: { type: Number, default: 0 },
      weakTopicsCount: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
  }
);

EvaluationSchema.index({ studentId: 1, createdAt: -1 });
EvaluationSchema.index({ studentId: 1, evaluationType: 1 });

const Evaluation: Model<IEvaluation> =
  mongoose.models.Evaluation ||
  mongoose.model<IEvaluation>("Evaluation", EvaluationSchema);

export default Evaluation;
export { Evaluation };
