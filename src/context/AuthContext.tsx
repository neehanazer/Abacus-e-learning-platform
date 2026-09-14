"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface StudentUser {
  id: string;
  fullName: string;
  email: string;
  age: number;
  dateOfBirth: string;
  abacusLevel: string;
  avatar: string;
  parentName: string;
  parentEmail: string;
  parentPhone: string;
  progress: number;
  streakDays: number;
  totalPracticeMinutes: number;
  completedWorksheets: number;
  earnedBadges: string[];
  createdAt: string;
}

interface AuthContextType {
  user: StudentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: Omit<StudentUser, "id" | "progress" | "streakDays" | "totalPracticeMinutes" | "completedWorksheets" | "earnedBadges" | "createdAt">) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateProfile: (updated: Partial<StudentUser>) => void;
}

const DEFAULT_DEMO_STUDENT: StudentUser = {
  id: "std_demo_101",
  fullName: "Alex Parker",
  email: "student@abacus.com",
  age: 8,
  dateOfBirth: "2018-05-14",
  abacusLevel: "Level 2 - Small Friends",
  avatar: "🧙‍♂️",
  parentName: "Emma Parker",
  parentEmail: "emma.parker@example.com",
  parentPhone: "+1 (555) 234-5678",
  progress: 42,
  streakDays: 5,
  totalPracticeMinutes: 180,
  completedWorksheets: 24,
  earnedBadges: ["Bead Master", "Speed Starter", "5-Day Streak", "Level 1 Certified"],
  createdAt: "2026-01-10",
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("abacus_active_student");
      if (storedUser) {
        setUser(JSON.parse(storedUser));
      }
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (email: string, pass: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    // Simulate brief network delay
    await new Promise((res) => setTimeout(res, 600));

    // Check localStorage registered users pool or demo account
    const registeredPoolStr = localStorage.getItem("abacus_registered_students") || "[]";
    const registeredPool: StudentUser[] = JSON.parse(registeredPoolStr);

    const foundUser = registeredPool.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem("abacus_active_student", JSON.stringify(foundUser));
      setIsLoading(false);
      return { success: true };
    }

    // Demo account shortcut
    if (email.toLowerCase() === "student@abacus.com" && pass === "password123") {
      setUser(DEFAULT_DEMO_STUDENT);
      localStorage.setItem("abacus_active_student", JSON.stringify(DEFAULT_DEMO_STUDENT));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return { success: false, error: "Invalid email or password. Try demo: student@abacus.com / password123" };
  };

  const register = async (
    data: Omit<StudentUser, "id" | "progress" | "streakDays" | "totalPracticeMinutes" | "completedWorksheets" | "earnedBadges" | "createdAt">
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    await new Promise((res) => setTimeout(res, 800));

    const registeredPoolStr = localStorage.getItem("abacus_registered_students") || "[]";
    const registeredPool: StudentUser[] = JSON.parse(registeredPoolStr);

    if (registeredPool.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      setIsLoading(false);
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser: StudentUser = {
      ...data,
      id: `std_${Date.now()}`,
      progress: 5,
      streakDays: 1,
      totalPracticeMinutes: 15,
      completedWorksheets: 1,
      earnedBadges: ["Welcome Explorer", "Level 1 Starter"],
      createdAt: new Date().toISOString().split("T")[0],
    };

    registeredPool.push(newUser);
    localStorage.setItem("abacus_registered_students", JSON.stringify(registeredPool));
    localStorage.setItem("abacus_active_student", JSON.stringify(newUser));
    setUser(newUser);
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("abacus_active_student");
  };

  const updateProfile = (updated: Partial<StudentUser>) => {
    if (!user) return;
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    localStorage.setItem("abacus_active_student", JSON.stringify(updatedUser));

    // Update in registered pool as well
    const registeredPoolStr = localStorage.getItem("abacus_registered_students") || "[]";
    const registeredPool: StudentUser[] = JSON.parse(registeredPoolStr);
    const idx = registeredPool.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      registeredPool[idx] = updatedUser;
      localStorage.setItem("abacus_registered_students", JSON.stringify(registeredPool));
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
