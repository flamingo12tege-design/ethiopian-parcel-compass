import { createFileRoute, Link } from "@tanstack/react-router";
import { ChevronRight } from "lucide-react";
import { Screen, PageHeader, Card } from "@/components/app/shell";
import { ServiceIcon } from "@/components/app/service-icon";

export const Route = createFileRoute("/services")({
  head: () => ({
    meta: [
      { title: "Services — Ethiopian Postal Service" },
      { name: "description", content: "Post offices, price calculator, claims, shipping guide and service information in one place." },
      { property: "og:title", content: "Postal Services" },
      { property: "og:description", content: "Post offices, price calculator, claims, shipping guide and service information in one place." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Services,
});

const ITEMS = [
  { to: "/locator", label: "Post Offices", desc: "Find a branch near you", icon: "office" },
  { to: "/calculator", label: "Price Calculator", desc: "Estimate shipping cost", icon: "calculator" },
  { to: "/claims", label: "Claims", desc: "Lost, damaged or delayed items", icon: "claim" },
  { to: "/guide", label: "Shipping Guide", desc: "What you can send and how", icon: "guide" },
  { to: "/info", label: "Service Info", desc: "Rates, delivery times, FAQs", icon: "info" },
] as const;

function Services() {
  return (
    <Screen>
      <PageHeader title="Services" />
      <div className="p-4">
        <Card className="divide-y p-0">
          {ITEMS.map(({ to, label, desc, icon }) => (
            <Link key={to} to={to} className="flex items-center gap-3 px-4 py-4 active:bg-accent">
              <ServiceIcon kind={icon} />
              <span className="min-w-0 flex-1">
                <span className="block font-bold text-primary">{label}</span>
                <span className="block text-xs text-muted-foreground">{desc}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </Link>
          ))}
        </Card>
      </div>
    </Screen>
  );
}
