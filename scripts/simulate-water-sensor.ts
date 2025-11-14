import 'dotenv/config';
import mqtt from 'mqtt';

// --- Configuration ---
const SENSOR_ID = 'WATR9740FFFE10B22C'; // Fake Water Measurement Sensor DevEUI
const TOPIC = `sensors/${SENSOR_ID}/data`;
const SEND_INTERVAL_MS = 60000; // 60 seconds
// ---------------------

const options: mqtt.IClientOptions = {
  host: process.env.HIVEMQ_URL,
  port: parseInt(process.env.HIVEMQ_PORT || '1883'),
  protocol: 'mqtts',
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,
};

console.log('--- Water Measurement Sensor Simulator ---');
console.log(`Sensor ID: ${SENSOR_ID}`);
console.log(`Attempting to connect to: ${process.env.HIVEMQ_URL}:${process.env.HIVEMQ_PORT}`);

const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('✅ Water Measurement Simulator connected to HiveMQ!');
  console.log(`📡 Publishing to topic: ${TOPIC}`);
  console.log(`⏱️  Interval: ${SEND_INTERVAL_MS / 1000} seconds\n`);

  // Send first message immediately
  sendData();

  // Then send on interval
  setInterval(sendData, SEND_INTERVAL_MS);
});

function sendData() {
  // Simulate realistic water volume in liters (0-1000 L)
  // For water tank monitoring, reservoir level, etc.
  const water = parseFloat((Math.random() * 1000).toFixed(2));

  // Calculate weight based on water density (1 kg per liter)
  // Add some variation to simulate container weight
  const weight = parseFloat((water + (20 + Math.random() * 30)).toFixed(2));

  const batteryLevel = parseFloat((85 + Math.random() * 15).toFixed(1)); // 85-100%

  const payload = {
    water: water,
    weight: weight,
    battery: batteryLevel,
    timestamp: new Date().toISOString(),
  };

  const message = JSON.stringify(payload);

  client.publish(TOPIC, message, (err) => {
    if (err) {
      console.error('❌ Failed to publish:', err.message);
    } else {
      console.log(`📤 [${new Date().toLocaleTimeString()}] Sent: Water: ${water} L, Weight: ${weight} kg, Battery: ${batteryLevel}%`);
    }
  });
}

client.on('error', (err) => {
  console.error('❌ MQTT Client Error:', err.message);
  process.exit(1);
});

client.on('close', () => {
  console.log('⚠️  Connection closed.');
});

client.on('offline', () => {
  console.log('⚠️  Client went offline. Reconnecting...');
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down water measurement simulator...');
  client.end();
  process.exit(0);
});
