require('dotenv').config();
const { getDb, MessageThread } = require('./db');

getDb().then(async () => {
  try {
    // Find threads with the generated but incorrect email
    const result = await MessageThread.updateMany(
      { participants: 'kepler@indoreinstitute.com' },
      { $set: { "participants.$": "hardik.derashricse2023@indoreinstitute.com" } }
    );
    console.log(`Updated ${result.modifiedCount} message threads.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
