import type { Sensor, Alert, Product } from './types';

const now = new Date();

const generateData = (base: number, variance: number, count: number): { timestamp: Date; value: number }[] => {
  return Array.from({ length: count }, (_, i) => ({
    timestamp: new Date(now.getTime() - (count - i) * 60 * 60 * 1000), // hourly data
    value: parseFloat((base + (Math.random() - 0.5) * variance).toFixed(2)),
  }));
};

export const mockSensors: Sensor[] = [
  {
    id: 'temp-001',
    name: 'Boiler Temperature',
    type: 'temperature',
    location: 'Factory Floor 1',
    status: 'normal',
    thresholds: { warning: 85, critical: 95 },
    currentValue: 82.5,
    data: generateData(80, 5, 24),
    equipmentType: 'Industrial Boiler',
    maintenanceHistory: [{date: '2023-10-15', notes: 'Annual inspection and cleaning.'}]
  },
  {
    id: 'vib-002',
    name: 'CNC Machine Vibration',
    type: 'vibration',
    location: 'Assembly Line 2',
    status: 'warning',
    thresholds: { warning: 5, critical: 7.5 },
    currentValue: 5.8,
    data: generateData(4, 3, 24),
    equipmentType: 'CNC Milling Machine'
  },
  {
    id: 'hum-003',
    name: 'Storage Room Humidity',
    type: 'humidity',
    location: 'Warehouse B',
    status: 'normal',
    thresholds: { warning: 60, critical: 70 },
    currentValue: 55.2,
    data: generateData(55, 10, 24),
    equipmentType: 'Climate Control Unit'
  },
  {
    id: 'press-004',
    name: 'Hydraulic Press Pressure',
    type: 'pressure',
    location: 'Stamping Section',
    status: 'critical',
    thresholds: { warning: 1000, critical: 1200 },
    currentValue: 1250.7,
    data: generateData(950, 200, 24),
    equipmentType: 'Hydraulic Press'
  },
];

export const mockAlerts: Alert[] = [
    {
        id: 'alert-001',
        sensorId: 'press-004',
        sensorName: 'Hydraulic Press Pressure',
        type: 'critical',
        value: 1250.7,
        timestamp: new Date(now.getTime() - 5 * 60 * 1000),
    },
    {
        id: 'alert-002',
        sensorId: 'vib-002',
        sensorName: 'CNC Machine Vibration',
        type: 'warning',
        value: 5.8,
        timestamp: new Date(now.getTime() - 15 * 60 * 1000),
    },
    {
        id: 'alert-003',
        sensorId: 'press-004',
        sensorName: 'Hydraulic Press Pressure',
        type: 'warning',
        value: 1050.1,
        timestamp: new Date(now.getTime() - 2 * 60 * 60 * 1000),
    },
    {
        id: 'alert-004',
        sensorId: 'temp-001',
        sensorName: 'Boiler Temperature',
        type: 'warning',
        value: 86,
        timestamp: new Date(now.getTime() - 5 * 60 * 60 * 1000),
    }
];

export const mockProducts: Product[] = [
    {
        id: 'prod-001',
        name: 'SensoGuard Starter Kit',
        type: 'Starter Kit',
        description: 'Perfect for small operations, this kit includes everything you need to monitor up to 5 critical assets.',
        imageUrl: 'https://picsum.photos/seed/p1/600/400',
        imageHint: "sensor kit",
        rating: 4,
        specs: ['5 Multi-Sensors (T, H, P, V)', '1 Gateway Hub', '1 Year Basic Plan', 'Email & SMS Alerts'],
        price: { once: 499, monthly: 19 }
    },
    {
        id: 'prod-002',
        name: 'SensoGuard Professional',
        type: 'Professional',
        description: 'Our most popular package for growing businesses, with advanced analytics and broader sensor compatibility.',
        imageUrl: 'https://picsum.photos/seed/p2/600/400',
        imageHint: "professional sensors",
        rating: 5,
        specs: ['20 Multi-Sensors', '2 Gateway Hubs', 'AI Predictive Maintenance', 'Advanced Analytics Dashboard'],
        price: { once: 1999, monthly: 79 }
    },
    {
        id: 'prod-003',
        name: 'SensoGuard Enterprise',
        type: 'Enterprise',
        description: 'A complete solution for large-scale industrial monitoring with unlimited sensors and dedicated support.',
        imageUrl: 'https://picsum.photos/seed/p3/600/400',
        imageHint: "industrial sensors",
        rating: 5,
        specs: ['Unlimited Sensors', 'Scalable Gateway Infrastructure', 'Dedicated Account Manager', 'API Access & Integrations'],
        price: { once: 9999, monthly: 299 }
    },
     {
        id: 'prod-004',
        name: 'Sensor Node - Add-on',
        type: 'Starter Kit',
        description: 'Expand your existing Starter Kit with an additional multi-sensor node.',
        imageUrl: 'https://picsum.photos/seed/p4/600/400',
        imageHint: "single sensor",
        rating: 4,
        specs: ['1 Multi-Sensor (T, H, P, V)', '5-Year Battery Life', 'Easy Integration'],
        price: { once: 99, monthly: 5 }
    }
];
