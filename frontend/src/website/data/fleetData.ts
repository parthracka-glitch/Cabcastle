export interface VehicleSpec {
  id: string;
  title: string;
  subtitle: string;
  category: "Hatchback" | "SUV" | "Luxury" | "Sedan";
  fuel_type: string;
  seating: number;
  self_drive_rate: number;
  rate_manual: number | null;
  rate_auto: number | null;
  security_deposit: number;
  delivery_fee: number;
  daily_rate: number; // Tour package rate
  airport_rate: number;
  image_url: string;
  images: string[];
  description: string;
}

export const MASTER_FLEET: VehicleSpec[] = [
  {
    id: "v-swift",
    title: "Swift",
    subtitle: "Nimble city hatch — the everyday Goa mule.",
    category: "Hatchback",
    fuel_type: "Petrol",
    seating: 5,
    self_drive_rate: 1200,
    rate_manual: 1200,
    rate_auto: 1400,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 2200,
    airport_rate: 1200,
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
    category: "Hatchback",
    fuel_type: "Petrol",
    seating: 5,
    self_drive_rate: 1300,
    rate_manual: 1300,
    rate_auto: 1500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 2400,
    airport_rate: 1300,
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
    category: "SUV",
    fuel_type: "Petrol",
    seating: 7,
    self_drive_rate: 2200,
    rate_manual: 2200,
    rate_auto: 2500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3000,
    airport_rate: 1600,
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
    category: "SUV",
    fuel_type: "Petrol",
    seating: 7,
    self_drive_rate: 2200,
    rate_manual: 2200,
    rate_auto: 2500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3000,
    airport_rate: 1600,
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
    category: "SUV",
    fuel_type: "Diesel",
    seating: 7,
    self_drive_rate: 3000,
    rate_manual: 3000,
    rate_auto: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2200,
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
    category: "SUV",
    fuel_type: "Petrol",
    seating: 5,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2000,
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
    category: "SUV",
    fuel_type: "Diesel",
    seating: 7,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2000,
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
    category: "SUV",
    fuel_type: "Diesel",
    seating: 4,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 4000,
    airport_rate: 2500,
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
    category: "SUV",
    fuel_type: "Petrol",
    seating: 5,
    self_drive_rate: 3500,
    rate_manual: 3200,
    rate_auto: 3500,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 3500,
    airport_rate: 2000,
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
    category: "Luxury",
    fuel_type: "Hybrid Petrol",
    seating: 7,
    self_drive_rate: 4000,
    rate_manual: null,
    rate_auto: 4000,
    security_deposit: 3000,
    delivery_fee: 500,
    daily_rate: 4500,
    airport_rate: 2800,
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
    category: "Luxury",
    fuel_type: "Diesel",
    seating: 5,
    self_drive_rate: 6000,
    rate_manual: null,
    rate_auto: 6000,
    security_deposit: 5000,
    delivery_fee: 500,
    daily_rate: 6500,
    airport_rate: 3500,
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
    category: "Luxury",
    fuel_type: "Diesel",
    seating: 7,
    self_drive_rate: 6000,
    rate_manual: null,
    rate_auto: 6000,
    security_deposit: 5000,
    delivery_fee: 500,
    daily_rate: 6500,
    airport_rate: 3500,
    image_url: "/vehicles/hero_suv_cutout.png",
    images: [
      "/vehicles/hero_suv_cutout.png",
      "/vehicles/hero_xuv_cutout.png"
    ],
    description: "Flagship 7-seater SUV with commanding presence, 4x4 capability, and maximum passenger comfort."
  },
];
