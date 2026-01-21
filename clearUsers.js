require('dotenv').config();
const mongoose = require('mongoose');

async function clearUsers() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Get all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('\nAvailable collections:', collections.map(c => c.name).join(', '));

    // Delete all users
    const User = mongoose.connection.collection('users');
    const result = await User.deleteMany({});
    console.log(`\n🗑️  Deleted ${result.deletedCount} users`);

    // Optionally clear other collections
    const Visitor = mongoose.connection.collection('visitors');
    const visitorResult = await Visitor.deleteMany({});
    console.log(`🗑️  Deleted ${visitorResult.deletedCount} visitors`);

    const Notification = mongoose.connection.collection('notifications');
    const notifResult = await Notification.deleteMany({});
    console.log(`🗑️  Deleted ${notifResult.deletedCount} notifications`);

    console.log('\n✅ Database cleared successfully!');
    
    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

clearUsers();
