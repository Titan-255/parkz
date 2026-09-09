import { 
  AuthResponse, User, ParkingSpace, Booking, BookingCalculation,
  Payment, QRCodeData, CheckInResult, Review, Complaint, NotificationItem,
  OwnerDashboardStats, AdminDashboardStats, AIChatResponse
} from '../types';
import { mockDb } from './mockService';

const API_BASE = (import.meta as any).env?.VITE_API_BASE_URL || '/api';

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

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    }
    throw new Error('Received non-JSON response from server');
  }

  // Auth
  async register(data: any): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/register', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      console.warn('Backend unavailable, using local store for register:', err.message);
      return mockDb.register(data);
    }
  }

  async login(data: any): Promise<AuthResponse> {
    try {
      return await this.request<AuthResponse>('/auth/login', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      console.warn('Backend unavailable, using local store for login:', err.message);
      return mockDb.login(data);
    }
  }

  async getMe(): Promise<User> {
    try {
      return await this.request<User>('/auth/me');
    } catch (err: any) {
      return mockDb.getMe();
    }
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    try {
      return await this.request<User>('/auth/me', {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.updateProfile(data);
    }
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
    try {
      const searchParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([k, v]) => {
          if (v !== undefined && v !== null && v !== '') {
            searchParams.append(k, String(v));
          }
        });
      }
      const qs = searchParams.toString();
      return await this.request<ParkingSpace[]>(`/parking${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      return mockDb.getParkings(params);
    }
  }

  async getParkingById(id: number, coords?: { latitude?: number; longitude?: number }): Promise<ParkingSpace> {
    try {
      let url = `/parking/${id}`;
      if (coords?.latitude && coords?.longitude) {
        url += `?latitude=${coords.latitude}&longitude=${coords.longitude}`;
      }
      return await this.request<ParkingSpace>(url);
    } catch (err: any) {
      return mockDb.getParkingById(id, coords);
    }
  }

  async createParking(data: any): Promise<ParkingSpace> {
    try {
      return await this.request<ParkingSpace>('/parking', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.createParking(data);
    }
  }

  async updateParking(id: number, data: any): Promise<ParkingSpace> {
    try {
      return await this.request<ParkingSpace>(`/parking/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.updateParking(id, data);
    }
  }

  async getParkingQR(id: number): Promise<QRCodeData> {
    try {
      return await this.request<QRCodeData>(`/parking/${id}/qr`);
    } catch (err: any) {
      return mockDb.getParkingQR(id);
    }
  }

  // Bookings
  async calculatePrice(data: { parking_id: number; start_time: string; end_time: string }): Promise<BookingCalculation> {
    try {
      return await this.request<BookingCalculation>('/bookings/calculate', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.calculatePrice(data);
    }
  }

  async createBooking(data: {
    parking_id: number;
    start_time: string;
    end_time: string;
    vehicle_number: string;
    vehicle_type?: string;
  }): Promise<Booking> {
    try {
      return await this.request<Booking>('/bookings', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.createBooking(data);
    }
  }

  async getBookings(statusFilter?: string): Promise<Booking[]> {
    try {
      const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
      return await this.request<Booking[]>(`/bookings${qs}`);
    } catch (err: any) {
      return mockDb.getBookings(statusFilter);
    }
  }

  async getBookingById(id: string | number): Promise<Booking> {
    try {
      return await this.request<Booking>(`/bookings/${id}`);
    } catch (err: any) {
      return mockDb.getBookingById(id);
    }
  }

  async cancelBooking(id: string | number): Promise<{ booking_id: string; status: string; refund_amount: number; reason: string }> {
    try {
      return await this.request(`/bookings/${id}/cancel`, { method: 'POST' });
    } catch (err: any) {
      return mockDb.cancelBooking(id);
    }
  }

  async checkIn(bookingId: string, secureToken: string): Promise<CheckInResult> {
    try {
      return await this.request<CheckInResult>(`/bookings/${bookingId}/check-in`, {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId, secure_token: secureToken }),
      });
    } catch (err: any) {
      return mockDb.checkIn(bookingId, secureToken);
    }
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    try {
      return await this.request<Booking>(`/bookings/${bookingId}/complete`, { method: 'POST' });
    } catch (err: any) {
      return mockDb.completeBooking(bookingId);
    }
  }

  // Payments
  async verifyPayment(data: { booking_id: string; provider?: string; status: 'SUCCESS' | 'FAILED' }): Promise<Payment> {
    try {
      return await this.request<Payment>('/payments/verify', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.verifyPayment(data);
    }
  }

  // Reviews
  async createReview(data: { booking_id: string; rating: number; comment?: string }): Promise<Review> {
    try {
      return await this.request<Review>('/reviews', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.createReview(data);
    }
  }

  async getParkingReviews(parkingId: number): Promise<Review[]> {
    try {
      return await this.request<Review[]>(`/parking/${parkingId}/reviews`);
    } catch (err: any) {
      return mockDb.getParkingReviews(parkingId);
    }
  }

  // Complaints
  async fileComplaint(data: { booking_id?: string; parking_id?: number; type: string; description: string }): Promise<Complaint> {
    try {
      return await this.request<Complaint>('/complaints', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.fileComplaint(data);
    }
  }

  async getMyComplaints(): Promise<Complaint[]> {
    try {
      return await this.request<Complaint[]>('/complaints');
    } catch (err: any) {
      return mockDb.getMyComplaints();
    }
  }

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      return await this.request<NotificationItem[]>('/notifications');
    } catch (err: any) {
      return mockDb.getNotifications();
    }
  }

  async markNotificationRead(id: number): Promise<NotificationItem> {
    try {
      return await this.request<NotificationItem>(`/notifications/${id}/read`, { method: 'PUT' });
    } catch (err: any) {
      return mockDb.markNotificationRead(id);
    }
  }

  async markAllNotificationsRead(): Promise<{ message: string }> {
    try {
      return await this.request<{ message: string }>('/notifications/read-all', { method: 'POST' });
    } catch (err: any) {
      return mockDb.markAllNotificationsRead();
    }
  }

  // Owner
  async getOwnerDashboard(): Promise<OwnerDashboardStats> {
    try {
      return await this.request<OwnerDashboardStats>('/owner/dashboard');
    } catch (err: any) {
      return mockDb.getOwnerDashboard();
    }
  }

  async getOwnerParking(): Promise<ParkingSpace[]> {
    try {
      return await this.request<ParkingSpace[]>('/owner/parking');
    } catch (err: any) {
      return mockDb.getOwnerParking();
    }
  }

  async getOwnerBookings(): Promise<Booking[]> {
    try {
      return await this.request<Booking[]>('/owner/bookings');
    } catch (err: any) {
      return mockDb.getOwnerBookings();
    }
  }

  async getOwnerEarnings(): Promise<{
    gross_earnings: number;
    platform_commission: number;
    net_earnings: number;
    payouts_history: any[];
  }> {
    try {
      return await this.request('/owner/earnings');
    } catch (err: any) {
      return mockDb.getOwnerEarnings();
    }
  }

  // Admin
  async getAdminDashboard(): Promise<AdminDashboardStats> {
    try {
      return await this.request<AdminDashboardStats>('/admin/dashboard');
    } catch (err: any) {
      return mockDb.getAdminDashboard();
    }
  }

  async getAdminUsers(role?: string, search?: string): Promise<User[]> {
    try {
      const params = new URLSearchParams();
      if (role) params.append('role', role);
      if (search) params.append('search', search);
      const qs = params.toString();
      return await this.request<User[]>(`/admin/users${qs ? `?${qs}` : ''}`);
    } catch (err: any) {
      return mockDb.getAdminUsers(role, search);
    }
  }

  async updateAdminUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    try {
      return await this.request<User>(`/admin/users/${userId}/status?status_val=${status}`, { method: 'PUT' });
    } catch (err: any) {
      return mockDb.updateAdminUserStatus(userId, status);
    }
  }

  async getAdminParking(verificationStatus?: string): Promise<ParkingSpace[]> {
    try {
      const qs = verificationStatus ? `?verification_status=${verificationStatus}` : '';
      return await this.request<ParkingSpace[]>(`/admin/parking${qs}`);
    } catch (err: any) {
      return mockDb.getAdminParking(verificationStatus);
    }
  }

  async approveParking(id: number): Promise<ParkingSpace> {
    try {
      return await this.request<ParkingSpace>(`/admin/parking/${id}/approve`, { method: 'POST' });
    } catch (err: any) {
      return mockDb.approveParking(id);
    }
  }

  async rejectParking(id: number): Promise<ParkingSpace> {
    try {
      return await this.request<ParkingSpace>(`/admin/parking/${id}/reject`, { method: 'POST' });
    } catch (err: any) {
      return mockDb.rejectParking(id);
    }
  }

  async suspendParking(id: number): Promise<ParkingSpace> {
    try {
      return await this.request<ParkingSpace>(`/admin/parking/${id}/suspend`, { method: 'POST' });
    } catch (err: any) {
      return mockDb.suspendParking(id);
    }
  }

  async getAdminBookings(): Promise<Booking[]> {
    try {
      return await this.request<Booking[]>('/admin/bookings');
    } catch (err: any) {
      return mockDb.getAdminBookings();
    }
  }

  async getAdminPayments(): Promise<any[]> {
    try {
      return await this.request('/admin/payments');
    } catch (err: any) {
      return mockDb.getAdminPayments();
    }
  }

  async getAdminComplaints(statusFilter?: string): Promise<Complaint[]> {
    try {
      const qs = statusFilter ? `?status_filter=${statusFilter}` : '';
      return await this.request<Complaint[]>(`/admin/complaints${qs}`);
    } catch (err: any) {
      return mockDb.getAdminComplaints(statusFilter);
    }
  }

  async resolveComplaint(id: number, resolution: string, status: string = 'RESOLVED'): Promise<Complaint> {
    try {
      return await this.request<Complaint>(`/admin/complaints/${id}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ status, resolution }),
      });
    } catch (err: any) {
      return mockDb.resolveComplaint(id, resolution, status);
    }
  }

  // AI Parking Assistant
  async queryAIAssistant(data: {
    message: string;
    latitude?: number;
    longitude?: number;
    vehicle_type?: string;
  }): Promise<AIChatResponse> {
    try {
      return await this.request<AIChatResponse>('/ai/assistant', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    } catch (err: any) {
      return mockDb.queryAIAssistant(data);
    }
  }
}

export const api = new ApiClient();
