import { createFileRoute } from "@tanstack/react-router";
import { Ban, AlertTriangle, FileText, Package, ExternalLink } from "lucide-react";
import { Screen, PageHeader, Card } from "@/components/app/shell";

export const Route = createFileRoute("/guide")({
  head: () => ({
    meta: [
      { title: "Shipping Guide & Prohibited Items — Ethiopian Postal Service" },
      { name: "description", content: "What you can't send, restricted items, packing tips and customs forms for international mail." },
      { property: "og:title", content: "Shipping Guide & Prohibited Items" },
      { property: "og:description", content: "What you can't send, restricted items, packing tips and customs forms for international mail." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Guide,
});

const SECTIONS = [
  { icon: Ban, title: "Never send", items: ["Explosives, fireworks, ammunition and weapons", "Narcotics and illegal drugs", "Cash, coins and bank notes", "Flammable liquids, gases and aerosols", "Live animals and perishable food", "Obscene or immoral material"] },
  { icon: AlertTriangle, title: "Restricted (check first)", items: ["Lithium batteries and devices containing them", "Medicines — urgent medicines and vaccines may be allowed", "Gold, jewellery and precious stones", "Large quantities of samples", "Items that need an import or export permit"] },
  { icon: FileText, title: "International customs", items: ["Every international item needs a customs declaration", "Use CN22 for small items, CN23 for parcels", "List each item, its value and quantity truthfully", "Dutiable goods must follow import/export rules", "Recipients may pay duties on arrival"] },
  { icon: Package, title: "Packing tips", items: ["Use a strong box and fill empty space", "Write full addresses with phone numbers", "Remove old labels from reused boxes", "Keep your receipt until the item is delivered"] },
];

function Guide() {
  return (
    <Screen>
      <PageHeader title="Shipping Guide" />
      <main className="space-y-4 px-4 pb-6">
        {SECTIONS.map(({ icon: Icon, title, items }) => (
          <Card key={title}>
            <h2 className="mb-2 flex items-center gap-2 font-bold text-primary"><Icon className="h-5 w-5" /> {title}</h2>
            <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
              {items.map((i) => <li key={i}>{i}</li>)}
            </ul>
          </Card>
        ))}
        <a href="https://ethio.post/prohibited-items/" target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 text-sm font-semibold text-primary">
          Full official list <ExternalLink className="h-4 w-4" />
        </a>
      </main>
    </Screen>
  );
}
