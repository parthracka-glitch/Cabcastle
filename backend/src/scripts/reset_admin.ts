import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { hashPassword } from '../middlewares/security.middleware.js';

dotenv.config();

async function resetAdmin() {
  const mongoUrl = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/coastal_cabs_goa';
  const dbName = process.env.DB_NAME || 'coastal_cabs_goa';
  const adminEmail = (process.env.ADMIN_EMAIL || 'dasgiradur@gmail.com').toLowerCase().trim();
  const adminPassword = process.env.ADMIN_PASSWORD || 'Admin@123';

  console.log(`Connecting to MongoDB at ${mongoUrl}...`);
  await mongoose.connect(mongoUrl, { dbName });

  const User = mongoose.connection.collection('users');
  const password_hash = hashPassword(adminPassword);

  // Update or insert admin account
  await User.updateOne(
    { role: 'admin' },
    {
      $set: {
        email: adminEmail,
        password_hash,
        role: 'admin',
        name: 'Dasgir Adur',
      },
    },
    { upsert: true }
  );

  console.log('✅ ADMIN USER SUCCESSFULLY UPDATED IN MONGODB ATLAS!');
  console.log(`Email: ${adminEmail}`);
  console.log(`Password: ${adminPassword}`);
  await mongoose.disconnect();
  process.exit(0);
}

resetAdmin().catch((err) => {
  console.error('Failed to reset admin:', err);
  process.exit(1);
});
