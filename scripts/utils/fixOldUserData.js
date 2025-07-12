// Usage: node scripts/utils/fixOldUserData.js
const mongoose = require('mongoose');
const User = require('../../src/models/User');
const dbConnect = require('../../src/lib/db').default;

(async () => {
  await dbConnect();
  const users = await User.find({});
  let fixed = 0;
  for (const user of users) {
    let changed = false;
    ['availability', 'skillsOffered', 'skillsWanted'].forEach(field => {
      if (typeof user[field] === 'string') {
        user[field] = user[field].split(',').map(s => s.trim()).filter(Boolean);
        changed = true;
      }
    });
    if (changed) {
      await user.save();
      fixed++;
    }
  }
  console.log(`Fixed ${fixed} users with old/bad data.`);
  process.exit(0);
})(); 