import { parseRange } from "../../../../lib/practice";
import { CHEAT_SHEET_GROUPS } from "../../../../lib/groups";
import { getMaxLessonNumber } from "../../../../lib/lessons";

export function getStaticPaths() {
  const max = getMaxLessonNumber();
  const ranges: string[] = [];
  for (let i = 1; i <= max; i++) ranges.push(String(i));
  for (const g of CHEAT_SHEET_GROUPS) ranges.push(`${g.start}-${g.end}`);
  ranges.push("11-13");
  return [...new Set(ranges)].map((range) => ({ params: { range } }));
}

export async function GET({ params, url }: { params: { range: string }; url: URL }) {
  const range = params.range!;
  const parsed = parseRange(range);
  if (!parsed) {
    return new Response("invalid range", { status: 404 });
  }

  const base = `${url.origin}${import.meta.env.BASE_URL}`.replace(/\/+$/, "");

  const text = `Spanish Writing Dialogue Mode — Lessons ${range}

Fetch instructions:
${base}/agent/writing/instructions.txt

Fetch lesson context:
${base}/practice/writing/${range}/context.json

Start the conversation immediately.
`;

  return new Response(text, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
