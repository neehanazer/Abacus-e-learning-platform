import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import PracticeAttempt from "@/models/PracticeAttempt";
import HomeworkAttempt from "@/models/HomeworkAttempt";
import PracticeWorksheet from "@/models/PracticeWorksheet";
import Homework from "@/models/Homework";
import Student from "@/models/Student";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import {
  IPerformanceSummary,
  ITopicPerformance,
  IWeakArea,
  IPerformanceHistoryItem,
  PerformanceTrend,
} from "@/types";

export interface UnifiedAttemptRecord {
  id: string;
  source: "practice" | "homework";
  referenceId: string;
  title: string;
  topicId: string;
  topicName: string;
  category: string;
  levelName: string;
  levelOrder: number;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTakenSeconds: number;
  date: Date;
  answers: Array<{
    questionId: string;
    isCorrect: boolean;
    timeSpent?: number;
    ruleHint?: string;
  }>;
}

/**
 * Reusable Performance Service
 * Aggregates performance data across Practice and Homework attempts.
 */
export class PerformanceService {
  /**
   * Fetches all practice and homework attempts for a student and normalizes them into a unified format.
   */
  static async getStudentAttempts(studentId: string): Promise<UnifiedAttemptRecord[]> {
    try {
      await connectToDatabase();

      // Ensure models are registered for population
      const _wsModel = PracticeWorksheet;
      const _hwModel = Homework;
      const _lvlModel = Level;
      const _topModel = Topic;

      const studentObjectId = mongoose.Types.ObjectId.isValid(studentId)
        ? new mongoose.Types.ObjectId(studentId)
        : null;

      if (!studentObjectId) {
        return this.getFallbackAttempts(studentId);
      }

      const [practiceAttempts, homeworkAttempts] = await Promise.all([
        PracticeAttempt.find({ studentId: studentObjectId })
          .populate({
            path: "worksheetId",
            select: "title category ruleType levelId topicId",
            populate: [
              { path: "levelId", select: "levelName order" },
              { path: "topicId", select: "topicName order" },
            ],
          })
          .sort({ submittedAt: -1 })
          .lean(),

        HomeworkAttempt.find({
          studentId: studentObjectId,
          status: { $in: ["submitted", "evaluated"] },
        })
          .populate({
            path: "homeworkId",
            select: "title levelId topicId lessonId homeworkNumber",
            populate: [
              { path: "levelId", select: "levelName order" },
              { path: "topicId", select: "topicName order" },
            ],
          })
          .sort({ submittedAt: -1 })
          .lean(),
      ]);

      const unified: UnifiedAttemptRecord[] = [];

      // Normalize practice attempts
      for (const pa of practiceAttempts as any[]) {
        const ws = pa.worksheetId || {};
        const lvl = ws.levelId || {};
        const top = ws.topicId || {};

        unified.push({
          id: pa._id.toString(),
          source: "practice",
          referenceId: ws._id?.toString() || "",
          title: ws.title || "Practice Worksheet",
          topicId: top._id?.toString() || ws.category || "practice-topic",
          topicName: top.topicName || ws.category || "Practice General",
          category: ws.category || ws.ruleType || "General",
          levelName: lvl.levelName || "Level 1",
          levelOrder: lvl.order || 1,
          score: pa.score ?? 0,
          totalQuestions: pa.totalQuestions || pa.answers?.length || 1,
          accuracy: pa.accuracy ?? Math.round(((pa.score || 0) / (pa.totalQuestions || 1)) * 100),
          timeTakenSeconds: pa.timeTaken || 0,
          date: pa.submittedAt ? new Date(pa.submittedAt) : new Date(pa.createdAt || Date.now()),
          answers: (pa.answers || []).map((a: any) => ({
            questionId: a.questionId?.toString() || "",
            isCorrect: !!a.isCorrect,
            timeSpent: a.timeSpent || 0,
            ruleHint: a.ruleHint || "",
          })),
        });
      }

      // Normalize homework attempts
      for (const ha of homeworkAttempts as any[]) {
        const hw = ha.homeworkId || {};
        const lvl = hw.levelId || {};
        const top = hw.topicId || {};

        unified.push({
          id: ha._id.toString(),
          source: "homework",
          referenceId: hw._id?.toString() || "",
          title: hw.title || "Homework Assignment",
          topicId: top._id?.toString() || `hw-topic-${hw.homeworkNumber || 1}`,
          topicName: top.topicName || hw.title?.split(": ")[1] || "Homework Topic",
          category: hw.title?.split(": ")[1] || "Homework",
          levelName: lvl.levelName || "Level 1",
          levelOrder: lvl.order || 1,
          score: ha.score ?? 0,
          totalQuestions: ha.totalQuestions || ha.answers?.length || 1,
          accuracy: ha.accuracy ?? Math.round(((ha.score || 0) / (ha.totalQuestions || 1)) * 100),
          timeTakenSeconds: ha.timeTaken || 0,
          date: ha.submittedAt ? new Date(ha.submittedAt) : new Date(ha.createdAt || Date.now()),
          answers: (ha.answers || []).map((a: any) => ({
            questionId: a.questionId?.toString() || "",
            isCorrect: !!a.isCorrect,
            timeSpent: a.timeSpent || 0,
            ruleHint: a.ruleHint || "",
          })),
        });
      }

      if (unified.length === 0) {
        if (studentId === "std_demo_101" || !studentId) {
          return this.getFallbackAttempts(studentId);
        }
        return [];
      }

      return unified.sort((a, b) => b.date.getTime() - a.date.getTime());
    } catch (err) {
      console.warn("[PerformanceService]: DB offline, checking fallback attempts for student...", err);
      if (studentId === "std_demo_101" || !studentId) {
        return this.getFallbackAttempts(studentId);
      }
      return [];
    }
  }

  /**
   * Calculates overall performance summary for the student.
   */
  static async getSummary(studentId: string): Promise<IPerformanceSummary> {
    const attempts = await this.getStudentAttempts(studentId);

    let studentName = "Student";
    if (mongoose.connection?.readyState === 1 && mongoose.Types.ObjectId.isValid(studentId)) {
      try {
        const st = await Student.findById(studentId).select("name fullName").lean();
        if (st) studentName = (st as any).name || (st as any).fullName || "Student";
      } catch (err) {
        // DB offline or query failed
      }
    }

    let totalPractice = 0;
    let totalHomework = 0;
    let totalQuestions = 0;
    let totalCorrect = 0;
    let totalTimeTaken = 0;
    let bestScore = 0;
    let sumScore = 0;

    for (const att of attempts) {
      if (att.source === "practice") totalPractice++;
      if (att.source === "homework") totalHomework++;

      totalQuestions += att.totalQuestions;
      totalCorrect += att.score;
      totalTimeTaken += att.timeTakenSeconds;
      sumScore += att.score;

      if (att.score > bestScore) {
        bestScore = att.score;
      }
    }

    const totalAttempts = attempts.length;
    const incorrectAnswers = Math.max(0, totalQuestions - totalCorrect);
    const overallAccuracy = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;
    const averageScore = totalAttempts > 0 ? Number((sumScore / totalAttempts).toFixed(1)) : 0;
    const averageResponseTime =
      totalQuestions > 0 ? Number((totalTimeTaken / totalQuestions).toFixed(1)) : 0;
    const totalTimeSpentMinutes = Math.round(totalTimeTaken / 60);

    // Topic performance to count strong, moderate, weak
    const topics = await this.getTopicWisePerformance(studentId, attempts);
    const strongTopicsCount = topics.filter((t) => t.status === "strong").length;
    const moderateTopicsCount = topics.filter((t) => t.status === "moderate").length;
    const weakTopicsCount = topics.filter((t) => t.status === "weak").length;

    const strongTopicsList = topics.filter((t) => t.status === "strong").map((t) => t.topicName);
    const weakTopicsList = topics.filter((t) => t.status === "weak").map((t) => t.topicName);

    // Improvement over time trend
    const { trend, trendPercentage } = this.calculateTrend(attempts);

    return {
      studentId,
      studentName,
      totalAttempts,
      totalPracticeAttempts: totalPractice,
      totalHomeworkAttempts: totalHomework,
      totalQuestions,
      totalQuestionsAttempted: totalQuestions,
      correctAnswers: totalCorrect,
      incorrectAnswers,
      accuracy: overallAccuracy,
      averageScore,
      bestScore,
      averageResponseTime,
      totalTimeSpentMinutes,
      strongTopicsCount,
      weakTopicsCount,
      moderateTopicsCount,
      strongTopics: strongTopicsList,
      weakTopics: weakTopicsList,
      improvementOverTime: {
        trend,
        percentage: trendPercentage,
      },
      recentTrend: trend,
      recentTrendPercentage: trendPercentage,
    };
  }

  /**
   * Calculates topic-wise performance breakdown.
   */
  static async getTopicWisePerformance(
    studentId: string,
    existingAttempts?: UnifiedAttemptRecord[]
  ): Promise<ITopicPerformance[]> {
    const attempts = existingAttempts || (await this.getStudentAttempts(studentId));

    const topicMap = new Map<
      string,
      {
        topicId: string;
        topicName: string;
        category: string;
        levelName: string;
        levelOrder: number;
        attemptsCount: number;
        totalQuestions: number;
        correctAnswers: number;
        totalTime: number;
        lastAttemptDate: Date | null;
      }
    >();

    for (const att of attempts) {
      const key = att.topicName || att.category || "General";
      let existing = topicMap.get(key);

      if (!existing) {
        existing = {
          topicId: att.topicId || key,
          topicName: att.topicName || key,
          category: att.category || key,
          levelName: att.levelName || "Level 1",
          levelOrder: att.levelOrder || 1,
          attemptsCount: 0,
          totalQuestions: 0,
          correctAnswers: 0,
          totalTime: 0,
          lastAttemptDate: null,
        };
        topicMap.set(key, existing);
      }

      existing.attemptsCount += 1;
      existing.totalQuestions += att.totalQuestions;
      existing.correctAnswers += att.score;
      existing.totalTime += att.timeTakenSeconds;

      if (!existing.lastAttemptDate || att.date > existing.lastAttemptDate) {
        existing.lastAttemptDate = att.date;
      }
    }

    const result: ITopicPerformance[] = [];

    for (const item of topicMap.values()) {
      const incorrect = Math.max(0, item.totalQuestions - item.correctAnswers);
      const accuracy =
        item.totalQuestions > 0
          ? Math.round((item.correctAnswers / item.totalQuestions) * 100)
          : 0;

      const avgTime =
        item.totalQuestions > 0
          ? Number((item.totalTime / item.totalQuestions).toFixed(1))
          : 0;

      let status: "strong" | "moderate" | "weak" = "moderate";
      if (accuracy >= 80) {
        status = "strong";
      } else if (accuracy < 65) {
        status = "weak";
      }

      result.push({
        topicId: item.topicId,
        topicName: item.topicName,
        category: item.category,
        levelName: item.levelName,
        levelOrder: item.levelOrder,
        attemptsCount: item.attemptsCount,
        totalQuestions: item.totalQuestions,
        correctAnswers: item.correctAnswers,
        incorrectAnswers: incorrect,
        accuracy,
        averageTimePerQuestion: avgTime,
        status,
        lastAttemptDate: item.lastAttemptDate ? item.lastAttemptDate.toISOString() : null,
      });
    }

    return result.sort((a, b) => b.accuracy - a.accuracy);
  }

  /**
   * Identifies weak areas and common calculation misconceptions.
   */
  static async getWeakAreas(
    studentId: string,
    existingAttempts?: UnifiedAttemptRecord[]
  ): Promise<IWeakArea[]> {
    const attempts = existingAttempts || (await this.getStudentAttempts(studentId));
    const topicPerformance = await this.getTopicWisePerformance(studentId, attempts);

    // Filter topics with accuracy < 75% or high error rate
    const weakTopics = topicPerformance.filter((t) => t.status === "weak" || t.accuracy < 75);

    const weakAreas: IWeakArea[] = [];

    for (const t of weakTopics) {
      const errorRate = 100 - t.accuracy;

      // Scan attempts for this topic to collect common formulas/rules where mistakes occurred
      const relevantAttempts = attempts.filter(
        (a) => a.topicName === t.topicName || a.category === t.category
      );

      const formulaSet = new Set<string>();
      let incorrectCount = 0;

      for (const att of relevantAttempts) {
        for (const ans of att.answers) {
          if (!ans.isCorrect) {
            incorrectCount++;
            if (ans.ruleHint) {
              formulaSet.add(ans.ruleHint);
            }
          }
        }
      }

      let priority: "high" | "medium" | "low" = "medium";
      if (errorRate >= 45 || t.accuracy < 55) {
        priority = "high";
      } else if (errorRate <= 25) {
        priority = "low";
      }

      let recommendedAction = `Practice ${t.topicName} worksheets to master proper bead manipulation.`;
      if (t.category.toLowerCase().includes("small friend")) {
        recommendedAction = "Review the Small Friend formulas (+5 combo rules) and drill finger flick drills.";
      } else if (t.category.toLowerCase().includes("big friend")) {
        recommendedAction = "Focus on the +10 tens rod carry-over and companion pairs (9&1, 8&2, 7&3).";
      } else if (t.category.toLowerCase().includes("2 digit") || t.category.toLowerCase().includes("multi")) {
        recommendedAction = "Practice simultaneous two-hand finger coordination on tens and units rods.";
      }

      weakAreas.push({
        topicId: t.topicId,
        topicName: t.topicName,
        category: t.category,
        levelName: t.levelName,
        errorRate,
        accuracy: t.accuracy,
        totalAttempts: t.attemptsCount,
        totalQuestions: t.totalQuestions,
        incorrectCount: incorrectCount || t.incorrectAnswers,
        priority,
        commonFormulas: Array.from(formulaSet).slice(0, 3),
        recommendedAction,
        suggestedPracticeTitle: `Recommended Drill: ${t.topicName}`,
        suggestedLessonId: t.topicId.startsWith("6789") ? t.topicId : undefined,
      });
    }

    return weakAreas.sort((a, b) => b.errorRate - a.errorRate);
  }

  /**
   * Retrieves chronological performance history.
   */
  static async getHistory(
    studentId: string,
    limit: number = 30
  ): Promise<IPerformanceHistoryItem[]> {
    const attempts = await this.getStudentAttempts(studentId);

    return attempts.slice(0, limit).map((a) => ({
      id: a.id,
      type: a.source,
      title: a.title,
      topicName: a.topicName,
      category: a.category,
      date: a.date.toISOString(),
      score: a.score,
      totalQuestions: a.totalQuestions,
      accuracy: a.accuracy,
      timeTaken: a.timeTakenSeconds,
      status: a.accuracy >= 80 ? "Mastered" : a.accuracy >= 60 ? "Completed" : "Needs Review",
    }));
  }

  /**
   * Calculates student readiness to progress to next level or stage.
   */
  static async getReadiness(studentId: string) {
    const summary = await this.getSummary(studentId);
    const weakAreas = await this.getWeakAreas(studentId);

    // Calculate composite readiness score (0-100)
    // 40% accuracy, 25% attempt volume, 20% weak areas resolved, 15% speed consistency
    const accuracyScore = Math.min(100, (summary.accuracy / 80) * 40);
    const volumeScore = Math.min(25, (summary.totalAttempts / 6) * 25);
    const weakPenalty = Math.min(20, Math.max(0, 20 - weakAreas.filter((w) => w.priority === "high").length * 10));
    const speedScore = summary.averageResponseTime > 0 && summary.averageResponseTime <= 10 ? 15 : 8;

    const readinessScore = Math.min(
      100,
      Math.max(0, Math.round(accuracyScore + volumeScore + weakPenalty + speedScore))
    );

    let readinessStatus: "ready" | "almost_ready" | "needs_more_practice" | "not_started" =
      "not_started";

    if (summary.totalAttempts === 0) {
      readinessStatus = "not_started";
    } else if (readinessScore >= 80) {
      readinessStatus = "ready";
    } else if (readinessScore >= 65) {
      readinessStatus = "almost_ready";
    } else {
      readinessStatus = "needs_more_practice";
    }

    const criteria = [
      {
        name: "Overall Accuracy (≥80%)",
        target: "80%",
        current: `${summary.accuracy}%`,
        passed: summary.accuracy >= 80,
        weight: 40,
      },
      {
        name: "Practice Volume (≥5 Attempts)",
        target: "5 attempts",
        current: `${summary.totalAttempts} attempts`,
        passed: summary.totalAttempts >= 5,
        weight: 25,
      },
      {
        name: "High Priority Weak Areas Resolved",
        target: "0 weak areas",
        current: `${weakAreas.filter((w) => w.priority === "high").length} remaining`,
        passed: weakAreas.filter((w) => w.priority === "high").length === 0,
        weight: 20,
      },
      {
        name: "Speed Consistency (≤8s/question)",
        target: "≤ 8s",
        current: summary.averageResponseTime > 0 ? `${summary.averageResponseTime}s` : "N/A",
        passed: summary.averageResponseTime > 0 && summary.averageResponseTime <= 8,
        weight: 15,
      },
    ];

    // Compute student's level homework completion rate (Compulsory 70% threshold for exam attendance)
    let totalHomeworkCount = 0;
    let completedHomeworkCount = 0;
    let homeworkCompletionRate = 0;
    let homeworkDueTodayCount = 0;
    let homeworkDueTodayTitles: string[] = [];

    try {
      let currentLevelOrder = 1;
      let studentObjectId: mongoose.Types.ObjectId | null = null;
      if (mongoose.Types.ObjectId.isValid(studentId)) {
        studentObjectId = new mongoose.Types.ObjectId(studentId);
        const Student = (await import("@/models/Student")).default;
        const studentDoc = await Student.findById(studentObjectId).lean();
        if (studentDoc) {
          if (typeof (studentDoc as any).currentLevel === "number" && (studentDoc as any).currentLevel >= 1) {
            currentLevelOrder = (studentDoc as any).currentLevel;
          } else {
            const match = String((studentDoc as any).selectedLevel || (studentDoc as any).abacusLevel || "").match(/Level\s*(\d+)/i);
            currentLevelOrder = match ? parseInt(match[1], 10) : 1;
          }
        }
      }

      const Level = (await import("@/models/Level")).default;
      const Homework = (await import("@/models/Homework")).default;
      const HomeworkAttempt = (await import("@/models/HomeworkAttempt")).default;

      const levelDoc = await Level.findOne({ order: currentLevelOrder }).lean();
      if (levelDoc) {
        const hwList = await Homework.find({ levelId: levelDoc._id }).lean();
        totalHomeworkCount = hwList.length;

        if (totalHomeworkCount > 0 && studentObjectId) {
          const attempts = await HomeworkAttempt.find({
            studentId: studentObjectId,
            status: { $in: ["submitted", "evaluated"] },
          }).lean();

          const completedHwIds = new Set(attempts.map((a: any) => a.homeworkId?.toString()));
          completedHomeworkCount = hwList.filter((h: any) => completedHwIds.has(h._id.toString())).length;
          homeworkCompletionRate = Math.round((completedHomeworkCount / totalHomeworkCount) * 100);

          const now = new Date();
          const todayYear = now.getFullYear();
          const todayMonth = now.getMonth();
          const todayDate = now.getDate();

          hwList.forEach((h: any) => {
            if (!completedHwIds.has(h._id.toString()) && h.dueDate) {
              const d = new Date(h.dueDate);
              if (!isNaN(d.getTime()) && d.getFullYear() === todayYear && d.getMonth() === todayMonth && d.getDate() === todayDate) {
                homeworkDueTodayCount++;
                homeworkDueTodayTitles.push(h.title);
              }
            }
          });
        }
      }
    } catch (err) {
      console.warn("[PerformanceService]: Could not compute DB homework metrics:", err);
    }

    // Add compulsory 70% homework completion criterion
    if (totalHomeworkCount > 0) {
      criteria.unshift({
        name: "Homework Completion (≥70% Required for Exam)",
        target: "70%",
        current: `${homeworkCompletionRate}% (${completedHomeworkCount}/${totalHomeworkCount} done)`,
        passed: homeworkCompletionRate >= 70,
        weight: 35,
      });
    }

    return {
      readinessScore,
      readinessStatus,
      summary,
      weakAreas,
      criteria,
      homeworkMetrics: {
        total: totalHomeworkCount,
        completed: completedHomeworkCount,
        completionRate: homeworkCompletionRate,
        isEligible: totalHomeworkCount === 0 || homeworkCompletionRate >= 70,
        dueTodayCount: homeworkDueTodayCount,
        dueTodayTitles: homeworkDueTodayTitles,
      },
    };
  }

  /**
   * Helper: Calculates improvement over time trend.
   */
  private static calculateTrend(attempts: UnifiedAttemptRecord[]): {
    trend: PerformanceTrend;
    trendPercentage: number;
  } {
    if (attempts.length < 2) {
      return { trend: "insufficient_data", trendPercentage: 0 };
    }

    // Sort chronologically ascending for trend
    const chronological = [...attempts].sort((a, b) => a.date.getTime() - b.date.getTime());

    const half = Math.floor(chronological.length / 2);
    const earlySlice = chronological.slice(0, half || 1);
    const recentSlice = chronological.slice(half);

    const earlyAvgAcc =
      earlySlice.reduce((sum, a) => sum + a.accuracy, 0) / earlySlice.length;
    const recentAvgAcc =
      recentSlice.reduce((sum, a) => sum + a.accuracy, 0) / recentSlice.length;

    const diff = Math.round(recentAvgAcc - earlyAvgAcc);

    let trend: PerformanceTrend = "stable";
    if (diff >= 5) {
      trend = "improving";
    } else if (diff <= -5) {
      trend = "declining";
    }

    return {
      trend,
      trendPercentage: diff,
    };
  }

  /**
   * Fallback mock attempts for demo session or when DB is offline.
   */
  private static getFallbackAttempts(studentId: string): UnifiedAttemptRecord[] {
    const now = Date.now();
    return [
      {
        id: "att_mock_1",
        source: "practice",
        referenceId: "679900000000000000000001",
        title: "Simple 1-Digit Direct Calculations",
        topicId: "l1-simple-1digit",
        topicName: "Simple 1 Digit Calculations (Without Rules)",
        category: "Simple 1 Digit Calculations (Without Rules)",
        levelName: "Level 1: Basic Foundations",
        levelOrder: 1,
        score: 9,
        totalQuestions: 10,
        accuracy: 90,
        timeTakenSeconds: 65,
        date: new Date(now - 86400000 * 3),
        answers: [
          { questionId: "q1", isCorrect: true, timeSpent: 6 },
          { questionId: "q2", isCorrect: true, timeSpent: 5 },
          { questionId: "q3", isCorrect: true, timeSpent: 7 },
          { questionId: "q4", isCorrect: true, timeSpent: 6 },
          { questionId: "q5", isCorrect: false, timeSpent: 9, ruleHint: "Direct thumb push" },
        ],
      },
      {
        id: "att_mock_2",
        source: "homework",
        referenceId: "67a900000000000000000001",
        title: "Homework 01: Direct 1-Digit Calculation",
        topicId: "l1-simple-1digit",
        topicName: "Simple 1 Digit Calculations (Without Rules)",
        category: "Simple 1 Digit Calculations (Without Rules)",
        levelName: "Level 1: Basic Foundations",
        levelOrder: 1,
        score: 10,
        totalQuestions: 10,
        accuracy: 100,
        timeTakenSeconds: 58,
        date: new Date(now - 86400000 * 2),
        answers: [{ questionId: "q1", isCorrect: true, timeSpent: 5 }],
      },
      {
        id: "att_mock_3",
        source: "practice",
        referenceId: "679900000000000000000002",
        title: "Simple 2-Digit Direct Manipulations",
        topicId: "l1-simple-2digit",
        topicName: "Simple 2 Digit Calculations (Without Rules)",
        category: "Simple 2 Digit Calculations (Without Rules)",
        levelName: "Level 1: Basic Foundations",
        levelOrder: 1,
        score: 8,
        totalQuestions: 10,
        accuracy: 80,
        timeTakenSeconds: 84,
        date: new Date(now - 86400000 * 1),
        answers: [
          { questionId: "q1", isCorrect: true, timeSpent: 8 },
          { questionId: "q2", isCorrect: false, timeSpent: 12, ruleHint: "Simultaneous 2-hand flick" },
        ],
      },
      {
        id: "att_mock_4",
        source: "homework",
        referenceId: "67a900000000000000000004",
        title: "Homework 04: Small Friends Addition (+4 Rule)",
        topicId: "l1-small-friend",
        topicName: "Small Friend Addition (+4..+1)",
        category: "Small Friend Addition (+4..+1)",
        levelName: "Level 1: Basic Foundations",
        levelOrder: 1,
        score: 6,
        totalQuestions: 10,
        accuracy: 60,
        timeTakenSeconds: 110,
        date: new Date(now - 3600000 * 4),
        answers: [
          { questionId: "q1", isCorrect: true, timeSpent: 10 },
          { questionId: "q2", isCorrect: false, timeSpent: 14, ruleHint: "+4 = +5 - 1" },
          { questionId: "q3", isCorrect: false, timeSpent: 15, ruleHint: "+3 = +5 - 2" },
        ],
      },
    ];
  }
}

export default PerformanceService;
