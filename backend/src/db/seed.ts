import mongoose from 'mongoose';
import { randomUUID } from 'node:crypto';
import { ADMIN_EMAIL, ADMIN_PASSWORD } from '../config/index.js';
import { hashPassword, verifyPassword } from '../middlewares/security.middleware.js';
import { nowIso } from '../services/booking.service.js';
import { UserModel } from '../models/user.model.js';
import { VehicleModel } from '../models/vehicle.model.js';
import { CouponModel } from '../models/coupon.model.js';
import { BookingModel } from '../models/booking.model.js';

export const SEED_VEHICLES: any[] = [
  {
    id: "v-swift",
    title: "Swift",
    subtitle: "Nimble city hatch — the everyday Goa mule.",
    reg_no: "GA01-SW-2001",
    category: "Hatchback",
    fuel_type: "Petrol",
    transmission: "Manual & Automatic",
    seating: 5,
    self_drive_rate: 1200,
    rate_manual: 1200,
    rate_auto: 1400,
    daily_rate_manual: 1200,
    daily_rate_automatic: 1400,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 2200,
    airport_rate: 1200,
    status: "Available",
    image_url: "/vehicles/hero_swift_front_cutout.png",
    images: [
      "/vehicles/hero_swift_front_cutout.png",
      "/vehicles/maruti_swift_old.webp"
    ],
    description: "Compact, efficient, and easy to maneuver through Goa's vibrant lanes and beach roads."
  },
  {
    id: "v-baleno",
    title: "Baleno",
    subtitle: "One step up from the Swift with extra cabin space.",
    reg_no: "GA02-BL-2002",
    category: "Hatchback",
    fuel_type: "Petrol",
    transmission: "Manual & Automatic",
    seating: 5,
    self_drive_rate: 1300,
    rate_manual: 1300,
    rate_auto: 1500,
    daily_rate_manual: 1300,
    daily_rate_automatic: 1500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 2400,
    airport_rate: 1300,
    status: "Available",
    image_url: "/vehicles/hyundai_i20.webp",
    images: [
      "/vehicles/hyundai_i20.webp",
      "/vehicles/hyundai_grand_i10.webp"
    ],
    description: "Premium hatchback with extra cabin space, supreme comfort, and modern touchscreen cockpit."
  },
  {
    id: "v-ertiga-7seater",
    title: "Ertiga",
    subtitle: "Seven seats, small footprint, dual AC.",
    reg_no: "GA03-ER-1002",
    category: "SUV",
    fuel_type: "Petrol",
    transmission: "Manual & Automatic",
    seating: 7,
    self_drive_rate: 2200,
    rate_manual: 2200,
    rate_auto: 2500,
    daily_rate_manual: 2200,
    daily_rate_automatic: 2500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3000,
    airport_rate: 1600,
    status: "Available",
    image_url: "/vehicles/maruti_ertiga_2022.webp",
    images: [
      "/vehicles/maruti_ertiga_2022.webp",
      "/vehicles/hero_ertiga_cutout.png"
    ],
    description: "Spacious 7-seater MPV with dual AC, perfect for group and family tours across Goa."
  },
  {
    id: "v-kia-carens",
    title: "Kia Carens",
    subtitle: "MPV interior, crossover stance with plush seating.",
    reg_no: "GA04-KC-2004",
    category: "SUV",
    fuel_type: "Petrol",
    transmission: "Manual & Automatic",
    seating: 7,
    self_drive_rate: 2200,
    rate_manual: 2200,
    rate_auto: 2500,
    daily_rate_manual: 2200,
    daily_rate_automatic: 2500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3000,
    airport_rate: 1600,
    status: "Available",
    image_url: "/vehicles/maruti_ertiga_2016.webp",
    images: [
      "/vehicles/maruti_ertiga_2016.webp",
      "/vehicles/hero_ertiga_cutout.png"
    ],
    description: "Modern 7-seater with premium safety features, refined cabin, and commanding road presence."
  },
  {
    id: "v-innova-crysta",
    title: "Innova Crysta",
    subtitle: "The seven-seat executive benchmark.",
    reg_no: "GA01-IN-1003",
    category: "SUV",
    fuel_type: "Diesel",
    transmission: "Manual & Automatic",
    seating: 7,
    self_drive_rate: 3000,
    rate_manual: 3000,
    rate_auto: 3500,
    daily_rate_manual: 3000,
    daily_rate_automatic: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2200,
    status: "Available",
    image_url: "/vehicles/hero_xuv_cutout.png",
    images: [
      "/vehicles/hero_xuv_cutout.png",
      "/vehicles/mahindra_xuv_3xo.webp"
    ],
    description: "Executive luxury MPV with plush captain seating, smooth highway stability, and unmatched legroom."
  },
  {
    id: "v-kia-seltos",
    title: "Kia Seltos",
    subtitle: "Compact SUV, panoramic sunroof & automatic drive.",
    reg_no: "GA05-KS-2006",
    category: "SUV",
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 5,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    daily_rate_manual: 3200,
    daily_rate_automatic: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2000,
    status: "Available",
    image_url: "/vehicles/hero_brezza_cutout.png",
    images: [
      "/vehicles/hero_brezza_cutout.png",
      "/vehicles/maruti_brezza.webp"
    ],
    description: "Bold styling, panoramic sunroof, and ultra-smooth automatic drive for scenic Goa vacations."
  },
  {
    id: "v-hyundai-alcazar",
    title: "Hyundai Alcazar",
    subtitle: "3-row executive SUV with ambient lighting.",
    reg_no: "GA06-HA-2007",
    category: "SUV",
    fuel_type: "Diesel",
    transmission: "Automatic",
    seating: 7,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    daily_rate_manual: 3200,
    daily_rate_automatic: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2000,
    status: "Available",
    image_url: "/vehicles/mahindra_xuv_3xo.webp",
    images: [
      "/vehicles/mahindra_xuv_3xo.webp",
      "/vehicles/hero_xuv_cutout.png"
    ],
    description: "3-row executive SUV equipped with ambient cabin lighting, ventilated seats, and diesel torque."
  },
  {
    id: "v-thar",
    title: "Thar (ST / HT)",
    subtitle: "Convertible soft-top & hard-top — proper 4x4.",
    reg_no: "GA07-TH-2008",
    category: "SUV",
    fuel_type: "Diesel",
    transmission: "Automatic",
    seating: 4,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    daily_rate_manual: 3200,
    daily_rate_automatic: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 4000,
    airport_rate: 2500,
    status: "Available",
    image_url: "/vehicles/hero_thar_front_cutout.png",
    images: [
      "/vehicles/hero_thar_front_cutout.png",
      "/vehicles/hero_thar_cutout.png"
    ],
    description: "Iconic 4x4 convertible off-roader. The ultimate ride to cruise Goa's beaches and coastal trails."
  },
  {
    id: "v-hyundai-creta",
    title: "Hyundai Creta",
    subtitle: "The default premium urban SUV.",
    reg_no: "GA08-HC-2009",
    category: "SUV",
    fuel_type: "Petrol",
    transmission: "Automatic",
    seating: 5,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    daily_rate_manual: 3200,
    daily_rate_automatic: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2000,
    status: "Available",
    image_url: "/vehicles/hero_creta_front_cutout.png",
    images: [
      "/vehicles/hero_creta_front_cutout.png",
      "/vehicles/hyundai_creta.webp"
    ],
    description: "India's favorite mid-size SUV featuring plush seats, superb AC cooling, and smooth automatic transmission."
  },
  {
    id: "v-innova-hycross",
    title: "Innova Hycross",
    subtitle: "Hybrid-petrol, business-class lounge cabin.",
    reg_no: "GA09-IH-2010",
    category: "Luxury",
    fuel_type: "Hybrid Petrol",
    transmission: "Automatic",
    seating: 7,
    self_drive_rate: 4000,
    rate_manual: null,
    rate_auto: 4000,
    daily_rate_manual: 4000,
    daily_rate_automatic: 4000,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 4500,
    airport_rate: 2800,
    status: "Available",
    image_url: "/vehicles/hero_suv_cutout.png",
    images: [
      "/vehicles/hero_suv_cutout.png",
      "/vehicles/maruti_ertiga_2022.webp"
    ],
    description: "Next-gen hybrid luxury MPV with ottoman lounge seating and whisper-quiet electric cruising."
  },
  {
    id: "v-thar-roxx",
    title: "Thar Roxx",
    subtitle: "Five-door Thar — 4x4 plus a proper boot.",
    reg_no: "GA10-TR-2011",
    category: "Luxury",
    fuel_type: "Diesel",
    transmission: "Automatic",
    seating: 5,
    self_drive_rate: 6000,
    rate_manual: null,
    rate_auto: 6000,
    daily_rate_manual: 6000,
    daily_rate_automatic: 6000,
    security_deposit: 5000,
    delivery_fee: 500,
    daily_rate: 6500,
    airport_rate: 3500,
    status: "Available",
    image_url: "/vehicles/hero_thar_cutout.png",
    images: [
      "/vehicles/hero_thar_cutout.png",
      "/vehicles/hero_thar_front_cutout.png"
    ],
    description: "Brand new 5-door Thar Roxx with Harman Kardon audio, white leatherette interior, and true 4x4 grit."
  },
  {
    id: "v-fortuner",
    title: "Fortuner",
    subtitle: "The go-anywhere flagship 4x4.",
    reg_no: "GA11-FT-2012",
    category: "Luxury",
    fuel_type: "Diesel",
    transmission: "Automatic",
    seating: 7,
    self_drive_rate: 6000,
    rate_manual: null,
    rate_auto: 6000,
    daily_rate_manual: 6000,
    daily_rate_automatic: 6000,
    security_deposit: 5000,
    delivery_fee: 500,
    daily_rate: 6500,
    airport_rate: 3500,
    status: "Available",
    image_url: "/vehicles/hero_suv_cutout.png",
    images: [
      "/vehicles/hero_suv_cutout.png",
      "/vehicles/hero_xuv_cutout.png"
    ],
    description: "Flagship 7-seater SUV with commanding presence, 4x4 capability, and maximum passenger comfort."
  },
];

export async function seedInitialData() {
  if (mongoose.connection.readyState !== 1) {
    return;
  }
  // Seed Admin
  const adminEmail = ADMIN_EMAIL.toLowerCase();
  const existingAdmin = await UserModel.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const admin = new UserModel({
      id: randomUUID(),
      email: adminEmail,
      password_hash: hashPassword(ADMIN_PASSWORD),
      name: 'Dasgir Adur',
      role: 'admin',
      created_at: nowIso(),
    });
    await admin.save();
    console.log(`Seeded admin: ${adminEmail}`);
  } else {
    if (!verifyPassword(ADMIN_PASSWORD, existingAdmin.password_hash || '')) {
      existingAdmin.password_hash = hashPassword(ADMIN_PASSWORD);
      await existingAdmin.save();
    }
  }

  // Seed Demo Customer
  const demoEmail = 'demo@cabcastlegoa.com';
  const demoExisting = await UserModel.findOne({ email: demoEmail });
  if (!demoExisting) {
    const demo = new UserModel({
      id: randomUUID(),
      email: demoEmail,
      password_hash: hashPassword('Demo@1234'),
      name: 'Demo Customer',
      phone: '+91 70266 48960',
      role: 'customer',
      created_at: nowIso(),
    });
    await demo.save();
    console.log('Seeded demo customer: demo@cabcastlegoa.com / Demo@1234');
  }

  // Seed / Upsert All Fleet Vehicles
  for (const v of SEED_VEHICLES) {
    const existing = await VehicleModel.findOne({ id: v.id });
    if (!existing) {
      const vehicle = new VehicleModel({
        ...v,
        images: Array.isArray(v.images) && v.images.length > 0 ? v.images : [v.image_url],
        id: v.id || randomUUID(),
        created_at: nowIso(),
      });
      await vehicle.save();
    } else {
      // Synchronize fields so full rates and attributes are present
      await VehicleModel.updateOne(
        { id: v.id },
        {
          $set: {
            title: v.title,
            subtitle: v.subtitle || existing.subtitle,
            category: v.category || existing.category,
            fuel_type: v.fuel_type || existing.fuel_type,
            transmission: v.transmission || existing.transmission,
            seating: v.seating || existing.seating,
            self_drive_rate: v.self_drive_rate || existing.self_drive_rate || 1500,
            rate_manual: v.rate_manual !== undefined ? v.rate_manual : existing.rate_manual,
            rate_auto: v.rate_auto !== undefined ? v.rate_auto : existing.rate_auto,
            daily_rate: v.daily_rate || existing.daily_rate || 2500,
            airport_rate: v.airport_rate || existing.airport_rate || 1500,
            security_deposit: v.security_deposit !== undefined ? v.security_deposit : existing.security_deposit,
            delivery_fee: v.delivery_fee !== undefined ? v.delivery_fee : 500,
            image_url: v.image_url || existing.image_url,
            images: Array.isArray(v.images) && v.images.length > 0 ? v.images : (existing.images || [v.image_url]),
            description: v.description || existing.description,
          }
        }
      );
    }
  }
  console.log(`Seeded / Synced ${SEED_VEHICLES.length} vehicles.`);

  // Seed Coupons
  const couponCount = await CouponModel.countDocuments({});
  if (couponCount === 0) {
    const exp180 = new Date(Date.now() + 180 * 86400000).toISOString();
    const exp90 = new Date(Date.now() + 90 * 86400000).toISOString();
    const seedCoupons = [
      { id: randomUUID(), code: 'CASTLE10', type: 'Percentage', value: 10, min_amount: 2000, expiry: exp180, active: true, created_at: nowIso() },
      { id: randomUUID(), code: 'FLAT500', type: 'Fixed', value: 500, min_amount: 5000, expiry: exp90, active: true, created_at: nowIso() },
    ];
    for (const c of seedCoupons) {
      const coupon = new CouponModel(c);
      await coupon.save();
    }
    console.log('Seeded promo coupons.');
  }
}
