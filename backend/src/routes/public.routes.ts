import { Router, Request, Response } from 'express';
import mongoose from 'mongoose';

export const publicRouter = Router();

const STATIC_REVIEWS = [
  {
    name: 'Priya Sharma',
    avatar: 'https://i.pravatar.cc/100?img=47',
    rating: 5,
    text: 'Excellent service! Thar was in top shape and delivered right at Dabolim Airport. Highly recommended.',
    date: '2 weeks ago',
  },
  {
    name: 'Rohan Iyer',
    avatar: 'https://i.pravatar.cc/100?img=12',
    rating: 5,
    text: 'Booked a Fortuner for 5 days — smooth pickup at Candolim, very transparent pricing.',
    date: '1 month ago',
  },
  {
    name: 'Emma Wilson',
    avatar: 'https://i.pravatar.cc/100?img=32',
    rating: 5,
    text: 'Loved the convertible! Perfect for a Goa road trip. Team was super helpful with the itinerary too.',
    date: '3 weeks ago',
  },
  {
    name: 'Aditya Nair',
    avatar: 'https://i.pravatar.cc/100?img=15',
    rating: 4,
    text: 'Clean cars, easy documentation. Airport delivery was worth every rupee.',
    date: '2 months ago',
  },
  {
    name: 'Sana Kapoor',
    avatar: 'https://i.pravatar.cc/100?img=45',
    rating: 5,
    text: 'Best rental experience in Goa. Loved the honesty on the security deposit refund.',
    date: '5 days ago',
  },
  {
    name: 'Marco Bianchi',
    avatar: 'https://i.pravatar.cc/100?img=8',
    rating: 5,
    text: 'Drove around North Goa in a Thar 4x4. Zero hassles. Would rent again on next visit.',
    date: '1 week ago',
  },
];

publicRouter.get('/reviews', (_req: Request, res: Response) => {
  return res.json(STATIC_REVIEWS);
});

publicRouter.get('/locations', (_req: Request, res: Response) => {
  return res.json({
    free_hubs: ['Candolim (Main Hub)', 'Calangute', 'Baga'],
    airports: ['Dabolim Airport (GOI)', 'Mopa Airport (GOX)'],
    airport_surcharge_min: 800,
    airport_surcharge_max: 1200,
  });
});

publicRouter.get('/trip-planner', (_req: Request, res: Response) => {
  return res.json([
    {
      id: '1d-north',
      title: '1 Day · North Goa Coastline & Fort Loop',
      duration: '1 Day',
      region: 'North Goa',
      recommended_vehicle: 'Hatchback',
      est_distance: '45 km total drive',
      est_drive_time: '1.5 hours driving',
      best_for: 'Beach Lovers & Sunset Seekers',
      highlights: ['Fort Aguada Lighthouse', 'Fontainhas Latin Quarter', 'Chapora Fort Sunset', 'Vagator Beach Cafes'],
      image:
        'https://images.pexels.com/photos/28520254/pexels-photo-28520254.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      itinerary: [
        { time: '09:00 AM', spot: 'Pick up car at Candolim / Calangute Hub' },
        { time: '10:30 AM', spot: 'Explore historic Fort Aguada & Lighthouse overlooking the Arabian Sea' },
        { time: '01:00 PM', spot: 'Lunch at Assagao — Goan Fish Thali at Gunpowder or Vinayak' },
        { time: '04:30 PM', spot: 'Drive to Chapora Fort (Dil Chahta Hai point) for iconic 360° views' },
        { time: '06:15 PM', spot: 'Sunset cocktails at Vagator Cliffside / Thalassa' },
      ],
      tips: 'Narrow lanes near Assagao — compact hatchbacks like Swift or Baleno are super easy to park.',
    },
    {
      id: '3d-south',
      title: '3 Days · South Goa Cliffside & Serene Beaches',
      duration: '3 Days',
      region: 'South Goa',
      recommended_vehicle: 'Thar 4x4',
      est_distance: '120 km total drive',
      est_drive_time: '3 hours total driving',
      best_for: 'Couples, Nature & Off-road Exploration',
      highlights: ['Cabo de Rama Fort & Cliff', 'Palolem Curved Bay', 'Agonda Peaceful Beach', 'Sal River Boat Cruise'],
      image:
        'https://images.pexels.com/photos/6239334/pexels-photo-6239334.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      itinerary: [
        { time: 'Day 1', spot: 'Candolim to Cabo de Rama Cliff & Secret Beach — Sunset overlooking ocean' },
        { time: 'Day 2', spot: 'Palolem Kayaking & Butterfly Beach Boat Ride — Fresh Seafood dinner at Agonda' },
        { time: 'Day 3', spot: 'Sal River backwaters drive, Cola Beach lagoon dip & return drive' },
      ],
      tips: 'South Goa roads have scenic coastal curves — Thar 4x4 or Creta SUV provides ultimate ground clearance.',
    },
    {
      id: '5d-full',
      title: '5 Days · Ultimate North + South + Dudhsagar Cascades',
      duration: '5 Days',
      region: 'Complete Goa (North + South + Hinterlands)',
      recommended_vehicle: 'SUV',
      est_distance: '260 km total drive',
      est_drive_time: '6 hours total driving',
      best_for: 'Complete Goa Experience with Family or Group',
      highlights: [
        'Dudhsagar Waterfalls',
        'Old Goa Basilica',
        'Divar Island Ferry Drive',
        'Panjim River Cruise',
        'Morjim Turtle Beach',
      ],
      image:
        'https://images.pexels.com/photos/8975647/pexels-photo-8975647.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
      itinerary: [
        { time: 'Day 1', spot: 'North Goa Beaches & Night Markets (Baga, Calangute, Anjuna)' },
        { time: 'Day 2', spot: 'Old Goa World Heritage Churches & Divar Island Ferry car crossing' },
        { time: 'Day 3', spot: 'Jungle Drive to Dudhsagar Waterfall & Tropical Spice Plantation thali' },
        { time: 'Day 4', spot: 'South Goa Coast — Palolem, Cabo de Rama & Agonda cliff views' },
        { time: 'Day 5', spot: 'Souvenir shopping in Panjim Market & Airport Dropoff (Mopa/Dabolim)' },
      ],
      tips: 'Spacious SUV recommended for luggage space when moving between North and South Goa hotels.',
    },
  ]);
});

publicRouter.get('/', (_req: Request, res: Response) => {
  return res.json({ status: 'ok', app: 'Cab Castle Goa' });
});

const healthHandler = (_req: Request, res: Response) => {
  const dbConnected = mongoose.connection.readyState === 1;
  return res.json({
    ok: dbConnected,
    status: dbConnected ? 'healthy' : 'degraded',
    database: dbConnected ? 'connected' : 'disconnected',
    service: 'cab-castle-goa-backend',
    version: '2.0.0',
    uptime_seconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
};

publicRouter.get('/healthz', healthHandler);
publicRouter.get('/health', healthHandler);
