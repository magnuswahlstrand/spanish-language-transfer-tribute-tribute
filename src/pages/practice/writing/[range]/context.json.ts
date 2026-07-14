import { getAgentContext, parseRange } from "../../../../lib/practice";
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

export async function GET({ params }: { params: { range: string } }) {
  const range = params.range!;
  const parsed = parseRange(range);
  if (!parsed) {
    return new Response(JSON.stringify({ error: "invalid range" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const numbers: number[] = [];
  for (let i = parsed.start; i <= parsed.end; i++) numbers.push(i);

  const context = getAgentContext(numbers);

  return new Response(JSON.stringify(context, null, 2), {
    headers: { "Content-Type": "application/json" },
  });
}
