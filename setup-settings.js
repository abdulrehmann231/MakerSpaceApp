// Setup script for MongoDB settings collection
// Run this once to initialize the availability settings

import { MongoClient } from 'mongodb';
import { config } from 'dotenv';

// Load environment variables from .env file
config();

const uri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB;

// Validate environment variables
if (!uri) {
  console.log('💡 Please create a .env file with your MongoDB connection string');
  console.log('📝 Example: MONGODB_URI=mongodb+srv://yourusername:yourpassword@yourcluster.mongodb.net/');
  process.exit(1);
}

if (!dbName) {
  console.log('💡 Please create a .env file with your database name');
  console.log('📝 Example: MONGODB_DB=makerspace');
  process.exit(1);
}



async function setupSettings() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db(dbName);
    const settingsCollection = db.collection('settings');
    
    // Availability configuration
    const availabilityConfig = {
      key: "availability",
      spotsAvailable: [
        // Sunday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Monday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Tuesday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Wednesday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Thursday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Friday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
        // Saturday
        [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      ],
      holidays: [
        // Add specific holiday dates here (YYYY-MM-DD format)
        // Example: "2024-12-25", "2024-01-01"
      ],
      recurHolidays: [
        // Add recurring holiday dates here (MM-DD format)
        // Example: "12-25", "01-01"
      ]
    };
    
    // Insert or update the availability settings
    await settingsCollection.updateOne(
      { key: "availability" },
      { $set: availabilityConfig },
      { upsert: true }
    );
    
    
    
  } catch (error) {
    console.error('❌ Error setting up settings:', error);
  } finally {
    await client.close();
  }
}

// Run the setup
setupSettings();
