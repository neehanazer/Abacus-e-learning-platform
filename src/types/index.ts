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
