{// This is a placeholder for the MQTT service.
// In a real-world scenario, this code would run in a persistent backend service,
// like a Firebase Function or a standalone Node.js process, NOT in the Next.js frontend.
import 'dotenv/config';
import mqtt from 'mqtt';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs, updateDoc, addDoc, Timestamp } from 'firebase/firestore';

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
    // topic is 'sensors/{sensorId}/data'
    // message is a buffer
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

      // Find the sensor document in Firestore using its physical ID
      const sensorsRef = collection(db, "users");
      const q = query(collectionGroup(db, 'sensors'), where('sensorId', '==', sensorPhysicalId));
      const querySnapshot = await getDocs(q);


      if (querySnapshot.empty) {
        console.warn(`No sensor document found for physical ID: ${sensorPhysicalId}`);
        return;
      }

      // Should only be one, but loop just in case
      for (const doc of querySnapshot.docs) {
        const sensorDocRef = doc.ref;
        const sensorData = doc.data();

        console.log(`Updating Firestore for sensor: ${sensorData.name} (${doc.id})`);

        // Update the main sensor document
        await updateDoc(sensorDocRef, {
          currentValue: value,
          batteryLevel: battery,
          lastCommunication: Timestamp.now(),
          // TODO: Add logic to determine 'status' based on thresholds
        });

        // Add a new reading to the historical data subcollection
        const readingsRef = collection(sensorDocRef, 'readings');
        await addDoc(readingsRef, {
          value: value,
          timestamp: Timestamp.now(),
          batteryLevel: battery
        });
        
        console.log(`✅ Successfully updated sensor ${sensorData.name}`);
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
    // You might want a more robust reconnection strategy here
    setTimeout(connectMqtt, 5000); 
  });
}

connectMqtt();
