import type { Sensor, Alert } from './types';

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
