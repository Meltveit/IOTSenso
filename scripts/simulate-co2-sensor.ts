import 'dotenv/config';
import mqtt from 'mqtt';

// --- Configuration ---
const SENSOR_ID = 'CO2A9740FFFE10C33D'; // Fake CO2 Sensor DevEUI
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

console.log('--- CO2 Sensor Simulator ---');
console.log(`Sensor ID: ${SENSOR_ID}`);
console.log(`Attempting to connect to: ${process.env.HIVEMQ_URL}:${process.env.HIVEMQ_PORT}`);

const client = mqtt.connect(options);

client.on('connect', () => {
  console.log('✅ CO2 Simulator connected to HiveMQ!');
  console.log(`📡 Publishing to topic: ${TOPIC}`);
  console.log(`⏱️  Interval: ${SEND_INTERVAL_MS / 1000} seconds\n`);

  // Send first message immediately
  sendData();

  // Then send on interval
  setInterval(sendData, SEND_INTERVAL_MS);
});

function sendData() {
  // Simulate realistic CO2 levels (ppm - parts per million)
  // 400-800 ppm = good air quality
  // 800-1200 ppm = acceptable
  // 1200-2000 ppm = poor air quality
  // >2000 ppm = very poor, ventilation needed
  const co2Level = parseFloat((400 + Math.random() * 1600).toFixed(0));

  // Simulate realistic humidity (30-70%)
  const humidity = parseFloat((30 + Math.random() * 40).toFixed(1));

  const batteryLevel = parseFloat((85 + Math.random() * 15).toFixed(1)); // 85-100%

  const payload = {
    co2: co2Level,
    humidity: humidity,
    battery: batteryLevel,
    timestamp: new Date().toISOString(),
  };

  const message = JSON.stringify(payload);

  client.publish(TOPIC, message, (err) => {
    if (err) {
      console.error('❌ Failed to publish:', err.message);
    } else {
      console.log(`📤 [${new Date().toLocaleTimeString()}] Sent: CO2: ${co2Level} ppm, Humidity: ${humidity}%, Battery: ${batteryLevel}%`);
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
  console.log('\n👋 Shutting down CO2 simulator...');
  client.end();
  process.exit(0);
});
