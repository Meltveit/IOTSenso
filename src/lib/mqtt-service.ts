// MQTT Service using Firebase Admin SDK
// This bypasses Firestore security rules for backend operations
import 'dotenv/config';
import mqtt from 'mqtt';
import admin from 'firebase-admin';

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

const db = admin.firestore();

const options: mqtt.IClientOptions = {
  host: process.env.HIVEMQ_URL,
  port: parseInt(process.env.HIVEMQ_PORT || '8883'),
  protocol: 'mqtts',
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,
};

// This function should be called once when the backend service starts.
export function connectMqtt() {
  console.log('Attempting to connect to HiveMQ...');
  const client = mqtt.connect(options);

  client.on('connect', () => {
    console.log('✅ Successfully connected to HiveMQ Broker!');
    // Subscribe to a wildcard topic for all sensors
    client.subscribe('sensors/+/data', (err) => {
      if (!err) {
        console.log('📡 Subscribed to sensor data topic: sensors/+/data');
      } else {
        console.error('Subscription error:', err);
      }
    });
  });

  client.on('message', async (topic, message) => {
    console.log(`📩 Received message from topic: ${topic}`);
    console.log(`Payload: ${message.toString()}`);

    const topicParts = topic.split('/');
    if (topicParts.length !== 3 || topicParts[0] !== 'sensors' || topicParts[2] !== 'data') {
      console.warn(`Ignoring message from unexpected topic: ${topic}`);
      return;
    }

    const sensorPhysicalId = topicParts[1];
    
    try {
      const payload = JSON.parse(message.toString());
      const { value, battery, unit } = payload;

      if (value === undefined) {
        console.warn('Message payload is missing "value" field.');
        return;
      }

      // Find the sensor document using collectionGroup query
      const sensorsQuery = db.collectionGroup('sensors')
        .where('sensorId', '==', sensorPhysicalId);
      
      const querySnapshot = await sensorsQuery.get();

      if (querySnapshot.empty) {
        console.warn(`No sensor document found for physical ID: ${sensorPhysicalId}`);
        return;
      }

      // Process each matching sensor (should only be one)
      for (const doc of querySnapshot.docs) {
        const sensorData = doc.data();
        console.log(`Updating Firestore for sensor: ${sensorData.name} (${doc.id})`);

        // Determine status based on thresholds
        let status: 'ok' | 'warning' | 'critical' = 'ok';
        
        if (sensorData.thresholds) {
          if (value >= sensorData.thresholds.critical) {
            status = 'critical';
          } else if (value >= sensorData.thresholds.warning) {
            status = 'warning';
          }
        }

        // Update the main sensor document
        await doc.ref.update({
          currentValue: value,
          batteryLevel: battery || 0,
          lastCommunication: admin.firestore.FieldValue.serverTimestamp(),
          status: status,
        });

        // Add a new reading to the historical data subcollection
        await doc.ref.collection('readings').add({
          value: value,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          batteryLevel: battery || 0
        });
        
        console.log(`✅ Successfully updated sensor ${sensorData.name} - Status: ${status}, Value: ${value}${sensorData.unit}`);
      }
    } catch (error) {
      console.error(`Failed to process message from topic ${topic}:`, error);
    }
  });

  client.on('error', (err) => {
    console.error('MQTT Client Error:', err);
    client.end();
  });

  client.on('close', () => {
    console.log('MQTT connection closed. Reconnecting...');
    setTimeout(connectMqtt, 5000); 
  });
}

// Start the service if the file is run directly
connectMqtt();