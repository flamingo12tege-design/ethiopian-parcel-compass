import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Check, ChevronsUpDown, ExternalLink } from "lucide-react";
import { Screen, PageHeader, Card } from "@/components/app/shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandItem,
} from "@/components/ui/command";
import {
  DESTINATIONS,
  MIN_WEIGHT,
  MAX_WEIGHT,
  WEIGHT_STEP,
  domesticPostage,
  isSupportedWeight,
  type ShipmentMethod,
} from "@/lib/postage";

export const Route = createFileRoute("/calculator")({
  head: () => ({
    meta: [
      { title: "Ethiopia Price Calculator — Postal Tracking" },
      {
        name: "description",
        content: "Check confirmed Ethiopia Parcel and EMS postage charges by shipment weight.",
      },
      { property: "og:title", content: "Ethiopia Price Calculator — Postal Tracking" },
      {
        property: "og:description",
        content: "Check confirmed Ethiopia Parcel and EMS postage charges by shipment weight.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Calculator,
});

function Calculator() {
  const [method, setMethod] = useState<ShipmentMethod>("Parcel");
  const [country, setCountry] = useState("Ethiopia");
  const [countryOpen, setCountryOpen] = useState(false);
  const [weightInput, setWeightInput] = useState("0.5");
  const weight = Number(weightInput);
  const validWeight = isSupportedWeight(weight);
  const fee = domesticPostage(method, country, weight);
  const chooseWeight = (value: number) => setWeightInput(String(value));

  return (
    <Screen>
      <PageHeader title="Price Calculator" />
      <main className="space-y-4 px-4 pb-6">
        <Card className="space-y-4">
          <div>
            <p id="method-label" className="mb-2 text-sm font-semibold">
              Shipment Method
            </p>
            <div role="group" aria-labelledby="method-label" className="grid grid-cols-2 gap-2">
              {(["Parcel", "EMS"] as const).map((value) => (
                <Button
                  key={value}
                  variant={method === value ? "default" : "outline"}
                  aria-pressed={method === value}
                  onClick={() => setMethod(value)}
                  className="h-11"
                >
                  {value}
                </Button>
              ))}
            </div>
          </div>
          <div>
            <p id="country-label" className="mb-2 text-sm font-semibold">
              Shipment Country
            </p>
            <Popover open={countryOpen} onOpenChange={setCountryOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-labelledby="country-label"
                  aria-expanded={countryOpen}
                  className="h-11 w-full justify-between"
                >
                  <span className="truncate">{country}</span>
                  <ChevronsUpDown className="shrink-0 text-muted-foreground" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-[var(--radix-popover-trigger-width)] p-0">
                <Command>
                  <CommandInput placeholder="Search country…" />
                  <CommandList className="max-h-52">
                    <CommandEmpty>No country found.</CommandEmpty>
                    {DESTINATIONS.map((destination) => (
                      <CommandItem
                        key={destination}
                        value={destination}
                        onSelect={() => {
                          setCountry(destination);
                          setCountryOpen(false);
                        }}
                      >
                        <span className="flex-1">{destination}</span>
                        {country === destination && <Check />}
                      </CommandItem>
                    ))}
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
          <div className="space-y-3">
            <label htmlFor="shipment-weight" className="block text-sm font-semibold">
              Weight (KG)
            </label>
            <Slider
              aria-label="Shipment weight"
              min={MIN_WEIGHT}
              max={MAX_WEIGHT}
              step={WEIGHT_STEP}
              value={[validWeight ? weight : MIN_WEIGHT]}
              onValueChange={([value]) => {
                if (value !== undefined) chooseWeight(value);
              }}
              className="py-2"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0.5 kg</span>
              <span>31.5 kg</span>
            </div>
            <Input
              id="shipment-weight"
              type="number"
              inputMode="decimal"
              min={MIN_WEIGHT}
              max={MAX_WEIGHT}
              step={WEIGHT_STEP}
              value={weightInput}
              onChange={(e) => setWeightInput(e.target.value)}
              aria-invalid={!validWeight}
              aria-describedby={!validWeight ? "weight-error" : undefined}
              className="h-11"
            />
            <div className="grid grid-cols-4 gap-2">
              {[0.5, 1, 1.5, 2].map((value) => (
                <Button
                  key={value}
                  size="sm"
                  variant={weight === value ? "secondary" : "outline"}
                  aria-pressed={weight === value}
                  onClick={() => chooseWeight(value)}
                >
                  {value} kg
                </Button>
              ))}
            </div>
            {!validWeight && (
              <p id="weight-error" className="text-xs text-destructive">
                Enter 0.5–31.5 kg in 0.5 kg steps.
              </p>
            )}
          </div>
        </Card>
        <section aria-labelledby="summary-title" aria-live="polite" className="border-y py-4">
          <h2 id="summary-title" className="mb-3 text-base font-bold text-primary">
            Shipment Charges Summary
          </h2>
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Shipment Method</dt>
              <dd className="font-semibold">{method.toUpperCase()}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="shrink-0 text-muted-foreground">Country</dt>
              <dd className="text-right font-semibold">{country}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-muted-foreground">Weight (KG)</dt>
              <dd className="font-semibold">{validWeight ? weight.toFixed(1) : "—"}</dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 border-t pt-3">
              <dt className="text-muted-foreground">Charges (ETB)</dt>
              <dd className="text-2xl font-bold text-primary">
                {fee === null ? "—" : fee.toLocaleString()}
              </dd>
            </div>
          </dl>
          {country !== "Ethiopia" ? (
            <p className="mt-3 text-xs text-muted-foreground">
              International prices are not calculated in this app.
            </p>
          ) : validWeight && fee === null ? (
            <p className="mt-3 text-xs text-muted-foreground">
              No confirmed rate for this weight. Please check with Ethiopost.
            </p>
          ) : null}
        </section>
        <p className="text-xs text-muted-foreground">
          Based on supplied Ethiopost rate examples. Confirm current charges with Ethiopost.
        </p>
        <a
          href="https://ethio.post/price-calculator/"
          target="_blank"
          rel="noreferrer"
          className="flex items-center justify-center gap-2 text-sm font-semibold text-primary"
        >
          Official Ethiopost calculator <ExternalLink className="h-4 w-4" />
        </a>
      </main>
    </Screen>
  );
}
