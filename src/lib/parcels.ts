import { queryOptions } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type ParcelStatus = "booked" | "accepted" | "in_transit" | "out_for_delivery" | "delivered";

export type TrackingEvent = {
  id: string;
  status: ParcelStatus;
  description: string;
  location: string;
  occurred_at: string;
  is_simulated: boolean;
};

export type TrackedParcel = {
  id: string;
  tracking_number: string;
  is_demo: boolean;
  status: ParcelStatus;
  service_type: string;
  weight_kg: number;
  declared_value: number;
  category: string;
  description: string | null;
  origin_city: string;
  origin_code: string;
  destination_city: string;
  destination_code: string;
  sender_name: string;
  sender_address: string;
  recipient_name: string;
  recipient_address: string;
  recipient_phone: string;
  estimated_delivery: string;
  created_at: string;
  events: TrackingEvent[];
};

export const STATUS_LABEL: Record<ParcelStatus, string> = {
  booked: "Booked",
  accepted: "Accepted",
  in_transit: "In Transit",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
};

export const STATUS_MESSAGE: Record<ParcelStatus, string> = {
  booked: "Booking created. Drop the parcel at a post office.",
  accepted: "Your parcel has been accepted.",
  in_transit: "Your parcel is on the way.",
  out_for_delivery: "Your parcel is out for delivery.",
  delivered: "Your parcel has been delivered.",
};

export const STEPS: ParcelStatus[] = ["accepted", "in_transit", "out_for_delivery", "delivered"];

export const TRACKING_RE = /^[A-Z]{2}\d{9}[A-Z]{2}$/;

export function normalizeTracking(v: string) {
  return v.replace(/\s+/g, "").toUpperCase();
}

export const DEMO_TRACKING_NUMBERS = ["EP123456789ET", "EP987654321ET", "EP555000111ET"];

export const CITIES = [
  { name: "Addis Ababa", code: "AA" },
  { name: "Dire Dawa", code: "DIR" },
  { name: "Bahir Dar", code: "BDR" },
  { name: "Hawassa", code: "AWA" },
  { name: "Mekelle", code: "MQX" },
  { name: "Gondar", code: "GDQ" },
  { name: "Adama", code: "ADM" },
  { name: "Jimma", code: "JIM" },
] as const;

export const SERVICES = [
  { name: "Standard Mail", base: 60, perKg: 25, eta: "3 – 7 working days (Domestic)" },
  { name: "Registered Mail", base: 90, perKg: 30, eta: "3 – 6 working days (Domestic)" },
  { name: "Express Mail", base: 150, perKg: 45, eta: "1 – 3 working days (Express)" },
] as const;

export const CATEGORIES = [
  "Documents",
  "Parcel",
  "Gift",
  "Electronics",
  "Clothing",
  "Other",
] as const;

/** Indicative fee in ETB (illustrative demo tariff, not an official rate). */
export function estimateFee(serviceName: string, weightKg: number) {
  const s = SERVICES.find((x) => x.name === serviceName) ?? SERVICES[0];
  const w = Math.max(0, weightKg);
  return Math.round(s.base + (Math.ceil(w * 2) / 2) * s.perKg);
}

export const trackQueryOptions = (tn: string) =>
  queryOptions({
    queryKey: ["track", tn],
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const { data, error } = await supabase
        .rpc("track_parcel", { _tracking: tn })
        .abortSignal(signal);
      if (error) throw error;
      return (data as unknown as TrackedParcel | null) ?? null;
    },
  });

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
