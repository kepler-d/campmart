require('dotenv').config();
const { getDb, Profile } = require('./db');
const mongoose = require('mongoose');

getDb().then(async () => {
  try {
    try {
      await mongoose.connection.collection('profiles').dropIndex('id_1');
    } catch (e) {
      console.log('Index drop ignored if it does not exist');
    }
    
    await Profile.updateOne(
      { email: 'student@university.edu' },
      { $set: { password: 'password123', isVerified: true, id: 100 } },
      { upsert: true }
    );
    await Profile.updateOne(
      { email: 'hardik@university.edu' },
      { $set: { password: 'password123', isVerified: true, name: 'Hardik', isAdmin: true, id: 101 } },
      { upsert: true }
    );
    console.log('Fixed demo users in MongoDB');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
