export type UserRole = "student" | "admin" | "parent" | "teacher";
export type AccountStatus = "active" | "suspended" | "pending";

export interface IStudentDocument {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  passwordHash: string;
  dateOfBirth?: string;
  age: number;
  selectedLevel: string;
  guardianName?: string;
  guardianPhone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  avatar?: string;
  progress?: number;
  streakDays?: number;
  totalPracticeMinutes?: number;
  completedWorksheets?: number;
  earnedBadges?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ISafeStudent {
  id: string;
  name: string;
  fullName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  age: number;
  selectedLevel: string;
  abacusLevel: string;
  guardianName?: string;
  guardianPhone?: string;
  parentName?: string;
  parentPhone?: string;
  role: UserRole;
  accountStatus: AccountStatus;
  avatar?: string;
  progress?: number;
  streakDays?: number;
  totalPracticeMinutes?: number;
  completedWorksheets?: number;
  earnedBadges?: string[];
  currentLevel?: number;
  completedLevels?: number[];
  finalExamStatus?: "PASS" | "FAIL" | "NOT_ATTENDED";
  finalExamScore?: number | null;
  completionDate?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TokenPayload {
  userId: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface RegisterDTO {
  name?: string;
  fullName?: string;
  email: string;
  password: string;
  phone?: string;
  dateOfBirth?: string;
  age: number | string;
  selectedLevel?: string;
  abacusLevel?: string;
  guardianName?: string;
  guardianPhone?: string;
  parentName?: string;
  parentPhone?: string;
  parentEmail?: string;
  avatar?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface ProfileUpdateDTO {
  name?: string;
  fullName?: string;
  phone?: string;
  dateOfBirth?: string;
  age?: number | string;
  selectedLevel?: string;
  abacusLevel?: string;
  guardianName?: string;
  guardianPhone?: string;
  parentName?: string;
  parentPhone?: string;
  avatar?: string;
}

// ==============================================================
// LEARNING, SYLLABUS & LESSON TYPES
// ==============================================================

export interface ILevelDocument {
  _id: string;
  levelName: string;
  description: string;
  objectives: string[];
  order: number;
  status: "active" | "inactive" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

export interface ITopicDocument {
  _id: string;
  topicName: string;
  description: string;
  levelId: string;
  order: number;
  createdAt: Date;
  updatedAt?: Date;
}

export interface ILessonDocument {
  _id: string;
  title: string;
  description: string;
  levelId: string;
  topicId: string;
  lessonNumber: number;
  videoUrl: string;
  duration: number; // in seconds
  objectives: string[];
  order: number;
  status: "active" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

export interface IStudentLessonProgressDocument {
  _id: string;
  studentId: string;
  lessonId: string;
  videoProgress: number;
  lastWatchedPosition: number;
  started: boolean;
  completed: boolean;
  completedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProgressUpdateDTO {
  lessonId: string;
  videoProgress?: number;
  lastWatchedPosition?: number;
  completed?: boolean;
}

// ==============================================================
// PRACTICE, WORKSHEET & ATTEMPT TYPES
// ==============================================================

export type PracticeQuestionType = "multipleChoice" | "numberInput" | "abacus";
export type PracticeDifficulty = "easy" | "medium" | "hard";

export interface IPracticeWorksheetDocument {
  _id: string;
  title: string;
  description: string;
  levelId: string;
  topicId?: string;
  category: string;
  ruleType: string;
  difficulty: PracticeDifficulty;
  timeLimit?: number; // seconds
  totalQuestions: number;
  order: number;
  status: "active" | "draft";
  createdAt: Date;
  updatedAt: Date;
}

export interface IPracticeQuestionDocument {
  _id: string;
  levelId: string;
  topicId?: string;
  worksheetId: string;
  question: string;
  questionType: PracticeQuestionType;
  options: (string | number)[];
  correctAnswer: string | number;
  difficulty: PracticeDifficulty;
  marks: number;
  explanation: string;
  numbers?: number[];
  operation?: string;
  ruleHint?: string;
  createdAt: Date;
}

export interface IPracticeAttemptAnswer {
  questionId: string;
  userAnswer: string | number | null;
  correctAnswer?: string | number;
  isCorrect: boolean;
  timeSpent?: number;
}

export interface IPracticeAttemptDocument {
  _id: string;
  studentId: string;
  worksheetId: string;
  answers: IPracticeAttemptAnswer[];
  score: number;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number; // percentage 0-100
  attemptNumber: number;
  timeTaken: number; // seconds
  submittedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PracticeAttemptSubmitDTO {
  worksheetId: string;
  answers: {
    questionId: string;
    userAnswer: string | number | null;
    timeSpent?: number;
  }[];
  timeTaken: number;
}

// ==============================================================
// HOMEWORK MANAGEMENT TYPES
// ==============================================================

export type HomeworkStatus = "pending" | "inProgress" | "submitted" | "evaluated";
export type HomeworkAttemptStatus = "inProgress" | "submitted" | "evaluated";

export interface IHomeworkDocument {
  _id: string;
  title: string;
  description: string;
  levelId: string;
  topicId: string;
  lessonId: string;
  questionIds: string[];
  recommendedTime: number; // in minutes
  dueDate: Date | string;
  status: HomeworkStatus;
  homeworkNumber?: number;
  order?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHomeworkQuestionDocument {
  _id: string;
  homeworkId: string;
  question: string;
  questionType: "multipleChoice" | "numberInput" | "abacus";
  options: (string | number)[];
  correctAnswer: string | number;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  explanation: string;
  numbers?: number[];
  operation?: string;
  ruleHint?: string;
  order: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IHomeworkAttemptAnswer {
  questionId: string;
  studentAnswer: string | number | null;
  userAnswer?: string | number | null; // alias
  correctAnswer?: string | number;
  isCorrect: boolean;
  timeSpent?: number; // seconds
}

export interface IHomeworkAttemptDocument {
  _id: string;
  studentId: string;
  homeworkId: string;
  answers: IHomeworkAttemptAnswer[];
  attemptNumber: number;
  score: number;
  totalQuestions: number;
  accuracy: number; // percentage 0-100
  timeTaken: number; // seconds
  submittedAt: Date | null;
  status: HomeworkAttemptStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface HomeworkSaveProgressDTO {
  attemptId?: string;
  answers: {
    questionId: string;
    studentAnswer: string | number | null;
    timeSpent?: number;
  }[];
  timeTaken?: number;
}

export interface HomeworkSubmitDTO {
  attemptId?: string;
  answers: {
    questionId: string;
    studentAnswer: string | number | null;
    timeSpent?: number;
  }[];
  timeTaken: number;
}

// ==============================================================
// PERFORMANCE & AI EVALUATION TYPES
// ==============================================================

export type TopicPerformanceStatus = "strong" | "moderate" | "weak";
export type ReadinessStatus = "ready" | "almost_ready" | "needs_more_practice" | "not_started";
export type PerformanceTrend = "improving" | "stable" | "declining" | "insufficient_data";
export type AIEvaluationProvider = "rule_based_fallback" | "gemini" | "openai" | "claude";

export interface ITopicPerformance {
  topicId: string;
  topicName: string;
  category: string;
  levelName: string;
  levelOrder: number;
  attemptsCount: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // 0-100%
  averageTimePerQuestion: number; // in seconds
  status: TopicPerformanceStatus;
  lastAttemptDate: string | null;
}

export interface IWeakArea {
  topicId: string;
  topicName: string;
  category: string;
  levelName: string;
  errorRate: number; // 0-100%
  accuracy: number;
  totalAttempts: number;
  totalQuestions: number;
  incorrectCount: number;
  priority: "high" | "medium" | "low";
  commonFormulas: string[];
  recommendedAction: string;
  suggestedPracticeTitle: string;
  suggestedLessonId?: string;
}

export interface IPerformanceSummary {
  studentId: string;
  studentName: string;
  totalAttempts: number;
  totalPracticeAttempts: number;
  totalHomeworkAttempts: number;
  totalQuestions: number;
  totalQuestionsAttempted: number;
  correctAnswers: number;
  incorrectAnswers: number;
  accuracy: number; // 0-100%
  averageScore: number;
  bestScore: number;
  averageResponseTime: number; // seconds per question
  totalTimeSpentMinutes: number;
  strongTopicsCount: number;
  weakTopicsCount: number;
  moderateTopicsCount: number;
  strongTopics: string[];
  weakTopics: string[];
  improvementOverTime: {
    trend: PerformanceTrend;
    percentage: number;
  };
  recentTrend: PerformanceTrend;
  recentTrendPercentage: number;
}

export interface IPerformanceHistoryItem {
  id: string;
  type: "practice" | "homework";
  title: string;
  topicName: string;
  category: string;
  date: string;
  score: number;
  totalQuestions: number;
  accuracy: number;
  timeTaken: number; // in seconds
  status: string;
}

export interface IReadinessCriteria {
  name: string;
  target: string;
  current: string;
  passed: boolean;
  weight: number;
}

export interface IAIEvaluationResult {
  evaluationId?: string;
  provider: AIEvaluationProvider;
  isAIRated: boolean;
  strengths: string[];
  weakAreas: string[];
  recommendedPractice: {
    topicId?: string;
    title: string;
    category?: string;
    reason: string;
    type: "lesson" | "practice" | "homework";
    link?: string;
  }[];
  accuracyImprovement: string;
  speedImprovement: string;
  readinessFeedback: string;
  overallFeedback: string;
  evaluatedAt: string;
}

export interface IReadinessResponse {
  readinessScore: number; // 0-100
  readinessStatus: ReadinessStatus;
  currentLevel: string;
  recommendedNextLevel?: string;
  criteria: IReadinessCriteria[];
  aiEvaluation: IAIEvaluationResult;
}

// ==============================================================
// EXAMS & AI PROCTORING TYPES
// ==============================================================

export type ExamType = "mock" | "final";
export type ExamStatus = "active" | "inactive" | "draft";
export type ExamAttemptStatus = "in_progress" | "submitted" | "evaluated";

export type ProctoringEventType =
  | "face_not_detected"
  | "multiple_faces"
  | "phone_detected"
  | "suspicious_object"
  | "unusual_head_movement"
  | "tab_change"
  | "camera_disconnected"
  | "microphone_disconnected";

export type ProctoringSeverity = "low" | "medium" | "high" | "critical";

export interface IExamDocument {
  _id: string;
  title: string;
  description?: string;
  levelId: string;
  type: ExamType;
  duration: number; // in minutes
  totalQuestions: number;
  totalMarks: number;
  passingMarks: number;
  status: ExamStatus;
  questionIds?: string[];
  createdAt: Date;
  updatedAt?: Date;
}

export interface IExamQuestionDocument {
  _id: string;
  examId: string;
  questionNumber: number;
  questionText: string;
  numbers?: number[];
  operations?: string[];
  options?: (string | number)[];
  correctAnswer: string | number;
  marks: number;
  explanation?: string;
  ruleType?: string;
  topicId?: string;
  createdAt: Date;
}

export interface IExamAnswerItem {
  questionId: string;
  userAnswer: string | number | null;
  correctAnswer?: string | number;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpent: number; // seconds
}

export interface IExamAttemptDocument {
  _id: string;
  studentId: string;
  examId: string;
  attemptNumber: number;
  score: number;
  totalMarks: number;
  percentage: number;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  unansweredCount: number;
  timeTaken: number; // seconds
  isPassed: boolean;
  status: ExamAttemptStatus;
  startedAt: Date;
  submittedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface IExamAnswerDocument {
  _id: string;
  examAttemptId: string;
  questionId: string;
  studentId: string;
  userAnswer: string | number | null;
  correctAnswer: string | number;
  isCorrect: boolean;
  marksAwarded: number;
  timeSpent: number;
  createdAt: Date;
}

export interface IProctoringEventDocument {
  _id: string;
  examAttemptId: string;
  studentId?: string;
  eventType: ProctoringEventType;
  timestamp: Date;
  confidence: number;
  severity: ProctoringSeverity;
  description: string;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface IProctoringSummary {
  totalEvents: number;
  highSeverityCount: number;
  mediumSeverityCount: number;
  lowSeverityCount: number;
  integrityScore: number; // 0-100
  status: "verified" | "needs_review" | "suspicious";
  events: IProctoringEventDocument[];
}

// ==============================================================
// ADMIN MANAGEMENT TYPES
// ==============================================================

export type AdminRole = "admin";
export type AdminStatus = "active" | "inactive" | "suspended";

export interface IAdminDocument {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISafeAdmin {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  status: AdminStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: AdminRole;
  iat?: number;
  exp?: number;
}

export interface AdminLoginDTO {
  email: string;
  password: string;
}


