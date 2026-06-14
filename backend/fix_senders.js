require('dotenv').config();
const { getDb, MessageThread } = require('./db');

getDb().then(async () => {
  try {
    // Find threads with the wrong sender in messages
    const threads = await MessageThread.find({ "messages.sender": "kepler@indoreinstitute.com" });
    let count = 0;
    
    for (let thread of threads) {
      let updated = false;
      for (let msg of thread.messages) {
        if (msg.sender === "kepler@indoreinstitute.com") {
          msg.sender = "hardik.derashricse2023@indoreinstitute.com";
          updated = true;
        }
      }
      if (updated) {
        thread.markModified('messages');
        await thread.save();
        count++;
      }
    }
    
    console.log(`Updated senders in ${count} message threads.`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
});
