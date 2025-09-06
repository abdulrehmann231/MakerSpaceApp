#!/usr/bin/env node

/**
 * MongoDB Index Creation Script
 * 
 * Run this script to create all necessary indexes for optimal performance.
 * 
 * Usage:
 *   node scripts/create-indexes.js
 *   npm run create-indexes
 */


import { createAllIndexes, listAllIndexes } from '../src/lib/backend/createIndexes.js';
import { connectToDatabase, closeConnection } from '../src/lib/backend/mongodb.js';


async function main() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await connectToDatabase();
    
    console.log('📊 Creating MongoDB indexes...');
    await createAllIndexes();
    
    console.log('📋 Listing all indexes...');
    await listAllIndexes();
    
    console.log('✅ Index creation completed successfully!');
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log('🔌 Database connection closed.');
  }
}

// Run the script
main();
