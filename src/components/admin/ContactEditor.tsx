"use client";
import { useState, useEffect } from 'react';
import { Contact } from '@/types';
import { Save, Plus, Trash2, MapPin, Phone, Mail, Clock, Globe } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { 
  data: Contact | null; 
  onSaved: (contact: Contact) => void; 
}

interface SocialLink {
  platform: string;
  url: string;
  icon: string;
}

export default function ContactEditor({ data, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Contact & { socialLinks: SocialLink[] }>>({});
  
  useEffect(() => { 
    if (data) {
      // Convert SocialLinks object to SocialLink array for editing
      const socialLinksArray = data.socialLinks ? Object.entries(data.socialLinks).map(([platform, url]) => ({
        platform: platform.charAt(0).toUpperCase() + platform.slice(1),
        url: url || '',
        icon: platform
      })).filter(link => link.url) : [];
      
      setForm({
        ...data,
        socialLinks: socialLinksArray
      });
    }
  }, [data]);

  const update = (patch: Partial<Contact & { socialLinks: SocialLink[] }>) => 
    setForm(p => ({ ...p, ...patch }));
  
  const addSocialLink = () => {
    const socialLinks = [...(form.socialLinks || []), { platform: '', url: '', icon: '' }];
    update({ socialLinks });
  };
  
  const updateSocialLink = (i: number, patch: Partial<SocialLink>) => {
    const socialLinks = [...(form.socialLinks || [])];
    socialLinks[i] = { ...socialLinks[i], ...patch };
    update({ socialLinks });
  };
  
  const removeSocialLink = (i: number) => {
    const socialLinks = [...(form.socialLinks || [])];
    socialLinks.splice(i, 1);
    update({ socialLinks });
  };
  
  const save = async () => { 
    try { 
      const res = await fetch('/api/contact', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form)
      }); 
      if (!res.ok) throw new Error(); 
      const contact = await res.json(); 
      toast.success('Contact saved'); 
      onSaved(contact);
    } catch { 
      toast.error('Save failed'); 
    } 
  };

  const socialPlatforms = [
    { name: 'Facebook', icon: 'facebook' },
    { name: 'Twitter', icon: 'twitter' },
    { name: 'Instagram', icon: 'instagram' },
    { name: 'LinkedIn', icon: 'linkedin' },
    { name: 'YouTube', icon: 'youtube' },
    { name: 'TripAdvisor', icon: 'star' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Contact Information</h2>
        <button 
          onClick={save} 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 w-full sm:w-auto"
        >
          <Save className="w-4 h-4"/> Save
        </button>
      </div>
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-gray-800">
              <MapPin className="w-5 h-5 text-gray-700"/> Address & Location
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Street Address</label>
              <textarea 
                value={form.address || ''} 
                onChange={e => update({ address: e.target.value })} 
                rows={3}
                placeholder="123 Hotel Street, City, State, ZIP"
                className="w-full p-3 border rounded text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Latitude</label>
                <input 
                  type="number" 
                  step="any"
                  value={form.coordinates?.lat || ''} 
                  onChange={e => update({ 
                    coordinates: { 
                      lat: parseFloat(e.target.value) || 0,
                      lng: form.coordinates?.lng || 0
                    } 
                  })} 
                  className="w-full text-gray-700 p-3 border rounded"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Longitude</label>
                <input 
                  type="number" 
                  step="any"
                  value={form.coordinates?.lng || ''} 
                  onChange={e => update({ 
                    coordinates: { 
                      lat: form.coordinates?.lat || 0,
                      lng: parseFloat(e.target.value) || 0 
                    } 
                  })} 
                  className="w-full p-3 text-gray-700 border rounded"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-gray-800">
              <Phone className="w-5 h-5"/> Contact Details
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Phone Number</label>
              <input 
                value={form.phone || ''} 
                onChange={e => update({ phone: e.target.value })} 
                placeholder="+1 (555) 123-4567"
                className="w-full p-3 border rounded text-gray-700 focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Email Address</label>
              <input 
                type="email"
                value={form.email || ''} 
                onChange={e => update({ email: e.target.value })} 
                placeholder="info@hotel.com"
                className="w-full p-3 border text-gray-700 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Website</label>
              <input 
                type="url"
                value={form.website || ''} 
                onChange={e => update({ website: e.target.value })} 
                placeholder="https://hotel.com"
                className="w-full p-3 border text-gray-700 rounded"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2 text-gray-800">
              <Clock className="w-5 h-5"/> Business Hours
            </h3>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Reception Hours</label>
              <input 
                value={form.hours || ''} 
                onChange={e => update({ hours: e.target.value })} 
                placeholder="24/7 or Mon-Sun: 9:00 AM - 6:00 PM"
                className="w-full p-3 border text-gray-700 placeholder:text-gray-400 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Check-in Time</label>
              <input 
                value={form.checkinTime || ''} 
                onChange={e => update({ checkinTime: e.target.value })} 
                placeholder="3:00 PM"
                className="w-full p-3 border text-gray-700 rounded"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1 text-gray-700">Check-out Time</label>
              <input 
                value={form.checkoutTime || ''} 
                onChange={e => update({ checkoutTime: e.target.value })} 
                placeholder="11:00 AM"
                className="w-full p-3 border text-gray-700 rounded"
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                <Globe className="w-5 h-5"/> Social Media
              </h3>
              <button 
                onClick={addSocialLink} 
                className="flex items-center gap-1 text-sm text-orange-600"
              >
                <Plus className="w-4 h-4"/> Add Link
              </button>
            </div>
            
            <div className="space-y-3">
              {(form.socialLinks || []).map((link, i) => (
                <div key={link.platform || `social-${i}`} className="border border-gray-500 rounded p-3 space-y-2">
                  <div className="flex gap-2">
                    <select 
                      value={link.platform} 
                      onChange={e => updateSocialLink(i, { 
                        platform: e.target.value,
                        icon: socialPlatforms.find(p => p.name === e.target.value)?.icon || ''
                      })} 
                      className="w-32 p-2 border text-gray-700 rounded"
                    >
                      <option value="">Platform</option>
                      {socialPlatforms.map(platform => (
                        <option key={platform.name} value={platform.name}>
                          {platform.name}
                        </option>
                      ))}
                    </select>
                    
                    <input 
                      placeholder="Profile URL" 
                      value={link.url} 
                      onChange={e => updateSocialLink(i, { url: e.target.value })} 
                      className="flex-1 text-gray-700 p-2 border rounded"
                    />
                    
                    <button 
                      onClick={() => removeSocialLink(i)} 
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4"/>
                    </button>
                  </div>
                </div>
              ))}
              
              {!(form.socialLinks || []).length && (
                <div className="text-sm text-gray-500">No social media links added yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
