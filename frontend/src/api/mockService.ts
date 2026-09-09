import {
  AuthResponse, User, ParkingSpace, Booking, BookingCalculation,
  Payment, QRCodeData, CheckInResult, Review, Complaint, NotificationItem,
  OwnerDashboardStats, AdminDashboardStats, AIChatResponse
} from '../types';

const STORAGE_KEYS = {
  USERS: 'parkz_mock_users',
  PARKINGS: 'parkz_mock_parkings',
  BOOKINGS: 'parkz_mock_bookings',
  PAYMENTS: 'parkz_mock_payments',
  REVIEWS: 'parkz_mock_reviews',
  COMPLAINTS: 'parkz_mock_complaints',
  NOTIFICATIONS: 'parkz_mock_notifications',
};

const INITIAL_USERS: (User & { password?: string })[] = [
  {
    id: 1,
    email: 'admin@parkz.local',
    name: 'Alexander Pierce (Chief Admin)',
    phone: '+91 98401 23456',
    role: 'ADMIN',
    is_verified: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 30 * 86400000).toISOString(),
    password: 'ParkZ@Admin123!',
  },
  {
    id: 2,
    email: 'owner@parkz.local',
    name: 'Rajesh Sharma (Commercial Host)',
    phone: '+91 98402 34567',
    role: 'OWNER',
    is_verified: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 25 * 86400000).toISOString(),
    password: 'ParkZ@Owner123!',
  },
  {
    id: 3,
    email: 'owner2@parkz.local',
    name: 'Kavitha Sundaram (Private Landowner)',
    phone: '+91 98403 45678',
    role: 'OWNER',
    is_verified: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    password: 'ParkZ@Owner456!',
  },
  {
    id: 4,
    email: 'driver@parkz.local',
    name: 'Siddharth Verma',
    phone: '+91 98404 56789',
    role: 'DRIVER',
    vehicle_number: 'TN-01-AB-1234',
    vehicle_type: 'CAR',
    is_verified: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    password: 'ParkZ@Driver123!',
  },
  {
    id: 5,
    email: 'driver2@parkz.local',
    name: 'Ananya Raman',
    phone: '+91 98405 67890',
    role: 'DRIVER',
    vehicle_number: 'TN-07-CD-5678',
    vehicle_type: 'TWO_WHEELER',
    is_verified: true,
    status: 'ACTIVE',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    password: 'ParkZ@Driver456!',
  },
];

const INITIAL_PARKINGS: ParkingSpace[] = [
  {
    id: 1,
    owner_id: 2,
    name: 'Phoenix Marketcity Premium Covered Parking',
    description: 'Secured basement parking with 24/7 CCTV surveillance, automated gate pass, and EV charging points.',
    address: '142 Velachery Main Rd, Indira Gandhi Nagar, Velachery, Chennai, Tamil Nadu 600042',
    latitude: 12.9922,
    longitude: 80.2173,
    price_per_hour: 40.0,
    vehicle_type: 'BOTH',
    total_spaces: 25,
    status: 'ACTIVE',
    verification_status: 'APPROVED',
    rules: 'No smoking, drive under 10 km/h, keep headlights on low beam.',
    entrance_instructions: 'Take Ramp B at Gate 3. Scan the entrance QR code on the barrier post.',
    created_at: new Date(Date.now() - 20 * 86400000).toISOString(),
    images: [
      { id: 1, image_url: 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80', is_primary: true },
      { id: 2, image_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80', is_primary: false }
    ],
    availabilities: [],
    qr_code: { id: 1, parking_id: 1, secure_token: 'PKZ-GATE-129922-PHOENIX', status: 'ACTIVE' },
    average_rating: 4.8,
    total_reviews: 42,
    available_slots_now: 19,
    owner_name: 'Rajesh Sharma (Commercial Host)',
  },
  {
    id: 2,
    owner_id: 2,
    name: 'Express Avenue Central Hub Parking',
    description: 'Prime central Chennai parking space directly connected to commercial complexes and restaurants.',
    address: '49, 50L, Whites Rd, Express Estate, Royapettah, Chennai, Tamil Nadu 600014',
    latitude: 13.0587,
    longitude: 80.2642,
    price_per_hour: 50.0,
    vehicle_type: 'CAR',
    total_spaces: 30,
    status: 'ACTIVE',
    verification_status: 'APPROVED',
    rules: 'Park strictly between yellow markers. Maximum height 2.2m.',
    entrance_instructions: 'Enter via Whites Road gate. Guard will direct to Reserved ParkZ Zone A.',
    created_at: new Date(Date.now() - 18 * 86400000).toISOString(),
    images: [
      { id: 3, image_url: 'https://images.unsplash.com/photo-1573348722427-f1d6819fdf98?auto=format&fit=crop&w=800&q=80', is_primary: true }
    ],
    availabilities: [],
    qr_code: { id: 2, parking_id: 2, secure_token: 'PKZ-GATE-130587-EXPRESS', status: 'ACTIVE' },
    average_rating: 4.9,
    total_reviews: 68,
    available_slots_now: 24,
    owner_name: 'Rajesh Sharma (Commercial Host)',
  },
  {
    id: 3,
    owner_id: 3,
    name: 'T. Nagar Panagal Park Covered Driveway',
    description: 'Private gated driveway in heart of shopping hub. Shaded, very safe with security personnel on duty.',
    address: '22 Usman Road, Near Panagal Park, T. Nagar, Chennai, Tamil Nadu 600017',
    latitude: 13.0418,
    longitude: 80.2337,
    price_per_hour: 30.0,
    vehicle_type: 'BOTH',
    total_spaces: 8,
    status: 'ACTIVE',
    verification_status: 'APPROVED',
    rules: 'Please reverse park. Contact security if you need assistance.',
    entrance_instructions: 'Black iron gate adjacent to Usman road intersection. Ring bell or scan QR.',
    created_at: new Date(Date.now() - 15 * 86400000).toISOString(),
    images: [
      { id: 4, image_url: 'https://images.unsplash.com/photo-1621929747188-0b4dc28498d2?auto=format&fit=crop&w=800&q=80', is_primary: true }
    ],
    availabilities: [],
    qr_code: { id: 3, parking_id: 3, secure_token: 'PKZ-GATE-130418-TNAGAR', status: 'ACTIVE' },
    average_rating: 4.7,
    total_reviews: 29,
    available_slots_now: 5,
    owner_name: 'Kavitha Sundaram (Private Landowner)',
  },
  {
    id: 4,
    owner_id: 3,
    name: 'Guindy Olympia Tech Park Adjacent',
    description: 'Ideal for tech professionals. Covered multistory parking right opposite SIDCO Industrial Estate.',
    address: '1 Alandur Road, SIDCO Industrial Estate, Guindy, Chennai, Tamil Nadu 600032',
    latitude: 13.0098,
    longitude: 80.2078,
    price_per_hour: 35.0,
    vehicle_type: 'CAR',
    total_spaces: 15,
    status: 'ACTIVE',
    verification_status: 'APPROVED',
    rules: 'Fastag/ParkZ registered entry only. 24/7 access.',
    entrance_instructions: 'Direct ramp entry from SIDCO main road.',
    created_at: new Date(Date.now() - 12 * 86400000).toISOString(),
    images: [
      { id: 5, image_url: 'https://images.unsplash.com/photo-1545179605-1296651e4d23?auto=format&fit=crop&w=800&q=80', is_primary: true }
    ],
    availabilities: [],
    qr_code: { id: 4, parking_id: 4, secure_token: 'PKZ-GATE-130098-GUINDY', status: 'ACTIVE' },
    average_rating: 4.6,
    total_reviews: 18,
    available_slots_now: 11,
    owner_name: 'Kavitha Sundaram (Private Landowner)',
  },
  {
    id: 5,
    owner_id: 2,
    name: 'Anna Nagar 2nd Avenue Commercial Lot',
    description: 'Spacious asphalt outdoor and shaded parking directly behind metro station.',
    address: '2nd Avenue, Block AA, Anna Nagar, Chennai, Tamil Nadu 600040',
    latitude: 13.0850,
    longitude: 80.2101,
    price_per_hour: 25.0,
    vehicle_type: 'BOTH',
    total_spaces: 20,
    status: 'ACTIVE',
    verification_status: 'APPROVED',
    rules: 'No heavy vehicles. Keep entry path clear.',
    entrance_instructions: 'Turn into Lane 4 behind Anna Arch. Scan QR on gate post.',
    created_at: new Date(Date.now() - 10 * 86400000).toISOString(),
    images: [
      { id: 6, image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80', is_primary: true }
    ],
    availabilities: [],
    qr_code: { id: 5, parking_id: 5, secure_token: 'PKZ-GATE-130850-ANNANAGAR', status: 'ACTIVE' },
    average_rating: 4.5,
    total_reviews: 14,
    available_slots_now: 16,
    owner_name: 'Rajesh Sharma (Commercial Host)',
  },
  {
    id: 6,
    owner_id: 3,
    name: 'OMR IT Expressway Sholinganallur Hub',
    description: 'High-tech parking facility equipped with smart sensors, wide lanes, and bike parking zones.',
    address: 'Rajiv Gandhi Salai, Sholinganallur, Chennai, Tamil Nadu 600119',
    latitude: 12.9010,
    longitude: 80.2279,
    price_per_hour: 20.0,
    vehicle_type: 'BOTH',
    total_spaces: 40,
    status: 'ACTIVE',
    verification_status: 'APPROVED',
    rules: 'Follow direction markers. Park within lines.',
    entrance_instructions: 'Left service lane next to Toll plaza.',
    created_at: new Date(Date.now() - 8 * 86400000).toISOString(),
    images: [
      { id: 7, image_url: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&w=800&q=80', is_primary: true }
    ],
    availabilities: [],
    qr_code: { id: 6, parking_id: 6, secure_token: 'PKZ-GATE-129010-OMR', status: 'ACTIVE' },
    average_rating: 4.8,
    total_reviews: 35,
    available_slots_now: 32,
    owner_name: 'Kavitha Sundaram (Private Landowner)',
  },
  {
    id: 7,
    owner_id: 2,
    name: 'Alwarpet Private Villa Secured Gated',
    description: 'Exclusive, discreet private courtyard in quiet residential avenue. Ideal for sedans and luxury cars.',
    address: 'Oliver Road, Alwarpet, Chennai, Tamil Nadu 600018',
    latitude: 13.0336,
    longitude: 80.2529,
    price_per_hour: 60.0,
    vehicle_type: 'CAR',
    total_spaces: 4,
    status: 'ACTIVE',
    verification_status: 'PENDING',
    rules: 'No honking. Maintain quiet environment.',
    entrance_instructions: 'Ring villa chime for automated gate opener or use ParkZ QR.',
    created_at: new Date(Date.now() - 5 * 86400000).toISOString(),
    images: [
      { id: 8, image_url: 'https://images.unsplash.com/photo-1590674899484-d5640e854abe?auto=format&fit=crop&w=800&q=80', is_primary: true }
    ],
    availabilities: [],
    qr_code: { id: 7, parking_id: 7, secure_token: 'PKZ-GATE-130336-ALWARPET', status: 'ACTIVE' },
    average_rating: 5.0,
    total_reviews: 3,
    available_slots_now: 4,
    owner_name: 'Rajesh Sharma (Commercial Host)',
  }
];

class MockDbService {
  private getItem<T>(key: string, defaultVal: T): T {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : defaultVal;
    } catch {
      return defaultVal;
    }
  }

  private setItem<T>(key: string, val: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(val));
    } catch (e) {
      console.warn('LocalStorage error', e);
    }
  }

  private getUsers(): (User & { password?: string })[] {
    return this.getItem(STORAGE_KEYS.USERS, INITIAL_USERS);
  }

  private getParkingsList(): ParkingSpace[] {
    return this.getItem(STORAGE_KEYS.PARKINGS, INITIAL_PARKINGS);
  }

  private getBookingsList(): Booking[] {
    const defaultBookings: Booking[] = [
      {
        id: 1,
        booking_id: 'PKZ-948102',
        driver_id: 4,
        parking_id: 1,
        start_time: new Date(Date.now() + 3600000).toISOString(),
        end_time: new Date(Date.now() + 10800000).toISOString(),
        vehicle_number: 'TN-01-AB-1234',
        vehicle_type: 'CAR',
        amount: 96.0,
        base_price: 80.0,
        platform_fee: 16.0,
        owner_amount: 64.0,
        status: 'CONFIRMED',
        payment_status: 'PAID',
        check_in_status: 'PENDING',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        parking: INITIAL_PARKINGS[0],
      },
      {
        id: 2,
        booking_id: 'PKZ-882319',
        driver_id: 4,
        parking_id: 2,
        start_time: new Date(Date.now() - 7200000).toISOString(),
        end_time: new Date(Date.now() - 3600000).toISOString(),
        vehicle_number: 'TN-01-AB-1234',
        vehicle_type: 'CAR',
        amount: 60.0,
        base_price: 50.0,
        platform_fee: 10.0,
        owner_amount: 40.0,
        status: 'COMPLETED',
        payment_status: 'PAID',
        check_in_status: 'CHECKED_IN',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        parking: INITIAL_PARKINGS[1],
      }
    ];
    return this.getItem(STORAGE_KEYS.BOOKINGS, defaultBookings);
  }

  private getCurrentUser(): User {
    const users = this.getUsers();
    const token = localStorage.getItem('parkz_token') || '';
    if (token.startsWith('mock_token_')) {
      const id = parseInt(token.replace('mock_token_', ''), 10);
      const u = users.find(x => x.id === id);
      if (u) return u;
    }
    return users.find(u => u.role === 'DRIVER') || users[3];
  }

  // Auth
  async register(data: any): Promise<AuthResponse> {
    const users = this.getUsers();
    const existing = users.find(u => u.email.toLowerCase() === (data.email || '').toLowerCase());
    if (existing) {
      const token = 'mock_token_' + existing.id;
      return {
        access_token: token,
        token_type: 'bearer',
        user: existing,
      };
    }

    const newUser: User & { password?: string } = {
      id: Date.now(),
      email: data.email,
      name: data.name || (data.email ? data.email.split('@')[0] : 'User'),
      phone: data.phone || '',
      role: data.role || 'DRIVER',
      vehicle_number: data.vehicle_number || (data.role === 'DRIVER' ? 'TN-01-NEW-9999' : undefined),
      vehicle_type: data.vehicle_type || 'CAR',
      is_verified: true,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      password: data.password || 'password123',
    };

    users.push(newUser);
    this.setItem(STORAGE_KEYS.USERS, users);

    const token = 'mock_token_' + newUser.id;
    return {
      access_token: token,
      token_type: 'bearer',
      user: newUser,
    };
  }

  async login(data: any): Promise<AuthResponse> {
    const users = this.getUsers();
    const user = users.find(u => u.email.toLowerCase() === (data.email || '').toLowerCase());
    if (!user) {
      return this.register({
        email: data.email,
        password: data.password,
        name: data.email ? data.email.split('@')[0] : 'User',
        role: (data.email || '').includes('owner') ? 'OWNER' : (data.email || '').includes('admin') ? 'ADMIN' : 'DRIVER',
      });
    }

    const token = 'mock_token_' + user.id;
    return {
      access_token: token,
      token_type: 'bearer',
      user,
    };
  }

  async getMe(): Promise<User> {
    return this.getCurrentUser();
  }

  async updateProfile(data: Partial<User>): Promise<User> {
    const users = this.getUsers();
    const current = this.getCurrentUser();
    const idx = users.findIndex(u => u.id === current.id);
    if (idx !== -1) {
      users[idx] = { ...users[idx], ...data };
      this.setItem(STORAGE_KEYS.USERS, users);
      return users[idx];
    }
    return current;
  }

  // Parking Search & Details
  async getParkings(params?: any): Promise<ParkingSpace[]> {
    let list = this.getParkingsList();
    if (params?.vehicle_type && params.vehicle_type !== 'ALL') {
      list = list.filter(p => p.vehicle_type === params.vehicle_type || p.vehicle_type === 'BOTH');
    }
    if (params?.min_price) {
      list = list.filter(p => p.price_per_hour >= Number(params.min_price));
    }
    if (params?.max_price) {
      list = list.filter(p => p.price_per_hour <= Number(params.max_price));
    }
    if (params?.min_rating) {
      list = list.filter(p => p.average_rating >= Number(params.min_rating));
    }
    if (params?.search) {
      const q = params.search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q));
    }

    const userLat = params?.latitude || 13.0418;
    const userLng = params?.longitude || 80.2337;

    return list.map(p => {
      const dLat = (p.latitude - userLat) * (Math.PI / 180);
      const dLng = (p.longitude - userLng) * (Math.PI / 180);
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(userLat * (Math.PI / 180)) * Math.cos(p.latitude * (Math.PI / 180)) *
                Math.sin(dLng / 2) * Math.sin(dLng / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const dist = Math.round(6371 * c * 10) / 10;
      return { ...p, distance_km: dist };
    });
  }

  async getParkingById(id: number, coords?: { latitude?: number; longitude?: number }): Promise<ParkingSpace> {
    const list = await this.getParkings(coords);
    const item = list.find(p => p.id === Number(id));
    if (!item) throw new Error('Parking space not found');
    return item;
  }

  async createParking(data: any): Promise<ParkingSpace> {
    const parkings = this.getParkingsList();
    const current = this.getCurrentUser();
    const newId = Date.now();
    const newParking: ParkingSpace = {
      id: newId,
      owner_id: current.id,
      name: data.name,
      description: data.description || '',
      address: data.address,
      latitude: Number(data.latitude) || 13.0418,
      longitude: Number(data.longitude) || 80.2337,
      price_per_hour: Number(data.price_per_hour) || 30.0,
      vehicle_type: data.vehicle_type || 'BOTH',
      total_spaces: Number(data.total_spaces) || 10,
      status: 'ACTIVE',
      verification_status: 'APPROVED',
      rules: data.rules || 'Standard rules apply',
      entrance_instructions: data.entrance_instructions || 'Scan QR code at entry barrier.',
      created_at: new Date().toISOString(),
      images: [
        { id: Date.now(), image_url: data.image_url || 'https://images.unsplash.com/photo-1506521781263-d8422e82f27a?auto=format&fit=crop&w=800&q=80', is_primary: true }
      ],
      availabilities: [],
      qr_code: { id: newId, parking_id: newId, secure_token: 'PKZ-GATE-' + newId, status: 'ACTIVE' },
      average_rating: 5.0,
      total_reviews: 0,
      available_slots_now: Number(data.total_spaces) || 10,
      owner_name: current.name,
    };

    parkings.unshift(newParking);
    this.setItem(STORAGE_KEYS.PARKINGS, parkings);
    return newParking;
  }

  async updateParking(id: number, data: any): Promise<ParkingSpace> {
    const parkings = this.getParkingsList();
    const idx = parkings.findIndex(p => p.id === Number(id));
    if (idx !== -1) {
      parkings[idx] = { ...parkings[idx], ...data };
      this.setItem(STORAGE_KEYS.PARKINGS, parkings);
      return parkings[idx];
    }
    throw new Error('Parking not found');
  }

  async getParkingQR(id: number): Promise<QRCodeData> {
    return {
      id: Number(id),
      parking_id: Number(id),
      secure_token: 'PKZ-GATE-' + id + '-SECURE',
      status: 'ACTIVE'
    };
  }

  // Bookings & Payments
  async calculatePrice(data: { parking_id: number; start_time: string; end_time: string }): Promise<BookingCalculation> {
    const parkings = this.getParkingsList();
    const parking = parkings.find(p => p.id === Number(data.parking_id)) || parkings[0];
    const pricePerHour = parking ? parking.price_per_hour : 30.0;
    const start = new Date(data.start_time).getTime();
    const end = new Date(data.end_time).getTime();
    const hours = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60)));
    const base = hours * pricePerHour;
    const fee = Math.round(base * 0.2);
    const ownerAmt = Math.round(base * 0.8);
    const total = base + fee;

    return {
      parking_id: Number(data.parking_id),
      parking_name: parking?.name || 'Parking Space',
      price_per_hour: pricePerHour,
      duration_hours: hours,
      base_price: base,
      platform_fee: fee,
      owner_amount: ownerAmt,
      total_amount: total,
    };
  }

  async createBooking(data: any): Promise<Booking> {
    const calc = await this.calculatePrice({
      parking_id: data.parking_id,
      start_time: data.start_time,
      end_time: data.end_time
    });

    const parkings = this.getParkingsList();
    const parking = parkings.find(p => p.id === Number(data.parking_id)) || parkings[0];
    const current = this.getCurrentUser();
    const bookings = this.getBookingsList();

    const bookingCode = 'PKZ-' + Math.floor(100000 + Math.random() * 900000);
    const newBooking: Booking = {
      id: Date.now(),
      booking_id: bookingCode,
      driver_id: current.id,
      parking_id: Number(data.parking_id),
      start_time: data.start_time,
      end_time: data.end_time,
      vehicle_number: data.vehicle_number || current.vehicle_number || 'TN-01-AB-1234',
      vehicle_type: data.vehicle_type || 'CAR',
      amount: calc.total_amount,
      base_price: calc.base_price,
      platform_fee: calc.platform_fee,
      owner_amount: calc.owner_amount,
      status: 'CONFIRMED',
      payment_status: 'PAID',
      check_in_status: 'PENDING',
      created_at: new Date().toISOString(),
      parking,
      driver: current,
      can_cancel: true,
      refund_amount_preview: calc.total_amount,
    };

    bookings.unshift(newBooking);
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return newBooking;
  }

  async getBookings(statusFilter?: string): Promise<Booking[]> {
    let bookings = this.getBookingsList();
    const current = this.getCurrentUser();
    if (current.role === 'DRIVER') {
      bookings = bookings.filter(b => b.driver_id === current.id);
    }
    if (statusFilter) {
      bookings = bookings.filter(b => b.status === statusFilter);
    }
    return bookings;
  }

  async getBookingById(id: string | number): Promise<Booking> {
    const bookings = this.getBookingsList();
    const found = bookings.find(b => b.id === Number(id) || b.booking_id === String(id));
    if (!found) throw new Error('Booking not found');
    return found;
  }

  async cancelBooking(id: string | number): Promise<any> {
    const bookings = this.getBookingsList();
    const found = bookings.find(b => b.id === Number(id) || b.booking_id === String(id));
    if (!found) throw new Error('Booking not found');
    found.status = 'CANCELLED';
    found.payment_status = 'REFUNDED';
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return {
      booking_id: found.booking_id,
      status: 'CANCELLED',
      refund_amount: found.amount,
      reason: 'Driver requested cancellation within policy window.'
    };
  }

  async checkIn(bookingId: string, secureToken: string): Promise<CheckInResult> {
    const bookings = this.getBookingsList();
    const found = bookings.find(b => b.booking_id === bookingId || String(b.id) === String(bookingId));
    if (!found) throw new Error('Booking not found');

    found.check_in_status = 'CHECKED_IN';
    found.status = 'CHECKED_IN';
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);

    return {
      success: true,
      message: 'Gate access granted. Welcome to ParkZ Reserved Bay!',
      booking_id: found.booking_id,
      parking_name: found.parking?.name || 'Chennai Hub',
      driver_name: found.driver?.name || 'Driver',
      checked_in_at: new Date().toISOString()
    };
  }

  async completeBooking(bookingId: string): Promise<Booking> {
    const bookings = this.getBookingsList();
    const found = bookings.find(b => b.booking_id === bookingId || String(b.id) === String(bookingId));
    if (!found) throw new Error('Booking not found');
    found.status = 'COMPLETED';
    this.setItem(STORAGE_KEYS.BOOKINGS, bookings);
    return found;
  }

  async verifyPayment(data: any): Promise<Payment> {
    return {
      id: Date.now(),
      booking_id: 1,
      provider: data.provider || 'MOCK_SANDBOX',
      transaction_id: 'TXN_' + Date.now(),
      amount: 100,
      status: 'PAID',
      created_at: new Date().toISOString()
    };
  }

  async createReview(data: any): Promise<Review> {
    const reviews: Review[] = this.getItem(STORAGE_KEYS.REVIEWS, []);
    const current = this.getCurrentUser();
    const newRev: Review = {
      id: Date.now(),
      booking_id: 1,
      driver_id: current.id,
      parking_id: 1,
      rating: data.rating,
      comment: data.comment,
      created_at: new Date().toISOString(),
      driver_name: current.name,
    };
    reviews.unshift(newRev);
    this.setItem(STORAGE_KEYS.REVIEWS, reviews);
    return newRev;
  }

  async getParkingReviews(parkingId: number): Promise<Review[]> {
    const reviews: Review[] = this.getItem(STORAGE_KEYS.REVIEWS, [
      {
        id: 101,
        booking_id: 1,
        driver_id: 4,
        parking_id: Number(parkingId),
        rating: 5,
        comment: 'Very clean, automated barrier opened smoothly!',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        driver_name: 'Siddharth Verma',
      }
    ]);
    return reviews;
  }

  async fileComplaint(data: any): Promise<Complaint> {
    const complaints: Complaint[] = this.getItem(STORAGE_KEYS.COMPLAINTS, []);
    const current = this.getCurrentUser();
    const newC: Complaint = {
      id: Date.now(),
      booking_id: data.booking_id ? Number(data.booking_id) : undefined,
      parking_id: data.parking_id ? Number(data.parking_id) : undefined,
      created_by: current.id,
      type: data.type || 'PARKING_UNAVAILABLE',
      description: data.description,
      status: 'OPEN',
      created_at: new Date().toISOString(),
      creator_name: current.name,
      creator_email: current.email
    };
    complaints.unshift(newC);
    this.setItem(STORAGE_KEYS.COMPLAINTS, complaints);
    return newC;
  }

  async getMyComplaints(): Promise<Complaint[]> {
    return this.getItem(STORAGE_KEYS.COMPLAINTS, []);
  }

  async getNotifications(): Promise<NotificationItem[]> {
    return [
      {
        id: 1,
        user_id: 1,
        title: 'Booking Confirmed',
        message: 'Your parking pass for Phoenix Marketcity is active. Show QR at gate.',
        type: 'BOOKING_CONFIRMED',
        is_read: false,
        created_at: new Date().toISOString()
      },
      {
        id: 2,
        user_id: 1,
        title: 'Welcome to ParkZ',
        message: 'Thank you for joining India smart parking network.',
        type: 'SYSTEM',
        is_read: true,
        created_at: new Date(Date.now() - 3600000).toISOString()
      }
    ];
  }

  async markNotificationRead(id: number): Promise<any> {
    return { success: true };
  }

  async markAllNotificationsRead(): Promise<any> {
    return { message: 'All notifications marked as read' };
  }

  // Space Owner Dashboards
  async getOwnerDashboard(): Promise<OwnerDashboardStats> {
    const parkings = this.getParkingsList();
    const bookings = this.getBookingsList();
    return {
      todays_bookings_count: 8,
      todays_earnings: 1450.0,
      total_earnings: 28400.0,
      total_spaces: parkings.length,
      active_spaces: parkings.filter(p => p.status === 'ACTIVE').length,
      utilization_rate: 78.5,
      pending_payout: 4200.0,
      completed_payout: 24200.0,
      recent_bookings: bookings.slice(0, 5),
      revenue_chart: [
        { date: 'Mon', revenue: 2100, bookings: 12 },
        { date: 'Tue', revenue: 2450, bookings: 14 },
        { date: 'Wed', revenue: 3100, bookings: 18 },
        { date: 'Thu', revenue: 2800, bookings: 16 },
        { date: 'Fri', revenue: 4200, bookings: 24 },
        { date: 'Sat', revenue: 5800, bookings: 32 },
        { date: 'Sun', revenue: 6100, bookings: 35 }
      ]
    };
  }

  async getOwnerParking(): Promise<ParkingSpace[]> {
    return this.getParkingsList();
  }

  async getOwnerBookings(): Promise<Booking[]> {
    return this.getBookingsList();
  }

  async getOwnerEarnings(): Promise<any> {
    return {
      gross_earnings: 35500.0,
      platform_commission: 7100.0,
      net_earnings: 28400.0,
      payouts_history: [
        { id: 1, amount: 15000.0, status: 'PAID', created_at: new Date(Date.now() - 14 * 86400000).toISOString() },
        { id: 2, amount: 9200.0, status: 'PAID', created_at: new Date(Date.now() - 7 * 86400000).toISOString() }
      ]
    };
  }

  // Admin Dashboard
  async getAdminDashboard(): Promise<AdminDashboardStats> {
    const parkings = this.getParkingsList();
    const bookings = this.getBookingsList();
    const users = this.getUsers();
    return {
      total_users: users.length,
      total_drivers: users.filter(u => u.role === 'DRIVER').length,
      total_owners: users.filter(u => u.role === 'OWNER').length,
      total_parking_spaces: parkings.length,
      active_parking_spaces: parkings.filter(p => p.status === 'ACTIVE').length,
      pending_parking_spaces: parkings.filter(p => p.verification_status === 'PENDING').length,
      todays_bookings_count: 24,
      total_gmv: 89450.0,
      total_platform_revenue: 17890.0,
      open_complaints_count: 1,
      fraud_flags_count: 0,
      recent_bookings: bookings.slice(0, 5),
      revenue_chart: [
        { date: 'Mon', gmv: 9800, revenue: 1960, bookings: 42 },
        { date: 'Tue', gmv: 11200, revenue: 2240, bookings: 48 },
        { date: 'Wed', gmv: 12500, revenue: 2500, bookings: 53 },
        { date: 'Thu', gmv: 11900, revenue: 2380, bookings: 51 },
        { date: 'Fri', gmv: 16400, revenue: 3280, bookings: 72 },
        { date: 'Sat', gmv: 21500, revenue: 4300, bookings: 95 },
        { date: 'Sun', gmv: 23800, revenue: 4760, bookings: 104 }
      ]
    };
  }

  async getAdminUsers(role?: string, search?: string): Promise<User[]> {
    let users = this.getUsers();
    if (role) users = users.filter(u => u.role === role);
    if (search) {
      const q = search.toLowerCase();
      users = users.filter(u => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q));
    }
    return users;
  }

  async updateAdminUserStatus(userId: number, status: 'ACTIVE' | 'SUSPENDED'): Promise<User> {
    const users = this.getUsers();
    const found = users.find(u => u.id === Number(userId));
    if (found) {
      found.status = status;
      this.setItem(STORAGE_KEYS.USERS, users);
      return found;
    }
    throw new Error('User not found');
  }

  async getAdminParking(verificationStatus?: string): Promise<ParkingSpace[]> {
    let list = this.getParkingsList();
    if (verificationStatus) {
      list = list.filter(p => p.verification_status === verificationStatus);
    }
    return list;
  }

  async approveParking(id: number): Promise<ParkingSpace> {
    const parkings = this.getParkingsList();
    const found = parkings.find(p => p.id === Number(id));
    if (found) {
      found.verification_status = 'APPROVED';
      this.setItem(STORAGE_KEYS.PARKINGS, parkings);
      return found;
    }
    throw new Error('Parking not found');
  }

  async rejectParking(id: number): Promise<ParkingSpace> {
    const parkings = this.getParkingsList();
    const found = parkings.find(p => p.id === Number(id));
    if (found) {
      found.verification_status = 'REJECTED';
      this.setItem(STORAGE_KEYS.PARKINGS, parkings);
      return found;
    }
    throw new Error('Parking not found');
  }

  async suspendParking(id: number): Promise<ParkingSpace> {
    const parkings = this.getParkingsList();
    const found = parkings.find(p => p.id === Number(id));
    if (found) {
      found.status = 'SUSPENDED';
      this.setItem(STORAGE_KEYS.PARKINGS, parkings);
      return found;
    }
    throw new Error('Parking not found');
  }

  async getAdminBookings(): Promise<Booking[]> {
    return this.getBookingsList();
  }

  async getAdminPayments(): Promise<any[]> {
    return [
      { id: 1, transaction_id: 'TXN_881920', amount: 96.0, status: 'PAID', provider: 'MOCK_UPI', created_at: new Date().toISOString() },
      { id: 2, transaction_id: 'TXN_881919', amount: 60.0, status: 'PAID', provider: 'MOCK_CARD', created_at: new Date(Date.now() - 3600000).toISOString() }
    ];
  }

  async getAdminComplaints(statusFilter?: string): Promise<Complaint[]> {
    const defaultComplaints: Complaint[] = [
      {
        id: 1,
        booking_id: 1,
        parking_id: 1,
        created_by: 5,
        type: 'WRONG_LOCATION',
        description: 'Gate barrier was slightly hidden behind pillar 4. Added signage requested.',
        status: 'OPEN',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        creator_name: 'Ananya Raman',
        creator_email: 'driver2@parkz.local'
      }
    ];
    let complaints = this.getItem(STORAGE_KEYS.COMPLAINTS, defaultComplaints);
    if (statusFilter) complaints = complaints.filter(c => c.status === statusFilter);
    return complaints;
  }

  async resolveComplaint(id: number, resolution: string, status: string = 'RESOLVED'): Promise<Complaint> {
    const complaints = await this.getAdminComplaints();
    const found = complaints.find(c => c.id === Number(id));
    if (found) {
      found.resolution = resolution;
      found.status = status as any;
      this.setItem(STORAGE_KEYS.COMPLAINTS, complaints);
      return found;
    }
    throw new Error('Complaint not found');
  }

  // AI Parking Assistant
  async queryAIAssistant(data: any): Promise<AIChatResponse> {
    const msg = (data.message || '').toLowerCase();
    const parkings = await this.getParkings();

    if (msg.includes('cheap') || msg.includes('budget') || msg.includes('lowest')) {
      const sorted = [...parkings].sort((a, b) => a.price_per_hour - b.price_per_hour);
      const rec = sorted[0];
      return {
        reply: 'The best budget parking is **' + rec.name + '** at just **₹' + rec.price_per_hour + '/hr** with ' + rec.available_slots_now + ' slots available now.',
        suggested_actions: ['Book Nearest Spot', 'View Rates', 'Get Directions'],
        recommended_parkings: [{
          id: rec.id,
          name: rec.name,
          address: rec.address,
          price_per_hour: rec.price_per_hour,
          distance_km: rec.distance_km || 1.2,
          rating: rec.average_rating,
          available_slots: rec.available_slots_now || 10,
          recommendation_reason: 'Lowest price in Chennai (₹' + rec.price_per_hour + '/hr)'
        }]
      };
    }

    if (msg.includes('phoenix') || msg.includes('velachery') || msg.includes('mall')) {
      const rec = parkings.find(p => p.id === 1) || parkings[0];
      return {
        reply: 'I recommend **' + rec.name + '**. It is situated right by Gate 3 with covered slots, EV charging, and 24/7 CCTV.',
        suggested_actions: ['Book Phoenix Parking', 'View Available Slots', 'Check Rules'],
        recommended_parkings: [{
          id: rec.id,
          name: rec.name,
          address: rec.address,
          price_per_hour: rec.price_per_hour,
          distance_km: rec.distance_km || 0.8,
          rating: rec.average_rating,
          available_slots: rec.available_slots_now || 19,
          recommendation_reason: 'Premium covered basement with EV charging'
        }]
      };
    }

    const top = parkings.slice(0, 2);
    return {
      reply: 'I found **' + parkings.length + ' verified parking spaces** near your destination with real-time slot availability and instant QR check-in passes.',
      suggested_actions: ['Show Cheapest', 'Show Highest Rated', 'Find 2-Wheeler Parking'],
      recommended_parkings: top.map(p => ({
        id: p.id,
        name: p.name,
        address: p.address,
        price_per_hour: p.price_per_hour,
        distance_km: p.distance_km || 1.5,
        rating: p.average_rating,
        available_slots: p.available_slots_now || 10,
        recommendation_reason: 'Rated ★' + p.average_rating + ' (' + p.total_reviews + ' reviews)'
      }))
    };
  }
}

export const mockDb = new MockDbService();
