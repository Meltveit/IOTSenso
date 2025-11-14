// Filsti: src/lib/types.ts

import { Timestamp } from 'firebase/firestore';

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
  stripeCustomerId?: string;      // ID for kunden i Stripe (gjelder alle)
  stripeSubscriptionId?: string;  // ID for aktivt abonnement i Stripe (gjelder alle)
  numberOfSensors?: number;       // Antall sensorer (gjelder alle)
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
  streamType?: 'iframe' | 'mjpeg' | 'hls' | 'image';
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
  yearBuilt?: number;      // Byggeår
  size?: number;           // Størrelse i m²
  occupants?: number;      // Antall beboere/brukere
  imageUrl?: string;
  notes?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  sensorCount: number;
  cameras?: Camera[];      // Støtte for IP-kameraer
}

// ============================================
// SENSOR TYPES - OPPDATERT MED UPPER/LOWER THRESHOLDS
// ============================================

export type SensorType = 'temp_humidity' | 'water_weight' | 'weight_temp';
export type SensorStatus = 'ok' | 'warning' | 'critical' | 'offline' | 'pending';

// Display names for sensortyper
export const SENSOR_TYPE_LABELS: Record<SensorType, string> = {
  temp_humidity: 'Temperatur & Fukt',
  water_weight: 'Vannmåler & Vekt',
  weight_temp: 'Vekt & Temperatur',
};

export const SENSOR_TYPE_DESCRIPTIONS: Record<SensorType, string> = {
  temp_humidity: 'Kombinert sensor for temperatur og luftfuktighet',
  water_weight: 'Vannmåler med vektsensor for presist forbruk',
  weight_temp: 'Vektsensor med temperaturmåling',
};

// Units for hver sensortype (første verdi er primary)
export const SENSOR_UNITS: Record<SensorType, string[]> = {
  temp_humidity: ['°C', '%'],
  water_weight: ['L', 'kg'],
  weight_temp: ['kg', '°C'],
};

// Icons for hver sensortype
export const SENSOR_TYPE_ICONS: Record<SensorType, string> = {
  temp_humidity: 'thermometer',
  water_weight: 'droplet',
  weight_temp: 'weight',
};

export interface Sensor {
  id: string;
  sensorId: string;
  userId: string;
  buildingId?: string;
  type: SensorType;
  name: string;
  location?: string;
  thresholds: {
    upper?: number;
    lower?: number;
    warning: number;
    critical: number;
  };
  alertMethods: ('email' | 'sms')[];
  batteryLevel: number;
  signalStrength?: number;
  lastCommunication: Timestamp | null;
  status: SensorStatus;
  currentValue: number;
  humidityValue?: number;  // For temp_humidity sensors
  weightValue?: number;  // For water_weight and weight_temp sensors
  temperatureValue?: number;  // For weight_temp sensors (secondary temp reading)
  unit: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  equipmentType?: string;
  data?: SensorReading[];
  maintenanceHistory?: any[];
}

export interface SensorReading {
  value: number;
  humidityValue?: number;  // For temp_humidity sensors
  weightValue?: number;  // For water_weight and weight_temp sensors
  temperatureValue?: number;  // For weight_temp sensors (secondary temp reading)
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

// ============================================
// SENSOR PRODUCT TYPES (for public product pages)
// ============================================

// Product category types (for marketing/sales)
export type ProductCategory = 'weight' | 'ir' | 'moisture' | 'flow' | 'temp_humidity' | 'water_weight' | 'weight_temp';

export interface SensorProduct {
  id: string;
  name: string;
  subtitle: string;
  type: ProductCategory;  // Product category, not technical sensor type
  description: string;
  purpose: string[];
  howItWorks: string;
  specs: Record<string, string>;
  useCases: string[];
  importantFor: string[];
  costSavings: Record<string, string>;
  repaymentTime: string;
  uniqueBenefits: string[];
  price: number;
  monthlyFee: number;
  imageUrl?: string;
  imageHint?: string;
  inStock: boolean;
  rating: number;
}

// ============================================
// PRODUCT TYPES (Subscription Plans)
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
export interface AvailableSensor {
  sensorId: string;           // Unik sensor-ID (f.eks. SG-001)
  type: SensorType;           // Type sensor
  manufacturedAt?: Timestamp; // Når sensoren ble produsert
  registeredToUser?: string;  // UserID til nåværende eier (null hvis ledig)
  registeredAt?: Timestamp;   // Når sensoren ble registrert til nåværende eier
  previousOwners?: {          // Historikk over tidligere eiere
    userId: string;
    registeredAt: Timestamp;
    unregisteredAt: Timestamp;
  }[
    
  ];
  simCardNumber?: string;     // SIM-kortnummer hvis relevant
  firmwareVersion?: string;   // Firmware-versjon
  status: 'available' | 'registered' | 'inactive';  // Status
  createdAt: Timestamp;       // Når sensoren ble opprettet i systemet
  updatedAt: Timestamp;       // Sist oppdatert
}