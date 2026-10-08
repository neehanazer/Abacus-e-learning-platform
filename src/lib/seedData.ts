import mongoose from "mongoose";
import { connectToDatabase } from "@/lib/mongodb";
import Level from "@/models/Level";
import Topic from "@/models/Topic";
import Lesson from "@/models/Lesson";

export interface SeedLesson {
  _id: string;
  title: string;
  description: string;
  levelId: string;
  topicId: string;
  lessonNumber: number;
  videoUrl: string;
  duration: number;
  objectives: string[];
  order: number;
  status: "active" | "draft";
}

export interface SeedTopic {
  _id: string;
  topicName: string;
  description: string;
  levelId: string;
  order: number;
  lessons: SeedLesson[];
}

export interface SeedLevel {
  _id: string;
  levelName: string;
  description: string;
  objectives: string[];
  order: number;
  status: "active" | "inactive" | "draft";
  topics: SeedTopic[];
}

/**
 * Standard realistic Abacus syllabus definitions.
 * Provides authentic, step-by-step curriculum from basic foundations to Anzan mental calculation.
 */
export const SYLLABUS_CATALOG: SeedLevel[] = [
  // =========================================================================
  // LEVEL 1: Basic Foundations & Friend Rules
  // =========================================================================
  {
    _id: "678900000000000000000001",
    levelName: "Level 1: Basic Foundations & Friend Rules",
    description:
      "Master simple 1-digit and 2-digit calculations without rules, complete Small Friend rules (+4..+1, -4..-1), Big Friend rules (+9..+1, -9..-1), and 1-digit multi-row calculations (3, 5, 7 rows).",
    objectives: [
      "Simple 1-digit calculations (without using rules)",
      "Simple 2-digit calculations (without using rules)",
      "Small friend addition (+4, +3, +2, +1)",
      "Small friend subtraction (-4, -3, -2, -1)",
      "Big friend addition (+9 to +1)",
      "1-digit 3, 5, 7 row calculations",
    ],
    order: 1,
    status: "active",
    topics: [
      {
        _id: "678900000000000000010001",
        topicName: "Introduction & Simple 1-Digit Calculations",
        description: "Direct bead manipulation on single unit rod without formulas.",
        levelId: "678900000000000000000001",
        order: 1,
        lessons: [
          {
            _id: "678900000000000001000001",
            title: "Introduction to Abacus & Soroban Structure",
            description:
              "Discover the magical ancient calculating tool! Learn about the outer frame, reckoning beam, heaven beads, and earth beads in a fun story-driven adventure.",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000001",
            lessonNumber: 1,
            videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\abacus-demo.mp4"),
            duration: 64,
            objectives: [
              "Identify the main parts of an Abacus (Frame, Beam, Rods)",
              "Understand the difference between Upper and Lower beads",
              "Learn how to reset the Abacus with the clear beam sweep",
              "Adopt the correct two-hand pinch pencil posture",
            ],
            order: 1,
            status: "active",
          },
          {
            _id: "678900000000000001000002",
            title: "Introducing Small Friend Rule",
            description:
              "Discover the power of Small Friends of 5! Learn how to use the 5-point Heaven bead when you don't have enough lower beads for addition and subtraction.",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000001",
            lessonNumber: 2,
            videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\small-friend-rules.mp4"),
            duration: 70,
            objectives: [
              "Direct thumb push for lower beads",
              "Index finger pull down for lower beads",
              "Perform calculations like 1+2, 2+1, 3-2, 4-3",
            ],
            order: 2,
            status: "active",
          },
          {
            _id: "678900000000000001000003",
            title: "Big Friend Rules (Friends of 10)",
            description:
              "When the unit rod needs more beads, use its big friend: ten! Master Big Friend addition (+9 to +1) and subtraction (-9 to -1) rules across the tens and units rods.",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000001",
            lessonNumber: 3,
            videoUrl: "/api/video?path=" + encodeURIComponent("C:\\Users\\NEEHA NAZER\\Documents\\Manim Test\\out\\big-friend-rules.mp4"),
            duration: 106,
            objectives: [
              "Understand Big Friends formula using complement to 10",
              "Master Big Friend Addition rules (+9 to +1 = +10 - partner)",
              "Master Big Friend Subtraction rules (-9 to -1 = -10 + partner)",
              "Coordinate the tens rod (+10/-10) with unit rod complements",
            ],
            order: 3,
            status: "active",
          },
        ],
      },
      {
        _id: "678900000000000001000002",
        topicName: "Small Friends Addition (+4, +3, +2, +1)",
        description: "Formulas when not enough lower beads are available (using +5 combo).",
        levelId: "678900000000000000000001",
        order: 2,
        lessons: [
          {
            _id: "678900000000000001000004",
            title: "Small Friend +4 Formula (+5 - 1)",
            description:
              "Learn how to add 4 when you only have 1, 2, or 3 lower beads available by calling friend 1 from heaven bead 5.",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000002",
            lessonNumber: 4,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 450,
            objectives: [
              "Master the formula: +4 = +5 - 1",
              "Synchronize thumb and index finger simultaneously",
              "Solve problems like 1+4, 2+4, 3+4, 4+4",
            ],
            order: 1,
            status: "active",
          },
          {
            _id: "678900000000000001000005",
            title: "Small Friend +3, +2, +1 Formulas",
            description:
              "Master the remaining small friends addition rules (+3 = +5 - 2, +2 = +5 - 3, +1 = +5 - 4).",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000002",
            lessonNumber: 5,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 480,
            objectives: [
              "Apply formula: +3 = +5 - 2",
              "Apply formula: +2 = +5 - 3",
              "Apply formula: +1 = +5 - 4",
            ],
            order: 2,
            status: "active",
          },
        ],
      },
      {
        _id: "678900000000000001000003",
        topicName: "Small Friends Subtraction (-4, -3, -2, -1)",
        description: "Subtracting when not enough lower beads are active (borrowing from 5).",
        levelId: "678900000000000000000001",
        order: 3,
        lessons: [
          {
            _id: "678900000000000001000006",
            title: "Small Friend Subtraction (-4, -3, -2, -1)",
            description:
              "Master formulas: -4 = -5 + 1, -3 = -5 + 2, -2 = -5 + 3, and -1 = -5 + 4.",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000003",
            lessonNumber: 6,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 460,
            objectives: [
              "Master formula: -4 = -5 + 1",
              "Master formula: -3 = -5 + 2",
              "Master formula: -2 = -5 + 3",
              "Master formula: -1 = -5 + 4",
            ],
            order: 1,
            status: "active",
          },
        ],
      },
      {
        _id: "678900000000000001000004",
        topicName: "Big Friends Addition (+9 to +1)",
        description: "Formulas using base-10 carrying when the unit rod is full.",
        levelId: "678900000000000000000001",
        order: 4,
        lessons: [
          {
            _id: "678900000000000001000007",
            title: "Big Friend Addition Fundamentals (+9, +8, +7)",
            description:
              "Understand the base-10 carry rod movement. Formulas: +9 = +10 - 1, +8 = +10 - 2, +7 = +10 - 3.",
            levelId: "678900000000000000000001",
            topicId: "678900000000000001000004",
            lessonNumber: 7,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 520,
            objectives: [
              "Understand base-10 rod transfer (+10 on tens rod)",
              "Apply formula: +9 = +10 - 1",
              "Apply formula: +8 = +10 - 2",
              "Apply formula: +7 = +10 - 3",
            ],
            order: 1,
            status: "active",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 2: Two-Digit Operations & Big Friend Subtraction
  // =========================================================================
  {
    _id: "678900000000000000000002",
    levelName: "Level 2: Two-Digit Operations & Big Friend Subtraction",
    description:
      "Master 2-digit multi-row addition and subtraction, Big Friend subtraction formulas (-9 to -1), and mental visualization speed drills.",
    objectives: [
      "2-digit 3 row calculations",
      "Big Friend subtraction rules (-9 to -1)",
      "2-digit 5 row calculations",
      "Speed visualization drills",
    ],
    order: 2,
    status: "active",
    topics: [
      {
        _id: "678900000000000002000001",
        topicName: "Big Friends Subtraction (-9 to -1)",
        description: "Borrowing from the tens rod when unit rod lower beads are insufficient.",
        levelId: "678900000000000000000002",
        order: 1,
        lessons: [
          {
            _id: "678900000000000002000008",
            title: "Big Friend Subtraction: -9, -8, -7 Formulas",
            description:
              "Formulas: -9 = -10 + 1, -8 = -10 + 2, -7 = -10 + 3. Master tens rod retraction and unit rod addition.",
            levelId: "678900000000000000000002",
            topicId: "678900000000000002000001",
            lessonNumber: 8,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 490,
            objectives: [
              "Tens rod retraction (-10)",
              "Unit rod compensation (+1, +2, +3)",
              "Solve problems like 15-9, 12-8, 14-7",
            ],
            order: 1,
            status: "active",
          },
          {
            _id: "678900000000000002000009",
            title: "Big Friend Subtraction: -6 through -1 Formulas",
            description:
              "Complete the base-10 subtraction rulebook: -6 = -10 + 4, -5 = -10 + 5, -4 = -10 + 6, down to -1.",
            levelId: "678900000000000000000002",
            topicId: "678900000000000002000001",
            lessonNumber: 9,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 510,
            objectives: [
              "Complete Big Friend subtraction suite",
              "Perform rapid mental drills on Soroban",
            ],
            order: 2,
            status: "active",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 3: Combination Formulas & Rapid Multi-Row
  // =========================================================================
  {
    _id: "678900000000000000000003",
    levelName: "Level 3: Combination Formulas & Rapid Multi-Row",
    description:
      "Master combination formulas (+6 to +9 combo, -6 to -9 combo), 2-digit 7 row calculations, and introduction to 3-digit addition.",
    objectives: [
      "Combination addition (+6 = +1 - 5 + 10)",
      "Combination subtraction (-6 = -10 + 5 - 1)",
      "2-digit 7 row calculations",
      "3-digit 3 row addition",
    ],
    order: 3,
    status: "active",
    topics: [
      {
        _id: "678900000000000003000001",
        topicName: "Combination Addition & Subtraction Rules",
        description: "Combining small friends and big friends in a single composite motion.",
        levelId: "678900000000000000000003",
        order: 1,
        lessons: [
          {
            _id: "678900000000000003000010",
            title: "Combination Addition Formulas (+6, +7, +8, +9)",
            description:
              "Learn the combination formulas when you need both the 5 bead and the 10 bead.",
            levelId: "678900000000000000000003",
            topicId: "678900000000000003000001",
            lessonNumber: 10,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 540,
            objectives: [
              "Combination addition formula structure",
              "Two-handed fluid movement on Soroban",
            ],
            order: 1,
            status: "active",
          },
        ],
      },
    ],
  },

  // =========================================================================
  // LEVEL 4: Multiplication Basics & Anzan Mental Champion
  // =========================================================================
  {
    _id: "678900000000000000000004",
    levelName: "Level 4: Multiplication Basics & Anzan Mental Champion",
    description:
      "Master 2-digit x 1-digit and 3-digit x 1-digit multiplication on Soroban, along with rapid Anzan mental arithmetic.",
    objectives: [
      "2-digit by 1-digit multiplication",
      "3-digit by 1-digit multiplication",
      "Anzan mental calculation drills",
    ],
    order: 4,
    status: "active",
    topics: [
      {
        _id: "678900000000000004000001",
        topicName: "Abacus Multiplication Basics",
        description: "Placing multi-digit multiplicands and accumulators across rods.",
        levelId: "678900000000000000000004",
        order: 1,
        lessons: [
          {
            _id: "678900000000000004000011",
            title: "2-Digit by 1-Digit Abacus Multiplication",
            description:
              "Learn rod positioning and digit placement for multiplication on the Abacus.",
            levelId: "678900000000000000000004",
            topicId: "678900000000000004000001",
            lessonNumber: 11,
            videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
            duration: 600,
            objectives: [
              "Setting the multiplicand and multiplier",
              "Multiplying tens and units systematically",
              "Accumulating products seamlessly",
            ],
            order: 1,
            status: "active",
          },
        ],
      },
    ],
  },
];

/**
 * Fallback helpers when MongoDB is offline / unreachable
 */
export function getCatalogLevels() {
  return SYLLABUS_CATALOG.map((l) => ({
    _id: l._id,
    levelName: l.levelName,
    description: l.description,
    objectives: l.objectives,
    order: l.order,
    status: l.status,
  }));
}

export function getCatalogLevel(identifier: string) {
  const num = Number(identifier);
  return (
    SYLLABUS_CATALOG.find(
      (l) => l._id === identifier || (!isNaN(num) && l.order === num)
    ) || null
  );
}

export function getCatalogTopics(levelIdentifier: string) {
  const level = getCatalogLevel(levelIdentifier);
  if (!level) return null;
  return level.topics.map((t) => ({
    _id: t._id,
    topicName: t.topicName,
    description: t.description,
    levelId: t.levelId,
    order: t.order,
  }));
}

export function getCatalogLessons(topicId: string) {
  for (const level of SYLLABUS_CATALOG) {
    for (const topic of level.topics) {
      if (topic._id === topicId) {
        return topic.lessons;
      }
    }
  }
  return null;
}

export function getCatalogLesson(lessonId: string) {
  for (const level of SYLLABUS_CATALOG) {
    for (const topic of level.topics) {
      for (const lesson of topic.lessons) {
        if (lesson._id === lessonId) {
          return {
            ...lesson,
            levelId: {
              _id: level._id,
              levelName: level.levelName,
              order: level.order,
              status: level.status,
              description: level.description,
            },
            topicId: {
              _id: topic._id,
              topicName: topic.topicName,
              order: topic.order,
              description: topic.description,
            },
          };
        }
      }
    }
  }
  return null;
}

export function getAllCatalogLessons() {
  const lessons: any[] = [];
  for (const level of SYLLABUS_CATALOG) {
    for (const topic of level.topics) {
      for (const lesson of topic.lessons) {
        lessons.push({
          ...lesson,
          levelId: {
            _id: level._id,
            levelName: level.levelName,
            order: level.order,
          },
          topicId: {
            _id: topic._id,
            topicName: topic.topicName,
            order: topic.order,
          },
        });
      }
    }
  }
  return lessons;
}

/**
 * Seeds or re-seeds sample syllabus data directly into MongoDB.
 */
export async function seedSyllabusData(force = false) {
  await connectToDatabase();

  const existingLevelsCount = await Level.countDocuments();
  if (existingLevelsCount > 0 && !force) {
    return {
      message: `Database already seeded with ${existingLevelsCount} levels.`,
      seeded: false,
      count: existingLevelsCount,
    };
  }

  if (force) {
    await Lesson.deleteMany({});
    await Topic.deleteMany({});
    await Level.deleteMany({});
  }

  let totalLevels = 0;
  let totalTopics = 0;
  let totalLessons = 0;

  for (const levelData of SYLLABUS_CATALOG) {
    const levelDoc = await Level.findOneAndUpdate(
      { order: levelData.order },
      {
        $set: {
          levelName: levelData.levelName,
          description: levelData.description,
          objectives: levelData.objectives,
          order: levelData.order,
          status: levelData.status,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    totalLevels++;

    for (const topicData of levelData.topics) {
      const topicDoc = await Topic.findOneAndUpdate(
        { levelId: levelDoc._id, order: topicData.order },
        {
          $set: {
            topicName: topicData.topicName,
            description: topicData.description,
            levelId: levelDoc._id,
            order: topicData.order,
          },
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      totalTopics++;

      for (const lessonData of topicData.lessons) {
        await Lesson.findOneAndUpdate(
          { topicId: topicDoc._id, lessonNumber: lessonData.lessonNumber },
          {
            $set: {
              title: lessonData.title,
              description: lessonData.description,
              levelId: levelDoc._id,
              topicId: topicDoc._id,
              lessonNumber: lessonData.lessonNumber,
              videoUrl: lessonData.videoUrl,
              duration: lessonData.duration,
              objectives: lessonData.objectives,
              order: lessonData.order,
              status: lessonData.status,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true }
        );
        totalLessons++;
      }
    }
  }

  return {
    message: "Abacus syllabus successfully seeded into MongoDB!",
    seeded: true,
    totalLevels,
    totalTopics,
    totalLessons,
  };
}
