'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Room } from '@/types';
import { 
  ArrowLeft, 
  Users, 
  Square, 
  Wifi, 
  Coffee, 
  Car, 
  Star, 
  Bed,
  Bath,
  Wind,
  Tv,
  Phone,
  Utensils,
  MapPin,
  Calendar,
  Clock,
  Shield,
  Heart,
  ChevronLeft,
  ChevronRight,
  Check
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function RoomDetails() {
  const params = useParams();
  const router = useRouter();
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchRoom = async () => {
      try {
        const response = await fetch(`/api/rooms/${params.id}`);
        if (response.ok) {
          const data = await response.json();
          setRoom(data);
        } else {
          router.push('/');
        }
      } catch (error) {
        console.error('Error fetching room:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchRoom();
    }
  }, [params.id, router]);

  const getAmenityIcon = (amenity: string) => {
    const lower = amenity.toLowerCase();
    if (lower.includes('wifi') || lower.includes('internet')) return <Wifi className="w-5 h-5" />;
    if (lower.includes('coffee') || lower.includes('breakfast')) return <Coffee className="w-5 h-5" />;
    if (lower.includes('parking') || lower.includes('car')) return <Car className="w-5 h-5" />;
    if (lower.includes('bed') || lower.includes('sleep')) return <Bed className="w-5 h-5" />;
    if (lower.includes('bath') || lower.includes('shower')) return <Bath className="w-5 h-5" />;
    if (lower.includes('air') || lower.includes('cooling')) return <Wind className="w-5 h-5" />;
    if (lower.includes('tv') || lower.includes('television')) return <Tv className="w-5 h-5" />;
    if (lower.includes('phone')) return <Phone className="w-5 h-5" />;
    if (lower.includes('restaurant') || lower.includes('food')) return <Utensils className="w-5 h-5" />;
    if (lower.includes('location') || lower.includes('view')) return <MapPin className="w-5 h-5" />;
    if (lower.includes('service')) return <Clock className="w-5 h-5" />;
    if (lower.includes('security') || lower.includes('safe')) return <Shield className="w-5 h-5" />;
    return <Star className="w-5 h-5" />;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Room not found</h1>
          <button
            onClick={() => router.push('/')}
            className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-lg"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-white">
      <Header />
      <main className="pt-16">
        {/* Breadcrumb */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center space-x-2 text-sm text-gray-500"
          >
            <button 
              onClick={() => router.push('/')}
              className="hover:text-orange-600 transition-colors"
            >
              Home
            </button>
            <ChevronRight className="w-4 h-4" />
            <button 
              onClick={() => router.push('/#rooms')}
              className="hover:text-orange-600 transition-colors"
            >
              Rooms
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-medium">{room.name}</span>
          </motion.div>
        </div>

        {/* Back Button */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.back()}
            className="flex items-center space-x-2 text-gray-600 hover:text-orange-600 transition-all duration-200 bg-white px-4 py-2 rounded-xl shadow-md hover:shadow-lg border border-gray-200 hover:border-orange-200"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Rooms</span>
          </motion.button>
        </div>

        {/* Room Images */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Main Image */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-6"
            >
              <div className="relative aspect-w-4 aspect-h-3 rounded-3xl overflow-hidden shadow-2xl group">
                <img
                  src={room.images[selectedImage]}
                  alt={room.name}
                  className="w-full h-[500px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                {/* Image Navigation */}
                {room.images.length > 1 && (
                  <>
                    <button
                      onClick={() => setSelectedImage(selectedImage > 0 ? selectedImage - 1 : room.images.length - 1)}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <ChevronLeft className="w-6 h-6 text-gray-800" />
                    </button>
                    <button
                      onClick={() => setSelectedImage(selectedImage < room.images.length - 1 ? selectedImage + 1 : 0)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-80 hover:bg-opacity-100 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                    >
                      <ChevronRight className="w-6 h-6 text-gray-800" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white px-3 py-1 rounded-full text-sm font-medium">
                  {selectedImage + 1} / {room.images.length}
                </div>
              </div>
              
              {/* Thumbnail Images */}
              {room.images.length > 1 && (
                <div className="flex space-x-3 overflow-x-auto pb-2">
                  {room.images.map((image, index) => (
                    <motion.button
                      key={index}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSelectedImage(index)}
                      className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all duration-200 ${
                        selectedImage === index 
                          ? 'border-orange-600 shadow-lg ring-2 ring-orange-200' 
                          : 'border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <img
                        src={image}
                        alt={`${room.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Room Details */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-3 h-3 bg-orange-600 rounded-full"></div>
                  <span className="text-orange-600 font-medium text-sm uppercase tracking-wider">Luxury Room</span>
                </div>
                
                <h1 className="text-4xl font-bold text-gray-900 mb-6">
                  {room.name}
                </h1>
                
                <div className="flex items-center space-x-6 text-gray-600 mb-6">
                  <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-lg">
                    <Users className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">{room.capacity} Guests</span>
                  </div>
                  <div className="flex items-center space-x-2 bg-orange-50 px-4 py-2 rounded-lg">
                    <Square className="w-5 h-5 text-orange-600" />
                    <span className="font-medium">{room.size}</span>
                  </div>
                  {/* {room.available && (
                    <div className="flex items-center space-x-2 bg-green-50 px-4 py-2 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <span className="text-green-700 font-medium text-sm">Available Now</span>
                    </div>
                  )} */}
                </div>
                
                <div className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-6 rounded-2xl mb-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold">₹{room.price}</div>
                      <div className="text-orange-100">per night</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-orange-100">Starting from</div>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 fill-current" />
                        <span className="text-sm font-medium">Premium Rate</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <div className="w-6 h-6 bg-orange-600 rounded-lg flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span>Description</span>
                  </h2>
                  <p className="text-gray-700 leading-relaxed text-lg">
                    {room.description}
                  </p>
                </div>
              </div>

              {/* Amenities */}
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Room Amenities</h2>
                <div className="grid grid-cols-1 gap-3">
                  {room.amenities.map((amenity, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * index }}
                      className="flex items-center space-x-4 p-4 bg-gradient-to-r from-orange-50 to-orange-100 rounded-xl hover:from-orange-100 hover:to-orange-150 transition-all duration-200 border border-orange-200"
                    >
                      <div className="flex-shrink-0 w-10 h-10 bg-orange-600 rounded-lg flex items-center justify-center">
                        <div className="text-white">
                          {getAmenityIcon(amenity)}
                        </div>
                      </div>
                      <span className="text-gray-800 font-medium flex-1">{amenity}</span>
                      <Check className="w-5 h-5 text-green-500 flex-shrink-0" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Room Policies & Additional Info */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Policies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
            >
              <div className="flex items-center space-x-3 mb-6">
                <Shield className="w-6 h-6 text-orange-600" />
                <h2 className="text-2xl font-bold text-gray-900">Hotel Policies</h2>
              </div>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Clock className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Check-in & Check-out</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Check-in: 3:00 PM - 11:00 PM<br />
                      Check-out: Until 11:00 AM<br />
                      Early check-in and late check-out available upon request
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Calendar className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Cancellation Policy</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Free cancellation up to 24 hours before check-in.<br />
                      After that, charges may apply.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                    <Users className="w-5 h-5 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-2">Guest Policy</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                      Maximum occupancy: {room.capacity} guests<br />
                      Children under 12 stay free with existing bedding
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Why Choose This Room */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-3xl p-8 shadow-xl border border-orange-200"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-8 text-center">
                Why Choose This Room?
              </h2>
              
              <div className="space-y-6">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Star className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Premium Quality</h3>
                    <p className="text-gray-600 text-sm">
                      Experience luxury with carefully selected furnishings
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Wifi className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Modern Amenities</h3>
                    <p className="text-gray-600 text-sm">
                      High-speed Wi-Fi and latest conveniences included
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <Phone className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">24/7 Service</h3>
                    <p className="text-gray-600 text-sm">
                      Dedicated staff available around the clock
                    </p>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-orange-600 rounded-xl flex items-center justify-center shadow-lg">
                    <MapPin className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Prime Location</h3>
                    <p className="text-gray-600 text-sm">
                      Perfect location with easy access to city attractions
                    </p>
                  </div>
                </div>
              </div>

              {/* Contact CTA */}
              <div className="mt-8 bg-white rounded-2xl p-6 text-center shadow-lg">
                <p className="text-gray-600 mb-4">Need assistance with your booking?</p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  className="bg-orange-600 hover:bg-orange-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => window.location.href = '/#contact'}
                >
                  Contact Our Team
                </motion.button>
              </div>
            </motion.div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
