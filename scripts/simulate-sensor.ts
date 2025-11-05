import 'dotenv/config';
import mqtt from 'mqtt';

// --- Configuration ---
const SENSOR_ID = 'SG-2024-000001'; // The ID of the sensor you are simulating
const TOPIC = `sensors/${SENSOR_ID}/data`;
const SEND_INTERVAL_MS = 5000; // 5 seconds
// ---------------------

const options: mqtt.IClientOptions = {
  host: process.env.HIVEMQ_URL,
  port: parseInt(process.env.HIVEMQ_PORT || '8883'),
  protocol: 'mqtts',
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,
};

console.log('--- Sensor Simulator ---');
console.log(`Attempting to connect to HiveMQ Broker for sensor: ${SENSOR_ID}`);

const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('✅ Simulator connected to HiveMQ!');
  console.log(`Will start sending data every ${SEND_INTERVAL_MS / 1000} seconds to topic: ${TOPIC}`);
  
  // Start sending data on an interval
  setInterval(sendData, SEND_INTERVAL_MS);
});

function sendData() {
  // Simulate some realistic sensor data
  const simulatedValue = parseFloat((20 + Math.random() * 15).toFixed(2)); // e.g., temperature between 20-35
  const batteryLevel = parseFloat((90 - Math.random() * 10).toFixed(2)); // e.g., battery between 80-90%

  const payload = {
    value: simulatedValue,
    unit: '°C', // Change this unit based on the sensor type you're faking
    battery: batteryLevel,
    timestamp: new Date().toISOString(),
  };

  const message = JSON.stringify(payload);

  client.publish(TOPIC, message, (err) => {
    if (err) {
      console.error('❌ Failed to publish message:', err);
    } else {
      console.log(`- Sent: ${message}`);
    }
  });
}

client.on('error', (err) => {
  console.error('MQTT Client Error:', err);
  client.end();
});

client.on('close', () => {
  console.log('Connection closed.');
});
