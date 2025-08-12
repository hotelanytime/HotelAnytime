'use client';

import { useState, useEffect } from 'react';

export default function Footer() {
  const [hotelName, setHotelName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
      } finally {
        setLoading(false);
      }
    };

    fetchHotelConfig();
  }, []);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Hotel Info */}
          <div className="space-y-4">
            <div className="text-2xl font-bold">
              {loading ? (
                <div className="animate-pulse">
                  <div className="h-8 bg-gray-700 rounded w-32"></div>
                </div>
              ) : hotelName ? (
                <>
                  {hotelName.includes(' ') ? (
                    <>
                      {hotelName.split(' ')[0]}
                      <span className="text-orange-400"> {hotelName.split(' ').slice(1).join(' ')}</span>
                    </>
                  ) : (
                    <span className="text-orange-400">{hotelName}</span>
                  )}
                </>
              ) : (
                <span className="text-orange-400">•</span>
              )}
            </div>
            {hotelName && (
              <p className="text-gray-400 text-sm">
                Experience luxury and comfort in the heart of the city. Your perfect stay awaits.
              </p>
            )}
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li><a href="#about" className="text-gray-400 hover:text-white transition-colors">About</a></li>
              <li><a href="#rooms" className="text-gray-400 hover:text-white transition-colors">Rooms</a></li>
              <li><a href="#gallery" className="text-gray-400 hover:text-white transition-colors">Gallery</a></li>
              <li><a href="#contact" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
            </ul>
          </div>

          {/* Services */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Services</h3>
            <ul className="space-y-2 text-sm">
              <li><span className="text-gray-400">Room Service</span></li>
              <li><span className="text-gray-400">Restaurant</span></li>
              <li><span className="text-gray-400">Spa & Wellness</span></li>
              <li><span className="text-gray-400">Conference Rooms</span></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact</h3>
            <div className="space-y-2 text-sm text-gray-400">
              <p>123 Luxury Street</p>
              <p>Downtown City, 12345</p>
              <p>+1 (555) 123-4567</p>
              <p>info@grandhotel.com</p>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; 2025 {hotelName || 'Hotel Website'}. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
