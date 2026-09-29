import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Certificate, {
  ICertificate,
  generateVerificationCode,
  generateCertificateId,
  calculateGrade,
  CertificateStatus,
} from "@/models/Certificate";
import Student from "@/models/Student";
import Exam from "@/models/Exam";
import Level from "@/models/Level";

// In-memory fallback for offline environments or testing
const globalForCertificates = globalThis as unknown as {
  __inMemoryCertificates?: Map<string, any>;
};

const inMemoryCertificates: Map<string, any> =
  globalForCertificates.__inMemoryCertificates ||
  (globalForCertificates.__inMemoryCertificates = new Map());

export interface CreateCertificateParams {
  studentId: string;
  studentName?: string;
  levelId: string;
  examId: string;
  score: number;
  totalMarks?: number;
}

export class CertificateService {
  /**
   * Automatically creates a Certificate upon successful final exam completion.
   * Certificate should be created ONLY after successful final exam completion.
   */
  static async createCertificateForFinalExam(params: CreateCertificateParams): Promise<any> {
    const { studentId, levelId, examId, score, totalMarks = 100 } = params;

    try {
      await connectToDatabase();
    } catch {
      // offline fallback
    }

    let studentName = params.studentName || "";

    // Resolve studentName from Student collection if not provided
    if (!studentName && mongoose.connection?.readyState === 1 && mongoose.Types.ObjectId.isValid(studentId)) {
      try {
        const studentDoc = await Student.findById(studentId).lean();
        if (studentDoc) {
          studentName =
            (studentDoc as any).fullName ||
            (studentDoc as any).name ||
            (studentDoc as any).username ||
            "Abacus Student";
        }
      } catch (err) {
        console.warn("[CertificateService]: Error fetching student name:", err);
      }
    }

    if (!studentName) {
      studentName = "Abacus Student";
    }

    const grade = calculateGrade(score, totalMarks);
    const verificationCode = generateVerificationCode();
    const certificateId = generateCertificateId();
    const issueDate = new Date();

    const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
      ? new mongoose.Types.ObjectId(studentId)
      : null;
    const levelObjectId = mongoose.Types.ObjectId.isValid(levelId)
      ? new mongoose.Types.ObjectId(levelId)
      : null;
    const examObjectId = mongoose.Types.ObjectId.isValid(examId)
      ? new mongoose.Types.ObjectId(examId)
      : null;

    // Check if certificate already exists in DB
    if (mongoose.connection?.readyState === 1 && studentObjectId && examObjectId) {
      try {
        const existing = await Certificate.findOne({
          studentId: studentObjectId,
          examId: examObjectId,
        })
          .populate("levelId", "levelName order")
          .populate("examId", "title type")
          .lean();

        if (existing) {
          return {
            ...existing,
            id: existing._id.toString(),
          };
        }

        const created = await Certificate.create({
          certificateId,
          studentId: studentObjectId,
          studentName,
          levelId: levelObjectId,
          examId: examObjectId,
          score,
          grade,
          issueDate,
          verificationCode,
          status: "issued",
        });

        const populated = await Certificate.findById(created._id)
          .populate("levelId", "levelName order")
          .populate("examId", "title type")
          .lean();

        // Also store in in-memory map
        inMemoryCertificates.set(certificateId, populated || created);
        inMemoryCertificates.set(verificationCode.toUpperCase(), populated || created);

        return {
          ...(populated || created),
          id: (populated || created)._id.toString(),
        };
      } catch (err) {
        console.warn("[CertificateService]: DB error creating certificate, using in-memory:", err);
      }
    }

    // In-memory fallback record
    const certRecord = {
      _id: `cert_mem_${Date.now()}`,
      id: certificateId,
      certificateId,
      studentId,
      studentName,
      levelId,
      levelName: "Level 1",
      examId,
      examTitle: "Final Level Certification Exam",
      score,
      grade,
      issueDate,
      verificationCode,
      status: "issued",
      createdAt: issueDate,
      updatedAt: issueDate,
    };

    inMemoryCertificates.set(certificateId, certRecord);
    inMemoryCertificates.set(verificationCode.toUpperCase(), certRecord);

    return certRecord;
  }

  /**
   * GET /api/certificates
   * Retrieves all certificates for a student
   */
  static async getCertificates(studentId?: string, levelId?: string) {
    try {
      await connectToDatabase();
    } catch {
      // offline fallback
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        const query: any = {};
        if (studentId && mongoose.Types.ObjectId.isValid(studentId)) {
          query.studentId = new mongoose.Types.ObjectId(studentId);
        }
        if (levelId && mongoose.Types.ObjectId.isValid(levelId)) {
          query.levelId = new mongoose.Types.ObjectId(levelId);
        }

        const certs = await Certificate.find(query)
          .populate("levelId", "levelName order")
          .populate("examId", "title type duration totalMarks passingMarks")
          .sort({ issueDate: -1 })
          .lean();

        if (certs.length > 0) {
          return certs.map((c: any) => ({
            id: c._id.toString(),
            certificateId: c.certificateId,
            studentId: c.studentId?.toString() || c.studentId,
            studentName: c.studentName,
            levelId: c.levelId?._id?.toString() || c.levelId?.toString(),
            levelName: c.levelId?.levelName || "Level 1",
            examId: c.examId?._id?.toString() || c.examId?.toString(),
            examTitle: c.examId?.title || "Final Level Certification Exam",
            score: c.score,
            grade: c.grade,
            issueDate: c.issueDate,
            verificationCode: c.verificationCode,
            status: c.status,
            createdAt: c.createdAt,
          }));
        }
      } catch (err) {
        console.warn("[CertificateService]: DB error fetching certificates:", err);
      }
    }

    // In-memory fallback
    const all = Array.from(inMemoryCertificates.values());
    // Filter duplicates by certificateId
    const uniqueMap = new Map<string, any>();
    for (const c of all) {
      if (c.certificateId && !uniqueMap.has(c.certificateId)) {
        if (!studentId || c.studentId === studentId) {
          if (!levelId || c.levelId === levelId) {
            uniqueMap.set(c.certificateId, c);
          }
        }
      }
    }

    return Array.from(uniqueMap.values());
  }

  /**
   * GET /api/certificates/[certificateId]
   * Retrieves single certificate by certificateId (or MongoDB _id)
   */
  static async getCertificateById(certificateId: string) {
    try {
      await connectToDatabase();
    } catch {
      // offline fallback
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        let certDoc: any = null;
        if (mongoose.Types.ObjectId.isValid(certificateId)) {
          certDoc = await Certificate.findById(certificateId)
            .populate("levelId", "levelName order")
            .populate("examId", "title type totalMarks passingMarks")
            .lean();
        }

        if (!certDoc) {
          certDoc = await Certificate.findOne({ certificateId })
            .populate("levelId", "levelName order")
            .populate("examId", "title type totalMarks passingMarks")
            .lean();
        }

        if (certDoc) {
          return {
            id: certDoc._id.toString(),
            certificateId: certDoc.certificateId,
            studentId: certDoc.studentId?.toString() || certDoc.studentId,
            studentName: certDoc.studentName,
            levelId: certDoc.levelId?._id?.toString() || certDoc.levelId?.toString(),
            levelName: certDoc.levelId?.levelName || "Level 1",
            examId: certDoc.examId?._id?.toString() || certDoc.examId?.toString(),
            examTitle: certDoc.examId?.title || "Final Level Certification Exam",
            score: certDoc.score,
            grade: certDoc.grade,
            issueDate: certDoc.issueDate,
            verificationCode: certDoc.verificationCode,
            status: certDoc.status,
            createdAt: certDoc.createdAt,
          };
        }
      } catch (err) {
        console.warn("[CertificateService]: DB error fetching certificate by ID:", err);
      }
    }

    // In-memory fallback
    if (inMemoryCertificates.has(certificateId)) {
      return inMemoryCertificates.get(certificateId);
    }

    const found = Array.from(inMemoryCertificates.values()).find(
      (c) => c.certificateId === certificateId || c._id === certificateId || c.id === certificateId
    );
    return found || null;
  }

  /**
   * GET /api/certificates/verify/[verificationCode]
   * Public verification endpoint by verification code
   */
  static async verifyCertificate(verificationCode: string) {
    if (!verificationCode || typeof verificationCode !== "string") {
      return { valid: false, error: "Verification code is required" };
    }

    const cleanCode = verificationCode.trim().toUpperCase();

    try {
      await connectToDatabase();
    } catch {
      // offline fallback
    }

    if (mongoose.connection?.readyState === 1) {
      try {
        const certDoc = await Certificate.findOne({
          verificationCode: { $regex: new RegExp(`^${cleanCode}$`, "i") },
        })
          .populate("levelId", "levelName order")
          .populate("examId", "title type totalMarks passingMarks")
          .lean();

        if (certDoc) {
          const isValidStatus = certDoc.status === "issued" || certDoc.status === "active";
          return {
            valid: isValidStatus,
            certificate: {
              certificateId: certDoc.certificateId,
              studentName: certDoc.studentName,
              levelName: (certDoc.levelId as any)?.levelName || "Level 1",
              examTitle: (certDoc.examId as any)?.title || "Final Level Certification Exam",
              score: certDoc.score,
              grade: certDoc.grade,
              issueDate: certDoc.issueDate,
              verificationCode: certDoc.verificationCode,
              status: certDoc.status,
            },
          };
        }
      } catch (err) {
        console.warn("[CertificateService]: DB error during verification:", err);
      }
    }

    // In-memory fallback
    const found = Array.from(inMemoryCertificates.values()).find(
      (c) => (c.verificationCode || "").toUpperCase() === cleanCode
    );

    if (found) {
      const isValidStatus = found.status === "issued" || found.status === "active";
      return {
        valid: isValidStatus,
        certificate: {
          certificateId: found.certificateId,
          studentName: found.studentName,
          levelName: found.levelName || found.levelId?.levelName || "Level 1",
          examTitle: found.examTitle || found.examId?.title || "Final Level Certification Exam",
          score: found.score,
          grade: found.grade,
          issueDate: found.issueDate,
          verificationCode: found.verificationCode,
          status: found.status,
        },
      };
    }

    return {
      valid: false,
      error: "Invalid or unrecognized certificate verification code.",
    };
  }
}

export default CertificateService;
