"use client";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Calendar, Package, Plane, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriceChip } from "@/components/price-chip";
import { UserAvatar } from "@/components/user-avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { RatingStars } from "@/components/rating-stars";
import { formatShortDate } from "@/lib/utils";
import type { Trip, Profile } from "@/lib/types/db";
import { destinationImage } from "@/lib/city-images";

interface Props {
  trip: Trip;
  traveler: Pick<Profile, "id" | "full_name" | "avatar_url" | "rating_average" | "rating_count" | "verification_status">;
  href?: string;
}

export function TripCard({ trip, traveler, href }: Props) {
  const url = href ?? `/trips/${trip.id}`;
  const image = destinationImage(trip.destination_city);
  return (
    <motion.div
      whileHover={{ y: -3 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
    >
      <Link href={url} className="block">
        <Card className="group cursor-pointer overflow-hidden p-0 transition hover:border-brand-300 hover:shadow-soft">
          <div className="relative aspect-[5/3] w-full overflow-hidden">
            <Image
              src={image}
              alt={trip.destination_city}
              fill
              sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
              className="object-cover transition duration-500 group-hover:scale-[1.04]"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
            <div className="absolute left-4 top-4 flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-foreground shadow-sm backdrop-blur">
              <Plane className="h-3 w-3" /> {trip.airline ?? "Flight"} {trip.flight_number ?? ""}
            </div>
            <div className="absolute right-4 top-4">
              <PriceChip from={trip.minimum_price} className="bg-white/90 shadow-sm backdrop-blur" />
            </div>
            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-4 text-white">
              <div className="min-w-0">
                <h3 className="truncate text-lg font-semibold tracking-tight">
                  {trip.departure_city} <ArrowRight className="inline h-4 w-4 align-middle text-white/80" /> {trip.destination_city}
                </h3>
                <div className="mt-0.5 truncate text-xs text-white/85">
                  {trip.departure_country} → {trip.destination_country}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 px-5 py-4 text-sm">
            <Stat icon={<Calendar className="h-3.5 w-3.5" />} label="Date" value={formatShortDate(trip.departure_date)} />
            <Stat icon={<Package className="h-3.5 w-3.5" />} label="Free" value={`${trip.available_weight_kg} kg`} />
            <Stat label="Rate" value={`$${trip.price_per_kg}/kg`} />
          </div>

          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <div className="flex items-center gap-2.5">
              <UserAvatar name={traveler.full_name} url={traveler.avatar_url} className="h-8 w-8" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{traveler.full_name ?? "Traveler"}</div>
                <RatingStars
                  rating={Number(traveler.rating_average ?? 0)}
                  count={traveler.rating_count}
                />
              </div>
            </div>
            <VerificationBadge status={traveler.verification_status} />
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}

function Stat({ icon, label, value }: { icon?: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="flex items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {icon} {label}
      </span>
      <span className="text-sm font-semibold text-foreground">{value}</span>
    </div>
  );
}
