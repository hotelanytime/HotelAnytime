export interface Hero {
  _id?: string;
  title: string;
  subtitle: string;
  hotelName?: string;
  backgroundImage: string;
  ctaText?: string;
}

export interface About {
  _id?: string;
  title: string;
  description: string;
  features: Feature[];
  image: string;
}

export interface Feature {
  icon: string;
  title: string;
  description: string;
}

export interface Room {
  _id?: string;
  name: string;
  type: string;
  description: string;
  shortDescription?: string;
  price: number;
  videoUrl?: string;
  coverImage?: string;
  images: string[];
  amenities: string[];
  capacity?: number;
  maxGuests: number;
  size?: string;
  rating: number;
  available?: boolean;
}

export interface Gallery {
  _id?: string;
  title: string;
  images: GalleryImage[];
}

export interface GalleryImage {
  url: string;
  caption: string;
  category: string;
}

export interface Contact {
  _id?: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  hours?: string;
  checkinTime?: string;
  checkoutTime?: string;
  socialLinks?: SocialLinks;
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface SocialLinks {
  facebook?: string;
  twitter?: string;
  instagram?: string;
  linkedin?: string;
}

export interface Asset {
  url: string;
  public_id: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
  created_at?: string;
}

export interface AdminAuth {
  username: string;
  password: string;
}

export interface FinancePayment {
  _id?: string;
  date: string;
  roomId: string;
  roomName: string;
  customerName?: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'bank' | 'other';
  notes?: string;
  reference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceExpense {
  _id?: string;
  date: string;
  category: string;
  amount: number;
  paymentMode: 'cash' | 'upi' | 'card' | 'bank' | 'other';
  notes?: string;
  vendor?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FinanceAnalytics {
  summary: {
    totalIncome: number;
    totalExpense: number;
    profit: number;
    paymentCount: number;
    expenseCount: number;
  };
  daily: Array<{
    date: string;
    income: number;
    expense: number;
    profit: number;
  }>;
  roomRevenue: Array<{ roomName: string; amount: number }>;
  paymentModes: Array<{ mode: string; amount: number }>;
  expenseCategories: Array<{ category: string; amount: number }>;
}
