import { FieldValue, Timestamp } from 'firebase/firestore';

// ============================================
// USER TYPES
// ============================================

export type AccountType = 'private' | 'business';

export interface BaseUser {
  userId: string;
  accountType: AccountType;
  email: string;
  phone: string;
  createdAt: Timestamp;
  subscriptionStatus: 'active' | 'inactive';
}

export interface PrivateUser extends BaseUser {
  accountType: 'private';
  firstName: string;
  lastName: string;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
}

export interface BusinessUser extends BaseUser {
  accountType: 'business';
  companyName: string;
  organizationNumber: string; // 9-digit org number
  contactPerson: {
    firstName: string;
    lastName: string;
    title?: string;
  };
  billingAddress: {
    street: string;
    postalCode: string;
    city: string;
  };
  invoiceEmail?: string;
  numberOfSensors?: number;
  department?: string;
  referenceNumber?: string;
  vatNumber?: string;
}

export type User = PrivateUser | BusinessUser;

// ============================================
// SENSOR TYPES
// ============================================

export type SensorType = 'weight' | 'ir' | 'moisture' | 'flow' | 'temperature';
export type SensorStatus = 'ok' | 'warning' | 'critical' | 'offline';

export interface Sensor {
  id: string;
  userId: string;
  type: SensorType;
  name: string;
  location?: string;
  thresholds: {
    warning: number;
    critical: number;
  };
  alertMethods: ('email' | 'sms')[];
  batteryLevel: number; // 0-100
  lastCommunication: Timestamp;
  status: SensorStatus;
  currentValue: number;
  unit: string; // 'kg', 'cm', '%', etc.
  createdAt: Timestamp;
  equipmentType?: string;
  data?: SensorReading[];
}

export interface SensorReading {
  value: number;
  unit: string;
  timestamp: Timestamp;
  batteryLevel: number;
}

// ============================================
// ALERT TYPES
// ============================================

export type AlertType = 'warning' | 'critical' | 'info' | 'battery';

export interface Alert {
  id: string;
  sensorId: string;
  userId: string;
  type: AlertType;
  message: string;
  timestamp: Timestamp;
  acknowledged: boolean;
  readAt?: Timestamp;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  type: SensorType;
  description: string;
  specs: {
    maxRange: string;
    batteryLife: string;
    communication: string;
    ipRating: string;
  };
  price: number; // Engangskostnad
  monthlyFee: number;
  imageUrl?: string;
  imageHint?: string;
  inStock: boolean;
  rating: number;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  products: string[]; // Product IDs
  totalAmount: number;
  status: OrderStatus;
  createdAt: Timestamp;
  shippingAddress: {
    street: string;
    postalCode: string;
    city: string;
  };
}

// ============================================
// FORM TYPES (for frontend)
// ============================================

export interface SignupFormData {
  accountType: AccountType;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  
  // Private user fields
  firstName?: string;
  lastName?: string;
  
  // Business user fields
  companyName?: string;
  organizationNumber?: string;
  contactPersonFirstName?: string;
  contactPersonLastName?: string;
  contactPersonTitle?: string;
  billingAddressStreet?: string;
  billingAddressPostalCode?: string;
  billingAddressCity?: string;
  invoiceEmail?: string;
  numberOfSensors?: number;
  department?: string;
  referenceNumber?: string;
}

export interface LoginFormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
