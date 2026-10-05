"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If auth checking is finished and user is not registered or authenticated,
    // immediately replace route to /register so they never access the dashboard page.
    if (!isLoading && (!isAuthenticated || !user)) {
      router.replace("/register");
    }
  }, [isLoading, isAuthenticated, user, router]);

  // If loading or not registered/authenticated, never render dashboard children or countdown UI
  if (isLoading || !isAuthenticated || !user) {
    return null;
  }

  return <>{children}</>;
}

