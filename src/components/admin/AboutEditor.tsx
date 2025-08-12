"use client";
import { useState, useEffect } from 'react';
import { About, Feature } from '@/types';
import ImageLibraryModal from './ImageLibraryModal';
import { Plus, Trash2, Image as ImageIcon, Save } from 'lucide-react';
import toast from 'react-hot-toast';

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
      const res = await fetch('/api/about', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
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
      
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Title</label>
            <input 
              value={form.title || ''} 
              onChange={e => update({ title: e.target.value })} 
              className="w-full p-3 border rounded text-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Description</label>
            <textarea 
              value={form.description || ''} 
              onChange={e => update({ description: e.target.value })} 
              rows={4} 
              className="w-full p-3 border rounded text-gray-700"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-800">Image</label>
            <div className="flex items-center gap-3">
              <button 
                onClick={() => setShowLibrary(true)} 
                className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center gap-2 text-gray-700"
              >
                <ImageIcon className="w-4 h-4"/> Select
              </button>
              {form.image && (
                <img src={form.image} className="h-16 w-24 object-cover rounded"/>
              )}
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">Features</h3>
            <button 
              onClick={addFeature} 
              className="flex items-center gap-1 text-sm text-orange-600"
            >
              <Plus className="w-4 h-4"/> Add
            </button>
          </div>
          
          <div className="space-y-4">
            {(form.features || []).map((f, i) => (
              <div key={`feature-${i}`} className="border rounded border-gray-600 p-3 space-y-2">
                <div className="flex gap-2">
                  <input 
                    placeholder="Icon" 
                    value={f.icon || ''} 
                    onChange={e => updateFeature(i, { icon: e.target.value })} 
                    className="w-24 p-2 text-gray-700 border rounded"
                  />
                  <input 
                    placeholder="Title" 
                    value={f.title || ''} 
                    onChange={e => updateFeature(i, { title: e.target.value })} 
                    className="flex-1 p-2 border text-gray-700 rounded"
                  />
                  <button 
                    onClick={() => removeFeature(i)} 
                    className="text-red-600 hover:text-red-700"
                  >
                    <Trash2 className="w-4 h-4"/>
                  </button>
                </div>
                <textarea 
                  placeholder="Description" 
                  value={f.description || ''} 
                  onChange={e => updateFeature(i, { description: e.target.value })} 
                  rows={2} 
                  className="w-full p-2 text-gray-700 border rounded text-sm"
                />
              </div>
            ))}
            {!(form.features || []).length && (
              <div className="text-sm text-gray-500">No features added yet.</div>
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
