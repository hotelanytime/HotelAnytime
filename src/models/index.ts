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
  images: [{
    type: String,
    required: true,
  }],
  amenities: [String],
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
  socialLinks: {
    facebook: String,
    twitter: String,
    instagram: String,
    linkedin: String,
  },
  coordinates: {
    lat: Number,
    lng: Number,
  },
}, {
  timestamps: true,
});

export const Hero = mongoose.models.Hero || mongoose.model('Hero', heroSchema);
export const About = mongoose.models.About || mongoose.model('About', aboutSchema);
export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);
export const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);
