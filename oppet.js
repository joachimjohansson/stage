// Öppettider från stagedoor.se: Sön–Tors 16–01, Fre 15–02, Lör 14–02.
// Stängning efter midnatt räknas som timme 25/26 på öppningsdagen.
const STAGE_HOURS = [[16, 25], [16, 25], [16, 25], [16, 25], [16, 25], [15, 26], [14, 26]]; // index = getDay(), 0 = sön

// Tidig öppning vid evenemang på Scandinavium (evenemang.json): dagens första start minus 2 h,
// avrundat nedåt till hel timme, men bara om det blir tidigare än ordinarie öppning och aldrig före 12.
const EARLIEST_EVENT_OPENING = 12;
function stageOpening(date, events = []) {
  const p2 = n => String(n).padStart(2, "0");
  const ds = `${date.getFullYear()}-${p2(date.getMonth() + 1)}-${p2(date.getDate())}`;
  const normal = STAGE_HOURS[date.getDay()][0];
  const ev = events.filter(e => e.date === ds).sort((a, b) => a.time.localeCompare(b.time))[0];
  if (!ev) return { hour: normal };
  const [hh, mm] = ev.time.split(":").map(Number);
  const early = Math.max(EARLIEST_EVENT_OPENING, Math.floor(hh + mm / 60 - 2));
  return early < normal ? { hour: early, event: ev } : { hour: normal };
}

function stageStatus(now = new Date(), events = []) {
  const day = now.getDay();
  const h = now.getHours() + now.getMinutes() / 60;
  const { hour: open, event } = stageOpening(now, events);
  const close = STAGE_HOURS[day][1];
  const yClose = STAGE_HOURS[(day + 6) % 7][1];
  const pad = n => String(n % 24).padStart(2, "0");
  // day = öppningsdagen som gäller just nu; efter midnatt är det fortfarande gårdagens kväll
  if (h < yClose - 24) return { open: true, day: (day + 6) % 7, closes: pad(yClose), minutesLeft: Math.round((yClose - 24 - h) * 60) };
  if (h >= open && h < close) return { open: true, day, event, closes: pad(close), minutesLeft: Math.round((close - h) * 60) };
  if (h < open) return { open: false, day, event, opens: pad(open), when: "i dag" };
  const tomorrow = stageOpening(new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1), events);
  return { open: false, day: (day + 1) % 7, event: tomorrow.event, opens: pad(tomorrow.hour), when: "i morgon" };
}

function stageLeft(min) {
  const t = Math.floor(min / 60), m = min % 60;
  return t ? `${t} h ${m} min` : `${m} min`;
}

// Självtest (2026-10-25 är en söndag)
console.assert(stageStatus(new Date(2026, 9, 25, 15, 0)).opens === "16", "sön före öppning");
console.assert(stageStatus(new Date(2026, 9, 25, 23, 0)).closes === "01", "sön kväll");
console.assert(stageStatus(new Date(2026, 9, 25, 1, 30)).open === true, "natt till sön, lördagens 02");
console.assert(stageStatus(new Date(2026, 9, 31, 2, 0)).open === false, "lör 02 stängt");
console.assert(stageStatus(new Date(2026, 9, 30, 15, 30)).closes === "02", "fre efter 15");
console.assert(stageStatus(new Date(2026, 9, 26, 3, 0)).when === "i dag", "mån natt");
console.assert(stageStatus(new Date(2026, 9, 31, 1, 0)).day === 5, "lör 01 är fredagskväll");
console.assert(stageStatus(new Date(2026, 9, 30, 12, 0)).day === 5, "fre dag");
const testEv = [{ date: "2026-10-31", time: "15:15", title: "Match" }, { date: "2026-10-29", time: "19:30", title: "Konsert" }];
console.assert(stageStatus(new Date(2026, 9, 31, 10, 0), testEv).opens === "13", "lör match 15:15 öppnar 13");
console.assert(stageStatus(new Date(2026, 9, 31, 13, 30), testEv).open === true, "lör 13:30 öppet vid match");
console.assert(stageStatus(new Date(2026, 9, 31, 1, 0), testEv).closes === "02", "natten innan påverkas inte");
console.assert(stageStatus(new Date(2027, 2, 22, 8, 0), [{ date: "2027-03-22", time: "09:00", title: "Morgon" }]).opens === "12", "morgonevenemang öppnar tidigast 12");
console.assert(stageStatus(new Date(2026, 9, 29, 15, 0), testEv).opens === "16" && !stageStatus(new Date(2026, 9, 29, 15, 0), testEv).event, "konsert 19:30 ändrar inget");
