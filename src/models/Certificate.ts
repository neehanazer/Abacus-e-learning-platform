import mongoose, { Schema, Document, Model } from "mongoose";
import crypto from "crypto";

export type CertificateStatus = "issued" | "active" | "revoked";

export interface ICertificate extends Document {
  certificateId: string;
  studentId: mongoose.Types.ObjectId;
  studentName: string;
  levelId: mongoose.Types.ObjectId;
  examId: mongoose.Types.ObjectId;
  score: number;
  grade: string;
  issueDate: Date;
  verificationCode: string;
  status: CertificateStatus;
  createdAt: Date;
  updatedAt: Date;
}

export function generateVerificationCode(): string {
  const part1 = crypto.randomBytes(3).toString("hex").toUpperCase();
  const part2 = crypto.randomBytes(3).toString("hex").toUpperCase();
  return `VER-${part1}-${part2}`;
}

export function generateCertificateId(year: number = new Date().getFullYear()): string {
  const randomHex = crypto.randomBytes(4).toString("hex").toUpperCase();
  return `CERT-${year}-${randomHex}`;
}

export function calculateGrade(score: number, totalMarks: number = 100): string {
  const percentage = totalMarks > 0 ? (score / totalMarks) * 100 : 0;
  if (percentage >= 95) return "A+ (Outstanding)";
  if (percentage >= 85) return "A (Distinction)";
  if (percentage >= 75) return "B+ (Merit)";
  if (percentage >= 60) return "Pass";
  return "Fail";
}

const CertificateSchema = new Schema<ICertificate>(
  {
    certificateId: {
      type: String,
      required: [true, "Certificate ID is required"],
      unique: true,
      trim: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "Student",
      required: [true, "Student ID is required"],
      index: true,
    },
    studentName: {
      type: String,
      required: [true, "Student Name is required"],
      trim: true,
    },
    levelId: {
      type: Schema.Types.ObjectId,
      ref: "Level",
      required: [true, "Level ID is required"],
      index: true,
    },
    examId: {
      type: Schema.Types.ObjectId,
      ref: "Exam",
      required: [true, "Exam ID is required"],
      index: true,
    },
    score: {
      type: Number,
      required: [true, "Score is required"],
      min: 0,
    },
    grade: {
      type: String,
      required: [true, "Grade is required"],
      trim: true,
    },
    issueDate: {
      type: Date,
      default: Date.now,
      required: true,
      index: true,
    },
    verificationCode: {
      type: String,
      required: [true, "Verification code is required"],
      unique: true,
      trim: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["issued", "active", "revoked"],
      default: "issued",
      index: true,
    },
  },
  {
    timestamps: true,
    collection: "certificates",
  }
);

// Indexes
CertificateSchema.index({ studentId: 1, levelId: 1 });
CertificateSchema.index({ verificationCode: 1 });
CertificateSchema.index({ certificateId: 1 });

const Certificate: Model<ICertificate> =
  mongoose.models.Certificate ||
  mongoose.model<ICertificate>("Certificate", CertificateSchema, "certificates");

export default Certificate;
