const { MongoClient } = require('mongodb');
require('dotenv').config();

// Use the connection string from your .env file
const url = process.env.MONGODB_URL || 'mongodb+srv://admin:password123**@finance-app.ilbngw2.mongodb.net/?retryWrites=true&w=majority&appName=Finance-app';

console.log('Testing MongoDB connection...');
console.log('Connection URL:', url.replace(/password123\*\*/g, 'password123[HIDDEN]'));

async function testConnection() {
  const client = new MongoClient(url, {
    serverSelectionTimeoutMS: 10000, // 10 seconds
    connectTimeoutMS: 10000,
    socketTimeoutMS: 10000,
  });
  
  try {
    console.log('\n🔄 Attempting to connect to MongoDB Atlas...');
    await client.connect();
    console.log('✅ Connected successfully to MongoDB Atlas!');
    
    // Test database access
    console.log('\n🔄 Testing database access...');
    const db = client.db('Finance-app');
    
    // Try to ping the database
    await db.admin().ping();
    console.log('✅ Database ping successful!');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('\n📋 Available collections:');
    if (collections.length === 0) {
      console.log('  No collections found (this is normal for a new database)');
    } else {
      collections.forEach(collection => {
        console.log(`  - ${collection.name}`);
      });
    }
    
    // Test a simple query on Users collection
    console.log('\n🔄 Testing Users collection...');
    const users = await db.collection('Users').countDocuments();
    console.log(`✅ Users collection has ${users} documents`);
    
  } catch (error) {
    console.error('\n❌ MongoDB connection failed:');
    console.error('Error type:', error.constructor.name);
    console.error('Error message:', error.message);
    
    if (error.message.includes('authentication failed')) {
      console.error('\n💡 This looks like a username/password issue.');
      console.error('   Check your MongoDB Atlas database user credentials.');
    } else if (error.message.includes('not authorized') || error.message.includes('IP')) {
      console.error('\n💡 This looks like a network access issue.');
      console.error('   Check your MongoDB Atlas Network Access settings.');
      console.error('   Make sure your IP address is whitelisted.');
    } else if (error.message.includes('ReplicaSetNoPrimary')) {
      console.error('\n💡 This looks like a cluster availability issue.');
      console.error('   Your MongoDB Atlas cluster might be paused or having issues.');
      console.error('   Check your Atlas dashboard.');
    } else if (error.message.includes('serverSelectionTimeoutMS')) {
      console.error('\n💡 This looks like a connectivity issue.');
      console.error('   Check your internet connection and MongoDB Atlas status.');
    }
    
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Check MongoDB Atlas dashboard - is your cluster running?');
    console.error('2. Verify Network Access - is your IP whitelisted?');
    console.error('3. Check database user credentials');
    console.error('4. Ensure cluster is not paused (free tier auto-pauses)');
    
  } finally {
    try {
      await client.close();
      console.log('\n🔒 Connection closed.');
    } catch (closeError) {
      console.error('Error closing connection:', closeError.message);
    }
  }
}

// Run the test
testConnection().catch(console.error);