#!/usr/bin/env node

/**
 * MongoDB Index Checker Script
 * 
 * This script checks which indexes already exist in your MongoDB database.
 * 
 * Usage:
 *   node scripts/check-indexes.js
 *   npm run check-indexes
 */

import dotenv from 'dotenv';
import { connectToDatabase, closeConnection } from '../src/lib/backend/mongodb.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function checkAllIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
    
    for (const collectionName of collections) {
      console.log(`📊 Checking indexes for ${collectionName} collection:`);
      console.log('─'.repeat(50));
      
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        
        if (indexes.length === 0) {
          console.log('  ❌ No indexes found');
        } else {
          indexes.forEach((index, i) => {
            const isUnique = index.unique ? ' (UNIQUE)' : '';
            const isSparse = index.sparse ? ' (SPARSE)' : '';
            const isTTL = index.expireAfterSeconds !== undefined ? ` (TTL: ${index.expireAfterSeconds}s)` : '';
            const isText = index.textIndexVersion ? ' (TEXT)' : '';
            
            console.log(`  ${i + 1}. ${index.name}: ${JSON.stringify(index.key)}${isUnique}${isSparse}${isTTL}${isText}`);
          });
        }
      } catch (error) {
        console.log(`  ❌ Error accessing collection: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('📋 Summary:');
    console.log('─'.repeat(50));
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        const indexCount = indexes.length;
        console.log(`  ${collectionName}: ${indexCount} index${indexCount !== 1 ? 'es' : ''}`);
      } catch (error) {
        console.log(`  ${collectionName}: Error - ${error.message}`);
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
checkAllIndexes();
