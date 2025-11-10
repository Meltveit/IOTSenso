// Filsti: src/lib/types.ts

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
  organizationNumber: string;
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
// CAMERA TYPES
// ============================================

export interface Camera {
  id: string;
  name: string;
  url: string;
  addedAt: Timestamp;
}

// ============================================
// BUILDING TYPES
// ============================================

export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'cabin' | 'other';

export interface Building {
  id: string;
  userId: string;
  name: string;
  type?: BuildingType;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
  imageUrl?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sensorCount: number;
  cameras?: Camera[];  // Støtte for IP-kameraer
}

// ============================================
// SENSOR TYPES - OPPDATERT MED UPPER/LOWER THRESHOLDS
// ============================================

export type SensorType = 'weight' | 'ir' | 'moisture' | 'flow' | 'temperature';
export type SensorStatus = 'ok' | 'warning' | 'critical' | 'offline' | 'pending';

export interface Sensor {
  id: string;
  sensorId: string;
  userId: string;
  buildingId?: string;
  type: SensorType;
  name: string;
  location?: string;
  thresholds: {
    upper?: number;      // Øvre grense (varsel hvis over)
    lower?: number;      // Nedre grense (varsel hvis under)
    warning: number;     // Eksisterende warning threshold
    critical: number;    // Eksisterende critical threshold
  };
  alertMethods: ('email' | 'sms')[];
  batteryLevel: number;
  signalStrength?: number;
  lastCommunication: Timestamp | null;
  status: SensorStatus;
  currentValue: number;
  unit: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  equipmentType?: string;
  data?: SensorReading[];
  maintenanceHistory?: any[];
}

export interface SensorReading {
  value: number;
  unit: string;
  timestamp: Date | Timestamp;
  batteryLevel: number;
}

// ============================================
// ALERT TYPES
// ============================================

export type AlertType = 'warning' | 'critical' | 'info' | 'battery' | 'upper_limit' | 'lower_limit';

export interface Alert {
  id: string;
  sensorId: string;
  userId: string;
  buildingId?: string;
  type: AlertType;
  message: string;
  timestamp: Timestamp;
  acknowledged: boolean;
  readAt?: Timestamp;
}

// ============================================
// AVAILABLE SENSORS
// ============================================

export interface AvailableSensor {
  sensorId: string;
  type: SensorType;
  manufacturedAt: Timestamp;
  registeredToUser?: string;
  registeredAt?: Timestamp;
  simCardNumber?: string;
  firmwareVersion: string;
}

// ============================================
// PRODUCT TYPES
// ============================================

export interface Product {
  id: string;
  name: string;
  type: 'Starter Kit' | 'Professional' | 'Enterprise';
  description: string;
  price: {
    once: number;
    monthly: number;
  };
  specs: string[];
  imageUrl?: string;
  imageHint?: string;
  rating: number;
}

// ============================================
// ORDER TYPES
// ============================================

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered';

export interface Order {
  id: string;
  userId: string;
  products: string[];
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
// FORM TYPES
// ============================================

export interface SignupFormData {
  accountType: AccountType;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  organizationNumber?: string;
  contactPersonFirstName?: string;
  contactPersonLastName?: string;
  contactPersonTitle?: string;
  billingStreet?: string;
  billingPostalCode?: string;
  billingCity?: string;
  invoiceEmail?: string;
  numberOfSensors?: number;
  department?: string;
  referenceNumber?: string;
  vatNumber?: string;
}