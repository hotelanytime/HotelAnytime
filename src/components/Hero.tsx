'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hero as HeroType } from '@/types';

export default function Hero() {
  const [hero, setHero] = useState<HeroType | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const fetchHero = async () => {
      try {
        const response = await fetch('/api/hero');
        const data = await response.json();
        console.log('Hero data fetched:', data);
        setHero(data);
      } catch (error) {
        console.error('Error fetching hero data:', error);
        // Fallback data if API fails
        setHero({
          title: "Welcome to Hotel Anytime",
          subtitle: "Experience luxury and comfort in the heart of the city",
          hotelName: "Hotel Anytime",
          backgroundImage: "/hotel-hero-bg.jpg", // Local fallback first
          ctaText: "Book Now"
        });
      }
    };

    fetchHero();
  }, []);

  if (!hero) {
    return (
      <div className="h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      {hero?.backgroundImage && imageLoaded && !imageError && (
        <img
          src={hero.backgroundImage}
          alt="Hotel background"
          className="absolute inset-0 w-full z-30 h-full object-cover"
        />
      )}
      
      {/* Fallback gradient background */}
      {(!hero?.backgroundImage || !imageLoaded || imageError) && (
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900 to-red-900 z-0" />
      )}
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      
      {/* Additional subtle gradient overlay for better text readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/40 z-20" />
      
      {/* Hidden image for loading detection */}
      {hero?.backgroundImage && (
        <img
          src={hero.backgroundImage}
          alt=""
          className="hidden"
          onLoad={() => {
            console.log('Hero image loaded successfully:', hero?.backgroundImage);
            setImageLoaded(true);
          }}
          onError={(e) => {
            console.error('Hero image failed to load:', hero?.backgroundImage);
            setImageError(true);
          }}
        />
      )}
      
      {/* Loading indicator */}
      {hero?.backgroundImage && !imageLoaded && !imageError && (
        <div className="absolute inset-0 bg-gradient-to-r from-orange-900 to-red-900 flex items-center justify-center z-20">
          <div className="text-white text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
            <p className="text-sm">Loading image...</p>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="relative z-30 text-center max-w-4xl mx-auto px-4">
        <motion.h1
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-5xl md:text-7xl font-bold mb-6 text-orange-500 drop-shadow-2xl"
          style={{
            textShadow: '2px 2px 4px rgba(0,0,0,0.8), 0px 0px 20px rgba(0,0,0,0.6)'
          }}
        >
          {hero?.title || 'Welcome to Hotel Anytime'}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="text-xl md:text-2xl mb-8 text-white font-medium"
          style={{
            textShadow: '1px 1px 3px rgba(0,0,0,0.8), 0px 0px 15px rgba(0,0,0,0.5)'
          }}
        >
          {hero?.subtitle || 'Experience luxury and comfort'}
        </motion.p>
        
        <motion.button
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          onClick={() => {
            const contactSection = document.getElementById('contact');
            if (contactSection) {
              contactSection.scrollIntoView({ behavior: 'smooth' });
            }
          }}
          className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors duration-300 transform hover:scale-105 cursor-pointer shadow-2xl border border-orange-500"
          style={{
            boxShadow: '0 8px 32px rgba(0,0,0,0.3), 0 4px 16px rgba(234, 88, 12, 0.3)'
          }}
        >
          {hero?.ctaText || 'Book Now'}
        </motion.button>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-white"
        style={{
          textShadow: '1px 1px 2px rgba(0,0,0,0.8)'
        }}
      >
        <div className="flex flex-col items-center">
          <span className="text-sm mb-2">Scroll Down</span>
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center shadow-lg"
               style={{ boxShadow: '0 0 10px rgba(0,0,0,0.3)' }}>
            <div className="w-1 h-3 bg-white rounded-full mt-2 animate-bounce"></div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
