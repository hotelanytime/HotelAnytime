'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { About as AboutType } from '@/types';
import { Wifi, Car, Utensils, Dumbbell, Star, Users, Clock, Shield } from 'lucide-react';

const iconMap = {
  wifi: Wifi,
  car: Car,
  utensils: Utensils,
  dumbbell: Dumbbell,
  star: Star,
  users: Users,
  clock: Clock,
  shield: Shield,
};

export default function About() {
  const [about, setAbout] = useState<AboutType | null>(null);

  useEffect(() => {
    const fetchAbout = async () => {
      try {
        const response = await fetch('/api/about');
        const data = await response.json();
        setAbout(data);
      } catch (error) {
        console.error('Error fetching about data:', error);
      }
    };

    fetchAbout();
  }, []);

  if (!about) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  return (
    <section id="about" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Text Content */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              {about.title}
            </h2>
            <p className="text-lg text-gray-700 mb-8 leading-relaxed">
              {about.description}
            </p>
            
            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-6">
              {about.features.map((feature, index) => {
                const IconComponent = iconMap[feature.icon as keyof typeof iconMap] || Star;
                
                return (
                  <motion.div
                    key={`feature-${feature.title}-${index}`}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    viewport={{ once: true }}
                    className="flex items-start space-x-3"
                  >
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-6 h-6 text-orange-600" />
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {feature.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {feature.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Image */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-2xl shadow-2xl">
              <img
                src={about.image}
                alt="Hotel Interior"
                className="w-full h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
            </div>
            
            {/* Stats Overlay */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
              className="absolute -bottom-6 left-6 right-6"
            >
              <div className="bg-white rounded-xl shadow-lg p-6 grid grid-cols-2 gap-4">
                <div className="text-center border-x">
                  <div className="text-2xl font-bold text-orange-600">10+</div>
                  <div className="text-sm text-gray-600">Years Experience</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">24/7</div>
                  <div className="text-sm text-gray-600">Service</div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
