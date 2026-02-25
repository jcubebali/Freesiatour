import { Type } from "@google/genai";

export interface Tour {
  id: string;
  title: string;
  location: string;
  price: number;
  rating: number;
  reviews: number;
  image: string;
  duration: string;
  description: string;
  itinerary: string[];
  included: string[];
  excluded: string[];
  lat: number;
  lng: number;
  highlighted?: boolean;
}

export const DESTINATIONS: Tour[] = [
  {
    id: 'uluwatu',
    title: 'Tour Uluwatu',
    location: 'Uluwatu, Bali',
    price: 45,
    rating: 4.8,
    reviews: 120,
    image: 'https://picsum.photos/seed/uluwatu/800/600',
    duration: '8-10 Hours',
    description: 'Hidden behind large carved limestone cliffs that reveal wide views to the Indian Ocean, Pandawa Beach has impressive terrain and manmade limestone features. Finish the day with a spectacular sunset at Uluwatu Temple and watch the famous Kecak Balinese Cultural Dance. Enjoy grilled seafood at candlelit tables laid out on the beachfront at Jimbaran bay.',
    itinerary: ['12:00 Hotel pick up', '01:00 Lunch (Optional)', '02:00 Pandawa beach', '04:00 Uluwatu temple', '06:00 Kecak fire dance show', '08:00 Seafood dinner at Jimbaran bay', '09:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Uluwatu Temple IDR 50K, Kecak Dance at Uluwatu Temple IDR 150K, Pandawa Beach IDR 15K)', 'Lunch and dinner'],
    lat: -8.8291,
    lng: 115.0886
  },
  {
    id: 'nusadua',
    title: 'Tour Nusa Dua',
    location: 'Nusa Dua, Bali',
    price: 28,
    rating: 4.7,
    reviews: 95,
    image: 'https://picsum.photos/seed/nusadua/800/600',
    duration: '6 Hours',
    description: 'Getting wet & wild in Bali’s water wonderlands has never been so much fun. See the icon of civilisation rising from the rugged hills of Bali\'s Bukit Peninsula at Garuda Wisnu Kencana Statue.',
    itinerary: ['09:00 Hotel pick up', '09:30 Tanjung Benoa Watersports', '12:00 Lunch (Optional)', '01:00 Garuda Wisnu kencana Statue', '03:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Watersports Activity', 'Entrance fees (Garuda Wisnu Kencana Statue IDR 125K)', 'Lunch'],
    lat: -8.7941,
    lng: 115.2266
  },
  {
    id: 'seminyak',
    title: 'Tour Seminyak',
    location: 'Seminyak, Bali',
    price: 36,
    rating: 4.6,
    reviews: 110,
    image: 'https://picsum.photos/seed/seminyak/800/600',
    duration: '9 Hours',
    description: 'Tanah Lot Temple is one of Bali’s most important landmarks, which is famed for its unique offshore setting and sunset backdrops. Visit Seminyak Square and enjoy a restful experience during the day at Double Six Beach.',
    itinerary: ['10:00 Hotel pick up', '11:00 Tanah Lot temple', '01:00 Lunch (Optional)', '02:00 Seminyak Square', '05:00 Doublesix beach', '07:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Tanah Lot temple IDR 25K)', 'Lunch'],
    lat: -8.6913,
    lng: 115.1682
  },
  {
    id: 'bedugul',
    title: 'Tour Bedugul',
    location: 'Bedugul, Bali',
    price: 50,
    rating: 4.9,
    reviews: 145,
    image: 'https://picsum.photos/seed/bedugul/800/600',
    duration: '5-8 Hours',
    description: 'The ‘floating’ temple complex comprises 4 groups of shrines. Make a wonderful picture in front of Handara Gate with the breathtaking view of green scenery and gigantic-exotic traditional Balinese gate as your backdrop.',
    itinerary: ['09:00 Hotel pick up', '11:00 Ulundanu Temple', '02:00 Lunch (Optional)', '02:30 Bali Handara Gate', '03:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Ulundanu Temple IDR 30K, Bali Handara Gate IDR 25K)', 'Lunch'],
    lat: -8.2750,
    lng: 115.1668
  },
  {
    id: 'singaraja-waterfall',
    title: 'Tour Singaraja Waterfall',
    location: 'Singaraja, Bali',
    price: 57,
    rating: 4.8,
    reviews: 88,
    image: 'https://picsum.photos/seed/sekumpul/800/600',
    duration: '8-10 Hours',
    description: 'Visit the ‘floating’ temple complex, make a wonderful picture in front of Handara Gate, and traverse down to the rock pool base of the Sekumpul waterfalls with a combination of rice paddies, durian, rambutan and coffee plantations accompanying your journey.',
    itinerary: ['09:00 Hotel pick up', '11:00 Ulundanu Temple', '01:00 Lunch (Optional)', '02:00 Bali Handara Gate', '03:00 Sekumpul Waterfall', '06:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Ulundanu Temple IDR 30K, Bali Handara Gate IDR 25K)', 'Local guide at Sekumpul Waterfall IDR 300K', 'Lunch'],
    lat: -8.1743,
    lng: 115.1818
  },
  {
    id: 'dolphin-lovina',
    title: 'Tour Dolphin Lovina',
    location: 'Lovina, Bali',
    price: 70,
    rating: 4.7,
    reviews: 134,
    image: 'https://picsum.photos/seed/lovina/800/600',
    duration: '8-10 Hours',
    description: 'A typical morning at the coast starts before sunrise, waiting on shore with their boats. At times, you can see breaching dolphins right after your boat reaches the open waters. Also visit Ulundanu Temple and Bali Handara Gate.',
    itinerary: ['03:00 Hotel pick up', '05:00 Lovina Beach', '08:00 Breakfast', '09:30 Bali Handara Gate', '10:00 Ulundanu Temple', '12:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Bali Handara Gate IDR 25K, Ulundanu Temple IDR 30K)', 'Traditional boat IDR 350K', 'Lunch'],
    lat: -8.1611,
    lng: 115.0253
  },
  {
    id: 'nusa-penida-west',
    title: 'Tour Nusa Penida West',
    location: 'Nusa Penida, Bali',
    price: 65,
    rating: 4.9,
    reviews: 210,
    image: 'https://picsum.photos/seed/nusapenidawest/800/600',
    duration: '12 Hours',
    description: 'Spend a day in paradise exploring the beautiful and wild Nusa Penida island. Watch waves swirl at Broken Beach and crash at Angel’s Billabong. Spot the T-Rex-shaped headland at Kelingking Beach and swim or relax at Crystal Bay.',
    itinerary: ['06:30 Hotel pick up', '07:00 Sanur port', '09:00 Nusa Penida Island', '04:00 Nusa Penida port', '05:30 Sanur port', '06:00 Return to hotel'],
    included: ['Fastboat tickets (return)', 'Mineral drinking water', 'Air-conditioned vehicle', 'Driver as guide', 'Petrol', 'Parking fee', 'Lunch (local restaurant)', 'Entrance tickets'],
    excluded: ['Personal expenses', 'Attraction fees'],
    lat: -8.7278,
    lng: 115.5444
  },
  {
    id: 'nusa-penida-east',
    title: 'Tour Nusa Penida East',
    location: 'Nusa Penida, Bali',
    price: 65,
    rating: 4.8,
    reviews: 175,
    image: 'https://picsum.photos/seed/nusapenidaeast/800/600',
    duration: '12 Hours',
    description: 'Spend a day in paradise exploring the beautiful and wild Nusa Penida island. The view from the top on Diamond Beach is one directly from the postcards. Visit Molenteng house or tree house, and Teletubbies hills.',
    itinerary: ['06:30 Hotel pick up', '07:00 Sanur port', '09:00 Nusa Penida Island', '04:00 Nusa Penida port', '05:30 Sanur port', '06:00 Return to hotel'],
    included: ['Fastboat tickets (return)', 'Mineral drinking water', 'Air-conditioned vehicle', 'Driver as guide', 'Petrol', 'Parking fee', 'Lunch (local restaurant)', 'Entrance tickets'],
    excluded: ['Personal expenses', 'Attraction fees'],
    lat: -8.7753,
    lng: 115.5866
  },
  {
    id: 'ubud-tegalalang',
    title: 'Tour Ubud Tegalalang',
    location: 'Ubud, Bali',
    price: 50,
    rating: 4.7,
    reviews: 160,
    image: 'https://res.cloudinary.com/dbckdslrw/image/upload/v1771986403/532634a0-e809-41fe-acdc-671269b7d86c_169_bnzzta.jpg',
    duration: '5-8 Hours',
    description: 'Bali\'s most iconic tourist attractions. Experience Bali Swing, Tegalalang Rice Terraces, and get up close and personal with Bali’s largest herd of 31 Sumatran elephants at the island’s premiere interactive and intimate elephant experience.',
    itinerary: ['09:00 Hotel pick up', '10:30 Bali Swing', '12:00 Lunch (Optional)', '01:00 Tegalalang Rice Terraces', '02:00 Elephant park', '04:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Swing IDR 20K, Tegalalang IDR 20K, Elephant park IDR 316K)', 'Attraction fees', 'Lunch'],
    lat: -8.4333,
    lng: 115.2796,
    highlighted: true
  },
  {
    id: 'kintamani',
    title: 'Tour Kintamani',
    location: 'Kintamani, Bali',
    price: 57,
    rating: 4.8,
    reviews: 142,
    image: 'https://picsum.photos/seed/kintamani/800/600',
    duration: '5-8 Hours',
    description: 'Visit Tirta Empul Temple, enjoy breathtaking view of an active volcano and lake batur from the top, and relax at the infinity pool hot springs at Kintamani’s most amazing views.',
    itinerary: ['09:00 Hotel pick up', '10:30 Tirta Empul Temple', '12:00 Lunch (Optional)', '12:30 Mount Batur and Lake Batur View at Kintamani', '02:00 Natural Hot Spring Water', '04:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Tirta Empul IDR 35K, Kintamani IDR 50K, Hot Spring IDR 300K)', 'Lunch'],
    lat: -8.2821,
    lng: 115.3644
  },
  {
    id: 'ubud-monkey-forest',
    title: 'Tour Ubud Monkey Forest',
    location: 'Ubud, Bali',
    price: 43,
    rating: 4.6,
    reviews: 198,
    image: 'https://picsum.photos/seed/monkeyforest/800/600',
    duration: '5-8 Hours',
    description: 'See playful primates in their natural habitat, swinging through canopies, and feeding on bananas. Visit Ubud Palace featuring well-preserved Balinese architecture and enjoy the impressively green valley panorama with the cascading water at Tegenungan Waterfall.',
    itinerary: ['09:00 Hotel pick up', '10:30 Sacred Monkey Forest Sanctuary', '12:00 Ubud Palace', '01:00 Lunch (Optional)', '02:00 Tegenungan Waterfall', '04:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Monkey Forest IDR 50K, Tegenungan IDR 20K)', 'Lunch'],
    lat: -8.5190,
    lng: 115.2600
  },
  {
    id: 'lempuyang-temple',
    title: 'Tour Lempuyang Temple',
    location: 'Karangasem, Bali',
    price: 57,
    rating: 4.9,
    reviews: 230,
    image: 'https://picsum.photos/seed/lempuyang/800/600',
    duration: '5-8 Hours',
    description: 'The best views are higher up the stairs, where you can see all across the green forested slopes and to neighbouring Mount Agung. Visit The Tirta Gangga royal water garden, a cool retreat in the eastern highlands of the Karangasem regency.',
    itinerary: ['04:00 Hotel pick up', '06:00 Lempuyang Temple', '11:00 Tirta Gangga Water Palace', '12:00 Lunch (Optional)', '01:00 Return to hotel'],
    included: ['Air-conditioned vehicle', 'Mineral drinking water', 'Driver as guide', 'Petrol', 'Parking fee'],
    excluded: ['Personal expenses', 'Entrance fees (Lempuyang IDR 20K, Tirta Gangga IDR 25K)', 'Lunch'],
    lat: -8.3908,
    lng: 115.6293
  },
  {
    id: 'bromo',
    title: 'Tour Bromo',
    location: 'Probolinggo, Jawa Timur',
    price: 60,
    rating: 4.9,
    reviews: 180,
    image: 'https://res.cloudinary.com/dbckdslrw/image/upload/v1771987264/1280px-Mount_Bromo_at_sunrise__showing_its_volcanoes_and_Mount_Semeru__background_cb8v7f.jpg',
    duration: '12 Hours',
    description: 'Experience the magical sunrise over Mount Bromo, an active volcano in East Java. Explore the Sea of Sand and climb the stairs to the crater rim for an unforgettable view.',
    itinerary: ['02:00 Hotel pick up', '03:30 Penanjakan Sunrise View', '06:00 Sea of Sand', '07:00 Bromo Crater', '09:00 Breakfast', '11:00 Return to hotel'],
    included: ['4WD Jeep', 'Entrance fees', 'Mineral water', 'Driver as guide'],
    excluded: ['Personal expenses', 'Horse riding', 'Lunch'],
    lat: -7.9425,
    lng: 112.9531,
    highlighted: true
  }
];

export const HERO_SLIDES = [
  {
    id: 1,
    bg: 'https://picsum.photos/seed/indonesia/1920/1080',
    title: 'INDONESIA',
    badge: '14 DAYS\nALL INCLUSIVE\n$1399',
  },
  {
    id: 2,
    bg: 'https://picsum.photos/seed/norway/1920/1080',
    title: 'NORWAY',
    badge: '1 WEEK\nADVENTURE\n$899',
  },
  {
    id: 3,
    bg: 'https://picsum.photos/seed/thailand/1920/1080',
    title: 'THAILAND',
    badge: '12 DAYS\nINCL. FLIGHTS\n$1699',
  },
  {
    id: 4,
    bg: 'https://picsum.photos/seed/iceland/1920/1080',
    title: 'ICELAND',
    badge: '5 DAYS\nADVENTURE\n$979',
  },
  {
    id: 5,
    bg: 'https://picsum.photos/seed/peru/1920/1080',
    title: 'PERU',
    badge: '14 DAYS\nHIKING TRIP\n$1399',
  },
  {
    id: 6,
    bg: 'https://picsum.photos/seed/germany/1920/1080',
    title: 'GERMANY',
    badge: '9 DAYS\nADVENTURE\n$799',
  },
];
