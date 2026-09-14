"use client";

import React, { useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useLearning } from "@/context/LearningContext";
import LearningDashboardPage from "../../page";

interface LessonPageProps {
  params: Promise<{ id: string }>;
}

export default function StandaloneLessonPage({ params }: LessonPageProps) {
  const router = useRouter();
  const { setCurrentLessonId, lessons } = useLearning();
  const resolvedParams = use(params);
  const lessonId = resolvedParams.id;

  useEffect(() => {
    if (lessonId) {
      const match = lessons.find((l) => l.id === lessonId);
      if (match) {
        setCurrentLessonId(match.id);
      }
    }
  }, [lessonId, lessons, setCurrentLessonId]);

  return <LearningDashboardPage />;
}
