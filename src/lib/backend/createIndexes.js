import { getCollection } from './mongodb.js';

/**
 * MongoDB Index Creation Script
 * 
 * This script creates optimized indexes for all collections based on query patterns
 * identified in the codebase. Run this script once after setting up your database.
 */

// Helper function to create indexes with error handling
async function createIndexSafely(collection, indexSpec, options = {}, description) {
  try {
    await collection.createIndex(indexSpec, options);
    console.log(`  ✅ ${description}`);
  } catch (error) {
    if (error.code === 86) {
      console.log(`  ℹ️  ${description} already exists`);
    } else {
      throw error;
    }
  }
}

export async function createAllIndexes() {
  console.log('🚀 Starting MongoDB index creation...');
  
  try {
    // Create indexes for users collection
    await createUsersIndexes();
    
    // Create indexes for bookings collection
    await createBookingsIndexes();
    
    // Create indexes for settings collection
    await createSettingsIndexes();
    
    // Create indexes for password_reset_tokens collection
    await createPasswordResetTokensIndexes();
    
    console.log('✅ All MongoDB indexes created successfully!');
  } catch (error) {
    console.error('❌ Error creating indexes:', error);
    throw error;
  }
}

/**
 * Users Collection Indexes
 * 
 * Query patterns identified:
 * - findOne({ key: email }) - Primary user lookup
 * - findOne({ key: username + ".userData" }) - User data lookup
 * - updateOne({ key: email }) - User updates
 */
async function createUsersIndexes() {
  console.log('📊 Creating indexes for users collection...');
  
  const collection = await getCollection('users');
  
  // Primary key index for user lookups
  await createIndexSafely(collection, { key: 1 }, { unique: true }, 'Created unique index on key field');
  
  // Index for user data lookups (key field with .userData suffix)
  await createIndexSafely(collection, { key: 1 }, {}, 'Created index on key field for user data');
  
  // Index for refresh token lookups
  await createIndexSafely(collection, { refreshToken: 1 }, { sparse: true }, 'Created sparse index on refreshToken field');
  
  // Compound index for email-based operations
  await createIndexSafely(collection, { key: 1, hash: 1 }, {}, 'Created compound index on key and hash fields');
}

/**
 * Bookings Collection Indexes
 * 
 * Query patterns identified:
 * - find({ user: email, id: { $gte: fromDate, $lte: toDate } }) - User bookings by date range
 * - find({ date: { $gte: fromDate, $lte: toDate } }) - Availability queries
 * - deleteOne({ id: bookingId }) - Booking deletion
 * - find({}) - All bookings (admin view)
 */
async function createBookingsIndexes() {
  console.log('📊 Creating indexes for bookings collection...');
  
  const collection = await getCollection('bookings');
  
  // Primary booking ID index
  await createIndexSafely(collection, { id: 1 }, { unique: true }, 'Created unique index on id field');
  
  // User bookings by date range - most critical for performance
  await createIndexSafely(collection, { user: 1, id: 1 }, {}, 'Created compound index on user and id fields');
  
  // Date-based availability queries
  await createIndexSafely(collection, { date: 1 }, {}, 'Created index on date field');
  
  // Compound index for date range queries with user filtering
  await createIndexSafely(collection, { date: 1, user: 1 }, {}, 'Created compound index on date and user fields');
  
  // Index for booking time slots (if you add time-based queries)
  await createIndexSafely(collection, { start: 1, end: 1 }, {}, 'Created compound index on start and end time fields');
  
  // Index for number of people (capacity queries)
  await createIndexSafely(collection, { npeople: 1 }, {}, 'Created index on npeople field');
}

/**
 * Settings Collection Indexes
 * 
 * Query patterns identified:
 * - findOne({ key: setting }) - Setting lookups
 * - updateOne({ key: setting }) - Setting updates
 */
async function createSettingsIndexes() {
  console.log('📊 Creating indexes for settings collection...');
  
  const collection = await getCollection('settings');
  
  // Primary key index for settings
  await createIndexSafely(collection, { key: 1 }, { unique: true }, 'Created unique index on key field');
  
  // Index for setting type queries (if you add type field)
  await createIndexSafely(collection, { type: 1 }, { sparse: true }, 'Created sparse index on type field');
}

/**
 * Password Reset Tokens Collection Indexes
 * 
 * Query patterns identified:
 * - findOne({ token, used: false, expiresAt: { $gt: new Date() } }) - Token validation
 * - updateOne({ token }) - Token updates
 * - deleteMany({ expiresAt: { $lt: new Date() } }) - Cleanup expired tokens
 */
async function createPasswordResetTokensIndexes() {
  console.log('📊 Creating indexes for password_reset_tokens collection...');
  
  const collection = await getCollection('password_reset_tokens');
  
  // Primary token index
  await createIndexSafely(collection, { token: 1 }, { unique: true }, 'Created unique index on token field');
  
  // Compound index for token validation queries (most critical)
  await createIndexSafely(collection, { token: 1, used: 1, expiresAt: 1 }, {}, 'Created compound index on token, used, and expiresAt fields');
  
  // Index for cleanup operations
  await createIndexSafely(collection, { expiresAt: 1 }, {}, 'Created index on expiresAt field');
  
  // Index for email-based token lookups
  await createIndexSafely(collection, { email: 1 }, {}, 'Created index on email field');
  
}

/**
 * Index Management Functions
 */
export async function listAllIndexes() {
  console.log('📋 Listing all indexes...');
  
  const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
  
  for (const collectionName of collections) {
    const collection = await getCollection(collectionName);
    const indexes = await collection.indexes();
    console.log(`\n📊 ${collectionName} collection indexes:`);
    indexes.forEach(index => {
      console.log(`  - ${index.name}: ${JSON.stringify(index.key)}`);
    });
  }
}

export async function dropAllIndexes() {
  console.log('🗑️ Dropping all indexes (except _id)...');
  
  const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
  
  for (const collectionName of collections) {
    const collection = await getCollection(collectionName);
    const indexes = await collection.indexes();
    
    for (const index of indexes) {
      if (index.name !== '_id_') {
        await collection.dropIndex(index.name);
        console.log(`  ✅ Dropped index ${index.name} from ${collectionName}`);
      }
    }
  }
}

/**
 * Index Usage Statistics
 */
export async function getIndexStats() {
  console.log('📈 Getting index usage statistics...');
  
  const collections = ['users', 'bookings', 'settings', 'password_reset_tokens'];
  
  for (const collectionName of collections) {
    const collection = await getCollection(collectionName);
    const stats = await collection.aggregate([
      { $indexStats: {} }
    ]).toArray();
    
    console.log(`\n📊 ${collectionName} collection index stats:`);
    stats.forEach(stat => {
      console.log(`  - ${stat.name}: ${stat.accesses.ops} operations`);
    });
  }
}

// Export the main function for easy execution
export default createAllIndexes;
