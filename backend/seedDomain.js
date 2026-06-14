require('dotenv').config();
const mongoose = require('mongoose');
const { AllowedDomain } = require('./db');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    await AllowedDomain.findOneAndUpdate(
      { domain: '@indoreinstitute.com' },
      { domain: '@indoreinstitute.com', institutionName: 'Indore Institute' },
      { upsert: true }
    );
    console.log("Domain seeded successfully");
  } catch (err) {
    console.error(err);
  } finally {
    process.exit(0);
  }
});
