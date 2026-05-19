import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Trip } from "@/lib/types/db";

export const runtime = "nodejs";

function pad(n: number) { return String(n).padStart(2, "0"); }
function toIcsDate(d: string) {
  // d = YYYY-MM-DD, render as YYYYMMDD (all-day events)
  return d.replaceAll("-", "");
}
function toIcsDateTimeUtc(date = new Date()) {
  return (
    date.getUTCFullYear().toString() +
    pad(date.getUTCMonth() + 1) +
    pad(date.getUTCDate()) +
    "T" + pad(date.getUTCHours()) +
    pad(date.getUTCMinutes()) +
    pad(date.getUTCSeconds()) + "Z"
  );
}
function escape(s: string) {
  return s.replaceAll("\\", "\\\\").replaceAll(";", "\\;").replaceAll(",", "\\,").replaceAll("\n", "\\n");
}

/**
 * /api/trips/[id]/calendar.ics — downloads an iCalendar file for the trip.
 * Works in Apple Calendar, Google Calendar, Outlook, Fantastical, etc.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.from("trips").select("*").eq("id", id).maybeSingle();
  const trip = data as Trip | null;
  if (!trip) return new NextResponse("Not found", { status: 404 });

  const url = `${process.env.NEXT_PUBLIC_APP_URL ?? "https://bagslot.vercel.app"}/trips/${trip.id}`;
  const summary = `Flight: ${trip.departure_city} → ${trip.destination_city}`;
  const description = [
    `BagSlot trip: ${trip.departure_city} (${trip.departure_country}) → ${trip.destination_city} (${trip.destination_country})`,
    trip.airline ? `Airline: ${trip.airline}` : "",
    trip.flight_number ? `Flight: ${trip.flight_number}` : "",
    `Available: ${trip.available_weight_kg} kg`,
    `Price per kg: $${trip.price_per_kg}`,
    "",
    `View: ${url}`,
  ].filter(Boolean).join("\n");

  // All-day event (DTSTART = departure date, DTEND = arrival date + 1)
  const dtStart = toIcsDate(trip.departure_date);
  const arrivalNext = new Date(trip.arrival_date);
  arrivalNext.setUTCDate(arrivalNext.getUTCDate() + 1);
  const dtEnd =
    arrivalNext.getUTCFullYear().toString() +
    pad(arrivalNext.getUTCMonth() + 1) +
    pad(arrivalNext.getUTCDate());

  const ics = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//BagSlot//Trip//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:bagslot-trip-${trip.id}@bagslot.vercel.app`,
    `DTSTAMP:${toIcsDateTimeUtc()}`,
    `DTSTART;VALUE=DATE:${dtStart}`,
    `DTEND;VALUE=DATE:${dtEnd}`,
    `SUMMARY:${escape(summary)}`,
    `DESCRIPTION:${escape(description)}`,
    `LOCATION:${escape(trip.pickup_area ?? trip.departure_city)} → ${escape(trip.destination_handoff_area ?? trip.destination_city)}`,
    `URL:${url}`,
    "STATUS:CONFIRMED",
    "TRANSP:OPAQUE",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="bagslot-${trip.departure_city.toLowerCase()}-${trip.destination_city.toLowerCase()}.ics"`,
      "Cache-Control": "public, max-age=3600",
    },
  });
}
