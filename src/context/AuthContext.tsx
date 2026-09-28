"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export interface StudentUser {
  id: string;
  fullName: string;
  name?: string;
  email: string;
  phone?: string;
  age: number;
  dateOfBirth: string;
  abacusLevel: string;
  selectedLevel?: string;
  avatar: string;
  parentName: string;
  parentEmail?: string;
  parentPhone: string;
  guardianName?: string;
  guardianPhone?: string;
  role?: string;
  accountStatus?: string;
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
  register: (
    data: Omit<
      StudentUser,
      | "id"
      | "progress"
      | "streakDays"
      | "totalPracticeMinutes"
      | "completedWorksheets"
      | "earnedBadges"
      | "createdAt"
    > & { password?: string }
  ) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (updated: Partial<StudentUser>) => Promise<boolean>;
}

const DEFAULT_DEMO_STUDENT: StudentUser = {
  id: "std_demo_101",
  fullName: "Alex Parker",
  name: "Alex Parker",
  email: "student@abacus.com",
  phone: "+1 (555) 234-5678",
  age: 8,
  dateOfBirth: "2018-05-14",
  abacusLevel: "Level 2 - Small Friends",
  selectedLevel: "Level 2 - Small Friends",
  avatar: "🧙‍♂️",
  parentName: "Emma Parker",
  guardianName: "Emma Parker",
  parentEmail: "emma.parker@example.com",
  parentPhone: "+1 (555) 234-5678",
  guardianPhone: "+1 (555) 234-5678",
  role: "student",
  accountStatus: "active",
  progress: 42,
  streakDays: 5,
  totalPracticeMinutes: 180,
  completedWorksheets: 24,
  earnedBadges: ["Bead Master", "Speed Starter", "5-Day Streak", "Level 1 Certified"],
  createdAt: "2026-01-10",
};

export const sanitizeUser = (
  raw: (Partial<StudentUser> & Record<string, unknown>) | null | undefined
): StudentUser => {
  if (!raw) return DEFAULT_DEMO_STUDENT;
  const fullName =
    (typeof raw.fullName === "string"
      ? raw.fullName
      : typeof raw.name === "string"
      ? raw.name
      : "") || DEFAULT_DEMO_STUDENT.fullName;
  const name =
    (typeof raw.name === "string"
      ? raw.name
      : typeof raw.fullName === "string"
      ? raw.fullName
      : "") || DEFAULT_DEMO_STUDENT.name;
  const abacusLevel =
    (typeof raw.abacusLevel === "string"
      ? raw.abacusLevel
      : typeof raw.selectedLevel === "string"
      ? raw.selectedLevel
      : "") || DEFAULT_DEMO_STUDENT.abacusLevel;
  const selectedLevel =
    (typeof raw.selectedLevel === "string"
      ? raw.selectedLevel
      : typeof raw.abacusLevel === "string"
      ? raw.abacusLevel
      : "") || DEFAULT_DEMO_STUDENT.selectedLevel;
  const avatar =
    (typeof raw.avatar === "string" ? raw.avatar : "") || DEFAULT_DEMO_STUDENT.avatar;

  return {
    ...DEFAULT_DEMO_STUDENT,
    ...raw,
    fullName,
    name,
    abacusLevel,
    selectedLevel,
    avatar,
  };
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<StudentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state: Check /api/auth/me first, fallback to localStorage
  useEffect(() => {
    let isMounted = true;

    async function checkAuth() {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && isMounted) {
            const sanitized = sanitizeUser(data.user);
            setUser(sanitized);
            localStorage.setItem("abacus_active_student", JSON.stringify(sanitized));
            setIsLoading(false);
            return;
          }
        }
      } catch {
        // Fallback to local storage if API call fails
      }

      // Local storage fallback for offline or phase 1 demo sessions
      try {
        const storedUser = localStorage.getItem("abacus_active_student");
        if (storedUser && isMounted) {
          const sanitized = sanitizeUser(JSON.parse(storedUser));
          setUser(sanitized);
        }
      } catch {
        // ignore
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (
    email: string,
    pass: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // 1. Attempt Next.js MongoDB backend authentication
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await res.json().catch(() => null);

      if (res.ok && data?.success && data.user) {
        const sanitized = sanitizeUser(data.user);
        setUser(sanitized);
        localStorage.setItem("abacus_active_student", JSON.stringify(sanitized));
        setIsLoading(false);
        return { success: true };
      }

      // If backend returns an error response
      if (!res.ok || (data && !data.success)) {
        if (data?.error?.includes("whitelisted") || data?.error?.includes("MongoDB")) {
          setIsLoading(false);
          return {
            success: false,
            error: "MongoDB Atlas IP not whitelisted. Please add your IP (or 0.0.0.0/0) in MongoDB Atlas -> Network Access.",
          };
        }

        // Check if user is logging into demo account as fallback
        if (email.toLowerCase() === "student@abacus.com" && pass === "password123") {
          setUser(DEFAULT_DEMO_STUDENT);
          localStorage.setItem("abacus_active_student", JSON.stringify(DEFAULT_DEMO_STUDENT));
          setIsLoading(false);
          return { success: true };
        }

        setIsLoading(false);
        return {
          success: false,
          error: data?.error || "Invalid email or password.",
        };
      }
    } catch {
      // Network failure, fallback to localStorage/demo check
    }

    // Phase 1 demo account & local storage pool fallback
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

    if (email.toLowerCase() === "student@abacus.com" && pass === "password123") {
      setUser(DEFAULT_DEMO_STUDENT);
      localStorage.setItem("abacus_active_student", JSON.stringify(DEFAULT_DEMO_STUDENT));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      error: "Invalid email or password. Try demo: student@abacus.com / password123",
    };
  };

  const register = async (
    data: Omit<
      StudentUser,
      | "id"
      | "progress"
      | "streakDays"
      | "totalPracticeMinutes"
      | "completedWorksheets"
      | "earnedBadges"
      | "createdAt"
    > & { password?: string }
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);

    try {
      // 1. Attempt registration via Next.js backend API
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: data.fullName,
          fullName: data.fullName,
          email: data.email,
          password: data.password || "password123",
          age: data.age,
          selectedLevel: data.abacusLevel,
          abacusLevel: data.abacusLevel,
          avatar: data.avatar,
          dateOfBirth: data.dateOfBirth,
          guardianName: data.parentName,
          parentName: data.parentName,
          guardianPhone: data.parentPhone,
          parentPhone: data.parentPhone,
          parentEmail: data.parentEmail,
        }),
      });

      const responseData = await res.json().catch(() => null);

      if (res.ok && responseData?.success && responseData.user) {
        setUser(responseData.user);
        localStorage.setItem("abacus_active_student", JSON.stringify(responseData.user));
        setIsLoading(false);
        return { success: true };
      }

      // Validation errors (missing fields, duplicate email, invalid email, weak password, invalid phone)
      if (res.status === 400 || res.status === 409) {
        setIsLoading(false);
        return { success: false, error: responseData?.error || "Validation error during registration." };
      }

      // If backend returns a database error (status 500, like Atlas bad auth), proceed with resilient local fallback
      console.warn("[AuthContext]: Backend database error encountered. Falling back to local state.", responseData?.error);
    } catch (e) {
      console.warn("[AuthContext]: Network error during registration, falling back to local state.", e);
    }

    // Phase 1 local storage fallback
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

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    setUser(null);
    localStorage.removeItem("abacus_active_student");
  };

  const updateProfile = async (updated: Partial<StudentUser>): Promise<boolean> => {
    if (!user) return false;

    // Try backend API first
    try {
      const res = await fetch("/api/users/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success && data.profile) {
          const sanitized = sanitizeUser(data.profile);
          setUser(sanitized);
          localStorage.setItem("abacus_active_student", JSON.stringify(sanitized));
          return true;
        }
      }
    } catch {
      // Local fallback
    }

    // Local state fallback
    const updatedUser = { ...user, ...updated };
    setUser(updatedUser);
    localStorage.setItem("abacus_active_student", JSON.stringify(updatedUser));

    const registeredPoolStr = localStorage.getItem("abacus_registered_students") || "[]";
    const registeredPool: StudentUser[] = JSON.parse(registeredPoolStr);
    const idx = registeredPool.findIndex((u) => u.id === user.id);
    if (idx !== -1) {
      registeredPool[idx] = updatedUser;
      localStorage.setItem("abacus_registered_students", JSON.stringify(registeredPool));
    }

    return true;
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
