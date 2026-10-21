import { createFileRoute } from "@tanstack/react-router";
import { Screen, PageHeader, Card } from "@/components/app/shell";
import { SERVICES } from "@/lib/parcels";

export const Route = createFileRoute("/info")({
  head: () => ({
    meta: [
      { title: "Service Information — Ethiopian Postal Service" },
      { name: "description", content: "Rates, delivery times, FAQs and contact details." },
      { property: "og:title", content: "Service Information" },
      { property: "og:description", content: "Rates, delivery times, FAQs and contact details." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Info,
});

const FAQS = [
  ["Where is my tracking number?", "It's printed on your receipt and sent by SMS. It looks like EP123456789ET."],
  ["Why hasn't my status changed?", "Updates appear when a post office scans the parcel. Some legs take a day or more."],
  ["How do I get notified?", "Sign in, open a parcel and tap “Notify me about status changes”."],
  ["Can I pay in the app?", "No. Bookings are paid at the post office counter on drop-off."],
];

function Info() {
  return (
    <Screen>
      <PageHeader title="Service Information" />
      <main className="space-y-4 px-4 pb-6">
        <p className="rounded-xl bg-highlight/20 p-3 text-xs">Rates and contacts below are illustrative demo values, not official tariffs.</p>
        <Card>
          <h2 id="rates" className="mb-3 scroll-mt-24 font-bold text-primary">Rates (ETB)</h2>
          {SERVICES.map((s) => (
            <div key={s.name} className="flex justify-between border-b py-2 text-sm last:border-0">
              <span>{s.name}</span>
              <span className="font-semibold">{s.base} + {s.perKg}/kg</span>
            </div>
          ))}
        </Card>
        <Card>
          <h2 id="delivery" className="mb-3 scroll-mt-24 font-bold text-primary">Delivery Time</h2>
          {SERVICES.map((s) => (
            <div key={s.name} className="flex justify-between border-b py-2 text-sm last:border-0">
              <span>{s.name}</span>
              <span className="text-right text-muted-foreground">{s.eta}</span>
            </div>
          ))}
        </Card>
        <Card>
          <h2 id="faqs" className="mb-3 scroll-mt-24 font-bold text-primary">FAQs</h2>
          {FAQS.map(([q, a]) => (
            <details key={q} className="border-b py-2 last:border-0">
              <summary className="cursor-pointer text-sm font-semibold">{q}</summary>
              <p className="mt-1 text-sm text-muted-foreground">{a}</p>
            </details>
          ))}
        </Card>
        <Card>
          <h2 id="contact" className="mb-2 scroll-mt-24 font-bold text-primary">Contact Us</h2>
          <p className="text-sm text-muted-foreground">Customer service (demo): +251 11 000 0000</p>
          <p className="text-sm text-muted-foreground">Email (demo): support@example.com</p>
        </Card>
      </main>
    </Screen>
  );
}
