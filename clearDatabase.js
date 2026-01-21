require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./server/models/User');
const Visitor = require('./server/models/Visitor');
const Notification = require('./server/models/Notification');

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Delete all users with admin role
    const adminResult = await User.deleteMany({ role: 'admin' });
    console.log(`🗑️  Deleted ${adminResult.deletedCount} admin users`);

    // Delete all users
    const userResult = await User.deleteMany({});
    console.log(`🗑️  Deleted ${userResult.deletedCount} total users`);

    // Delete all visitors
    const visitorResult = await Visitor.deleteMany({});
    console.log(`🗑️  Deleted ${visitorResult.deletedCount} visitors`);

    // Delete all notifications
    const notificationResult = await Notification.deleteMany({});
    console.log(`🗑️  Deleted ${notificationResult.deletedCount} notifications`);

    console.log('✅ Database cleared successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

clearDatabase();
