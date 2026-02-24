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
  lat: number;
  lng: number;
}

export const DESTINATIONS = [
  {
    id: 'bali',
    title: 'Bali Cultural Tour',
    location: 'Ubud, Bali',
    price: 150,
    rating: 4.9,
    reviews: 124,
    image: 'https://picsum.photos/seed/bali/800/600',
    duration: '3 Days 2 Nights',
    description: 'Experience the spiritual heart of Bali with our Ubud cultural tour. Visit ancient temples, lush rice terraces, and vibrant local markets.',
    itinerary: ['Day 1: Arrival & Tegalalang Rice Terrace', 'Day 2: Sacred Monkey Forest & Ubud Palace', 'Day 3: Tirta Empul Temple & Departure'],
    lat: -8.5069,
    lng: 115.2625
  },
  {
    id: 'raja-ampat',
    title: 'Raja Ampat Paradise',
    location: 'West Papua',
    price: 850,
    rating: 5.0,
    reviews: 45,
    image: 'https://picsum.photos/seed/rajaampat/800/600',
    duration: '5 Days 4 Nights',
    description: 'Dive into the most biodiverse marine environment on Earth. Raja Ampat offers crystal clear waters and stunning limestone karsts.',
    itinerary: ['Day 1: Sorong to Piaynemo', 'Day 2: Wayag Island Trekking', 'Day 3: Snorkeling at Cape Kri', 'Day 4: Bird of Paradise Watching', 'Day 5: Return to Sorong'],
    lat: -0.2248,
    lng: 130.5008
  },
  {
    id: 'labuan-bajo',
    title: 'Komodo Dragon Quest',
    location: 'Labuan Bajo',
    price: 420,
    rating: 4.8,
    reviews: 89,
    image: 'https://picsum.photos/seed/komodo/800/600',
    duration: '4 Days 3 Nights',
    description: 'Sail across the Komodo National Park, visit the famous Pink Beach, and see the legendary Komodo dragons in their natural habitat.',
    itinerary: ['Day 1: Labuan Bajo Arrival & Sunset at Padar Island', 'Day 2: Komodo Island & Pink Beach', 'Day 3: Manta Point & Kanawa Island', 'Day 4: Mirror Stone Cave & Departure'],
    lat: -8.4907,
    lng: 119.8773
  },
  {
    id: 'bromo',
    title: 'Mount Bromo Sunrise',
    location: 'East Java',
    price: 200,
    rating: 4.7,
    reviews: 156,
    image: 'https://picsum.photos/seed/bromo/800/600',
    duration: '2 Days 1 Night',
    description: 'Witness one of the most spectacular sunrises in the world over the volcanic landscape of Mount Bromo.',
    itinerary: ['Day 1: Surabaya to Bromo Area', 'Day 2: Sunrise at Penanjakan & Bromo Crater'],
    lat: -7.9425,
    lng: 112.9530
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
