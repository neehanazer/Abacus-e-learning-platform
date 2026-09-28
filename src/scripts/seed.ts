import fs from "fs";
import path from "path";

// Load .env.local if present
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf-8");
    for (const line of envContent.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [k, ...v] = trimmed.split("=");
        if (k && v.length > 0) {
          process.env[k.trim()] = v.join("=").trim();
        }
      }
    }
  }
} catch {
  // ignore
}

import { seedSyllabusData } from "../lib/seedData";

async function run() {
  console.log("Seeding Abacus syllabus, levels, topics, and lessons into MongoDB...");
  const isForce = process.argv.includes("--force");
  const result = await seedSyllabusData(isForce);
  console.log("Seed result:", result);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
