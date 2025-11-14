// src/lib/mqtt-service.ts
import admin from 'firebase-admin';
import mqtt from 'mqtt';
import 'dotenv/config';
import { db } from './firebase-admin'; // Import db fra firebase-admin.ts

// MQTT Configuration
const mqttOptions: mqtt.IClientOptions = {
  host: process.env.HIVEMQ_URL,
  port: parseInt(process.env.HIVEMQ_PORT || '8883'),
  protocol: 'mqtts',
  username: process.env.HIVEMQ_USERNAME,
  password: process.env.HIVEMQ_PASSWORD,
  reconnectPeriod: 5000,
  connectTimeout: 30000,
};

console.log('🚀 Starting MQTT Service...');
console.log(`📡 Connecting to: ${process.env.HIVEMQ_URL}:${process.env.HIVEMQ_PORT}`);

export function connectMqtt() {
  const client = mqtt.connect(mqttOptions);

  client.on('connect', () => {
    console.log('✅ MQTT Client connected to HiveMQ Cloud!');
    
    // Subscribe to all sensor topics
    client.subscribe('sensors/+/data', (err) => {
      if (err) {
        console.error('❌ Failed to subscribe:', err);
      } else {
        console.log('📬 Subscribed to: sensors/+/data');
      }
    });
  });

  client.on('message', async (topic, message) => {
    try {
      console.log(`\n📨 [${new Date().toISOString()}] Message received on topic: ${topic}`);
      
      const payload = JSON.parse(message.toString());
      console.log('📦 Payload:', payload);

      // Extract sensor ID from topic (sensors/{sensorId}/data)
      const sensorPhysicalId = topic.split('/')[1];

      // Support multiple payload formats:
      // - Old format: { value, battery }
      // - Temp+Humidity: { temperature, humidity, battery }
      // - Water+Weight: { water, weight, battery }
      // - CO2+Humidity: { co2, humidity, battery }
      let value: number;
      let humidity: number | undefined;
      let weight: number | undefined;
      let co2: number | undefined;

      if (typeof payload.value === 'number') {
        // Old format: single value
        value = payload.value;
      } else if (typeof payload.temperature === 'number') {
        // Temp+Humidity format
        value = payload.temperature;
        humidity = payload.humidity;
      } else if (typeof payload.water === 'number') {
        // Water+Weight format (water level + snow weight)
        value = payload.water;
        weight = payload.weight;
      } else if (typeof payload.co2 === 'number') {
        // CO2+Humidity format
        value = payload.co2;
        co2 = payload.co2;  // Store CO2 separately
        humidity = payload.humidity;
      } else {
        console.warn('⚠️  Invalid payload format: no recognized value field');
        return;
      }

      const battery = payload.battery;

      // Find the sensor document using collectionGroup query
      const sensorsQuery = db.collectionGroup('sensors')
        .where('sensorId', '==', sensorPhysicalId);
      
      const querySnapshot = await sensorsQuery.get();

      if (querySnapshot.empty) {
        console.warn(`⚠️  No sensor document found for physical ID: ${sensorPhysicalId}`);
        return;
      }

      // Process each matching sensor (should only be one)
      for (const doc of querySnapshot.docs) {
        const sensorData = doc.data();
        console.log(`🔄 Updating Firestore for sensor: ${sensorData.name} (${doc.id})`);

        // Determine status based on ALL thresholds
        let status: 'ok' | 'warning' | 'critical' = 'ok';
        let alertType: string | null = null;
        
        if (sensorData.thresholds) {
          const { upper, lower, warning, critical } = sensorData.thresholds;
          
          // Check critical threshold
          if (value >= critical) {
            status = 'critical';
            alertType = 'critical';
          }
          // Check warning threshold
          else if (value >= warning) {
            status = 'warning';
            alertType = 'warning';
          }
          // Check upper limit
          else if (upper !== undefined && value > upper) {
            status = 'warning';
            alertType = 'upper_limit';
          }
          // Check lower limit
          else if (lower !== undefined && value < lower) {
            status = 'warning';
            alertType = 'lower_limit';
          }
        }

        // Update the main sensor document
        const updateData: any = {
          currentValue: value,
          batteryLevel: battery || 0,
          lastCommunication: admin.firestore.FieldValue.serverTimestamp(),
          status: status,
        };

        // Add secondary values based on sensor type
        if (humidity !== undefined) {
          updateData.humidityValue = humidity;
        }
        if (weight !== undefined) {
          updateData.weightValue = weight;
        }
        if (co2 !== undefined) {
          updateData.co2Value = co2;
        }

        await doc.ref.update(updateData);

        // Add a new reading to the historical data subcollection
        const readingData: any = {
          value: value,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          batteryLevel: battery || 0
        };

        // Add secondary values to reading
        if (humidity !== undefined) {
          readingData.humidityValue = humidity;
        }
        if (weight !== undefined) {
          readingData.weightValue = weight;
        }
        if (co2 !== undefined) {
          readingData.co2Value = co2;
        }

        await doc.ref.collection('readings').add(readingData);

        // Create alert if needed
        if (alertType) {
          let alertMessage = '';
          switch (alertType) {
            case 'critical':
              alertMessage = `Kritisk verdi på ${sensorData.name}: ${value}${sensorData.unit} (grense: ${sensorData.thresholds.critical}${sensorData.unit})`;
              break;
            case 'warning':
              alertMessage = `Advarsel for ${sensorData.name}: ${value}${sensorData.unit} (grense: ${sensorData.thresholds.warning}${sensorData.unit})`;
              break;
            case 'upper_limit':
              alertMessage = `${sensorData.name} har overskredet øvre grense: ${value}${sensorData.unit} (grense: ${sensorData.thresholds.upper}${sensorData.unit})`;
              break;
            case 'lower_limit':
              alertMessage = `${sensorData.name} har gått under nedre grense: ${value}${sensorData.unit} (grense: ${sensorData.thresholds.lower}${sensorData.unit})`;
              break;
          }

          // Get user path from doc reference
          const userPath = doc.ref.path.split('/sensors/')[0];
          
          // Create alert in user's alerts collection
          await db.collection(`${userPath}/alerts`).add({
            sensorId: doc.id,
            type: alertType,
            message: alertMessage,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            acknowledged: false,
          });

          console.log(`🚨 Alert created: ${alertMessage}`);
        }
        
        console.log(`✅ Successfully updated sensor ${sensorData.name}`);
        console.log(`   Status: ${status}`);
        console.log(`   Value: ${value}${sensorData.unit}`);
        if (humidity !== undefined) {
          console.log(`   Humidity: ${humidity}%`);
        }
        if (weight !== undefined) {
          console.log(`   Weight: ${weight} kg`);
        }
        if (co2 !== undefined) {
          console.log(`   CO2: ${co2} ppm`);
        }
        console.log(`   Battery: ${battery}%`);
      }
    } catch (error) {
      console.error(`❌ Failed to process message from topic ${topic}:`, error);
    }
  });

  client.on('error', (err) => {
    console.error('❌ MQTT Client Error:', err);
    client.end();
  });

  client.on('close', () => {
    console.log('⚠️  MQTT connection closed. Reconnecting...');
    setTimeout(connectMqtt, 5000); 
  });

  client.on('offline', () => {
    console.log('⚠️  MQTT Client went offline. Reconnecting...');
  });
}

// Start the service if the file is run directly
if (require.main === module) {
  connectMqtt();
  
  // Graceful shutdown
  process.on('SIGINT', () => {
    console.log('\n👋 Shutting down MQTT service...');
    process.exit(0);
  });
}