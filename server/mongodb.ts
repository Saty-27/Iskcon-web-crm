/**
 * MongoDB Connection Module
 */

import { MongoClient, Db } from 'mongodb';

// Connection URL
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/iskconjuhu';

// MongoDB client
let client: MongoClient;
let db: Db;

/**
 * Connect to MongoDB
 * @returns MongoDB connection client and database
 */
export async function connectToMongoDB() {
  if (!client) {
    client = new MongoClient(uri);
    await client.connect();
    
    // Get database name from URI
    const dbName = uri.split('/').pop()?.split('?')[0] || 'iskconjuhu';
    db = client.db(dbName);
    
    console.log(`Connected to MongoDB database: ${dbName}`);
  }
  
  return { client, db };
}

/**
 * Get MongoDB database connection
 * @returns MongoDB database or null if not connected
 */
export function getDb() {
  if (!db) {
    throw new Error('MongoDB not connected. Call connectToMongoDB() first.');
  }
  return db;
}

/**
 * Close MongoDB connection
 */
export async function closeMongoConnection() {
  if (client) {
    await client.close();
    console.log('MongoDB connection closed');
  }
}

// Ensure MongoDB connection is closed on application shutdown
process.on('SIGINT', async () => {
  await closeMongoConnection();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await closeMongoConnection();
  process.exit(0);
});