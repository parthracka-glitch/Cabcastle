import path from 'path';
import dotenv from 'dotenv';

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../backend/.env') });

export const PORT = parseInt(process.env.PORT || '8000', 10);
export const MONGO_URL = process.env.MONGO_URL || 'mongodb://127.0.0.1:27017/coastal_cabs_goa';
export const DB_NAME = process.env.DB_NAME || 'coastal_cabs_goa';
export const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_coastal_cabs_goa_prod_2026';
export const JWT_ALGO = 'HS256';

export const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'dasgiradur@gmail.com';
export const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';

export const EMAIL_BASE_URL = process.env.EMAIL_BASE_URL || '';
export const EMAIL_KEY = process.env.EMAIL_KEY || '';
export const EMAIL_FROM_NAME = process.env.EMAIL_FROM_NAME || 'Cab Castle Goa';

export const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY || '';
export const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET || '';
export const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME || '';

export const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '';
export const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export const AIRPORT_SURCHARGE = 1000.0;
export const TAX_RATE = 0.0;
export const ADDON_PRICING = {
  helmet_per_unit: 100,
  infant_seat_flat: 300,
};
