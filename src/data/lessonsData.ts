export interface Lesson {
  id: string;
  lessonNumber: number;
  title: string;
  topic: string;
  level: string;
  levelNumber: number;
  description: string;
  duration: string;
  durationSeconds: number;
  watchedSeconds: number;
  completed: boolean;
  isLocked: boolean;
  learningObjectives: string[];
  instructor: {
    name: string;
    role: string;
    avatar: string;
  };
  keyTakeaways: string[];
  thumbnailGradient: string;
  videoBadgeText: string;
  videoUrl?: string;
  localVideoPath?: string;
  animatedScenario: {
    abacusFormula: string;
    activeBeads: number[];
    explanation: string;
  };
}

export const MOCK_LESSONS: Lesson[] = [
  {
    id: "lesson-1",
    lessonNumber: 1,
    title: "Introduction to Abacus & Soroban Structure",
    topic: "Abacus Anatomy",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Discover the magical ancient calculating tool! Learn about the outer frame, reckoning beam, heaven beads, and earth beads in a fun story-driven adventure.",
    duration: "01:04",
    durationSeconds: 64,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\abacus-demo.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\abacus-demo.mp4",
    learningObjectives: [
      "Identify the main parts of an Abacus (Frame, Beam, Rods)",
      "Understand the difference between Upper and Lower beads",
      "Learn how to reset the Abacus with the clear beam sweep",
      "Adopt the correct two-hand pinch pencil posture",
    ],
    instructor: {
      name: "Sensei Maya",
      role: "Lead Abacus Master",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "The reckoning beam separates upper beads from lower beads",
      "A clean abacus has all beads pushed away from the beam (Value = 0)",
    ],
    thumbnailGradient: "from-amber-400 to-orange-500",
    videoBadgeText: "Manim Video 🎬",
    animatedScenario: {
      abacusFormula: "Clear Abacus (Value: 0)",
      activeBeads: [],
      explanation: "Resetting the abacus to zero value by clearing the beam.",
    },
  },
  {
    id: "lesson-2",
    lessonNumber: 2,
    title: "Introducing Small Friend Rule",
    topic: "Small Friend Rules",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Discover the power of Small Friends of 5! Learn how to use the 5-point Heaven bead when you don't have enough lower beads for addition and subtraction.",
    duration: "01:10",
    durationSeconds: 70,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\small-friend-rules.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\small-friend-rules.mp4",
    learningObjectives: [
      "Understand Small Friends complement formula to 5",
      "Learn Small Friend Addition rules (+4 = +5 - 1, +3 = +5 - 2, +2 = +5 - 3, +1 = +5 - 4)",
      "Learn Small Friend Subtraction rules (-4 = -5 + 1, -3 = -5 + 2, -2 = -5 + 3, -1 = -5 + 4)",
      "Practice synchronized finger movements with the Heaven bead",
    ],
    instructor: {
      name: "Sensei Maya",
      role: "Lead Abacus Master",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "Small friends are pairs that add up to 5: 4&1, 3&2, 2&3, 1&4",
      "When lower beads are full, use the Heaven bead 5 and adjust the partner bead",
    ],
    thumbnailGradient: "from-emerald-400 to-teal-500",
    videoBadgeText: "Small Friends 🎬",
    animatedScenario: {
      abacusFormula: "Small Friend: +4 = +5 - 1",
      activeBeads: [5],
      explanation: "Add Heaven bead (+5) and push down 1 Earth bead (-1) to add 4!",
    },
  },
  {
    id: "lesson-3",
    lessonNumber: 3,
    title: "Big Friend Rules (Friends of 10)",
    topic: "Big Friends of 10",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "When the unit rod needs more beads, use its big friend: ten! Master Big Friend addition (+9 to +1) and subtraction (-9 to -1) rules across the tens and units rods.",
    duration: "01:46",
    durationSeconds: 106,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\big-friend-rules.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\big-friend-rules.mp4",
    learningObjectives: [
      "Understand Big Friends formula using complement to 10",
      "Master Big Friend Addition rules (+9 to +1 = +10 - partner)",
      "Master Big Friend Subtraction rules (-9 to -1 = -10 + partner)",
      "Coordinate the tens rod (+10/-10) with unit rod complements",
    ],
    instructor: {
      name: "Sensei Maya",
      role: "Lead Abacus Master",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "Big Friends are number pairs that add up to 10 (9&1, 8&2, 7&3, 6&4, 5&5)",
      "Addition rule: Add 10 on the tens rod, then subtract the partner on the units rod",
      "Subtraction rule: Subtract 10 on the tens rod, then add the partner on the units rod",
    ],
    thumbnailGradient: "from-blue-400 to-indigo-500",
    videoBadgeText: "Big Friends 🎬",
    animatedScenario: {
      abacusFormula: "Big Friend Rule: +9 = +10 - 1",
      activeBeads: [10],
      explanation: "Add 1 on tens rod (+10) and subtract 1 on units rod (-1).",
    },
  },
];

export const LEVEL_1_LESSONS: Lesson[] = MOCK_LESSONS;

export const LEVEL_2_LESSONS: Lesson[] = [
  {
    id: "lesson-2-1",
    lessonNumber: 1,
    title: "1-Digit 10-Row Marathon Drills",
    topic: "1 Digit 10 Row Calculation",
    level: "Level 2 — Multi-Row & 2-Digit",
    levelNumber: 2,
    description:
      "Step up your endurance! Master continuous 10-row single-digit calculations on the abacus without breaking rhythm or concentration.",
    duration: "01:06",
    durationSeconds: 66,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4",
    learningObjectives: [
      "Maintain continuous finger posture across 10 rapid rows",
      "Handle mixed addition and subtraction in a continuous sequence",
      "Build steady cadence and eliminate calculation pauses",
      "Achieve high accuracy under 10-row test conditions",
    ],
    instructor: {
      name: "Master Kenji",
      role: "Grandmaster Coach",
      avatar: "🥋",
    },
    keyTakeaways: [
      "Rhythm beats speed: keep a steady cadence",
      "Clear sight and light finger touch maintain speed through row 10",
    ],
    thumbnailGradient: "from-sky-400 to-blue-500",
    videoBadgeText: "10-Row Drill 🎯",
    animatedScenario: {
      abacusFormula: "10-Row Chain: 4 + 5 - 2 + 1 - 3 + 2...",
      activeBeads: [5, 2],
      explanation: "10-row continuous single-digit calculation drill.",
    },
  },
  {
    id: "lesson-2-2",
    lessonNumber: 2,
    title: "1-Digit 12 & 15 Row High Endurance",
    topic: "1 Digit 12 & 15 Row Calculation",
    level: "Level 2 — Multi-Row & 2-Digit",
    levelNumber: 2,
    description:
      "Push beyond boundaries with 12-row and 15-row grand marathon sets. Develop lightning-fast reflex adjustments between positive and negative numbers.",
    duration: "01:06",
    durationSeconds: 66,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4",
    learningObjectives: [
      "Conquer 12-row sequential problem sets",
      "Advance to 15-row championship stamina drills",
      "Rapid sign switching reflexes between + and -",
      "Build mental focus for long calculation series",
    ],
    instructor: {
      name: "Sensei Maya",
      role: "Lead Abacus Master",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "Breathe evenly during long sets to maintain mental clarity",
      "Trust your muscle memory on high-row sequences",
    ],
    thumbnailGradient: "from-blue-400 to-indigo-500",
    videoBadgeText: "15-Row Endurance ⚡",
    animatedScenario: {
      abacusFormula: "15-Row Marathon Chain",
      activeBeads: [5, 4],
      explanation: "15-row endurance calculation without hesitation.",
    },
  },
  {
    id: "lesson-2-3",
    lessonNumber: 3,
    title: "2-Digit 3-Row Calculation Basics",
    topic: "2 Digit 3 Row Calculation",
    level: "Level 2 — Multi-Row & 2-Digit",
    levelNumber: 2,
    description:
      "Enter the world of two-digit mathematics! Learn to coordinate the tens column and units column simultaneously across 3 rows with smooth two-handed motions.",
    duration: "01:06",
    durationSeconds: 66,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4",
    learningObjectives: [
      "Coordinate tens column and units column simultaneously",
      "Calculate 2-digit sums like 24 + 53 - 12",
      "Master dual-column finger synchronization (left hand tens, right hand units)",
    ],
    instructor: {
      name: "Master Kenji",
      role: "Grandmaster Coach",
      avatar: "🥋",
    },
    keyTakeaways: [
      "Calculate from left to right: tens column first, then units column",
      "Synchronize left index for tens rod and right thumb/index for units rod",
    ],
    thumbnailGradient: "from-indigo-400 to-purple-500",
    videoBadgeText: "2-Digit Basics 🔢",
    animatedScenario: {
      abacusFormula: "2-Digit Addition: 24 + 53 = 77",
      activeBeads: [7, 7],
      explanation: "Tens rod: 2+5=7; Units rod: 4+3=7!",
    },
  },
  {
    id: "lesson-2-4",
    lessonNumber: 4,
    title: "2-Digit 5 & 8 Row Championship Speed",
    topic: "2 Digit 5 & 8 Row Calculation",
    level: "Level 2 — Multi-Row & 2-Digit",
    levelNumber: 2,
    description:
      "The championship Level 2 challenge! Master 5-row and 8-row continuous 2-digit calculations, preparing for official Level 2 certification.",
    duration: "01:06",
    durationSeconds: 66,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4"),
    localVideoPath: "C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\one-digit-practice.mp4",
    learningObjectives: [
      "Execute 5-row 2-digit calculation chains",
      "Conquer 8-row championship speed tests",
      "Achieve 95%+ accuracy under timed exam conditions",
      "Prepare for Level 2 Certification & Graduation",
    ],
    instructor: {
      name: "Sensei Maya & DigiBead 🤖",
      role: "Interactive Mentors",
      avatar: "🧙‍♂️",
    },
    keyTakeaways: [
      "Dual-hand coordination unlocks incredible calculating speed",
      "Consistency in finger posture prevents calculation errors in long sets",
    ],
    thumbnailGradient: "from-purple-500 to-pink-500",
    videoBadgeText: "Championship 🏆",
    animatedScenario: {
      abacusFormula: "8-Row 2-Digit Championship Drill",
      activeBeads: [5, 4],
      explanation: "Level 2 graduation mastery demonstration.",
    },
  },
];

export const LESSONS_BY_LEVEL: Record<number, Lesson[]> = {
  1: LEVEL_1_LESSONS,
  2: LEVEL_2_LESSONS,
};

