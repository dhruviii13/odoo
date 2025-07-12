const mongoose = require('mongoose');
const path = require('path');
const { generateUsers, generateSwaps, generateFeedback, generateAdminMessage } = require('./utils/seedUtils');

// Import models
const User = require(path.join(__dirname, '../src/models/User'));
const Swap = require(path.join(__dirname, '../src/models/Swap'));
const Feedback = require(path.join(__dirname, '../src/models/Feedback'));
const GlobalNotice = require(path.join(__dirname, '../src/models/GlobalNotice'));

// Use the same DB config as /src/lib/db.js
const { default: connectDB } = require(path.join(__dirname, '../src/lib/db'));

async function main() {
  try {
    await connectDB();
    console.log('Connected to MongoDB');

    // Clear collections
    await Promise.all([
      User.deleteMany({}),
      Swap.deleteMany({}),
      Feedback.deleteMany({}),
      GlobalNotice.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Seed users
    const users = await generateUsers(User);
    console.log(`Inserted ${users.length} users`);

    // Seed swaps
    const swaps = await generateSwaps(Swap, users);
    console.log(`Inserted ${swaps.length} swaps`);

    // Seed feedback
    const feedbacks = await generateFeedback(Feedback, swaps);
    console.log(`Inserted ${feedbacks.length} feedback entries`);

    // Seed admin message
    const adminMsg = await generateAdminMessage(GlobalNotice);
    console.log('Inserted admin broadcast message');

    console.log('Seeding complete!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding failed:', err);
    process.exit(1);
  }
}

main(); 