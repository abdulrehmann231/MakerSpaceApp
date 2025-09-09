#!/usr/bin/env node

/**
 * MongoDB Index Usage Statistics Script
 * 
 * This script shows detailed usage statistics for all indexes in your database.
 * It helps identify which indexes are being used and which might be unnecessary.
 * 
 * Usage:
 *   node scripts/check-index-usage.js
 *   npm run check-index-usage
 */

import { connectToDatabase, closeConnection } from '../src/lib/backend/mongodb.js';


async function checkIndexUsage() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    const { db } = await connectToDatabase();
    console.log('✅ Connected to MongoDB\n');
    
    const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
    
    for (const collectionName of collections) {
      console.log(`📊 Index Usage Statistics for ${collectionName} collection:`);
      console.log('═'.repeat(60));
      
      try {
        const collection = db.collection(collectionName);
        
        // Get index statistics
        const indexStats = await collection.aggregate([
          { $indexStats: {} }
        ]).toArray();
        
        if (indexStats.length === 0) {
          console.log('  ❌ No indexes found');
        } else {
          // Sort by usage (most used first)
          indexStats.sort((a, b) => b.accesses.ops - a.accesses.ops);
          
          indexStats.forEach((stat, i) => {
            const indexName = stat.name;
            const operations = stat.accesses.ops;
            const since = stat.accesses.since;
            const key = JSON.stringify(stat.key);
            
            // Determine usage level
            let usageLevel = '';
            let usageIcon = '';
            
            if (operations === 0) {
              usageLevel = 'UNUSED';
              usageIcon = '❌';
            } else if (operations < 10) {
              usageLevel = 'LOW';
              usageIcon = '⚠️';
            } else if (operations < 100) {
              usageLevel = 'MEDIUM';
              usageIcon = '✅';
            } else {
              usageLevel = 'HIGH';
              usageIcon = '🔥';
            }
            
            console.log(`  ${i + 1}. ${usageIcon} ${indexName}`);
            console.log(`     Key: ${key}`);
            console.log(`     Operations: ${operations.toLocaleString()}`);
            console.log(`     Usage Level: ${usageLevel}`);
            console.log(`     Since: ${new Date(since).toLocaleString()}`);
            
            // Show additional info for special indexes
            if (stat.expireAfterSeconds !== undefined) {
              console.log(`     TTL: ${stat.expireAfterSeconds} seconds`);
            }
            if (stat.unique) {
              console.log(`     Unique: Yes`);
            }
            if (stat.sparse) {
              console.log(`     Sparse: Yes`);
            }
            
            console.log('');
          });
          
          // Summary for this collection
          const totalOps = indexStats.reduce((sum, stat) => sum + stat.accesses.ops, 0);
          const unusedIndexes = indexStats.filter(stat => stat.accesses.ops === 0).length;
          const highUsageIndexes = indexStats.filter(stat => stat.accesses.ops >= 100).length;
          
          console.log(`📈 Collection Summary:`);
          console.log(`   Total Operations: ${totalOps.toLocaleString()}`);
          console.log(`   High Usage Indexes: ${highUsageIndexes}`);
          console.log(`   Unused Indexes: ${unusedIndexes}`);
          console.log(`   Total Indexes: ${indexStats.length}`);
          
          // Recommendations
          if (unusedIndexes > 0) {
            console.log(`\n💡 Recommendations:`);
            const unused = indexStats.filter(stat => stat.accesses.ops === 0);
            unused.forEach(stat => {
              console.log(`   - Consider dropping unused index: ${stat.name}`);
            });
          }
        }
      } catch (error) {
        console.log(`  ❌ Error accessing collection: ${error.message}`);
      }
      
      console.log('\n' + '─'.repeat(60) + '\n');
    }
    
    // Overall database summary
    console.log('📊 Overall Database Summary:');
    console.log('═'.repeat(60));
    
    let totalOperations = 0;
    let totalIndexes = 0;
    let totalUnused = 0;
    let totalHighUsage = 0;
    
    for (const collectionName of collections) {
      try {
        const collection = db.collection(collectionName);
        const indexStats = await collection.aggregate([{ $indexStats: {} }]).toArray();
        
        const collectionOps = indexStats.reduce((sum, stat) => sum + stat.accesses.ops, 0);
        const collectionUnused = indexStats.filter(stat => stat.accesses.ops === 0).length;
        const collectionHighUsage = indexStats.filter(stat => stat.accesses.ops >= 100).length;
        
        totalOperations += collectionOps;
        totalIndexes += indexStats.length;
        totalUnused += collectionUnused;
        totalHighUsage += collectionHighUsage;
        
        console.log(`  ${collectionName}: ${collectionOps.toLocaleString()} ops, ${indexStats.length} indexes`);
      } catch (error) {
        console.log(`  ${collectionName}: Error - ${error.message}`);
      }
    }
    
    console.log(`\n📈 Total Database Statistics:`);
    console.log(`   Total Operations: ${totalOperations.toLocaleString()}`);
    console.log(`   Total Indexes: ${totalIndexes}`);
    console.log(`   High Usage Indexes: ${totalHighUsage}`);
    console.log(`   Unused Indexes: ${totalUnused}`);
    
    // Performance recommendations
    console.log(`\n💡 Performance Recommendations:`);
    if (totalUnused > 0) {
      console.log(`   ⚠️  You have ${totalUnused} unused indexes that could be dropped to save storage`);
    }
    if (totalHighUsage > 0) {
      console.log(`   ✅ You have ${totalHighUsage} highly-used indexes providing excellent performance`);
    }
    if (totalOperations === 0) {
      console.log(`   ℹ️  No index operations recorded yet - indexes will show usage after queries are made`);
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
checkIndexUsage();
