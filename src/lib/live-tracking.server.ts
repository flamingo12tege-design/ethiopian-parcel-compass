// Live lookup against Ethiopian Post's official tracking site, with the
// Cainiao international lookup as a fallback (ported from the Telegram bot).
export type LiveEvent = { date: string; event: string; location: string; time: string };
export type LiveResult = {
  source: "ethiopost" | "cainiao";
  trackingNumber: string;
  origin: string | null;
  destination: string | null;
  status: string | null;
  events: LiveEvent[];
};

const DOMESTIC_URL = "https://domestictrack.ethio.post/PostGlobal/WebTrack/Track.aspx";
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const MONTHS = /January|February|March|April|May|June|July|August|September|October|November|December/;

function decode(s: string) {
  return s
    .replace(/<br\s*\/?>/gi, " ")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function hidden(html: string, name: string) {
  const m = html.match(new RegExp(`name="${name}"[^>]*value="([^"]*)"`)) ?? html.match(new RegExp(`value="([^"]*)"[^>]*name="${name}"`));
  return m?.[1];
}

function cleanEvent(t: string) {
  return t.replace(/(\d{2}:\d{2})\s+at\s+\1/g, "$1").replace(/from\s+(\d{2}:\d{2})\s+at\s+\1/g, "from $1").trim();
}

export function parseDomesticHtml(html: string, tn: string): LiveResult | null {
  const start = html.indexOf('id="divDisplayTrackResult"');
  if (start < 0) return null;
  const section = html.slice(start);
  const rows = [...section.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)].map((r) =>
    [...(r[1] ?? "").matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((c) => decode(c[1] ?? "")),
  );
  let origin: string | null = null;
  let destination: string | null = null;
  let inEvents = false;
  let date = "";
  const events: LiveEvent[] = [];
  for (const raw of rows) {
    if (!raw.length) continue;
    const cells = raw.map((c) => c ?? "");
    const first = cells[0] ?? "";
    if (cells.length >= 2 && first === "Origin" && cells[1]) origin = cells[1];
    if (cells.length >= 2 && first === "Destination" && cells[1]) destination = cells[1];
    if (first.includes("Item Events")) { inEvents = true; continue; }
    if (!inEvents) continue;
    // Date header rows look like ["Tuesday, December 3, 2024", "Location", "Time"].
    if (first && MONTHS.test(first) && /\d{4}/.test(first) && (cells.length === 1 || cells.slice(1).every((c) => !c || c === "Location" || c === "Time"))) { date = first; continue; }
    if (date && cells.length >= 2 && first.length > 3 && !["Location", "Time", "Event"].includes(first)) {
      events.push({
        date,
        event: cleanEvent(first),
        location: cells.length >= 3 ? cells[1] ?? "" : "",
        time: (cells.length >= 3 ? cells[2] : cells[1]) ?? "",
      });
    }
  }
  if (!events.length) return null;
  events.reverse(); // newest first
  return { source: "ethiopost", trackingNumber: tn, origin, destination, status: events[0]?.event ?? null, events };
}

async function fetchDomestic(tn: string): Promise<LiveResult | null> {
  const first = await fetch(DOMESTIC_URL, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
  if (!first.ok) return null;
  const html = await first.text();
  const vs = hidden(html, "__VIEWSTATE");
  const vsg = hidden(html, "__VIEWSTATEGENERATOR");
  const ev = hidden(html, "__EVENTVALIDATION");
  if (!vs || !vsg || !ev) return null;
  const cookie = (first.headers.getSetCookie?.() ?? [])
    .map((c) => c.split(";")[0])
    .join("; ");
  const body = new URLSearchParams({
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __VIEWSTATE: vs,
    __VIEWSTATEGENERATOR: vsg,
    __EVENTVALIDATION: ev,
    txtID: tn,
    "ImgBtnTrack.x": "0",
    "ImgBtnTrack.y": "0",
  });
  const res = await fetch(DOMESTIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": UA,
      Referer: DOMESTIC_URL,
      ...(cookie ? { Cookie: cookie } : {}),
    },
    body,
    signal: AbortSignal.timeout(12000),
  });
  if (!res.ok) return null;
  return parseDomesticHtml(await res.text(), tn);
}

async function fetchCainiao(tn: string): Promise<LiveResult | null> {
  const res = await fetch(
    `https://global.cainiao.com/global/detail.json?mailNos=${encodeURIComponent(tn)}&lang=en-US`,
    { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as { success?: boolean; module?: any[] };
  const m = data.success ? data.module?.[0] : undefined;
  const list: any[] = m?.detailList ?? [];
  if (!m || !list.length) return null;
  return {
    source: "cainiao",
    trackingNumber: tn,
    origin: m.originCountry ?? null,
    destination: m.destCountry ?? null,
    status: m.statusDesc ?? null,
    events: list.map((e) => {
      const [d, t = ""] = String(e.timeStr ?? "").split(" ");
      return { date: d ?? "", time: t.split(":").slice(0, 2).join(":"), event: e.standerdDesc || e.desc || "", location: "" };
    }),
  };
}

export async function liveLookup(tn: string): Promise<LiveResult | null> {
  // Ethiopian Post also tracks inbound international items (RR…AE, RQ…MY), so always try it first.
  if (/^[A-Z]{2}\d{9}[A-Z]{2}$/.test(tn)) {
    try {
      const r = await fetchDomestic(tn);
      if (r) return r;
    } catch (e) {
      console.error("Ethiopost lookup failed", e);
    }
  }
  try {
    return await fetchCainiao(tn);
  } catch (e) {
    console.error("Cainiao lookup failed", e);
    return null;
  }
}
