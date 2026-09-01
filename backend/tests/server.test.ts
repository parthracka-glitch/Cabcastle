import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, seedInitialData } from '../src/server.js';
import { connectDB } from '../src/db/connection.js';
import { VehicleModel } from '../src/models/vehicle.model.js';
import { BookingModel } from '../src/models/booking.model.js';

describe('Coastal Cabs Goa Express Backend Test Suite', () => {
  let mongod: MongoMemoryServer | null = null;
  let adminToken = '';
  let customerToken = '';
  let sampleVehicleId = '';
  let createdBookingId = '';
  let createdCouponId = '';
  let createdEnquiryId = '';

  beforeAll(async () => {
    try {
      let conn = await connectDB();
      if (!conn || mongoose.connection.readyState !== 1) {
        console.log('Local MongoDB not reachable, initiating MongoMemoryServer for CI/testing...');
        mongod = await MongoMemoryServer.create();
        const uri = mongod.getUri();
        conn = await mongoose.connect(uri, { dbName: 'coastal_cabs_goa_test' });
      }
      if (conn) {
        await seedInitialData();
      }
    } catch (err) {
      console.error('Test database setup error:', err);
    }
  }, 30000);

  afterAll(async () => {
    try {
      if (mongoose.connection.readyState === 1) {
        await VehicleModel.deleteMany({ title: { $regex: 'test', $options: 'i' } });
        if (createdBookingId) {
          await BookingModel.deleteOne({ id: createdBookingId });
        }
        await mongoose.disconnect();
      }
      if (mongod) {
        await mongod.stop();
      }
    } catch {}
  });

  describe('1. Health Check Endpoints', () => {
    it('GET / should return online status', async () => {
      const res = await request(app).get('/');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('online');
      expect(res.body.service).toContain('Cab Castle Goa');
    });

    it('GET /api/ should return ok', async () => {
      const res = await request(app).get('/api/');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('ok');
    });

    it('GET /api/healthz should return healthy status', async () => {
      const res = await request(app).get('/api/healthz');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
    });
  });

  describe('2. Authentication Flow', () => {
    it('POST /api/auth/login with admin credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'dasgiradur@gmail.com',
        password: 'Admin@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('admin');
      adminToken = res.body.token;
    });

    it('POST /api/auth/register a new customer', async () => {
      const uniqueEmail = `testcust_${Date.now()}@example.com`;
      const res = await request(app).post('/api/auth/register').send({
        name: 'Test Customer',
        phone: '9876543210',
        email: uniqueEmail,
        password: 'Password@123',
      });
      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(res.body.user.role).toBe('customer');
      customerToken = res.body.token;
    });

    it('GET /api/auth/me with Bearer token', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.email).toBe('dasgiradur@gmail.com');
    });

    it('GET /api/auth/me without token should return 401', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.status).toBe(401);
    });

    it('POST /api/auth/logout should clear session', async () => {
      const res = await request(app).post('/api/auth/logout');
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('3. Vehicles Operations', () => {
    it('GET /api/vehicles should return seeded fleet catalog', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body.length).toBeGreaterThan(0);
      sampleVehicleId = res.body[0].id;
    });

    it('GET /api/vehicles/:id should return single vehicle', async () => {
      const res = await request(app).get(`/api/vehicles/${sampleVehicleId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(sampleVehicleId);
    });

    it('POST /api/admin/vehicles should allow admin to create a new vehicle', async () => {
      const res = await request(app)
        .post('/api/admin/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test Convertible SUV',
          reg_no: `GA09-TEST-${Date.now().toString().slice(-4)}`,
          category: 'Thar 4x4',
          fuel_type: 'Petrol',
          transmission: 'Automatic',
          seating: 4,
          daily_rate: 4500,
          security_deposit: 10000,
          image_url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70',
          status: 'Available',
          description: 'Test vehicle created via integration test',
        });
      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
    });

    it('PUT /api/admin/vehicles/:id should allow admin to update an existing vehicle', async () => {
      const res = await request(app)
        .put(`/api/admin/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Updated Mahindra Thar 4x4',
          daily_rate: 3200,
          daily_rate_manual: 3200,
          daily_rate_automatic: 3600,
          transmission: 'Manual & Automatic',
        });
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(sampleVehicleId);
      expect(res.body.title).toBe('Updated Mahindra Thar 4x4');
      expect(res.body.daily_rate).toBe(3200);
    });

    it('PUT /api/admin/vehicles/:id should update image gallery and persist image deletion', async () => {
      const newImages = [
        'https://images.unsplash.com/photo-new-photo-1',
        'https://images.unsplash.com/photo-new-photo-2',
      ];
      const res = await request(app)
        .put(`/api/admin/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: newImages,
        });
      expect(res.status).toBe(200);
      expect(res.body.images).toEqual(newImages);
      expect(res.body.image_url).toBe(newImages[0]);
    });

    it('PATCH /api/admin/vehicles/:id should allow partial status and transmission updates', async () => {
      const resStatus = await request(app)
        .patch(`/api/admin/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          status: 'Maintenance',
        });
      expect(resStatus.status).toBe(200);
      expect(resStatus.body.status).toBe('Maintenance');

      const resTrans = await request(app)
        .patch(`/api/admin/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          transmission: 'Manual & Automatic',
        });
      expect(resTrans.status).toBe(200);
      expect(resTrans.body.transmission).toBe('Manual & Automatic');
    });

    it('PUT /api/admin/vehicles/:id should handle gallery clearing with fallback placeholder', async () => {
      const res = await request(app)
        .put(`/api/admin/vehicles/${sampleVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          images: [],
        });
      expect(res.status).toBe(200);
      expect(res.body.images.length).toBeGreaterThan(0);
      expect(res.body.image_url).toBeDefined();
    });
  });

  describe('4. Bookings & Payments Operations', () => {
    it('POST /api/bookings/quote should calculate rental fare breakdown', async () => {
      const start = new Date(Date.now() + 86400000).toISOString();
      const end = new Date(Date.now() + 3 * 86400000).toISOString();

      const res = await request(app)
        .post('/api/bookings/quote')
        .send({
          vehicle_id: sampleVehicleId,
          start_date: start,
          end_date: end,
          add_ons: { helmets: 2, infant_seat: true, airport_pickup: true },
          airport_pickup: true,
          coupon_code: 'CASTLE10',
        });
      expect(res.status).toBe(200);
      expect(res.body.days).toBeGreaterThanOrEqual(1);
      expect(res.body.total_amount).toBeGreaterThan(0);
    });

    it('POST /api/bookings should create a new online booking', async () => {
      const offsetDays = 200 + Math.floor(Math.random() * 50000);
      const start = new Date(Date.now() + offsetDays * 86400000).toISOString();
      const end = new Date(Date.now() + (offsetDays + 2) * 86400000).toISOString();

      const res = await request(app)
        .post('/api/bookings')
        .send({
          vehicle_id: sampleVehicleId,
          customer: {
            name: 'John Doe Test',
            phone: '9876543210',
            email: 'johndoe@example.com',
          },
          start_date: start,
          end_date: end,
          pickup_location: 'Candolim (Main Hub)',
          airport_pickup: false,
          add_ons: { helmets: 1, infant_seat: false, airport_pickup: false },
        });

      expect(res.status).toBe(200);
      expect(res.body.id).toBeDefined();
      expect(res.body.booking_no).toMatch(/^DHG-/);
      createdBookingId = res.body.id;
    });

    it('GET /api/bookings/:id should retrieve created booking', async () => {
      const res = await request(app).get(`/api/bookings/${createdBookingId}`);
      expect(res.status).toBe(200);
      expect(res.body.id).toBe(createdBookingId);
    });

    it('POST /api/payments/create-order should create mock Razorpay order', async () => {
      const res = await request(app)
        .post('/api/payments/create-order')
        .send({ booking_id: createdBookingId });
      expect(res.status).toBe(200);
      expect(res.body.order_id).toMatch(/^order_mock_/);
      expect(res.body.currency).toBe('INR');
    });

    it('POST /api/payments/verify should process mock payment', async () => {
      const res = await request(app)
        .post('/api/payments/verify')
        .send({
          booking_id: createdBookingId,
          razorpay_order_id: 'order_mock_12345',
          razorpay_payment_id: 'pay_mock_67890',
          razorpay_signature: 'sig_mock_abcde',
        });
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
      expect(res.body.booking.payment_status).toBe('Paid');
    });

    it('GET /api/bookings/:id/invoice?fmt=pdf should stream PDF invoice', async () => {
      const res = await request(app).get(`/api/bookings/${createdBookingId}/invoice?fmt=pdf`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/pdf');
    });

    it('GET /api/bookings/:id/invoice?fmt=html should return HTML receipt', async () => {
      const res = await request(app)
        .get(`/api/bookings/${createdBookingId}/invoice?fmt=html`)
        .set('Accept', 'text/html');
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/html');
      expect(res.text).toContain('Cab Castle Goa');
    });
  });

  describe('5. Coupons Operations', () => {
    it('POST /api/coupons/validate should validate CASTLE10 promo', async () => {
      const res = await request(app).post('/api/coupons/validate').send({
        code: 'CASTLE10',
        amount: 3000,
      });
      expect(res.status).toBe(200);
      expect(res.body.code).toBe('CASTLE10');
      expect(res.body.discount).toBe(300);
    });

    it('POST /api/admin/coupons should create new coupon', async () => {
      const expDate = new Date(Date.now() + 30 * 86400000).toISOString();
      const code = `TEST${Date.now().toString().slice(-4)}`;
      const res = await request(app)
        .post('/api/admin/coupons')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          code,
          type: 'Fixed',
          value: 200,
          min_amount: 1000,
          expiry: expDate,
          active: true,
        });
      expect(res.status).toBe(200);
      expect(res.body.code).toBe(code);
      createdCouponId = res.body.id;
    });

    it('DELETE /api/admin/coupons/:id should delete coupon', async () => {
      const res = await request(app)
        .delete(`/api/admin/coupons/${createdCouponId}`)
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.ok).toBe(true);
    });
  });

  describe('6. Admin CRM Enquiries & Analytics', () => {
    it('POST /api/admin/enquiries should record new lead enquiry', async () => {
      const res = await request(app)
        .post('/api/admin/enquiries')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          customer_name: 'Lead Customer',
          phone: '9811122233',
          email: 'lead@example.com',
          city: 'Mumbai',
          car_model_interested: 'Mahindra Thar 4x4',
          source: 'Instagram',
          status: 'New',
          notes: 'Wants to book for 4 days in North Goa',
        });
      expect(res.status).toBe(200);
      expect(res.body.enquiry_no).toMatch(/^ENQ-/);
      createdEnquiryId = res.body.id;
    });

    it('GET /api/admin/enquiries should return analytics & item list', async () => {
      const res = await request(app)
        .get('/api/admin/enquiries')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.items).toBeDefined();
      expect(res.body.total_enquiries).toBeGreaterThan(0);
      expect(res.body.city_analytics).toBeDefined();
    });

    it('GET /api/admin/export/enquiries/excel should return formatted Excel file', async () => {
      const res = await request(app)
        .get('/api/admin/export/enquiries/excel')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });

    it('GET /api/admin/analytics should return business executive metrics', async () => {
      const res = await request(app)
        .get('/api/admin/analytics')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.total_revenue).toBeDefined();
      expect(res.body.fleet_utilization_pct).toBeDefined();
      expect(res.body.monthly_revenue).toBeDefined();
    });

    it('GET /api/admin/export/excel should return bookings Excel file', async () => {
      const res = await request(app)
        .get('/api/admin/export/excel')
        .set('Authorization', `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toBe('application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    });
  });
});
