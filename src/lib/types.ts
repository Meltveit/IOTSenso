export type SensorDataPoint = {
  timestamp: Date;
  value: number;
};

export type Sensor = {
  id: string;
  name: string;
  type: 'temperature' | 'humidity' | 'pressure' | 'vibration';
  location: string;
  status: 'normal' | 'warning' | 'critical';
  thresholds: {
    warning: number;
    critical: number;
  };
  currentValue: number;
  data: SensorDataPoint[];
  equipmentType: string;
  maintenanceHistory?: {
    date: string;
    notes: string;
  }[];
};

export type Alert = {
  id: string;
  sensorId: string;
  sensorName: string;
  type: 'warning' | 'critical';
  value: number;
  timestamp: Date;
};

export type Product = {
  id: string;
  name: string;
  type: 'Starter Kit' | 'Professional' | 'Enterprise';
  description: string;
  imageUrl: string;
  imageHint: string;
  rating: number;
  specs: string[];
  price: {
    once: number;
    monthly: number;
  };
};
