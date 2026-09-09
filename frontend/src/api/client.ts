import { 
  AuthResponse, User, ParkingSpace, Booking, BookingCalculation,
  Payment, QRCodeData, CheckInResult, Review, Complaint, NotificationItem,
  OwnerDashboardStats, AdminDashboardStats, AIChatResponse
} from '../types';

const API_BASE = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('parkz_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMsg = errorData.detail || errorData.message || JSON.stringify(errorData);
      } catch (e) {
        errorMsg = response.statusText || `HTTP ${response.status}`;
      }
      throw new Error(errorMsg);
    }

    return response.json();
  }

  // Auth
  async register(data: any): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async login(data: any): Promise<AuthResponse> {
    return this.request<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    return this.request<User>('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // Parking
  async getParkings(params?: {
    latitude?: number;
    longitude?: number;
    radius_km?: number;
    vehicle_type?: string;
    min_price?: number;
    max_price?: number;
    min_rating?: number;
    search?: string;
    sort_by?: string;
  }): Promise<ParkingSpace[]> {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          searchParams.append(k, String(v));
        }
      });
    }
    const qs = searchParams.toString();
    return this.request<ParkingSpace[]>(`/parking${qs ? `?${qs}` : ''}`);
  }

  async getParkingById(id: number, coords?: { latitude?: number; longitude?: number }): Promise<ParkingSpace> {
    let url = `/parking/${id}`;
    if (coords?.latitude && coords?.longitude) {
      url += `?latitude=${coords.latitude}&longitude=${coords.longitude}`;
    }
    return this.request<ParkingSpace>(url);
  }

  async createParking(data: any): Promise<ParkingSpace> {
    return this.request<ParkingSpace>('/parking', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateParking(id: number, data: any): Promise<ParkingSpace> {
    return this.request<ParkingSpace>(`/parking/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getParkingQR(id: number): Promise<QRCodeData> {
    return this.request<QRCodeData>(`/parking/${id}/qr`);
  }

  // Bookings
  async calculatePrice(data: { parking_id: number; start_time: string; end_time: string }): Promise<BookingCalculation> {
    return this.request<BookingCalculation>('/bookings/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createBooking(data: {
    parking_id: number;
    start_time: string;
    end_time: string;
    vehicle_number: string;
    vehicle_type?: string;
  }): Promise<Booking> {
    return this.request<Booking>('/bookings', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBookings(statusFilter?: string): Promise<Booking[]> {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<Booking[]>(`/bookings${qs}`);
  }

  async getBookingById(id: string | number): Promise<Booking> {
    return this.request<Booking>(`/bookings/${id}`);
  }

  async cancelBooking(id: string | number): Promise<{ booking_id: string; status: string; refund_amount: number; reason: string }> {
    return this.request(`/bookings/${id}/cancel`, { method: 'POST' });
  }

  async checkIn(bookingId: string, secureToken: string): Promise<CheckInResult> {
    return this.request<CheckInResult>(`/bookings/${bookingId}/check-in`, {
      method: 'POST',
      body: JSON.stringify({ booking_id: bookingId, secure_token: secureToken }),
    });
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    return this.request<Booking>(`/bookings/${bookingId}/complete`, { method: 'POST' });
  }

  // Payments
  async verifyPayment(data: { booking_id: string; provider?: string; status: 'SUCCESS' | 'FAILED' }): Promise<Payment> {
    return this.request<Payment>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Reviews
  async createReview(data: { booking_id: string; rating: number; comment?: string }): Promise<Review> {
    return this.request<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getParkingReviews(parkingId: number): Promise<Review[]> {
    return this.request<Review[]>(`/parking/${parkingId}/reviews`);
  }

  // Complaints
  async fileComplaint(data: { booking_id?: string; parking_id?: number; type: string; description: string }): Promise<Complaint> {
    return this.request<Complaint>('/complaints', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getMyComplaints(): Promise<Complaint[]> {
    return this.request<Complaint[]>('/complaints');
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    return this.request<NotificationItem[]>('/notifications');
  }

  async markNotificationRead(id: number): Promise<NotificationItem> {
    return this.request<NotificationItem>(`/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    return this.request<{ message: string }>('/notifications/read-all', { method: 'POST' });
  }

  // Owner
  async getOwnerDashboard(): Promise<OwnerDashboardStats> {
    return this.request<OwnerDashboardStats>('/owner/dashboard');
  }

  async getOwnerParking(): Promise<ParkingSpace[]> {
    return this.request<ParkingSpace[]>('/owner/parking');
  }

  async getOwnerBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/owner/bookings');
  }

  async getOwnerEarnings(): Promise<{
    gross_earnings: number;
    platform_commission: number;
    net_earnings: number;
    payouts_history: any[];
  }> {
    return this.request('/owner/earnings');
  }

  // Admin
  async getAdminDashboard(): Promise<AdminDashboardStats> {
    return this.request<AdminDashboardStats>('/admin/dashboard');
  }

  async getAdminUsers(role?: string, search?: string): Promise<User[]> {
    const params = new URLSearchParams();
    if (role) params.append('role', role);
    if (search) params.append('search', search);
    const qs = params.toString();
    return this.request<User[]>(`/admin/users${qs ? `?${qs}` : ''}`);
  }

  async updateAdminUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    return this.request<User>(`/admin/users/${userId}/status?status_val=${status}`, { method: 'PUT' });
  }

  async getAdminParking(verificationStatus?: string): Promise<ParkingSpace[]> {
    const qs = verificationStatus ? `?verification_status=${verificationStatus}` : '';
    return this.request<ParkingSpace[]>(`/admin/parking${qs}`);
  }

  async approveParking(id: number): Promise<ParkingSpace> {
    return this.request<ParkingSpace>(`/admin/parking/${id}/approve`, { method: 'POST' });
  }

  async rejectParking(id: number): Promise<ParkingSpace> {
    return this.request<ParkingSpace>(`/admin/parking/${id}/reject`, { method: 'POST' });
  }

  async suspendParking(id: number): Promise<ParkingSpace> {
    return this.request<ParkingSpace>(`/admin/parking/${id}/suspend`, { method: 'POST' });
  }

  async getAdminBookings(): Promise<Booking[]> {
    return this.request<Booking[]>('/admin/bookings');
  }

  async getAdminPayments(): Promise<any[]> {
    return this.request('/admin/payments');
  }

  async getAdminComplaints(statusFilter?: string): Promise<Complaint[]> {
    const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
    return this.request<Complaint[]>(`/admin/complaints${qs}`);
  }

  async resolveComplaint(id: number, resolution: string, status: string = 'RESOLVED'): Promise<Complaint> {
    return this.request<Complaint>(`/admin/complaints/${id}/resolve`, {
      method: 'POST',
      body: JSON.stringify({ status, resolution }),
    });
  }

  // AI Parking Assistant
  async queryAIAssistant(data: {
    message: string;
    latitude?: number;
    longitude?: number;
    vehicle_type?: string;
  }): Promise<AIChatResponse> {
    return this.request<AIChatResponse>('/ai/assistant', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
}

export const api = new ApiClient();
