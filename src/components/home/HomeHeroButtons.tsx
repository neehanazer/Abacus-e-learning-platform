"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import Button from "@/components/ui/Button";
import { useAuth } from "@/context/AuthContext";

export default function HomeHeroButtons() {
  const { isAuthenticated, user } = useAuth();
  const isRegisteredUser = Boolean(isAuthenticated && user);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
      <Link href={isRegisteredUser ? "/dashboard" : "/register"}>
        <Button
          variant="primary"
          size="lg"
          icon={<ArrowRight className="w-5 h-5" />}
        >
          {isRegisteredUser ? "Go to Dashboard" : "Start Learning"}
        </Button>
      </Link>
      <Link href="/about">
        <Button
          variant="outline"
          size="lg"
          icon={<Sparkles className="w-5 h-5 text-amber-500" />}
        >
          Explore Platform
        </Button>
      </Link>
    </div>
  );
}
