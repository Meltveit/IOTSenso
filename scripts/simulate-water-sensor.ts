import 'dotenv/config';
import mqtt from 'mqtt';

// --- Configuration ---
const SENSOR_ID = 'WATR9740FFFE10B22C'; // Fake Water & Weight Sensor DevEUI
const TOPIC = `sensors/${SENSOR_ID}/data`;
const SEND_INTERVAL_MS = 400000; // 5 Min
// ---------------------

const options: mqtt.IClientOptions = {
  host: process.env.HIVEMQ_URL,
  port: parseInt(process.env.HIVEMQ_PORT || '1883'),
  protocol: 'mqtts',
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,
};

console.log('--- Water & Weight Sensor Simulator ---');
console.log(`Sensor ID: ${SENSOR_ID}`);
console.log(`Attempting to connect to: ${process.env.HIVEMQ_URL}:${process.env.HIVEMQ_PORT}`);

const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('✅ Water & Weight Simulator connected to HiveMQ!');
  console.log(`📡 Publishing to topic: ${TOPIC}`);
  console.log(`⏱️  Interval: ${SEND_INTERVAL_MS / 1000} seconds\n`);

  // Send first message immediately
  sendData();

  // Then send on interval
  setInterval(sendData, SEND_INTERVAL_MS);
});

function sendData() {
  // Simulate realistic water height in centimeters (0-15 cm)
  // For measuring water level on roofs, flood detection, etc.
  const water = parseFloat((Math.random() * 15).toFixed(2));

  // Simulate snow weight per square meter (0-75 kg/m²)
  // Weight varies independently from water level
  const weight = parseFloat((Math.random() * 75).toFixed(2));

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
      console.log(`📤 [${new Date().toLocaleTimeString()}] Sent: Water: ${water} cm, Weight: ${weight} kg, Battery: ${batteryLevel}%`);
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
