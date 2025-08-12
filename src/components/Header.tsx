'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [hotelName, setHotelName] = useState<string | null>(null); // No default fallback

  useEffect(() => {
    // Fetch hotel name from config
    const fetchHotelConfig = async () => {
      try {
        const response = await fetch('/api/config');
        if (response.ok) {
          const config = await response.json();
          if (config.hotelName) {
            setHotelName(config.hotelName);
          }
        }
      } catch (error) {
        console.error('Failed to fetch hotel config:', error);
        // Keep hotelName as null if fetch fails
      }
    };

    fetchHotelConfig();
  }, []);

  const navigation = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Rooms', href: '#rooms' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Contact', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('#')) {
      const element = document.querySelector(href);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex-shrink-0">
            {hotelName ? (
              <div className="text-2xl font-bold text-gray-900">
                {hotelName.split(' ').map((word: string, index: number) => (
                  <span key={index}>
                    {index === hotelName.split(' ').length - 1 ? (
                      <span className="text-orange-600">{word}</span>
                    ) : (
                      word + ' '
                    )}
                  </span>
                ))}
              </div>
            ) : (
              <div className="text-2xl font-bold text-gray-900">
                <span className="text-orange-600">•</span>
              </div>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => scrollToSection(item.href)}
                className="text-gray-700 hover:text-orange-600 font-medium transition-colors duration-300"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* CTA Button */}
          <div className="hidden md:flex items-center space-x-4">
            <button 
              onClick={() => scrollToSection('#contact')}
              className="bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-300"
            >
              Book Now
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-orange-600 p-2"
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden border-t border-gray-200 bg-white"
          >
            <div className="py-4 space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => scrollToSection(item.href)}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:text-orange-600 hover:bg-gray-50 font-medium transition-colors duration-300"
                >
                  {item.name}
                </button>
              ))}
              <div className="px-4 pt-2">
                <button 
                  onClick={() => scrollToSection('#contact')}
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-300"
                >
                  Book Now
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </header>
  );
}
