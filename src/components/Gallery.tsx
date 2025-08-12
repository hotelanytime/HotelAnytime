'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Gallery as GalleryType } from '@/types';

export default function Gallery() {
  const [gallery, setGallery] = useState<GalleryType | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const response = await fetch('/api/gallery');
        const data = await response.json();
        console.log('Gallery component - Fetched data:', data);
        console.log('Gallery component - Number of images:', data.images?.length || 0);
        setGallery(data);
      } catch (error) {
        console.error('Error fetching gallery data:', error);
      }
    };

    fetchGallery();
  }, []);

  if (!gallery) {
    return (
      <div className="py-16 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const categories = ['all', ...new Set(gallery.images.map(img => img.category))];
  const filteredImages = selectedCategory === 'all' 
    ? gallery.images 
    : gallery.images.filter(img => img.category === selectedCategory);

  return (
    <section id="gallery" className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            {gallery.title}
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover the beauty and elegance of our hotel through our carefully curated image gallery.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="flex justify-center mb-8"
        >
          <div className="flex flex-wrap gap-2 bg-white rounded-full p-2 shadow-md">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-6 py-2 rounded-full font-medium capitalize transition-all duration-300 ${
                  selectedCategory === category
                    ? 'bg-orange-600 text-white shadow-md'
                    : 'text-gray-600 hover:text-orange-600'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </motion.div>

        {/* Image Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredImages.map((image, index) => (
            <motion.div
              key={`gallery-${image.url}-${index}`}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="group relative rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden bg-white"
            >
              {/* Image container with explicit dimensions */}
              <div 
                style={{ 
                  width: '100%', 
                  height: '256px', 
                  position: 'relative',
                  overflow: 'hidden'
                }}
              >
                <img
                  src={image.url}
                  alt={image.caption}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                    display: 'block',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    transition: 'transform 0.5s ease'
                  }}
                  className="group-hover:scale-110"
                  onError={(e) => {
                    console.error('Gallery image failed to load:', image.url);
                    e.currentTarget.style.backgroundColor = '#fee2e2';
                    e.currentTarget.style.border = '2px solid #ef4444';
                  }}
                  onLoad={() => {
                    console.log('Gallery image loaded successfully:', image.url);
                  }}
                />
                
                {/* Overlay */}
                <div 
                  className="absolute inset-0  bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300 flex items-end"
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 2
                  }}
                >
                  <div className="p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <p className="font-semibold text-lg mb-1">{image.caption}</p>
                    <p className="text-sm opacity-90 capitalize">{image.category}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View More Button */}
        {filteredImages.length > 6 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mt-12"
          >
                        <button className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300">
              View More Photos
            </button>
          </motion.div>
        )}
      </div>
    </section>
  );
}
