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
// BUILDING TYPES (NYTT!)
// ============================================

export type BuildingType = 'residential' | 'commercial' | 'industrial' | 'cabin' | 'other';

export interface Building {
  id: string;
  userId: string; // Eier av bygningen
  name: string; // "Hovedbygning", "Garasje", "Hytte på fjellet"
  type?: BuildingType;
  address?: {
    street: string;
    postalCode: string;
    city: string;
  };
  imageUrl?: string;
  notes?: string; // Ekstra notater om bygningen
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sensorCount: number; // Teller - oppdateres automatisk
}

// ============================================
// SENSOR TYPES (OPPDATERT!)
// ============================================

export type SensorType = 'weight' | 'ir' | 'moisture' | 'flow' | 'temperature';
export type SensorStatus = 'ok' | 'warning' | 'critical' | 'offline' | 'pending';

export interface Sensor {
  id: string;
  sensorId: string; // Fysisk ID på sensor (f.eks. SG-2024-001234)
  userId: string;
  buildingId?: string; // NYTT - referanse til bygning (valgfritt)
  type: SensorType;
  name: string;
  location?: string; // Spesifikk plassering innenfor bygning
  thresholds: {
    warning: number;
    critical: number;
  };
  alertMethods: ('email' | 'sms')[];
  batteryLevel: number; // 0-100
  signalStrength?: number; // dBm
  lastCommunication: Timestamp | null;
  status: SensorStatus;
  currentValue: number;
  unit: string; // 'kg', 'cm', '%', etc.
  createdAt: Timestamp;
  updatedAt: Timestamp;
  equipmentType?: string;
  data?: SensorReading[];
  maintenanceHistory?: any[]; // For predictive analysis
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
  buildingId?: string; // NYTT - for å filtrere varsler per bygning
  type: AlertType;
  message: string;
  timestamp: Timestamp;
  acknowledged: boolean;
  readAt?: Timestamp;
}

// ============================================
// AVAILABLE SENSORS (Sensor-inventory)
// ============================================

export interface AvailableSensor {
  sensorId: string; // Fysisk ID (f.eks. SG-2024-001234)
  type: SensorType;
  manufacturedAt: Timestamp;
  registeredToUser?: string; // userId hvis allerede registrert
  registeredAt?: Timestamp;
  simCardNumber?: string;
  firmwareVersion: string;
}

// ============================================
// PRODUCT TYPES (Refactored to Subscription Tiers)
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
