"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import { driver, type Driver } from "driver.js";
import { Compass, Sparkles, X } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

type TourStop = {
  route: string;
  target: string;
  title: string;
  description: string;
};

const TOUR_STOPS: TourStop[] = [
  { route: "/dashboard", target: "dashboard-learning", title: "Your learning world", description: "Open the full curriculum, follow lessons, and build your abacus skills at your own pace." },
  { route: "/dashboard", target: "dashboard-games", title: "Brain Gym", description: "Jump into quick games for memory, focus, visual thinking, and number sense." },
  { route: "/learning/syllabus", target: "syllabus-roadmap", title: "A roadmap for every level", description: "Browse the eight-level syllabus and see the skills each stage is designed to build." },
  { route: "/learning", target: "lesson-studio", title: "Learn with animated lessons", description: "Choose a lesson, watch the demonstration, and keep track of your progress and rewards." },
  { route: "/learning/practice", target: "practice-center", title: "Practice your way", description: "Explore worksheets, timed challenges, and Flash Anzan to strengthen speed and accuracy." },
  { route: "/learning/homework", target: "homework-center", title: "Stay on top of homework", description: "Review assigned work, due dates, and submissions in one place." },
  { route: "/learning/mock-exam", target: "mock-exam-center", title: "Get ready with mock exams", description: "Try timed exam simulations and review your scores before the official assessment." },
  { route: "/learning/exam", target: "exam-center", title: "Check your exam readiness", description: "See your readiness and eligibility before starting an official exam." },
  { route: "/learning/certificate", target: "certificate-center", title: "Celebrate your milestones", description: "View earned certificates and check certificate verification details." },
  { route: "/learning/virtual-abacus", target: "virtual-abacus-center", title: "Try the virtual abacus", description: "Move beads on an interactive Soroban and explore calculation modes." },
  { route: "/dashboard/braingym", target: "braingym-center", title: "Pick a game adventure", description: "Choose from number games, visual puzzles, and memory challenges." },
  { route: "/profile", target: "student-profile", title: "Make it yours", description: "Update your student details, avatar, and family contact information." },
];

export default function ProductTour() {
  const { user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [tourIndex, setTourIndex] = useState<number | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const driverRef = useRef<Driver | null>(null);
  const retryRef = useRef<number | null>(null);

  const stopTour = useCallback(() => {
    if (retryRef.current !== null) window.clearTimeout(retryRef.current);
    driverRef.current?.destroy();
    driverRef.current = null;
    setTourIndex(null);
  }, []);

  const moveTo = useCallback((index: number) => {
    driverRef.current?.destroy();
    driverRef.current = null;
    if (index < 0) {
      setTourIndex(null);
      return;
    }
    if (index >= TOUR_STOPS.length) {
      setTourIndex(null);
      setIsComplete(true);
      return;
    }
    setTourIndex(index);
    const nextRoute = TOUR_STOPS[index].route;
    if (window.location.pathname !== nextRoute) {
      router.push(nextRoute === "/learning" ? "/learning?product-tour=1" : nextRoute);
    }
  }, [router]);

  useEffect(() => () => {
    if (retryRef.current !== null) window.clearTimeout(retryRef.current);
    driverRef.current?.destroy();
  }, []);

  useEffect(() => {
    if (tourIndex === null) return;
    const stop = TOUR_STOPS[tourIndex];
    if (pathname !== stop.route) return;

    let attempts = 0;
    const showStop = () => {
      const element = document.querySelector<HTMLElement>(`[data-tour="${stop.target}"]`);
      if (!element && attempts < 20) {
        attempts += 1;
        retryRef.current = window.setTimeout(showStop, 150);
        return;
      }
      if (!element) {
        moveTo(tourIndex + 1);
        return;
      }
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      driverRef.current = driver({
        animate: true,
        allowClose: false,
        overlayOpacity: 0.72,
        stagePadding: 10,
        stageRadius: 24,
        popoverClass: "abacus-tour-popover",
        showProgress: true,
        progressText: `Stop ${tourIndex + 1} of ${TOUR_STOPS.length}`,
        steps: [{
          element,
          popover: {
            title: stop.title,
            description: stop.description,
            side: "bottom",
            align: "center",
            showButtons: ["previous", "next", "close"],
            prevBtnText: "Back",
            nextBtnText: tourIndex === TOUR_STOPS.length - 1 ? "Finish tour" : "Next",
            onPrevClick: () => moveTo(tourIndex - 1),
            onNextClick: () => moveTo(tourIndex + 1),
            onCloseClick: stopTour,
          },
        }],
      });
      driverRef.current.drive();
    };

    const frame = window.requestAnimationFrame(showStop);
    return () => {
      window.cancelAnimationFrame(frame);
      if (retryRef.current !== null) window.clearTimeout(retryRef.current);
      driverRef.current?.destroy();
      driverRef.current = null;
    };
  }, [pathname, stopTour, moveTo, tourIndex]);

  if (!user) return null;

  const beginTour = () => {
    setIsWelcomeOpen(false);
    setIsComplete(false);
    moveTo(0);
  };

  return (
    <>
      <motion.button
        type="button"
        aria-label="Take the Abacus World tour"
        onClick={() => { setIsComplete(false); setIsWelcomeOpen(true); }}
        whileHover={{ scale: 1.06, y: -2 }}
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-5 right-5 z-[90] flex items-center gap-2 rounded-full border border-white/80 bg-gradient-to-r from-[#F4A261] via-[#E76F51] to-[#9B5DE5] px-4 py-3 font-bold text-white shadow-xl shadow-orange-900/20 focus:outline-none focus-visible:ring-4 focus-visible:ring-orange-200"
      >
        <Compass className="h-5 w-5" />
        <span className="text-sm">Tour</span>
      </motion.button>

      <AnimatePresence>
        {(isWelcomeOpen || isComplete) && (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-[#10213D]/55 p-4 backdrop-blur-sm"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setIsWelcomeOpen(false); }}
          >
            <motion.section
              role="dialog" aria-modal="true" aria-labelledby="product-tour-title"
              initial={{ opacity: 0, y: 24, scale: 0.94 }}
              animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 16, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 24 }}
              className="relative w-full max-w-lg overflow-hidden rounded-[2rem] border border-white/70 bg-[#FFFBF0] p-7 shadow-2xl sm:p-9"
            >
              <div className="pointer-events-none absolute -right-12 -top-16 h-48 w-48 rounded-full bg-amber-200/70 blur-3xl" />
              <button type="button" aria-label="Close tour dialog" onClick={() => setIsWelcomeOpen(false)} className="absolute right-4 top-4 z-10 rounded-full p-2 text-slate-500 transition hover:bg-white hover:text-slate-800">
                <X className="h-5 w-5" />
              </button>
              <motion.div className="relative" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-lg shadow-orange-200">
                  {isComplete ? <Sparkles className="h-7 w-7" /> : <span className="text-3xl">🧮</span>}
                </div>
                <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-orange-600">{isComplete ? "Tour complete" : "Your Abacus World"}</p>
                <h2 id="product-tour-title" className="text-3xl font-extrabold leading-tight text-[#1D3557] font-heading">
                  {isComplete ? "You’ve seen it all!" : "Let’s explore together."}
                </h2>
                <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
                  {isComplete ? "Your learning hub, practice tools, games, exams, certificates, and profile are all ready when you are." : "Take a guided, animated tour through lessons, practice, homework, exams, games, and more. You can leave the tour at any time."}
                </p>
                {!isComplete && (
                  <div className="my-6 grid grid-cols-3 gap-2 text-center">
                    {["Learn", "Practice", "Play"].map((label, index) => (
                      <motion.div key={label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 + index * 0.07 }} className="rounded-2xl border border-amber-100 bg-white/80 px-2 py-3 text-xs font-extrabold text-[#1D3557]">
                        <span className="mb-1 block text-xl">{["📚", "🧠", "🎮"][index]}</span>{label}
                      </motion.div>
                    ))}
                  </div>
                )}
                <button type="button" onClick={isComplete ? () => setIsComplete(false) : beginTour} className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#F4A261] to-[#E76F51] px-6 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-orange-200 transition hover:brightness-105 active:scale-[0.99]">
                  {isComplete ? "Close" : "Start the tour"}<span aria-hidden="true">{isComplete ? "✓" : "→"}</span>
                </button>
              </motion.div>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
