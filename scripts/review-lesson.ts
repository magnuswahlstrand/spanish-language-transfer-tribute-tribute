import * as fs from "node:fs";
import * as path from "node:path";
import * as readline from "node:readline";

const CONTENT_DIR = path.resolve("src/content/lessons");

interface Sentence {
  spanish: string;
  english: string;
  note?: string;
  showInMode?: "all" | "compact";
}

interface LessonData {
  number: number;
  title: string;
  status: string;
  sentences: Sentence[];
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

function rl(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function prompt(question: string): Promise<string> {
  const rli = rl();
  return new Promise((resolve) => {
    rli.question(question, (answer) => {
      rli.close();
      resolve(answer.trim().toLowerCase());
    });
  });
}

async function reviewLesson(number: number, reset: boolean): Promise<void> {
  const filePath = path.join(CONTENT_DIR, `${pad(number)}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`Lesson ${number} not found at ${filePath}`);
    return;
  }

  const raw = fs.readFileSync(filePath, "utf-8");
  const lesson: LessonData = JSON.parse(raw);
  const sentences = lesson.sentences;

  if (sentences.length === 0) {
    console.log(`Lesson ${number}: no sentences to review`);
    return;
  }

  let changed = false;

  for (let i = 0; i < sentences.length; i++) {
    const s = sentences[i];
    if (!reset && s.showInMode !== undefined) {
      continue;
    }

    console.clear();
    console.log(
      `Lesson ${number}: ${lesson.title}\n` +
        `Sentence ${i + 1}/${sentences.length}\n`,
    );
    console.log(`  Spanish: ${s.spanish}`);
    console.log(`  English: ${s.english}`);
    if (s.note) console.log(`  Note: ${s.note}`);
    console.log();

    const mode = await prompt(
      `Show in compact mode? (y = shown everywhere / n = hidden in compact) [Y/n] `,
    );
    s.showInMode = mode === "n" || mode === "no" ? "compact" : "all";

    changed = true;
  }

  if (changed) {
    lesson.sentences = sentences;
    fs.writeFileSync(filePath, JSON.stringify(lesson, null, 2) + "\n", "utf-8");
    console.log(`\nSaved lesson ${number}`);
  } else {
    console.log(`Lesson ${number}: all sentences already reviewed`);
  }
}

async function main() {
  const args = process.argv.slice(2);
  const reset = args.includes("--reset");

  const range = args.find((a) => /^\d+-\d+$/.test(a));
  const single = args.find((a) => /^\d+$/.test(a));

  if (single) {
    await reviewLesson(parseInt(single, 10), reset);
  } else if (range) {
    const [start, end] = range.split("-").map(Number);
    for (let n = start; n <= end; n++) {
      await reviewLesson(n, reset);
    }
  } else {
    console.log("Usage: tsx scripts/review-lesson.ts <number|range> [--reset]");
    console.log("  pnpm review:lesson 5");
    console.log("  pnpm review:lesson 21-30");
    console.log("  pnpm review:lesson 21-30 --reset");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
