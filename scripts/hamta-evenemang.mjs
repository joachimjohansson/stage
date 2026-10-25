// Hämtar kommande evenemang på Scandinavium från gotevent.se och skriver evenemang.json.
// Körs av GitHub Actions (se .github/workflows/evenemang.yml) eller lokalt: node scripts/hamta-evenemang.mjs
// Got Event saknar CORS-stöd, därför hämtas datan här och inte i besökarens webbläsare.
import { writeFileSync } from "node:fs";
import assert from "node:assert";

const BASE = "https://gotevent.se";
const ARENA_ID = 2063; // Scandinavium, från länken "Se alla kommande evenemang"
const MONTHS = ["januari", "februari", "mars", "april", "maj", "juni", "juli", "augusti", "september", "oktober", "november", "december"];
const DATE_LINE = new RegExp(`^(?:mån|tis|ons|tors|fre|lör|sön) (\\d{1,2}) (${MONTHS.join("|")}) (\\d{1,2}):(\\d{2})$`);

const decode = s => s.replace(/&#(\d+);/g, (_, n) => String.fromCharCode(n)).replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"').replace(/&nbsp;/g, " ");

function textLines(html) {
  return decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, "\n"))
    .split("\n").map(l => l.trim()).filter(Boolean);
}

// Plockar "lör 31 oktober 15:15" (+ ev. matchnamn på nästa rad) under rubriken "Datum" på en evenemangssida.
// Sidan visar inget år: ett datum mer än två månader bakåt räknas som nästa år.
function parseDates(lines, fallbackTitle, today = new Date()) {
  const start = lines.indexOf("Datum");
  if (start < 0) return [];
  const out = [];
  for (let i = start + 1; i < lines.length && !["Arrangör", "Bra att veta", "Hålltider"].includes(lines[i]); i++) {
    const m = lines[i].match(DATE_LINE);
    if (!m) continue;
    const month = MONTHS.indexOf(m[2]);
    let year = today.getFullYear();
    if (month < today.getMonth() - 2) year++;
    const next = lines[i + 1];
    const title = next && next !== "Biljetter" && !DATE_LINE.test(next) ? next : fallbackTitle;
    if (m[3] === "00" && m[4] === "00") continue; // 00:00 = tid ej satt (t.ex. Melodifestivalen)
    const pad = n => String(n).padStart(2, "0");
    out.push({ date: `${year}-${pad(month + 1)}-${pad(m[1])}`, time: `${pad(m[3])}:${m[4]}`, title });
  }
  return out;
}

assert.deepStrictEqual(
  parseDates(["Datum", "lör 31 oktober 15:15", "Frölunda HC - Linköping HC", "Biljetter", "fre 8 januari 19:30", "Biljetter", "Arrangör", "sön 1 mars 12:00"], "Frölunda HC i SHL", new Date(2026, 9, 25)),
  [{ date: "2026-10-31", time: "15:15", title: "Frölunda HC - Linköping HC" }, { date: "2027-01-08", time: "19:30", title: "Frölunda HC i SHL" }]
);

async function get(url, init) {
  const res = await fetch(url, { ...init, headers: { "User-Agent": "stagedoor.se evenemangssynk", ...init?.headers } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

async function main() {
  const list = await (await get(`${BASE}/api/v2/event/GetEventsTeasers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ categories: [], arenas: [ARENA_ID], dates: [], searchWord: "", skip: 0, take: 100 }),
  })).json();
  const teasers = (list.teaserCards?.$values ?? []).filter(t => t.arena === "Scandinavium");
  assert(teasers.length, "inga evenemang i listan – har Got Event ändrat sitt API?");

  const today = new Date();
  const todayStr = today.toLocaleDateString("sv-SE", { timeZone: "Europe/Stockholm" });
  const events = new Map();
  for (const t of teasers) {
    const lines = textLines(await (await get(BASE + t.toPageUrl.url)).text());
    for (const e of parseDates(lines, t.title, today)) if (e.date >= todayStr) events.set(`${e.date} ${e.time} ${e.title}`, e);
  }
  const sorted = [...events.values()].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
  // Tom lista skrivs inte: hellre gamla data än att tidig öppning försvinner av ett tillfälligt fel
  assert(sorted.length, "inga datum hittades på evenemangssidorna");
  writeFileSync(new URL("../evenemang.json", import.meta.url), JSON.stringify({ source: `${BASE}/arenor/scandinavium`, events: sorted }, null, 1) + "\n");
  console.log(`${sorted.length} evenemangstider från ${teasers.length} evenemang`);
}

await main();
