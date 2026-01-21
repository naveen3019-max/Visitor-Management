require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    const User = mongoose.connection.collection('users');
    const users = await User.find({}).toArray();
    
    console.log(`Found ${users.length} user(s) in database:\n`);
    
    users.forEach((user, i) => {
      console.log(`User ${i + 1}:`);
      console.log(`  Username: ${user.username}`);
      console.log(`  Full Name: ${user.fullName}`);
      console.log(`  Role: ${user.role}`);
      console.log(`  Is Approved: ${user.isApproved}`);
      console.log(`  Password Hash: ${user.password?.substring(0, 20)}...`);
      console.log(`  PIN Hash: ${user.pin?.substring(0, 20)}...`);
      console.log('');
    });

    // Test password comparison
    if (users.length > 0) {
      const testUser = users[0];
      console.log('Testing password comparison...');
      console.log('Enter the password you used during registration to test:');
      console.log('(This is just for debugging - the password hash is stored)');
      
      // Example test with common passwords
      const testPasswords = ['admin', 'password', '123456', 'admin123'];
      for (const pwd of testPasswords) {
        const match = await bcrypt.compare(pwd, testUser.password);
        if (match) {
          console.log(`✅ Password "${pwd}" matches!`);
        }
      }
    }

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testLogin();
