import * as fs from "node:fs";
import * as path from "node:path";
import { load as loadHtml } from "cheerio";

const TRIBUTE_BASE = "http://languagetransfertribute.com";
const INDEX_URL = `${TRIBUTE_BASE}/lessons/`;
const CONTENT_DIR = path.resolve("src/content/lessons");
const SOURCE_DIR = path.resolve("sources/html");

interface LessonEntry {
  number: number;
  url: string;
  title: string;
}

interface LessonData {
  number: number;
  title: string;
  status: "draft";
  source: {
    type: "tribute";
    url: string;
    importedAt: string;
  };
  concepts: string[];
  verbs: Array<{ spanish: string; english: string }>;
  keywords: Array<{ spanish: string; english: string }>;
  sentences: Array<{ spanish: string; english: string }>;
}

async function fetchPage(url: string): Promise<string> {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${url}`);
  return res.text();
}

const WORD_MAP: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5,
  six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  eleven: 11, twelve: 12, thirteen: 13, fourteen: 14, fifteen: 15,
  sixteen: 16, seventeen: 17, eighteen: 18, nineteen: 19, twenty: 20,
};

function wordToNumber(word: string): number {
  if (WORD_MAP[word]) return WORD_MAP[word];
  const n = parseInt(word, 10);
  return isNaN(n) ? 0 : n;
}

function parseLessonIndex(html: string): LessonEntry[] {
  const $ = loadHtml(html);
  const entries: LessonEntry[] = [];

  $(".lesson-list a").each((_, el) => {
    const href = $(el).attr("href") || "";
    const text = $(el).text().trim();
    const match = text.match(
      /(?:Lesson\s+)?(One|Two|Three|Four|Five|Six|Seven|Eight|Nine|Ten|Eleven|Twelve|Thirteen|Fourteen|Fifteen|Sixteen|Seventeen|Eighteen|Nineteen|Twenty|1[0-9]|2[0-9]|3[0-9]|4[0-9]|5[0-9]|6[0-8]|[1-9])/i,
    );
    if (!match) return;

    const number = wordToNumber(match[1].toLowerCase());
    if (number === 0 || number > 68) return;

    const url = href.startsWith("//")
      ? `http:${href}`
      : href.startsWith("/")
        ? `${TRIBUTE_BASE}${href}`
        : href;

    entries.push({
      number,
      url,
      title: text.replace(/^Lesson\s+\w+:\s*/i, "").trim(),
    });
  });

  entries.sort((a, b) => a.number - b.number);
  return entries;
}

function parseLessonPage(html: string, entry: LessonEntry): LessonData {
  const $ = loadHtml(html);

  const title = $("h1").first().text().trim() || entry.title;
  const description =
    $("h1").first().nextAll("p").first().text().trim() || "";

  const seen = new Set<string>();
  const sentences: Array<{ spanish: string; english: string }> = [];
  $(".language-table").each((_, table) => {
    $(table)
      .find("tr")
      .each((_, row) => {
        const spanishCell = $(row).find("td.spanish");
        const englishCell = $(row).find("td.english");
        if (spanishCell.length === 0 || englishCell.length === 0) return;

        const spanish =
          spanishCell.find("a").first().text().trim() ||
          spanishCell.text().trim();
        const english = englishCell.text().trim();
        if (!spanish || !english) return;

        const key = `${spanish}|${english}`;
        if (seen.has(key)) return;
        seen.add(key);

        sentences.push({ spanish, english });
      });
  });

  const concepts: string[] = [];
  if (description) concepts.push(description);

  $(".my-tip p, .nice-to-know p").each((_, el) => {
    const text = $(el).text().trim();
    if (text && !concepts.includes(text)) concepts.push(text);
  });

  return {
    number: entry.number,
    title,
    status: "draft",
    source: {
      type: "tribute",
      url: entry.url,
      importedAt: new Date().toISOString().split("T")[0],
    },
    concepts,
    verbs: [],
    keywords: [],
    sentences,
  };
}

function saveSourceHtml(number: number, html: string): void {
  const filePath = path.join(
    SOURCE_DIR,
    `lesson-${String(number).padStart(2, "0")}.html`,
  );
  fs.writeFileSync(filePath, html, "utf-8");
}

async function exportLesson(data: LessonData): Promise<boolean> {
  const filePath = path.join(
    CONTENT_DIR,
    `${String(data.number).padStart(2, "0")}.json`,
  );
  if (fs.existsSync(filePath)) {
    const existing = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    if (existing.status === "reviewed") {
      return false;
    }
  }
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
  return true;
}

function pad(n: number): string {
  return String(n).padStart(2, "0");
}

async function main() {
  const args = process.argv.slice(2);
  const range = args.find((a) => /^\d+-\d+$/.test(a));
  const singleLesson = args.find((a) => /^\d+$/.test(a));
  const singleFile = args.find(
    (a) => a.endsWith(".html") && !a.startsWith("--"),
  );

  if (singleFile) {
    const html = fs.readFileSync(singleFile, "utf-8");
    const fileName = path.basename(singleFile);
    const numMatch = fileName.match(/(\d+)/);
    if (!numMatch) {
      console.error("Could not determine lesson number from filename");
      process.exit(1);
    }
    const number = parseInt(numMatch[1], 10);
    const entry: LessonEntry = {
      number,
      url: `${TRIBUTE_BASE}/lessons/${number}/`,
      title: "",
    };
    const data = parseLessonPage(html, entry);
    const wrote = await exportLesson(data);
    console.log(wrote ? `  wrote lesson ${number}` : `  SKIP lesson ${number} (reviewed)`);
    return;
  }

  console.log("Fetching lesson index...");
  const indexHtml = await fetchPage(INDEX_URL);
  fs.writeFileSync(path.join(SOURCE_DIR, "index.html"), indexHtml, "utf-8");
  console.log("  saved sources/html/index.html");

  const allEntries = parseLessonIndex(indexHtml);
  console.log(`Found ${allEntries.length} lessons\n`);

  let entries = allEntries;
  if (range) {
    const [start, end] = range.split("-").map(Number);
    entries = allEntries.filter((e) => e.number >= start && e.number <= end);
    console.log(`Importing lessons ${start}–${end} (${entries.length} lessons)\n`);
  } else if (singleLesson) {
    const n = parseInt(singleLesson, 10);
    entries = allEntries.filter((e) => e.number === n);
    if (entries.length === 0) {
      console.error(`Lesson ${n} not found in index`);
      process.exit(1);
    }
  }

  for (const entry of entries) {
    process.stdout.write(`Lesson ${pad(entry.number)}: ${entry.title} ... `);
    try {
      const html = await fetchPage(entry.url);
      saveSourceHtml(entry.number, html);
      const data = parseLessonPage(html, entry);
      const wrote = await exportLesson(data);
      console.log(wrote ? `OK (${data.sentences.length} sentences)` : `SKIP (reviewed)`);
    } catch (err) {
      console.log(`FAIL: ${err}`);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
