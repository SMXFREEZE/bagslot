"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { Calendar, Package, Plane } from "lucide-react";
import { Card } from "@/components/ui/card";
import { PriceChip } from "@/components/price-chip";
import { UserAvatar } from "@/components/user-avatar";
import { VerificationBadge } from "@/components/verification-badge";
import { RatingStars } from "@/components/rating-stars";
import { formatShortDate } from "@/lib/utils";
import type { Trip, Profile } from "@/lib/types/db";
import { Badge } from "@/components/ui/badge";

interface Props {
  trip: Trip;
  traveler: Pick<Profile, "id" | "full_name" | "avatar_url" | "rating_average" | "rating_count" | "verification_status">;
  href?: string;
}

export function TripCard({ trip, traveler, href }: Props) {
  const url = href ?? `/trips/${trip.id}`;
  return (
    <motion.div whileHover={{ y: -2 }} transition={{ type: "spring", stiffness: 240, damping: 22 }}>
      <Link href={url}>
        <Card className="group cursor-pointer overflow-hidden p-5 transition hover:border-brand-200 hover:shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Plane className="h-3.5 w-3.5 text-brand-600" />
                <span>{trip.airline ?? "Direct flight"}</span>
                {trip.flight_number && <span>· {trip.flight_number}</span>}
              </div>
              <h3 className="mt-2 truncate text-lg font-semibold text-foreground">
                {trip.departure_city} <span className="text-muted-foreground">→</span> {trip.destination_city}
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {trip.departure_country} → {trip.destination_country}
              </p>
            </div>
            <PriceChip from={trip.minimum_price} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span className="truncate">{formatShortDate(trip.departure_date)}</span>
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Package className="h-4 w-4" />
              <span>{trip.available_weight_kg} kg free</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-border pt-4">
            <div className="flex items-center gap-3">
              <UserAvatar name={traveler.full_name} url={traveler.avatar_url} className="h-8 w-8" />
              <div className="min-w-0">
                <div className="truncate text-sm font-medium">{traveler.full_name ?? "Traveler"}</div>
                <RatingStars
                  rating={Number(traveler.rating_average ?? 0)}
                  count={traveler.rating_count}
                />
              </div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <VerificationBadge status={traveler.verification_status} />
              <Badge variant="muted">{trip.price_per_kg ? `$${trip.price_per_kg}/kg` : "Negotiable"}</Badge>
            </div>
          </div>
        </Card>
      </Link>
    </motion.div>
  );
}
