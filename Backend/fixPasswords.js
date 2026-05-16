require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./Model/user');
const bcrypt = require('bcrypt');

mongoose.connect(process.env.MONGO_URI)
  .then(async () => {
    console.log("MongoDB connected ✅");
    
    try {
      // Find all users without googleId
      const users = await User.find({ googleId: { $exists: false } });
      console.log(`Found ${users.length} email/password users`);

      for (const user of users) {
        // Check if password is already hashed (bcrypt hashes start with $2a$, $2b$, or $2y$)
        if (user.password && !user.password.startsWith('$2')) {
          console.log(`Re-hashing password for user: ${user.email}`);
          user.password = await bcrypt.hash(user.password, 10);
          await user.save();
          console.log(`✅ Updated ${user.email}`);
        }
      }

      console.log("✅ Done! All passwords are properly hashed.");
    } catch (error) {
      console.error("Error:", error);
    }

    await mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error("❌ Connection error:", err);
    process.exit(1);
  });
