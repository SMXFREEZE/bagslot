import { notFound, redirect } from "next/navigation";
import { ChatRoom } from "./chat-room";
import { Card } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { Conversation, Message, Profile, Booking } from "@/lib/types/db";
import { UserAvatar } from "@/components/user-avatar";
import { BookingStatusBadge } from "@/components/booking-status-badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

// The route param is the booking ID (one conversation per booking).
export default async function MessagesPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId: bookingId } = await params;
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=/messages/${bookingId}`);

  const supabase = await createSupabaseServerClient();
  const { data: convData } = await supabase
    .from("conversations")
    .select("*")
    .eq("booking_id", bookingId)
    .maybeSingle();
  const conv = convData as Conversation | null;
  if (!conv) notFound();
  if (conv.sender_id !== user.id && conv.traveler_id !== user.id) redirect("/dashboard");

  const otherId = conv.sender_id === user.id ? conv.traveler_id : conv.sender_id;
  const [{ data: otherData }, { data: bookingData }, { data: msgData }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", otherId).single(),
    supabase.from("bookings").select("*").eq("id", bookingId).single(),
    supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", conv.id)
      .order("created_at", { ascending: true })
      .limit(200),
  ]);
  const other = otherData as Profile | null;
  const booking = bookingData as Booking | null;
  const initialMessages = (msgData as Message[]) ?? [];

  return (
    <div className="container-page max-w-3xl py-6">
      <div className="mb-4 flex items-center justify-between gap-3">
        <Link
          href={`/bookings/${bookingId}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Booking
        </Link>
        {booking && <BookingStatusBadge status={booking.status} />}
      </div>

      <Card className="overflow-hidden">
        <div className="flex items-center gap-3 border-b border-border bg-sand-50 px-4 py-3">
          <UserAvatar name={other?.full_name} url={other?.avatar_url} className="h-10 w-10" />
          <div>
            <div className="font-semibold">{other?.full_name ?? "User"}</div>
            <div className="text-xs text-muted-foreground">
              {other?.home_city ? `From ${other.home_city}` : ""}
            </div>
          </div>
        </div>
        <ChatRoom
          conversationId={conv.id}
          currentUserId={user.id}
          initialMessages={initialMessages}
        />
      </Card>
    </div>
  );
}
