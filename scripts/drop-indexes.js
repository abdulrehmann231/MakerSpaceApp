#!/usr/bin/env node

/**
 * MongoDB Index Dropping Script
 * 
 * This script drops all indexes except the default _id index.
 * WARNING: This will significantly slow down your database queries!
 * 
 * Usage:
 *   node scripts/drop-indexes.js
 *   npm run drop-indexes
 */

import dotenv from 'dotenv';
import { connectToDatabase, closeConnection } from '../src/lib/backend/mongodb.js';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

async function dropAllIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
    
    for (const collectionName of collections) {
      console.log(`🗑️  Dropping indexes for ${collectionName} collection:`);
      console.log('─'.repeat(50));
      
      try {
        const collection = db.collection(collectionName);
        const indexes = await collection.indexes();
        
        // Filter out the default _id index
        const indexesToDrop = indexes.filter(index => index.name !== '_id_');
        
        if (indexesToDrop.length === 0) {
          console.log('  ℹ️  No indexes to drop (only _id index exists)');
        } else {
          for (const index of indexesToDrop) {
            try {
              await collection.dropIndex(index.name);
              console.log(`  ✅ Dropped index: ${index.name} (${JSON.stringify(index.key)})`);
            } catch (error) {
              console.log(`  ❌ Failed to drop index ${index.name}: ${error.message}`);
            }
          }
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
        console.log(`  ${collectionName}: ${indexCount} index${indexCount !== 1 ? 'es' : ''} remaining`);
      } catch (error) {
        console.log(`  ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log('\n⚠️  WARNING: Your database queries will now be significantly slower!');
    console.log('💡 Run "npm run create-indexes" to restore performance.');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
dropAllIndexes();
