"use client";
import { useState, useEffect } from 'react';
import { About, Feature } from '@/types';
import ImageLibraryModal from './ImageLibraryModal';
import { Plus, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';
import { getCsrfToken } from '@/lib/csrf';

interface Props { 
  data: About | null; 
  onSaved: (about: About) => void; 
}

export default function AboutEditor({ data, onSaved }: Props) {
  const [form, setForm] = useState<Partial<About>>({});
  const [showLibrary, setShowLibrary] = useState(false);
  
  useEffect(() => { 
    if (data) setForm(data); 
  }, [data]);

  const update = (patch: Partial<About>) => setForm(p => ({ ...p, ...patch }));
  
  const addFeature = () => {
    update({ 
      features: [...(form.features || []), { icon: '', title: '', description: '' }] 
    });
  };
  
  const updateFeature = (i: number, patch: Partial<Feature>) => { 
    const features = [...(form.features || [])]; 
    features[i] = { ...features[i], ...patch } as Feature; 
    update({ features }); 
  };
  
  const removeFeature = (i: number) => { 
    const features = [...(form.features || [])]; 
    features.splice(i, 1); 
    update({ features }); 
  };
  
  const save = async () => { 
    try { 
      const csrfToken = await getCsrfToken();
      const res = await fetch('/api/about', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json', 'x-csrf-token': csrfToken }, 
        body: JSON.stringify(form)
      }); 
      if (!res.ok) throw new Error(); 
      const about = await res.json(); 
      toast.success('About saved'); 
      onSaved(about);
    } catch { 
      toast.error('Save failed'); 
    } 
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">About Section</h2>
        <button 
          onClick={save} 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700 w-full sm:w-auto"
        >
          <Save className="w-4 h-4"/> Save
        </button>
      </div>
      
      <div className="grid gap-4 sm:gap-6 xl:grid-cols-2">
        <div className="space-y-3 sm:space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Title</label>
            <input 
              value={form.title || ''} 
              onChange={e => update({ title: e.target.value })} 
              className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Description</label>
            <textarea 
              value={form.description || ''} 
              onChange={e => update({ description: e.target.value })} 
              rows={4} 
              className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base resize-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Image</label>
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
              <button 
                onClick={() => setShowLibrary(true)} 
                className="w-full sm:w-auto px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center gap-2 text-gray-700"
              >
                <ImageIcon className="w-4 h-4"/> Select Image
              </button>
              {form.image && (
                <div className="w-full sm:w-auto">
                  <Image src={form.image} alt="About image" width={96} height={64} className="h-16 w-24 object-cover rounded mx-auto sm:mx-0"/>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-3 sm:space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <h3 className="font-semibold text-gray-800">Features</h3>
            <button 
              onClick={addFeature} 
              className="flex items-center justify-center gap-1 text-sm text-orange-600 px-3 py-1 rounded border border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4"/> Add Feature
            </button>
          </div>
          
          <div className="space-y-3 sm:space-y-4">
            {(form.features || []).map((f, i) => (
              <div key={`feature-${i}`} className="border rounded border-gray-300 p-3 space-y-2 bg-gray-50">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input 
                    placeholder="Icon (e.g., ⭐)" 
                    value={f.icon || ''} 
                    onChange={e => updateFeature(i, { icon: e.target.value })} 
                    className="w-full sm:w-24 p-2 text-gray-700 border rounded text-sm"
                  />
                  <input 
                    placeholder="Feature Title" 
                    value={f.title || ''} 
                    onChange={e => updateFeature(i, { title: e.target.value })} 
                    className="flex-1 p-2 border text-gray-700 rounded text-sm"
                  />
                  <button 
                    onClick={() => removeFeature(i)} 
                    className="text-red-600 hover:text-red-700 p-2 w-full sm:w-auto flex items-center justify-center gap-1 border border-red-200 rounded hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4"/>
                    <span className="sm:hidden">Remove</span>
                  </button>
                </div>
                <textarea 
                  placeholder="Feature Description" 
                  value={f.description || ''} 
                  onChange={e => updateFeature(i, { description: e.target.value })} 
                  rows={2} 
                  className="w-full p-2 text-gray-700 border rounded text-sm resize-none"
                />
              </div>
            ))}
            {!(form.features || []).length && (
              <div className="text-sm text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded">
                No features added yet. Click &quot;Add Feature&quot; to get started.
              </div>
            )}
          </div>
        </div>
      </div>
      
      <ImageLibraryModal 
        isOpen={showLibrary} 
        multiple={false} 
        onClose={() => setShowLibrary(false)} 
        onSelect={urls => update({ image: urls[0] })}
      />
    </div>
  );
}
