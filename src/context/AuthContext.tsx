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
  login: (email: string, pass: string) => Promise<{ success: boolean; error?: string; notRegistered?: boolean }>;
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

const PRE_REGISTERED_STUDENTS: (StudentUser & { password?: string })[] = [
  {
    id: "6ab4bdd6022c50de24e9a2a7",
    fullName: "Neeha Nazer",
    name: "Neeha",
    email: "neehanaz226@gmail.com",
    password: "neeha123",
    phone: "+91 98765 43210",
    age: 10,
    dateOfBirth: "2016-04-12",
    abacusLevel: "Level 2: Two-Digit Operations & Big Friend Subtraction",
    selectedLevel: "Level 2: Two-Digit Operations & Big Friend Subtraction",
    avatar: "🧮",
    parentName: "Nazer",
    parentEmail: "neehanaz226@gmail.com",
    parentPhone: "+91 98765 43210",
    role: "student",
    accountStatus: "active",
    progress: 100,
    streakDays: 4,
    totalPracticeMinutes: 120,
    completedWorksheets: 18,
    earnedBadges: ["Bead Master", "Speed Starter", "BrainGym Champ", "Level 1 Certified"],
    createdAt: "2026-02-15",
  },
  {
    id: "std_demo_101",
    fullName: "Alex Parker",
    name: "Alex Parker",
    email: "student@abacus.com",
    password: "password123",
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
  },
];

const DEFAULT_DEMO_STUDENT = PRE_REGISTERED_STUDENTS[1];

export const sanitizeUser = (
  raw: (Partial<StudentUser> & Record<string, unknown>) | null | undefined
): StudentUser | null => {
  if (!raw || (!raw.id && !raw.email && !raw.fullName && !raw.name)) {
    return null;
  }
  const fullName =
    (typeof raw.fullName === "string"
      ? raw.fullName
      : typeof raw.name === "string"
      ? raw.name
      : "") || "Student Explorer";
  const name =
    (typeof raw.name === "string"
      ? raw.name
      : typeof raw.fullName === "string"
      ? raw.fullName
      : "") || fullName.split(" ")[0] || "Student";
  const email = (typeof raw.email === "string" ? raw.email : "") || "";
  const emailLower = email.toLowerCase();
  const rawId = (typeof raw.id === "string" ? raw.id : "") || ((raw as any)._id?.toString() || "");

  // Auto-promote if certified or completed level 1 (e.g. Neeha Nazer)
  const isLevel1Certified =
    emailLower === "neehanaz226@gmail.com" ||
    rawId === "6ab4bdd6022c50de24e9a2a7" ||
    rawId === "std_neeha_226" ||
    (Array.isArray(raw.earnedBadges) &&
      raw.earnedBadges.some(
        (b) => typeof b === "string" && b.toLowerCase().includes("level 1 cert")
      ));

  let abacusLevel =
    (typeof raw.abacusLevel === "string"
      ? raw.abacusLevel
      : typeof raw.selectedLevel === "string"
      ? raw.selectedLevel
      : "") || "Level 1 - Direct Addition & Subtraction";
  let selectedLevel =
    (typeof raw.selectedLevel === "string"
      ? raw.selectedLevel
      : typeof raw.abacusLevel === "string"
      ? raw.abacusLevel
      : "") || abacusLevel;

  if (isLevel1Certified) {
    abacusLevel = "Level 2: Two-Digit Operations & Big Friend Subtraction";
    selectedLevel = "Level 2: Two-Digit Operations & Big Friend Subtraction";
  }

  const earnedBadges = Array.isArray(raw.earnedBadges)
    ? [...raw.earnedBadges]
    : ["Welcome Explorer"];
  if (isLevel1Certified && !earnedBadges.includes("Level 1 Certified")) {
    earnedBadges.push("Level 1 Certified");
  }

  const avatar =
    (typeof raw.avatar === "string" ? raw.avatar : "") || "🧙‍♂️";

  return {
    ...raw,
    id: (raw.id || (raw as any)._id?.toString() || (isLevel1Certified ? "6ab4bdd6022c50de24e9a2a7" : `std_${Date.now()}`)).toString(),
    fullName,
    name,
    email,
    phone: typeof raw.phone === "string" ? raw.phone : "",
    age: typeof raw.age === "number" ? raw.age : 8,
    dateOfBirth: typeof raw.dateOfBirth === "string" ? raw.dateOfBirth : "",
    abacusLevel,
    selectedLevel,
    avatar,
    parentName:
      typeof raw.parentName === "string"
        ? raw.parentName
        : typeof raw.guardianName === "string"
        ? raw.guardianName
        : "",
    parentEmail: typeof raw.parentEmail === "string" ? raw.parentEmail : "",
    parentPhone:
      typeof raw.parentPhone === "string"
        ? raw.parentPhone
        : typeof raw.guardianPhone === "string"
        ? raw.guardianPhone
        : "",
    role: typeof raw.role === "string" ? raw.role : "student",
    accountStatus: typeof raw.accountStatus === "string" ? raw.accountStatus : "active",
    progress: typeof raw.progress === "number" ? raw.progress : (isLevel1Certified ? 100 : 0),
    streakDays: typeof raw.streakDays === "number" ? raw.streakDays : 1,
    totalPracticeMinutes: typeof raw.totalPracticeMinutes === "number" ? raw.totalPracticeMinutes : 0,
    completedWorksheets: typeof raw.completedWorksheets === "number" ? raw.completedWorksheets : 0,
    earnedBadges,
    createdAt: typeof raw.createdAt === "string" ? raw.createdAt : new Date().toISOString().split("T")[0],
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
        let queryParams = "";
        try {
          const storedStr = localStorage.getItem("abacus_active_student");
          if (storedStr) {
            const parsed = JSON.parse(storedStr);
            if (parsed.email) {
              queryParams = `?email=${encodeURIComponent(parsed.email)}`;
            }
          }
        } catch {}

        const res = await fetch(`/api/auth/me${queryParams}`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });

        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user && isMounted) {
            const sanitized = sanitizeUser(data.user);
            if (sanitized) {
              setUser(sanitized);
              localStorage.setItem("abacus_active_student", JSON.stringify(sanitized));
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // Fallback to local storage if API call fails
      }

      // Local storage fallback for previously logged-in students
      try {
        const storedUser = localStorage.getItem("abacus_active_student");
        if (storedUser && isMounted) {
          const parsed = JSON.parse(storedUser);
          // If stored user was the auto-seeded demo user and not explicitly logged in, clear it!
          if (parsed && (parsed.id === "std_demo_101" || parsed.email === "student@abacus.com")) {
            const explicitlyLoggedIn = localStorage.getItem("abacus_demo_explicitly_logged_in");
            if (!explicitlyLoggedIn) {
              localStorage.removeItem("abacus_active_student");
              setUser(null);
              setIsLoading(false);
              return;
            }
          }

          if (parsed && (parsed.id || parsed.email)) {
            const sanitized = sanitizeUser(parsed);
            if (sanitized) {
              setUser(sanitized);
              // CRUCIAL: Immediately re-persist the sanitized (upgraded) user back to localStorage
              localStorage.setItem("abacus_active_student", JSON.stringify(sanitized));
              setIsLoading(false);
              return;
            }
          }
        }
      } catch {
        // ignore
      }

      if (isMounted) {
        setUser(null);
        setIsLoading(false);
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
  ): Promise<{ success: boolean; error?: string; notRegistered?: boolean }> => {
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
        if (sanitized) {
          setUser(sanitized);
          localStorage.setItem("abacus_active_student", JSON.stringify(sanitized));
          setIsLoading(false);
          return { success: true };
        }
      }

      // If backend explicitly returned 401 (incorrect password in database), return error immediately
      if (res.status === 401) {
        setIsLoading(false);
        return {
          success: false,
          error: data?.error || "Incorrect password. Please try again.",
        };
      }
    } catch {
      // Network failure, fallback to localStorage check
    }

    // Check pre-registered accounts (e.g. neehanaz226@gmail.com)
    const preRegistered = PRE_REGISTERED_STUDENTS.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (preRegistered) {
      if (preRegistered.password && preRegistered.password !== pass) {
        setIsLoading(false);
        return {
          success: false,
          error: "Incorrect password. Please try again.",
        };
      }
      setUser(preRegistered);
      localStorage.setItem("abacus_active_student", JSON.stringify(preRegistered));
      localStorage.setItem("abacus_demo_explicitly_logged_in", "true");
      setIsLoading(false);
      return { success: true };
    }

    // Local storage pool fallback for locally registered accounts
    const registeredPoolStr = localStorage.getItem("abacus_registered_students") || "[]";
    let registeredPool: (StudentUser & { password?: string })[] = [];
    try {
      registeredPool = JSON.parse(registeredPoolStr);
    } catch {
      registeredPool = [];
    }

    const foundUser = registeredPool.find(
      (u) => u.email.toLowerCase() === email.toLowerCase()
    );

    if (foundUser) {
      if (foundUser.password && foundUser.password !== pass) {
        setIsLoading(false);
        return {
          success: false,
          error: "Incorrect password. Please try again.",
        };
      }
      setUser(foundUser);
      localStorage.setItem("abacus_active_student", JSON.stringify(foundUser));
      setIsLoading(false);
      return { success: true };
    }

    setIsLoading(false);
    return {
      success: false,
      notRegistered: true,
      error: "This user is not registered. Redirecting to register page...",
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
    let registeredPool: (StudentUser & { password?: string })[] = [];
    try {
      registeredPool = JSON.parse(registeredPoolStr);
    } catch {
      registeredPool = [];
    }

    if (registeredPool.some((u) => u.email.toLowerCase() === data.email.toLowerCase())) {
      setIsLoading(false);
      return { success: false, error: "An account with this email already exists." };
    }

    const newUser: StudentUser & { password?: string } = {
      ...data,
      password: data.password,
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
    localStorage.removeItem("abacus_demo_explicitly_logged_in");
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
