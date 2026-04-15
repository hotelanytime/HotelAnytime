import mongoose from 'mongoose';

const heroSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    required: true,
  },
  hotelName: {
    type: String,
    default: 'Grand Hotel',
  },
  backgroundImage: {
    type: String,
    required: true,
  },
  ctaText: {
    type: String,
    default: 'Book Now',
  },
}, {
  timestamps: true,
});

const aboutSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  features: [{
    icon: String,
    title: String,
    description: String,
  }],
  image: {
    type: String,
    required: true,
  },
}, {
  timestamps: true,
});

const roomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    default: 'Standard',
  },
  description: {
    type: String,
    required: true,
  },
  shortDescription: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  videoUrl: {
    type: String,
    default: '',
  },
  coverImage: {
    type: String,
    default: '',
  },
  images: [{
    type: String,
    required: true,
  }],
  amenities: [String],
  maxGuests: {
    type: Number,
    default: 2,
  },
  rating: {
    type: Number,
    default: 4,
  },
  capacity: {
    type: Number,
    required: true,
  },
  size: {
    type: String,
    required: true,
  },
  available: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  images: [{
    url: String,
    caption: String,
    category: String,
  }],
}, {
  timestamps: true,
});

const contactSchema = new mongoose.Schema({
  address: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  website: String,
  hours: String,
  checkinTime: String,
  checkoutTime: String,
  socialLinks: {
    type: Map,
    of: String,
    default: {},
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
}, {
  timestamps: true,
});

const adminLoginAttemptSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
  },
  count: {
    type: Number,
    default: 0,
  },
  windowStart: {
    type: Date,
    default: Date.now,
  },
  blockedUntil: {
    type: Date,
    default: null,
  },
}, {
  timestamps: true,
});

const financePaymentSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  roomId: {
    type: String,
    required: true,
  },
  roomName: {
    type: String,
    required: true,
  },
  customerName: {
    type: String,
    default: '',
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank', 'other'],
    default: 'cash',
  },
  notes: {
    type: String,
    default: '',
  },
  reference: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

const financeExpenseSchema = new mongoose.Schema({
  date: {
    type: String,
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  paymentMode: {
    type: String,
    enum: ['cash', 'upi', 'card', 'bank', 'other'],
    default: 'cash',
  },
  notes: {
    type: String,
    default: '',
  },
  vendor: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

export const Hero = mongoose.models.Hero || mongoose.model('Hero', heroSchema);
export const About = mongoose.models.About || mongoose.model('About', aboutSchema);
export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
export const AdminLoginAttempt =
  mongoose.models.AdminLoginAttempt || mongoose.model('AdminLoginAttempt', adminLoginAttemptSchema);
export const FinancePayment =
  mongoose.models.FinancePayment || mongoose.model('FinancePayment', financePaymentSchema);
export const FinanceExpense =
  mongoose.models.FinanceExpense || mongoose.model('FinanceExpense', financeExpenseSchema);
