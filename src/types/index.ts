import { Timestamp } from 'firebase/firestore';

// User Roles
export type UserRole = 'admin' | 'advertiser' | 'owner';

// User Interface
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  isApproved: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  avatar?: string;
}

// Location Interface
export interface Location {
  address: string;
  city: string;
  state: string;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Dimensions Interface
export interface Dimensions {
  width: number;
  height: number;
  unit: 'ft' | 'm';
}

// Hoarding Interface
export interface Hoarding {
  id: string;
  ownerId: string;
  ownerName?: string;
  title: string;
  description: string;
  location: Location;
  dimensions: Dimensions;
  pricePerDay: number;
  images: string[];
  isVerified: boolean;
  isActive: boolean;
  type?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Booking Status
export type BookingStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'completed' | 'cancelled';
export type PaymentStatus = 'pending' | 'confirmed';

// Booking Interface
export interface Booking {
  id: string;
  hoardingId: string;
  hoardingTitle?: string;
  advertiserId: string;
  advertiserName?: string;
  ownerId: string;
  ownerName?: string;
  startDate: Timestamp;
  endDate: Timestamp;
  totalAmount: number;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentConfirmedAt?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// Filter Types
export interface HoardingFilters {
  city?: string;
  state?: string;
  minPrice?: number;
  maxPrice?: number;
  minWidth?: number;
  maxWidth?: number;
  isVerified?: boolean;
}

// Form Types
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  email: string;
  password: string;
  confirmPassword: string;
  displayName: string;
  role: 'advertiser' | 'owner';
}

export interface HoardingFormData {
  title: string;
  description: string;
  address: string;
  city: string;
  state: string;
  width: number;
  height: number;
  unit: 'ft' | 'm';
  pricePerDay: number;
  images: string[];
}

// Stats Types
export interface DashboardStats {
  totalBookings: number;
  pendingBookings: number;
  totalRevenue: number;
  activeHoardings: number;
}

// Navigation Types
export interface NavItem {
  label: string;
  href: string;
  icon: string;
}
