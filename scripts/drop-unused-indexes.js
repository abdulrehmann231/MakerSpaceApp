#!/usr/bin/env node

/**
 * MongoDB Unused Index Dropping Script
 * 
 * This script drops only the unused indexes (0 operations) while keeping
 * all active indexes that are being used by your application.
 * 
 * Usage:
 *   node scripts/drop-unused-indexes.js
 *   npm run drop-unused-indexes
 */


import { connectToDatabase, closeConnection } from '../src/lib/backend/mongodb.js';



async function dropUnusedIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
    let totalDropped = 0;
    let totalKept = 0;
    
    for (const collectionName of collections) {
      console.log(`🗑️  Analyzing ${collectionName} collection:`);
      console.log('─'.repeat(50));
      
      try {
        const collection = db.collection(collectionName);
        
        // Get index statistics
        const indexStats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();
        
        if (indexStats.length === 0) {
          console.log('  ℹ️  No indexes found');
          continue;
        }
        
        // Separate used and unused indexes
        const usedIndexes = indexStats.filter(stat => stat.accesses.ops > 0);
        const unusedIndexes = indexStats.filter(stat => stat.accesses.ops === 0);
        
        console.log(`  📊 Found ${indexStats.length} total indexes:`);
        console.log(`     ✅ Used indexes: ${usedIndexes.length}`);
        console.log(`     ❌ Unused indexes: ${unusedIndexes.length}`);
        
        // Keep used indexes
        if (usedIndexes.length > 0) {
          console.log(`\n  🔒 Keeping used indexes:`);
          usedIndexes.forEach(stat => {
            const operations = stat.accesses.ops;
            let usageLevel = '';
            let icon = '';
            
            if (operations >= 100) {
              usageLevel = 'HIGH';
              icon = '🔥';
            } else if (operations >= 10) {
              usageLevel = 'MEDIUM';
              icon = '✅';
            } else {
              usageLevel = 'LOW';
              icon = '⚠️';
            }
            
            console.log(`     ${icon} ${stat.name}: ${operations} operations (${usageLevel})`);
            totalKept++;
          });
        }
        
        // Drop unused indexes
        if (unusedIndexes.length > 0) {
          console.log(`\n  🗑️  Dropping unused indexes:`);
          for (const stat of unusedIndexes) {
            // Never drop the default _id index
            if (stat.name === '_id_') {
              console.log(`     ⚠️  Skipping _id_ index (required by MongoDB)`);
              continue;
            }
            
            try {
              await collection.dropIndex(stat.name);
              console.log(`     ✅ Dropped: ${stat.name} (${JSON.stringify(stat.key)})`);
              totalDropped++;
            } catch (error) {
              console.log(`     ❌ Failed to drop ${stat.name}: ${error.message}`);
            }
          }
        } else {
          console.log(`\n  ℹ️  No unused indexes to drop`);
        }
        
      } catch (error) {
        console.log(`  ❌ Error accessing collection: ${error.message}`);
      }
      
      console.log(''); // Empty line for readability
    }
    
    // Summary
    console.log('📋 Summary:');
    console.log('═'.repeat(50));
    console.log(`  ✅ Indexes kept: ${totalKept}`);
    console.log(`  🗑️  Indexes dropped: ${totalDropped}`);
    
    if (totalDropped > 0) {
      console.log(`\n💡 Benefits of dropping unused indexes:`);
      console.log(`   - Reduced storage space`);
      console.log(`   - Faster write operations`);
      console.log(`   - Reduced memory usage`);
      console.log(`   - Cleaner database structure`);
    }
    
    console.log(`\n🔍 Run "npm run check-index-usage" to verify the changes`);
    
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    await closeConnection();
    console.log('\n🔌 Database connection closed.');
  }
}

// Run the script
dropUnusedIndexes();
