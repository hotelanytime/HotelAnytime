'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Home,
  Users,
  Image as ImageIcon,
  Settings,
  LogOut,
  Edit,
  Plus,
  Trash2,
  Upload,
  Lock
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { Hero, About, Room, Gallery, Contact } from '@/types';
import HeroEditor from '@/components/admin/HeroEditor';
import AboutEditor from '@/components/admin/AboutEditor';
import RoomsManager from '@/components/admin/RoomsManager';
import GalleryManager from '@/components/admin/GalleryManager';
import ContactEditor from '@/components/admin/ContactEditor';

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('hero');
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [data, setData] = useState({
    hero: null as Hero | null,
    about: null as About | null,
    rooms: [] as Room[],
    gallery: null as Gallery | null,
    contact: null as Contact | null,
  });

  // Editor states - kept for legacy compatibility but may not be needed
  const [heroData, setHeroData] = useState<Partial<Hero>>({});
  const [aboutData, setAboutData] = useState<Partial<About>>({});
  const [contactData, setContactData] = useState<Partial<Contact>>({});
  
  const router = useRouter();

  const tabs = [
    { id: 'hero', name: 'Hero Section', icon: Home },
    { id: 'about', name: 'About', icon: Users },
    { id: 'rooms', name: 'Rooms', icon: Settings },
    { id: 'gallery', name: 'Gallery', icon: ImageIcon },
    { id: 'contact', name: 'Contact', icon: Settings },
  ];

  useEffect(() => {
    checkAuth();
  }, []);

  // Update editor states when data changes
  useEffect(() => {
    if (data.hero) {
      setHeroData(data.hero);
    }
    if (data.about) {
      setAboutData(data.about);
    }
    if (data.contact) {
      setContactData(data.contact);
    }
  }, [data]);

  const redirectingRef = useRef(false);

  const checkAuth = async () => {
    if (redirectingRef.current) return;
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('admin-token') : null;
      console.log('Dashboard - Token from localStorage:', token ? 'exists' : 'missing');

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      console.log('Dashboard - Making verify request');
      const response = await fetch('/api/admin/verify', {
        method: 'GET',
        headers,
        credentials: 'include'
      });

      console.log('Dashboard - Verify response status:', response.status);

      if (!response.ok) {
        console.log('Dashboard - Verification failed, clearing token');
        if (token) localStorage.removeItem('admin-token');
        setAuthLoading(false);
        redirectingRef.current = true;
        router.replace('/admin/login');
        return;
      }

      console.log('Dashboard - Authentication successful');
      setIsAuthenticated(true);
      setAuthLoading(false);
      fetchData();
    } catch (error) {
      console.error('Dashboard - Auth check failed:', error);
      if (typeof window !== 'undefined') localStorage.removeItem('admin-token');
      setAuthLoading(false);
      redirectingRef.current = true;
      router.replace('/admin/login');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const endpoints = ['hero', 'about', 'rooms', 'gallery', 'contact'];
      const responses = await Promise.all(
        endpoints.map(endpoint => fetch(`/api/${endpoint}`))
      );
      const results = await Promise.all(responses.map(res => res.json()));
      
      console.log('Admin Dashboard - Fetched data:', {
        hero: results[0],
        gallery: results[3]
      });
      
      setData({
        hero: results[0],
        about: results[1],
        rooms: results[2],
        gallery: results[3],
        contact: results[4],
      });
    } catch (error) {
      console.error('Admin Dashboard - Fetch error:', error);
      toast.error('Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/auth', { 
        method: 'DELETE',
        credentials: 'include'
      });
      
      localStorage.removeItem('admin-token');
      toast.success('Logged out successfully');
      
      // Small delay to show the message
      setTimeout(() => {
        router.push('/admin/login');
      }, 1000);
    } catch (error) {
      toast.error('Logout failed');
      localStorage.removeItem('admin-token');
      router.push('/admin/login');
    }
  };

  const updateData = async (endpoint: string, updatedData: any) => {
    try {
      const response = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });

      if (response.ok) {
        toast.success('Data updated successfully');
        fetchData();
      } else {
        toast.error('Failed to update data');
      }
    } catch (error) {
      toast.error('An error occurred');
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (response.ok) {
      const result = await response.json();
      return result.url;
    } else {
      throw new Error('Upload failed');
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'hero':
        return (
          <HeroEditor 
            data={data.hero} 
            onSaved={(hero) => setData(prev => ({ ...prev, hero }))}
          />
        );
      case 'about':
        return (
          <AboutEditor 
            data={data.about} 
            onSaved={(about) => setData(prev => ({ ...prev, about }))}
          />
        );
      case 'rooms':
        return (
          <RoomsManager 
            data={data.rooms} 
            onSaved={(rooms) => setData(prev => ({ ...prev, rooms }))}
          />
        );
      case 'gallery':
        return (
          <GalleryManager 
            data={data.gallery} 
            onSaved={(gallery) => setData(prev => ({ ...prev, gallery }))}
          />
        );
      case 'contact':
        return (
          <ContactEditor 
            data={data.contact} 
            onSaved={(contact) => setData(prev => ({ ...prev, contact }))}
          />
        );
      default:
        return <div>Select a section to edit</div>;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  // Show loading screen while checking authentication
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-gray-700">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-right" />
      
      {/* Header Bar */}
      <header className="bg-white shadow-sm border-b">
        <div className="px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lock className="w-6 h-6 text-orange-600" />
            <h1 className="text-lg sm:text-xl font-bold text-gray-900">Hotel Admin Dashboard</h1>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </header>
      
      <div className="flex flex-col lg:flex-row">
        {/* Mobile Navigation */}
        <div className="lg:hidden bg-white border-b">
          <div className="px-4 py-3">
            <select 
              value={activeTab} 
              onChange={(e) => setActiveTab(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            >
              {tabs.map((tab) => (
                <option key={tab.id} value={tab.id}>
                  {tab.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Desktop Sidebar */}
        <aside className="hidden lg:block w-64 bg-white shadow-sm border-r min-h-[calc(100vh-73px)]">
          <nav className="p-4">
            <div className="space-y-2">
              {tabs.map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors font-medium ${
                      activeTab === tab.id
                        ? 'bg-orange-50 text-orange-700 border border-orange-200'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <IconComponent className="w-5 h-5 flex-shrink-0" />
                    <span>{tab.name}</span>
                  </button>
                );
              })}
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 overflow-auto min-h-[calc(100vh-73px)] lg:min-h-[calc(100vh-73px)]">
          <div className="max-w-7xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading data...</p>
                </div>
              </div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white rounded-lg shadow-sm border p-4 sm:p-6"
              >
                {renderContent()}
              </motion.div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
