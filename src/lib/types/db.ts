// Hand-maintained DB types matching supabase/migrations/0001_init.sql.
// (Run `supabase gen types typescript` to regenerate from a live schema.)

export type UserRole = "traveler" | "sender" | "both";
export type VerificationStatus = "unverified" | "email_verified" | "id_verified";
export type TripStatus = "draft" | "active" | "full" | "in_progress" | "completed" | "cancelled";
export type ItemSafetyStatus = "pending" | "allowed" | "flagged" | "blocked";
export type ItemRequestStatus =
  | "draft" | "submitted" | "matched" | "cancelled" | "rejected" | "expired";
export type BookingStatus =
  | "requested" | "accepted" | "rejected"
  | "payment_pending" | "paid"
  | "picked_up" | "in_transit" | "delivered"
  | "completed" | "disputed" | "cancelled";
export type PaymentStatus =
  | "pending" | "processing" | "succeeded" | "failed" | "refunded" | "released";
export type ReviewType = "sender_to_traveler" | "traveler_to_sender";
export type SafetySeverity = "low" | "medium" | "high" | "critical";
export type SafetyFlagStatus = "open" | "reviewing" | "resolved" | "dismissed";
export type HandoffType = "pickup" | "delivery";
export type NotificationType =
  | "request_received" | "request_accepted" | "request_rejected"
  | "payment_received" | "pickup_confirmed" | "delivery_confirmed"
  | "dispute_opened" | "review_received" | "message_received" | "system";

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  phone_number: string | null;
  home_city: string | null;
  languages: string[];
  bio: string | null;
  rating_average: number;
  rating_count: number;
  verification_status: VerificationStatus;
  is_admin: boolean;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  traveler_id: string;
  departure_city: string;
  departure_country: string;
  destination_city: string;
  destination_country: string;
  departure_date: string;
  arrival_date: string;
  airline: string | null;
  flight_number: string | null;
  available_weight_kg: number;
  available_volume_description: string | null;
  price_per_kg: number;
  minimum_price: number;
  pickup_area: string | null;
  destination_handoff_area: string | null;
  allowed_item_notes: string | null;
  status: TripStatus;
  created_at: string;
  updated_at: string;
}

export interface ItemRequest {
  id: string;
  sender_id: string;
  trip_id: string | null;
  origin_city: string;
  origin_country: string;
  destination_city: string;
  destination_country: string;
  item_name: string;
  item_description: string | null;
  item_category: string | null;
  item_weight_kg: number;
  item_size_description: string | null;
  item_value: number;
  item_photos: string[];
  pickup_deadline: string | null;
  delivery_notes: string | null;
  safety_status: ItemSafetyStatus;
  status: ItemRequestStatus;
  created_at: string;
  updated_at: string;
}

export interface Booking {
  id: string;
  trip_id: string;
  item_request_id: string;
  traveler_id: string;
  sender_id: string;
  status: BookingStatus;
  agreed_price: number;
  platform_fee: number;
  traveler_payout: number;
  pickup_code: string;
  delivery_code: string;
  created_at: string;
  updated_at: string;
}

export interface Payment {
  id: string;
  booking_id: string;
  payer_id: string;
  traveler_id: string;
  amount: number;
  platform_fee: number;
  traveler_payout: number;
  currency: string;
  status: PaymentStatus;
  stripe_checkout_session_id: string | null;
  stripe_payment_intent_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  booking_id: string;
  traveler_id: string;
  sender_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  read_at: string | null;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string;
  reviewer_id: string;
  reviewee_id: string;
  rating: number;
  comment: string | null;
  review_type: ReviewType;
  created_at: string;
}

export interface SafetyFlag {
  id: string;
  item_request_id: string | null;
  booking_id: string | null;
  flagged_by: string | null;
  reason: string;
  severity: SafetySeverity;
  status: SafetyFlagStatus;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface HandoffConfirmation {
  id: string;
  booking_id: string;
  type: HandoffType;
  confirmed_by: string;
  confirmation_code: string;
  photo_url: string | null;
  notes: string | null;
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  body: string | null;
  link_url: string | null;
  read_at: string | null;
  created_at: string;
}

// Composite shapes commonly fetched together
export type TripWithTraveler = Trip & { traveler: Profile };
export type BookingWithRelations = Booking & {
  trip: Trip;
  item_request: ItemRequest;
  traveler: Profile;
  sender: Profile;
};
