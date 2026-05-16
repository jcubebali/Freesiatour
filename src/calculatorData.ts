
export interface Destination {
  id: string;
  name: string;
  area: string;
  price: number;
  category: string;
  imageUrl: string;
}

export interface HotelOption {
  id: string;
  name: string;
  price: number;
  description: string;
  type: 'Budget' | 'Standard' | 'Luxury';
}

export interface Addon {
  id: string;
  name: string;
  price: number;
  type: 'addon';
  icon?: string;
}

export interface Activity {
  id: string;
  name: string;
  price: number;
  category?: string;
  type: 'activity';
  image?: string;
  description?: string;
  duration?: string;
  price_max_idr?: number;
}

import destinationsData from './destinationsData.json';

const getImageUrl = (category: string) => {
  const catMap: Record<string, string> = {
    'Nature & Scenery': 'https://images.unsplash.com/photo-1554481923-a6918bd997bc?auto=format&fit=crop&q=80&w=800',
    'Waterfall': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
    'Beach': 'https://images.unsplash.com/photo-1537953391648-762d01df3c14?auto=format&fit=crop&q=80&w=800',
    'Animal & Wildlife': 'https://images.unsplash.com/photo-1518548419970-58e3b4079ab2?auto=format&fit=crop&q=80&w=800',
    'Temple & Sacred Site': 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800',
    'Shopping & Market': 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&q=80&w=800',
    'Cultural Village': 'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&q=80&w=800',
    'Cafe & Lifestyle': 'https://images.unsplash.com/photo-1512132411229-c30391241dd8?auto=format&fit=crop&q=80&w=800',
    'Entertainment & Theme Park': 'https://images.unsplash.com/photo-1579208030886-b937fe0925dc?auto=format&fit=crop&q=80&w=800',
    'Museum': 'https://images.unsplash.com/photo-1552603305-b56d022d2218?auto=format&fit=crop&q=80&w=800',
    'Water Activity Area': 'https://images.unsplash.com/photo-1530263302096-7bb577ba6914?auto=format&fit=crop&q=80&w=800'
  };
  return catMap[category] || 'https://images.unsplash.com/photo-1539367628448-4bc5c9d171c8?auto=format&fit=crop&q=80&w=800';
};

export const CALCULATOR_DESTINATIONS: Destination[] = destinationsData.map(d => ({
  id: d.id,
  name: d.name,
  area: d.area,
  price: Math.ceil((d.entrance_fee_idr || 0) / 15000),
  category: d.category,
  imageUrl: getImageUrl(d.category)
}));

export const HOTEL_OPTIONS: HotelOption[] = [
  { id: 'budget', name: 'Budget Package', price: 35, description: 'Affordable 3-star local hotels', type: 'Budget' },
  { id: 'standard', name: 'Standard Package', price: 75, description: 'Comfortable 4-star boutique hotels', type: 'Standard' },
  { id: 'luxury', name: 'Luxury Package', price: 180, description: 'Exclusive 5-star villas & resorts', type: 'Luxury' },
];

export const ACTIVITIES: Activity[] = [
  { 
    id: 'swing', 
    name: 'Bali Swing', 
    price: 35, 
    type: 'activity', 
    category: 'Adventure',
    image: 'https://res.cloudinary.com/dbckdslrw/image/upload/v1778944524/In_my_fairytale_moment_Bali_swing_Bali_swing_Alas_harum_Bali_swing_Explore_Bali_chv6y5.jpg',
    description: 'Experience the thrill of swinging over lush tropical jungle valley with breathtaking views.',
    duration: '1-2 Hours',
    price_max_idr: 550000
  },
  { 
    id: 'rafting', 
    name: 'White Water Rafting', 
    price: 45, 
    type: 'activity', 
    category: 'Adventure',
    image: 'https://res.cloudinary.com/dbckdslrw/image/upload/v1778944524/e9_mxopdt.jpg',
    description: 'Navigate the exciting rapids of Ayung River while enjoying the surrounding rainforest scenery.',
    duration: '3-4 Hours',
    price_max_idr: 750000
  },
  { 
    id: 'atv', 
    name: 'ATV Ride', 
    price: 60, 
    type: 'activity', 
    category: 'Adventure',
    image: 'https://res.cloudinary.com/dbckdslrw/image/upload/v1778944524/3c_h2ykyk.jpg',
    description: 'Explore Balinese rice fields, villages, and jungles on a powerful all-terrain vehicle.',
    duration: '2 Hours',
    price_max_idr: 950000
  },
  { 
    id: 'snorkeling', 
    name: 'Snorkeling Blue Lagoon', 
    price: 40, 
    type: 'activity', 
    category: 'Water Sports',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&q=80&w=800',
    description: 'Discover the vibrant underwater world and colorful coral reefs of Bali.',
    duration: '3 Hours',
    price_max_idr: 650000
  },
];

export const VEHICLES_DATA = [
  { id: 'bus_medium_x2', vehicle: 'Bus Medium x2', rate_with_driver_idr: 2900000, rate_oneway_idr: 1500000, seats: 60, type: 'Bus', status: 'available' },
  { id: 'bus_large', vehicle: 'Bus Large', rate_with_driver_idr: 2200000, rate_oneway_idr: 1200000, seats: 45, type: 'Bus', status: 'available' },
  { id: 'bus_medium', vehicle: 'Bus Medium', rate_with_driver_idr: 1450000, rate_oneway_idr: 750000, seats: 35, type: 'Bus', status: 'available' },
  { id: 'bus_small', vehicle: 'Bus Small', rate_with_driver_idr: 1250000, rate_oneway_idr: 650000, seats: 28, type: 'Bus', status: 'available' },
  { id: 'elf_long', vehicle: 'Microbus Elf (long)', rate_with_driver_idr: 1200000, rate_oneway_idr: null, seats: 19, type: 'Van', status: 'available' },
  { id: 'hiace', vehicle: 'Minibus Toyota Hiace', rate_with_driver_idr: 1200000, rate_oneway_idr: 300000, seats: 15, type: 'Van', status: 'available' },
  { id: 'innova', vehicle: 'Toyota Innova', rate_with_driver_idr: 900000, rate_oneway_idr: null, seats: 6, type: 'MPV', status: 'available' },
  { id: 'mpv', vehicle: 'MPV', rate_with_driver_idr: 700000, rate_oneway_idr: 250000, seats: 5, type: 'MPV', status: 'available' },
  { id: 'city_car', vehicle: 'City Car', rate_with_driver_idr: 600000, rate_oneway_idr: 150000, seats: 3, type: 'Car', status: 'available' },
  { id: 'motorcycle', vehicle: 'Motorcycle', rate_with_driver_idr: 150000, rate_oneway_idr: 50000, seats: 1, type: 'Bike', status: 'available' },
];
