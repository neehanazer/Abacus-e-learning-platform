/**
 * Pure Soroban Bead Mechanics & Question Generator for Small Friend and Big Friend Rules.
 *
 * Implements authentic Japanese Soroban bead manipulation rules:
 * - 1 Upper Bead (Heaven deck, value 5)
 * - 4 Lower Beads (Earth deck, value 1)
 *
 * Guarantees:
 * - Exactly ONE target rule event per question.
 * - Every single other step is 100% direct (no formulas, no borrows, no carries).
 * - Rigorous bead state validation (running totals always valid non-negative abacus states).
 * - Zero combined rules.
 */

import { PracticeQuestion, QuestionType, RuleType } from "@/data/practiceData";

export type RuleCategory = "sf" | "bf";
export type RuleSign = "+" | "-";
export type RuleAction = "direct" | "sf_add" | "sf_sub" | "bf_add" | "bf_sub" | null;

export interface GeneratedRawQuestion {
  nums: number[];
  ops: ("+" | "-")[];
  ans: number;
}

export interface RuleSpec {
  cat: RuleCategory;
  sign: RuleSign;
  d: number;
  name: string;
  optionId: string;
  formula: string;
}

// ---------- Soroban Bead Mechanics ----------

export function colAddOk(v: number, d: number): boolean {
  const u = Math.floor(v / 5);
  const l = v % 5;
  if (d >= 5 && u === 1) return false;
  if (d % 5 && l + (d % 5) > 4) return false;
  return true;
}

export function colSubOk(v: number, d: number): boolean {
  const u = Math.floor(v / 5);
  const l = v % 5;
  if (d >= 5 && u === 0) return false;
  if (d % 5 && l < (d % 5)) return false;
  return true;
}

export function classifyAdd(c: number, d: number): RuleAction {
  if (c + d <= 9 && colAddOk(c, d)) return "direct";
  if (c + d <= 9) return "sf_add";
  if (colSubOk(c, 10 - d)) return "bf_add";
  return null;
}

export function classifySub(c: number, d: number): RuleAction {
  if (c >= d && colSubOk(c, d)) return "direct";
  if (c >= d) return "sf_sub";
  if (colAddOk(c, 10 - d)) return "bf_sub";
  return null;
}

export function applyDigit(st: number[], i: number, op: "+" | "-", d: number): RuleAction {
  const c = st[i];
  if (op === "+") {
    const k = classifyAdd(c, d);
    if (k === "bf_add") {
      st[i] = c - (10 - d);
      if (i + 1 === st.length) st.push(0);
      st[i + 1] += 1;
    } else {
      st[i] = c + d;
    }
    return k;
  } else {
    const k = classifySub(c, d);
    if (k === "bf_sub") {
      st[i] = c + 10 - d;
      st[i + 1] -= 1;
    } else {
      st[i] = c - d;
    }
    return k;
  }
}

export function carryOk(st: number[], i: number): boolean {
  const t = i < st.length ? st[i] : 0;
  return t + 1 <= 9 && colAddOk(t, 1);
}

export function borrowOk(st: number[], i: number): boolean {
  return i < st.length && st[i] >= 1 && colSubOk(st[i], 1);
}

// ---------- Deterministic Seeded PRNG ----------
export class SeededRandom {
  private s: number;

  constructor(seed: number = 1000) {
    this.s = seed | 0;
  }

  random(): number {
    this.s = (this.s + 0x6d2b79f5) | 0;
    let t = Math.imul(this.s ^ (this.s >>> 15), 1 | this.s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  choice<T>(arr: T[] | string): T {
    const idx = Math.floor(this.random() * arr.length);
    return arr[idx] as T;
  }

  randrange(n: number): number {
    return Math.floor(this.random() * n);
  }

  randint(a: number, b: number): number {
    return Math.floor(this.random() * (b - a + 1)) + a;
  }
}

// ---------- Question Generator (Exactly ONE rule event) ----------
export function genQuestion(
  cat: RuleCategory,
  sign: RuleSign,
  d: number,
  ndig: number,
  rows: number,
  rng: SeededRandom
): GeneratedRawQuestion {
  const want = `${cat === "sf" ? "sf" : "bf"}_${sign === "+" ? "add" : "sub"}`;
  for (let attempt = 0; attempt < 20000; attempt++) {
    const ops: ("+" | "-")[] = [];
    for (let r = 0; r < rows - 1; r++) {
      ops.push(rng.choice(["+", "-"]));
    }
    if (!ops.includes("+") || !ops.includes("-")) continue;
    const pos = rng.randrange(rows - 1);
    ops[pos] = sign;
    if (!ops.includes("+") || !ops.includes("-")) continue;

    const col = ndig === 1 || cat === "bf" ? 0 : rng.choice([0, 1]);
    const nums: number[] = new Array(rows).fill(0);
    const st: number[] = [0, 0];
    let ok = true;

    for (let i = 0; i < rows; i++) {
      if (i === 0) {
        if (ndig === 1) {
          nums[i] = rng.randint(1, 9);
          st[0] = nums[i];
        } else {
          const t = rng.randint(1, 9);
          const o = rng.randint(0, 9);
          nums[i] = 10 * t + o;
          st[0] = o;
          st[1] = t;
        }
        continue;
      }

      const op = ops[i - 1];
      if (i - 1 === pos) {
        // THE target rule step
        if (ndig === 1) {
          const k = op === "+" ? classifyAdd(st[0], d) : classifySub(st[0], d);
          if (k !== want) { ok = false; break; }
          if (k === "bf_add" && !carryOk(st, 1)) { ok = false; break; }
          if (k === "bf_sub" && !borrowOk(st, 1)) { ok = false; break; }
          applyDigit(st, 0, op, d);
          nums[i] = d;
        } else if (cat === "bf" && sign === "-") {
          const k = classifySub(st[0], d);
          if (k !== "bf_sub" || !borrowOk(st, 1)) { ok = false; break; }
          applyDigit(st, 0, op, d);
          nums[i] = d;
        } else {
          const o = col === 0 ? d : rng.randint(0, 9);
          const t = col === 0 ? rng.randint(1, 9) : d;
          nums[i] = 10 * t + o;
          const ko = op === "+" ? classifyAdd(st[0], o) : classifySub(st[0], o);
          const kt = op === "+" ? classifyAdd(st[1], t) : classifySub(st[1], t);
          if (ko === null || kt === null) { ok = false; break; }
          const nonDirect = [ko, kt].filter((k) => k !== "direct");
          if (nonDirect.length !== 1) { ok = false; break; }
          if ((col === 0 && ko !== want) || (col === 1 && kt !== want)) { ok = false; break; }
          if (ko === "bf_add" && !carryOk(st, 1)) { ok = false; break; }
          if (ko === "bf_sub" && !borrowOk(st, 1)) { ok = false; break; }
          if (kt === "bf_add" && !carryOk(st, 2)) { ok = false; break; }
          if (kt === "bf_sub" && !borrowOk(st, 2)) { ok = false; break; }
          applyDigit(st, 0, op, o);
          applyDigit(st, 1, op, t);
        }
      } else {
        // Every other step: strictly direct bead movements
        if (ndig === 1 || (cat === "bf" && sign === "-")) {
          const n = rng.randint(1, 9);
          const k = op === "+" ? classifyAdd(st[0], n) : classifySub(st[0], n);
          if (k !== "direct") { ok = false; break; }
          applyDigit(st, 0, op, n);
          nums[i] = n;
        } else {
          const t = rng.randint(1, 9);
          const o = rng.randint(0, 9);
          const ko = op === "+" ? classifyAdd(st[0], o) : classifySub(st[0], o);
          const kt = op === "+" ? classifyAdd(st[1], t) : classifySub(st[1], t);
          if (ko !== "direct" || kt !== "direct") { ok = false; break; }
          applyDigit(st, 0, op, o);
          applyDigit(st, 1, op, t);
          nums[i] = 10 * t + o;
        }
      }
    }

    if (!ok) continue;
    // Disallow identical consecutive operands for variety
    let duplicate = false;
    for (let j = 0; j < rows - 1; j++) {
      if (nums[j] === nums[j + 1]) { duplicate = true; break; }
    }
    if (duplicate) continue;

    const ans = st.reduce((acc, v, p) => acc + v * Math.pow(10, p), 0);
    if (ans >= 0) return { nums, ops, ans };
  }

  throw new Error(`Exhausted generator for ${cat}${sign}${d}`);
}

// ---------- Independent Verification ----------
export function verifyQuestion(q: GeneratedRawQuestion, cat: RuleCategory, sign: RuleSign): boolean {
  const want = `${cat === "sf" ? "sf" : "bf"}_${sign === "+" ? "add" : "sub"}`;
  const st: number[] = [q.nums[0] % 10, Math.floor(q.nums[0] / 10)];
  const events: string[] = [];

  for (let i = 0; i < q.ops.length; i++) {
    const op = q.ops[i];
    const n = q.nums[i + 1];
    const cols = n < 10 ? [n % 10] : [n % 10, Math.floor(n / 10)];

    for (let idx = 0; idx < cols.length; idx++) {
      const dd = cols[idx];
      const k = op === "+" ? classifyAdd(st[idx], dd) : classifySub(st[idx], dd);
      if (k === "bf_add" && !carryOk(st, idx + 1)) return false;
      if (k === "bf_sub" && !borrowOk(st, idx + 1)) return false;
      if (k && k !== "direct") events.push(k);
      applyDigit(st, idx, op, dd);
    }
    if (st.some((v) => v < 0)) return false;
  }

  let running = q.nums[0];
  for (let i = 0; i < q.ops.length; i++) {
    if (q.ops[i] === "+") running += q.nums[i + 1];
    else running -= q.nums[i + 1];
  }

  return events.length === 1 && events[0] === want && running === q.ans;
}

// ---------- Rule Specifications Definition (All 26 Rules) ----------
export const ALL_RULE_SPECS: RuleSpec[] = [
  // Small Friends Addition (+4, +3, +2, +1)
  { cat: "sf", sign: "+", d: 4, name: "Small Friend (+4)", optionId: "small-friend-plus-4", formula: "+4 = +5 - 1" },
  { cat: "sf", sign: "+", d: 3, name: "Small Friend (+3)", optionId: "small-friend-plus-3", formula: "+3 = +5 - 2" },
  { cat: "sf", sign: "+", d: 2, name: "Small Friend (+2)", optionId: "small-friend-plus-2", formula: "+2 = +5 - 3" },
  { cat: "sf", sign: "+", d: 1, name: "Small Friend (+1)", optionId: "small-friend-plus-1", formula: "+1 = +5 - 4" },
  // Small Friends Subtraction (-4, -3, -2, -1)
  { cat: "sf", sign: "-", d: 4, name: "Small Friend (-4)", optionId: "small-friend-minus-4", formula: "-4 = -5 + 1" },
  { cat: "sf", sign: "-", d: 3, name: "Small Friend (-3)", optionId: "small-friend-minus-3", formula: "-3 = -5 + 2" },
  { cat: "sf", sign: "-", d: 2, name: "Small Friend (-2)", optionId: "small-friend-minus-2", formula: "-2 = -5 + 3" },
  { cat: "sf", sign: "-", d: 1, name: "Small Friend (-1)", optionId: "small-friend-minus-1", formula: "-1 = -5 + 4" },
  // Big Friends Addition (+9 to +1)
  { cat: "bf", sign: "+", d: 9, name: "Big Friend (+9)", optionId: "big-friend-plus-9", formula: "+9 = -1 + 10" },
  { cat: "bf", sign: "+", d: 8, name: "Big Friend (+8)", optionId: "big-friend-plus-8", formula: "+8 = -2 + 10" },
  { cat: "bf", sign: "+", d: 7, name: "Big Friend (+7)", optionId: "big-friend-plus-7", formula: "+7 = -3 + 10" },
  { cat: "bf", sign: "+", d: 6, name: "Big Friend (+6)", optionId: "big-friend-plus-6", formula: "+6 = -4 + 10" },
  { cat: "bf", sign: "+", d: 5, name: "Big Friend (+5)", optionId: "big-friend-plus-5", formula: "+5 = -5 + 10" },
  { cat: "bf", sign: "+", d: 4, name: "Big Friend (+4)", optionId: "big-friend-plus-4", formula: "+4 = -6 + 10" },
  { cat: "bf", sign: "+", d: 3, name: "Big Friend (+3)", optionId: "big-friend-plus-3", formula: "+3 = -7 + 10" },
  { cat: "bf", sign: "+", d: 2, name: "Big Friend (+2)", optionId: "big-friend-plus-2", formula: "+2 = -8 + 10" },
  { cat: "bf", sign: "+", d: 1, name: "Big Friend (+1)", optionId: "big-friend-plus-1", formula: "+1 = -9 + 10" },
  // Big Friends Subtraction (-9 to -1)
  { cat: "bf", sign: "-", d: 9, name: "Big Friend (-9)", optionId: "big-friend-minus-9", formula: "-9 = -10 + 1" },
  { cat: "bf", sign: "-", d: 8, name: "Big Friend (-8)", optionId: "big-friend-minus-8", formula: "-8 = -10 + 2" },
  { cat: "bf", sign: "-", d: 7, name: "Big Friend (-7)", optionId: "big-friend-minus-7", formula: "-7 = -10 + 3" },
  { cat: "bf", sign: "-", d: 6, name: "Big Friend (-6)", optionId: "big-friend-minus-6", formula: "-6 = -10 + 4" },
  { cat: "bf", sign: "-", d: 5, name: "Big Friend (-5)", optionId: "big-friend-minus-5", formula: "-5 = -10 + 5" },
  { cat: "bf", sign: "-", d: 4, name: "Big Friend (-4)", optionId: "big-friend-minus-4", formula: "-4 = -10 + 6" },
  { cat: "bf", sign: "-", d: 3, name: "Big Friend (-3)", optionId: "big-friend-minus-3", formula: "-3 = -10 + 7" },
  { cat: "bf", sign: "-", d: 2, name: "Big Friend (-2)", optionId: "big-friend-minus-2", formula: "-2 = -10 + 8" },
  { cat: "bf", sign: "-", d: 1, name: "Big Friend (-1)", optionId: "big-friend-minus-1", formula: "-1 = -10 + 9" },
];

export function buildRuleSet(spec: RuleSpec, seed: number = 1000): GeneratedRawQuestion[] {
  const rng = new SeededRandom(seed);
  let formats: [number, number][];

  if (spec.cat === "bf" && spec.sign === "-" && spec.d === 1) {
    formats = new Array(30).fill([2, 5]);
  } else if (spec.cat === "bf" && spec.sign === "-") {
    formats = [...new Array(15).fill([2, 3]), ...new Array(15).fill([2, 5])];
  } else if (spec.cat === "bf" && spec.sign === "+" && spec.d === 1) {
    formats = new Array(30).fill([1, 5]);
  } else {
    formats = [...new Array(15).fill([1, 3]), ...new Array(15).fill([1, 5])];
  }

  const qs: GeneratedRawQuestion[] = [];
  const seen = new Set<string>();
  let stall = 0;

  for (let slot = 0; slot < 30; slot++) {
    while (true) {
      let q: GeneratedRawQuestion;
      try {
        q = genQuestion(spec.cat, spec.sign, spec.d, formats[slot][0], formats[slot][1], rng);
      } catch {
        continue;
      }
      const key = `${q.nums.join(",")}|${q.ops.join(",")}`;
      if (seen.has(key)) {
        stall++;
        if (stall < 2000) continue;
      } else {
        stall = 0;
        seen.add(key);
      }
      if (!verifyQuestion(q, spec.cat, spec.sign)) continue;
      qs.push(q);
      break;
    }
  }

  return qs;
}

// Convert GeneratedRawQuestion to the app's standard PracticeQuestion
export function rawToPracticeQuestion(
  q: GeneratedRawQuestion,
  spec: RuleSpec,
  index: number
): PracticeQuestion {
  const signedNumbers: number[] = [
    q.nums[0],
    ...q.nums.slice(1).map((n, i) => (q.ops[i] === "+" ? n : -n)),
  ];

  const ruleType: RuleType = spec.cat === "sf" ? "small-friend" : "big-friend";
  const digits: 1 | 2 = signedNumbers.some((n) => Math.abs(n) >= 10) ? 2 : 1;
  const targetAnswer = q.ans;

  const optionsSet = new Set<number>([targetAnswer]);
  for (const delta of [-2, 2, -1, 1, -5, 5, -10, 10]) {
    const candidate = targetAnswer + delta;
    if (candidate >= 0 && candidate !== targetAnswer) optionsSet.add(candidate);
    if (optionsSet.size === 4) break;
  }
  let extra = 1;
  while (optionsSet.size < 4) {
    optionsSet.add(Math.max(0, targetAnswer + extra++));
  }

  const formulaStr = signedNumbers
    .map((n, i) => (i === 0 ? String(n) : n < 0 ? `- ${Math.abs(n)}` : `+ ${n}`))
    .join(" ");

  const sectionLabel = index <= 15 ? "Section A (3-Row)" : "Section B (5-Row)";

  return {
    id: `rule-${spec.optionId}-${index}`,
    level: 1,
    title: `${spec.name} (Q${index})`,
    category: spec.name,
    categoryId: spec.optionId,
    ruleType,
    digits,
    rowCount: signedNumbers.length,
    numbers: signedNumbers,
    targetAnswer,
    questionType: "vertical-calc" as QuestionType,
    options: Array.from(optionsSet).sort(() => Math.random() - 0.5),
    ruleHint: `${spec.name}: ${spec.formula}`,
    explanation: `Formula ${spec.formula} applied at target step. Calculation: ${formulaStr} = ${targetAnswer}.`,
  };
}

// Pre-generated Cache of All 26 Rule Sets (780 questions total)
let cachedRuleQuestions: Record<string, PracticeQuestion[]> | null = null;

export function getAllRuleQuestions(): Record<string, PracticeQuestion[]> {
  if (cachedRuleQuestions) return cachedRuleQuestions;

  const result: Record<string, PracticeQuestion[]> = {};
  for (let i = 0; i < ALL_RULE_SPECS.length; i++) {
    const spec = ALL_RULE_SPECS[i];
    const rawSet = buildRuleSet(spec, 1000 + i);
    result[spec.optionId] = rawSet.map((q, idx) => rawToPracticeQuestion(q, spec, idx + 1));
  }

  cachedRuleQuestions = result;
  return result;
}

export function getQuestionsForRule(optionId: string): PracticeQuestion[] | null {
  const all = getAllRuleQuestions();
  return all[optionId] || null;
}

export function exportRuleQuestionsToJson(): Record<string, { question: string; answer: number }[]> {
  const result: Record<string, { question: string; answer: number }[]> = {};
  for (let i = 0; i < ALL_RULE_SPECS.length; i++) {
    const spec = ALL_RULE_SPECS[i];
    const rawSet = buildRuleSet(spec, 1000 + i);
    result[spec.name] = rawSet.map((q) => {
      const expr = String(q.nums[0]) + q.ops.map((o, idx) => ` ${o} ${q.nums[idx + 1]}`).join("");
      return { question: expr, answer: q.ans };
    });
  }
  return result;
}

export function exportRuleQuestionsToCsv(): string {
  const json = exportRuleQuestionsToJson();
  const rows = ["rule,question,answer"];
  for (const [ruleName, questions] of Object.entries(json)) {
    for (const q of questions) {
      rows.push(`"${ruleName}","${q.question}",${q.answer}`);
    }
  }
  return rows.join("\n");
}
