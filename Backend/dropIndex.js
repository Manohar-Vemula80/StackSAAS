require('dotenv').config();
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    
    // Drop the problematic index
    try {
      await mongoose.connection.collection('users').dropIndex('googleId_1');
      console.log("✅ Dropped googleId_1 index");
    } catch (err) {
      console.log("Index doesn't exist or already dropped:", err.message);
    }

    // Close connection
    await mongoose.connection.close();
    console.log("✅ Done! You can now register users.");
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Error:", err);
    process.exit(1);
  });
