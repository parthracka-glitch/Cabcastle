import { connectDB } from './connection.js';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/index.js';
import { UserModel } from '../models/user.model.js';
import { VehicleModel } from '../models/vehicle.model.js';
import { BookingModel } from '../models/booking.model.js';
import { EnquiryModel } from '../models/enquiry.model.js';
import { hashPassword, verifyPassword } from '../middlewares/security.middleware.js';
import { seedInitialData } from './seed.js';

export async function cleanDatabase() {
  const conn = await connectDB();
  if (!conn) {
    console.error('Failed to connect to MongoDB for cleanup.');
    return;
  }

  console.log('🧹 Starting database cleanup...');

  // 1. Delete all bookings
  const deletedBookings = await BookingModel.deleteMany({});
  console.log(`✅ Cleared ${deletedBookings.deletedCount} bookings.`);

  // 2. Delete all enquiries
  const deletedEnquiries = await EnquiryModel.deleteMany({});
  console.log(`✅ Cleared ${deletedEnquiries.deletedCount} customer lead enquiries.`);

  // 3. Delete all non-admin users (keep main admin)
  const adminEmail = ADMIN_EMAIL.toLowerCase();
  const deletedUsers = await UserModel.deleteMany({ email: { $ne: adminEmail } });
  console.log(`✅ Cleared ${deletedUsers.deletedCount} non-admin users.`);

  // 4. Ensure Main Admin user exists
  let admin = await UserModel.findOne({ email: adminEmail });
  if (!admin) {
    await seedInitialData();
    admin = await UserModel.findOne({ email: adminEmail });
  } else {
    if (!verifyPassword(ADMIN_PASSWORD, admin.password_hash || '')) {
      admin.password_hash = hashPassword(ADMIN_PASSWORD);
      await admin.save();
    }
  }
  console.log(`👑 Main Admin Account Intact: ${adminEmail} (Role: ${admin?.role})`);

  // 5. Reset all vehicle statuses to "Available" and verify vehicles exist
  await VehicleModel.updateMany({}, { $set: { status: 'Available' } });
  const vehicleCount = await VehicleModel.countDocuments({});
  if (vehicleCount === 0) {
    console.log('No vehicles found. Re-seeding default vehicle catalog...');
    await seedInitialData();
  }
  const finalVehicleCount = await VehicleModel.countDocuments({});
  console.log(`🚗 Fleet Vehicles Retained: ${finalVehicleCount} cars (Status set to Available).`);

  console.log('\n✨ Database cleanup completed successfully!');
  process.exit(0);
}

if (process.env.NODE_ENV !== 'test') {
  cleanDatabase().catch((err) => {
    console.error('Database cleanup failed:', err);
    process.exit(1);
  });
}
