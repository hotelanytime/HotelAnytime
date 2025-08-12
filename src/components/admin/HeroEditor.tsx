"use client";
import { useState, useEffect } from 'react';
import { Hero } from '@/types';
import ImageLibraryModal from './ImageLibraryModal';
import { Save, Image as ImageIcon } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { 
  data: Hero | null; 
  onSaved: (hero: Hero) => void; 
}

export default function HeroEditor({ data, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Hero>>({});
  const [showLibrary, setShowLibrary] = useState(false);
  
  useEffect(() => { 
    console.log('HeroEditor - Received data:', data);
    if (data) setForm(data); 
  }, [data]);

  const update = (patch: Partial<Hero>) => setForm(p => ({ ...p, ...patch }));
  
  const save = async () => { 
    try { 
      const res = await fetch('/api/hero', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form)
      }); 
      if (!res.ok) throw new Error(); 
      const hero = await res.json(); 
      toast.success('Hero section saved'); 
      onSaved(hero);
    } catch { 
      toast.error('Save failed'); 
    } 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Hero Section</h2>
          <p className="text-gray-600 mt-1">Manage the main banner content on your homepage</p>
        </div>
        <button 
          onClick={save} 
          className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium w-full sm:w-auto"
        >
          <Save className="w-4 h-4"/> Save Changes
        </button>
      </div>
      
      <div className="grid gap-6 lg:gap-8 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Content Settings</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Hotel Name</label>
                <input 
                  value={form.hotelName || ''} 
                  onChange={e => update({ hotelName: e.target.value })} 
                  placeholder="Grand Hotel"
                  className="w-full p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <p className="text-xs text-gray-500 mt-1">This will appear in the footer and site branding</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input 
                  value={form.title || ''} 
                  onChange={e => update({ title: e.target.value })} 
                  placeholder="Welcome to Our Luxury Hotel"
                  className="w-full p-3 border text-gray-700 border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subtitle</label>
                <textarea 
                  value={form.subtitle || ''} 
                  onChange={e => update({ subtitle: e.target.value })} 
                  rows={3}
                  placeholder="Experience comfort and luxury like never before..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-700 focus:border-orange-500 resize-none"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Call to Action Text</label>
                <input 
                  value={form.ctaText || ''} 
                  onChange={e => update({ ctaText: e.target.value })} 
                  placeholder="Book Now"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-gray-700 focus:border-orange-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-900 mb-4">Background Image</h3>
            
            <div className="space-y-4">
              <button 
                onClick={() => setShowLibrary(true)} 
                className="w-full p-4 bg-white border-2 border-dashed border-gray-300 rounded-lg hover:border-orange-400 hover:bg-orange-50 transition-colors flex items-center justify-center gap-2"
              >
                <ImageIcon className="w-5 h-5 text-gray-500"/> 
                <span className="text-gray-700">Select Background Image</span>
              </button>
              
              {form.backgroundImage ? (
                <div className="space-y-3">
                  {/* Simple image display first */}
                  <div className="w-full border border-gray-300 rounded-lg overflow-hidden">
                    <img 
                      src={form.backgroundImage} 
                      className="w-full h-64 object-cover block"
                      alt="Hero background preview"
                      style={{ display: 'block', width: '100%', height: '256px', objectFit: 'cover' }}
                      onError={(e) => {
                        console.error('Failed to load hero image:', form.backgroundImage);
                        const target = e.currentTarget;
                        target.style.backgroundColor = '#fee2e2';
                        target.style.border = '2px solid #ef4444';
                        target.alt = 'Image failed to load';
                      }}
                      onLoad={(e) => {
                        console.log('Hero image loaded successfully:', form.backgroundImage);
                        const target = e.currentTarget;
                        target.style.border = '2px solid #10b981';
                      }}
                    />
                  </div>
                  
                  {/* Preview with overlay */}
                  <div className="relative rounded-lg overflow-hidden bg-gray-900">
                    <img 
                      src={form.backgroundImage} 
                      className="w-full h-64 object-cover"
                      alt="Hero background with overlay"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center">
                      <div className="text-center text-white p-6">
                        <h3 className="text-xl font-bold mb-2">
                          {form.title || 'Hero Title'}
                        </h3>
                        <p className="text-sm opacity-90 mb-4">
                          {form.subtitle || 'Hero subtitle will appear here...'}
                        </p>
                        {form.ctaText && (
                          <button className="px-6 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium">
                            {form.ctaText}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* Debug info */}
                  <div className="text-xs text-gray-600 p-2 bg-gray-50 rounded border">
                    <strong>Image URL:</strong> {form.backgroundImage}
                  </div>
                </div>
              ) : (
                <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50"/>
                    <p className="text-sm">No background image selected</p>
                    <p className="text-xs text-gray-400 mt-1">Click above to choose an image</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      
      <ImageLibraryModal 
        isOpen={showLibrary} 
        multiple={false} 
        onClose={() => setShowLibrary(false)} 
        onSelect={urls => update({ backgroundImage: urls[0] })}
      />
    </div>
  );
}
