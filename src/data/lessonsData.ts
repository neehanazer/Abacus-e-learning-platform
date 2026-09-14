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
    duration: "05:40",
    durationSeconds: 340,
    watchedSeconds: 340,
    completed: true,
    isLocked: false,
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
    videoBadgeText: "Foundation 101",
    animatedScenario: {
      abacusFormula: "Clear Abacus (Value: 0)",
      activeBeads: [],
      explanation: "Resetting the abacus to zero value by clearing the beam.",
    },
  },
  {
    id: "lesson-2",
    lessonNumber: 2,
    title: "Understanding Upper Bead (5) & Lower Beads (1-4)",
    topic: "Bead Values",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Meet the 5-point Heaven Bead and the 1-point Earth Beads! Master how bead positions close to the center beam form counting values from 1 through 9.",
    duration: "07:15",
    durationSeconds: 435,
    watchedSeconds: 435,
    completed: true,
    isLocked: false,
    learningObjectives: [
      "Identify bead values (Lower bead = 1, Upper bead = 5)",
      "Understand how touching the beam activates a bead's value",
      "Read single rod values from 0 to 9 instantly",
      "Practice thumb up-flick for lower beads and index finger for upper beads",
    ],
    instructor: {
      name: "Sensei Maya",
      role: "Lead Abacus Master",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "Upper bead counts for 5 when moved down to the beam",
      "Each lower bead counts for 1 when moved up to the beam",
    ],
    thumbnailGradient: "from-emerald-400 to-teal-500",
    videoBadgeText: "Core Concepts",
    animatedScenario: {
      abacusFormula: "Bead Value: Upper (5) + Lower (2) = 7",
      activeBeads: [5, 1, 2],
      explanation: "Upper bead down (5) + 2 lower beads up (2) makes 7!",
    },
  },
  {
    id: "lesson-3",
    lessonNumber: 3,
    title: "Number Representation 1 to 9",
    topic: "Number Sense",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Turn numbers into vivid mental pictures. Practice representing single-digit values 1 through 9 on the unit rod with super-fast finger movements.",
    duration: "08:30",
    durationSeconds: 510,
    watchedSeconds: 510,
    completed: true,
    isLocked: false,
    learningObjectives: [
      "Form numbers 1, 2, 3, 4 using only lower beads",
      "Form number 5 using the single upper bead",
      "Form numbers 6, 7, 8, 9 combining upper and lower beads (Butterfly Pinch)",
      "Develop rapid eye-to-abacus visual recognition",
    ],
    instructor: {
      name: "Sensei Maya & DigiBead 🤖",
      role: "Interactive Mentors",
      avatar: "🧙‍♂️",
    },
    keyTakeaways: [
      "Pinch movement brings 5 and lower beads together simultaneously",
      "6 is 5 + 1; 8 is 5 + 3; 9 is 5 + 4 (full rod)",
    ],
    thumbnailGradient: "from-blue-400 to-indigo-500",
    videoBadgeText: "Essential Skill",
    animatedScenario: {
      abacusFormula: "Representing Number 9 (Pinch All)",
      activeBeads: [5, 1, 2, 3, 4],
      explanation: "Full rod activated: 5 + 1 + 1 + 1 + 1 = 9.",
    },
  },
  {
    id: "lesson-4",
    lessonNumber: 4,
    title: "Basic Addition on Abacus (Direct Method)",
    topic: "Direct Addition",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Your first arithmetic calculations! Learn direct addition without carrying, such as 2 + 2 = 4, 1 + 5 = 6, and 3 + 6 = 9 on the unit rod.",
    duration: "10:00",
    durationSeconds: 600,
    watchedSeconds: 450, // 75% watched
    completed: false,
    isLocked: false,
    learningObjectives: [
      "Perform direct addition: +1, +2, +3 on lower beads",
      "Add +5 using index finger downward motion",
      "Combine numbers directly without regrouping (e.g. 2 + 5 + 1 = 8)",
      "Say numbers aloud while moving beads to reinforce auditory memory",
    ],
    instructor: {
      name: "Sensei Maya & DigiBead 🤖",
      role: "Interactive Mentors",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "Always use thumb to push lower beads UP (+)",
      "Always use index finger to pull upper bead DOWN (+5)",
    ],
    thumbnailGradient: "from-purple-400 to-pink-500",
    videoBadgeText: "In Progress",
    animatedScenario: {
      abacusFormula: "Direct Addition: 3 + 5 = 8",
      activeBeads: [1, 2, 3, 5],
      explanation: "Start with 3 lower beads, then drop the upper bead (+5) to reach 8!",
    },
  },
  {
    id: "lesson-5",
    lessonNumber: 5,
    title: "Complementary Addition: Small Friends (+5 Rule)",
    topic: "Small Friends (+5)",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "When you don't have enough lower beads to add directly, call your Small Friends! Learn formulas: +4 = +5 - 1, +3 = +5 - 2, +2 = +5 - 3, +1 = +5 - 4.",
    duration: "09:20",
    durationSeconds: 560,
    watchedSeconds: 0,
    completed: false,
    isLocked: false,
    learningObjectives: [
      "Understand the concept of number complements to 5",
      "Memorize Small Friend pairs: (1 & 4), (2 & 3)",
      "Apply the Small Friend formula: +X = +5 - (5-X)",
      "Execute smooth synchronized two-finger motion",
    ],
    instructor: {
      name: "Master Kenji",
      role: "Grandmaster Coach",
      avatar: "🥋",
    },
    keyTakeaways: [
      "Small Friends are pairs of numbers that add up to 5",
      "When lower beads are full, drop 5 and push away the friend!",
    ],
    thumbnailGradient: "from-rose-400 to-red-500",
    videoBadgeText: "Key Formula",
    animatedScenario: {
      abacusFormula: "+4 Formula: (+5 - 1)",
      activeBeads: [5, 2, 3, 4],
      explanation: "Adding 4 to 3: drop upper 5 bead, pull down 1 lower bead friend = 7!",
    },
  },
  {
    id: "lesson-6",
    lessonNumber: 6,
    title: "Direct Subtraction on Abacus",
    topic: "Direct Subtraction",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Taking beads away with precision! Learn how to subtract using index finger motions for lower beads (pulling down) and pushing upper bead up (-5).",
    duration: "08:45",
    durationSeconds: 525,
    watchedSeconds: 0,
    completed: false,
    isLocked: true,
    learningObjectives: [
      "Perform direct subtraction on lower beads using index finger",
      "Subtract 5 using index finger upward flick",
      "Solve mixed equations: 9 - 3 - 5 + 2 = 3",
      "Build speed with single-finger retraction exercises",
    ],
    instructor: {
      name: "Sensei Maya",
      role: "Lead Abacus Master",
      avatar: "👩‍🏫",
    },
    keyTakeaways: [
      "Index finger is ALWAYS used for all subtraction movements",
      "Moving away from the center beam decreases the count",
    ],
    thumbnailGradient: "from-sky-400 to-cyan-500",
    videoBadgeText: "Upcoming",
    animatedScenario: {
      abacusFormula: "Direct Subtraction: 8 - 3 = 5",
      activeBeads: [5],
      explanation: "Pull down 3 lower beads, leaving only upper bead (5).",
    },
  },
  {
    id: "lesson-7",
    lessonNumber: 7,
    title: "Complementary Subtraction: Small Friends (-5 Rule)",
    topic: "Small Friends (-5)",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Need to subtract when there aren't enough lower beads? Reverse the formula! Learn: -4 = -5 + 1, -3 = -5 + 2, -2 = -5 + 3, -1 = -5 + 4.",
    duration: "11:10",
    durationSeconds: 670,
    watchedSeconds: 0,
    completed: false,
    isLocked: true,
    learningObjectives: [
      "Master the subtraction Small Friends rules",
      "Practice formulas: -4, -3, -2, -1 on beads",
      "Combine addition and subtraction formulas smoothly",
      "Solve 5-step rapid flash problem sets",
    ],
    instructor: {
      name: "Master Kenji",
      role: "Grandmaster Coach",
      avatar: "🥋",
    },
    keyTakeaways: [
      "Subtracting with friends: Push 5 UP (-5) and bring friend UP (+friend)",
    ],
    thumbnailGradient: "from-amber-500 to-emerald-500",
    videoBadgeText: "Advanced",
    animatedScenario: {
      abacusFormula: "-3 Formula: (-5 + 2)",
      activeBeads: [1, 2, 3, 4],
      explanation: "From 7 subtract 3: push upper 5 up, push 2 lower beads up = 4!",
    },
  },
  {
    id: "lesson-8",
    lessonNumber: 8,
    title: "Speed Finger Movements & Anzan Mental Math Intro",
    topic: "Mental Math (Anzan)",
    level: "Level 1 — Basic Numbers",
    levelNumber: 1,
    description:
      "Begin thinking without touching physical beads! Picture the Soroban beads moving in your mind's eye to compute simple sums at lightning speed.",
    duration: "12:00",
    durationSeconds: 720,
    watchedSeconds: 0,
    completed: false,
    isLocked: true,
    learningObjectives: [
      "Close eyes and visualize clear abacus rod",
      "Mentally flick virtual beads up and down with fingers in the air",
      "Solve 3-number flash sums within 3 seconds",
      "Earn Level 1 Video Lessons Mastery Badge 🏆",
    ],
    instructor: {
      name: "Sensei Maya & DigiBead 🤖",
      role: "Interactive Mentors",
      avatar: "🌟",
    },
    keyTakeaways: [
      "Anzan transforms the physical abacus into a mental supercomputer",
      "Regular 10-minute visualization builds razor-sharp concentration",
    ],
    thumbnailGradient: "from-violet-500 to-indigo-600",
    videoBadgeText: "Mastery Level",
    animatedScenario: {
      abacusFormula: "Anzan Mental Flash: 2 + 5 + 2 = 9",
      activeBeads: [5, 1, 2, 3, 4],
      explanation: "Mental visualization of full 9 bead activation!",
    },
  },
];
