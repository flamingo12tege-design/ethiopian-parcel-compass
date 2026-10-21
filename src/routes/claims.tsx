import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, ExternalLink, Phone } from "lucide-react";
import { Screen, PageHeader, Card } from "@/components/app/shell";

export const Route = createFileRoute("/claims")({
  head: () => ({
    meta: [
      { title: "Lost or Delayed Parcel Claims — Ethio Post" },
      { name: "description", content: "What you need and the steps to file a claim for a lost, damaged or delayed item." },
      { property: "og:title", content: "Lost or Delayed Parcel Claims" },
      { property: "og:description", content: "What you need and the steps to file a claim for a lost, damaged or delayed item." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Claims,
});

const CHECKLIST = [
  "Original mailing receipt from the post office",
  "Tracking number of the item",
  "Sender and recipient names and addresses",
  "Description and value of the contents",
  "Photos, if the item arrived damaged",
];

const STEPS = [
  ["Check tracking first", "Look up your number — many delays clear within a few days."],
  ["Gather your documents", "Have the receipt and details from the checklist ready."],
  ["Visit or call Ethiopost", "Go to the branch where you sent it, or call customer service."],
  ["Register the complaint", "Submit it through the official Ethiopost complaint page or at the counter."],
  ["Follow up", "Keep your claim reference. Compensation depends on the mail class and destination."],
];

function Claims() {
  const [done, setDone] = useState<string[]>([]);
  const toggle = (c: string) => setDone((d) => (d.includes(c) ? d.filter((x) => x !== c) : [...d, c]));
  return (
    <Screen>
      <PageHeader title="Claims" />
      <main className="space-y-4 px-4 pb-6">
        <p className="text-sm text-muted-foreground">
          The sender or the recipient can file a claim. Ethiopost pays compensation for lost items based on the mail class and destination.
        </p>
        <Card>
          <h2 className="mb-2 font-bold text-primary">What you need</h2>
          {CHECKLIST.map((c) => (
            <button key={c} onClick={() => toggle(c)} className="flex w-full items-center gap-3 py-2 text-left text-sm">
              <CheckCircle2 className={`h-5 w-5 shrink-0 ${done.includes(c) ? "text-success" : "text-muted-foreground/40"}`} />
              {c}
            </button>
          ))}
          <p className="mt-2 text-xs text-muted-foreground">{done.length}/{CHECKLIST.length} ready</p>
        </Card>
        <Card>
          <h2 className="mb-3 font-bold text-primary">Steps</h2>
          <ol className="space-y-3">
            {STEPS.map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-highlight text-xs font-bold text-highlight-foreground">{i + 1}</span>
                <span className="text-sm"><b>{t}</b><span className="block text-muted-foreground">{d}</span></span>
              </li>
            ))}
          </ol>
        </Card>
        <Link to="/track" className="flex h-12 items-center justify-center rounded-xl border border-primary/30 text-sm font-semibold text-primary">Check tracking first</Link>
        <a href="https://ethio.post/register-compliant/" target="_blank" rel="noreferrer" className="flex h-12 items-center justify-center gap-2 rounded-xl bg-highlight font-bold text-highlight-foreground">
          Official complaint page <ExternalLink className="h-4 w-4" />
        </a>
        <a href="tel:+251115512999" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          <Phone className="h-4 w-4" /> +251 11 551 2999
        </a>
        <p className="text-center text-[11px] text-muted-foreground">This app is independent and not affiliated with Ethiopost.</p>
      </main>
    </Screen>
  );
}
