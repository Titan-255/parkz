export type UserRole = 'ADMIN' | 'OWNER' | 'DRIVER';
export type UserStatus = 'ACTIVE' | 'SUSPENDED' | 'PENDING';
export type VehicleType = 'CAR' | 'TWO_WHEELER' | 'BOTH';
export type ParkingStatus = 'ACTIVE' | 'PAUSED' | 'SUSPENDED';
export type VerificationStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CHECKED_IN' | 'COMPLETED' | 'CANCELLED' | 'EXPIRED' | 'REFUNDED' | 'FAILED';
export type PaymentStatus = 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
export type CheckInStatus = 'PENDING' | 'CHECKED_IN';
export type ComplaintStatus = 'OPEN' | 'IN_REVIEW' | 'RESOLVED' | 'CLOSED';
export type ComplaintType = 'PARKING_UNAVAILABLE' | 'WRONG_LOCATION' | 'OWNER_ISSUE' | 'DRIVER_ISSUE' | 'PAYMENT_ISSUE' | 'VEHICLE_DAMAGE' | 'FAKE_LISTING' | 'UNSAFE_PARKING' | 'OTHER';

export interface User {
  id: number;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  vehicle_number?: string;
  vehicle_type?: string;
  is_verified: boolean;
  status: UserStatus;
  created_at: string;
}

export interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface ParkingImage {
  id: number;
  image_url: string;
  is_primary: boolean;
}

export interface Availability {
  id: number;
  parking_id: number;
  day_of_week: number;
  start_time: string;
  end_time: string;
  available_spaces: number;
}

export interface ParkingSpace {
  id: number;
  owner_id: number;
  name: string;
  description?: string;
  address: string;
  latitude: floatNumber;
  longitude: floatNumber;
  price_per_hour: number;
  vehicle_type: VehicleType | string;
  total_spaces: number;
  status: ParkingStatus;
  verification_status: VerificationStatus;
  rules?: string;
  entrance_instructions?: string;
  created_at: string;
  images: ParkingImage[];
  availabilities: Availability[];
  qr_code?: QRCodeData;
  average_rating: number;
  total_reviews: number;
  available_slots_now?: number;
  distance_km?: number | null;
  owner_name?: string;
}

export type floatNumber = number;

export interface BookingCalculation {
  parking_id: number;
  parking_name: string;
  price_per_hour: number;
  duration_hours: number;
  base_price: number;
  platform_fee: number;
  owner_amount: number;
  total_amount: number;
}

export interface Booking {
  id: number;
  booking_id: string;
  driver_id: number;
  parking_id: number;
  start_time: string;
  end_time: string;
  vehicle_number: string;
  vehicle_type?: string;
  amount: number;
  base_price: number;
  platform_fee: number;
  owner_amount: number;
  status: BookingStatus;
  payment_status: PaymentStatus;
  check_in_status: CheckInStatus;
  created_at: string;
  parking?: ParkingSpace;
  driver?: User;
  can_cancel?: boolean;
  refund_amount_preview?: number;
}

export interface Payment {
  id: number;
  booking_id: number;
  provider: string;
  transaction_id: string;
  amount: number;
  status: PaymentStatus;
  created_at: string;
}

export interface QRCodeData {
  id: number;
  parking_id: number;
  secure_token: string;
  status: string;
}

export interface CheckInResult {
  success: boolean;
  message: string;
  booking_id: string;
  parking_name: string;
  driver_name: string;
  checked_in_at: string;
}

export interface Review {
  id: number;
  booking_id: number;
  driver_id: number;
  parking_id: number;
  rating: number;
  comment?: string;
  created_at: string;
  driver_name?: string;
}

export interface Complaint {
  id: number;
  booking_id?: number;
  parking_id?: number;
  created_by: number;
  type: ComplaintType | string;
  description: string;
  status: ComplaintStatus;
  resolution?: string;
  created_at: string;
  creator_name?: string;
  creator_email?: string;
}

export interface NotificationItem {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: string;
  link?: string;
  is_read: boolean;
  created_at: string;
}

export interface OwnerDashboardStats {
  todays_bookings_count: number;
  todays_earnings: number;
  total_earnings: number;
  total_spaces: number;
  active_spaces: number;
  utilization_rate: number;
  pending_payout: number;
  completed_payout: number;
  recent_bookings: Booking[];
  revenue_chart: { date: string; revenue: number; bookings: number }[];
}

export interface AdminDashboardStats {
  total_users: number;
  total_drivers: number;
  total_owners: number;
  total_parking_spaces: number;
  active_parking_spaces: number;
  pending_parking_spaces: number;
  todays_bookings_count: number;
  total_gmv: number;
  total_platform_revenue: number;
  open_complaints_count: number;
  recent_bookings: Booking[];
  revenue_chart: { date: string; gmv: number; revenue: number; bookings: number }[];
  fraud_flags_count: number;
}

export interface RecommendedParking {
  id: number;
  name: string;
  address: string;
  price_per_hour: number;
  distance_km: number;
  rating: number;
  available_slots: number;
  recommendation_reason: string;
}

export interface AIChatResponse {
  reply: string;
  suggested_actions: string[];
  recommended_parkings: RecommendedParking[];
}
