"use client";
import { useState, useEffect } from 'react';
import { Gallery, GalleryImage } from '@/types';
import ImageLibraryModal from './ImageLibraryModal';
import { Plus, Trash2, Image as ImageIcon, Save, Edit, X, Grid } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { 
  data: Gallery | null; 
  onSaved: (gallery: Gallery) => void; 
}

export default function GalleryManager({ data, onSaved }: Props) {
  const [form, setForm] = useState<Partial<Gallery>>({});
  const [showLibrary, setShowLibrary] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  
  useEffect(() => { 
    console.log('GalleryManager - Received data:', data);
    if (data) setForm(data); 
  }, [data]);

  const update = (patch: Partial<Gallery>) => setForm(p => ({ ...p, ...patch }));
  
  const addImages = (urls: string[]) => {
    const newImages = urls.map(url => ({
      url,
      caption: '',
      category: 'general'
    }));
    
    const images = [...(form.images || []), ...newImages];
    update({ images });
  };
  
  const updateImage = (i: number, patch: Partial<GalleryImage>) => { 
    const images = [...(form.images || [])]; 
    images[i] = { ...images[i], ...patch }; 
    update({ images }); 
  };
  
  const removeImage = (i: number) => { 
    const images = [...(form.images || [])]; 
    images.splice(i, 1); 
    update({ images }); 
  };
  
  const moveImage = (from: number, to: number) => {
    const images = [...(form.images || [])];
    const [moved] = images.splice(from, 1);
    images.splice(to, 0, moved);
    update({ images });
  };
  
  const save = async () => { 
    try { 
      const res = await fetch('/api/gallery', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(form)
      }); 
      if (!res.ok) throw new Error(); 
      const gallery = await res.json(); 
      toast.success('Gallery saved'); 
      onSaved(gallery);
    } catch { 
      toast.error('Save failed'); 
    } 
  };

  const categories = ['general', 'rooms', 'dining', 'facilities', 'events', 'exterior'];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Gallery Management</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowLibrary(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700"
          >
            <Plus className="w-4 h-4"/> Add Images
          </button>
          <button 
            onClick={save} 
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
          >
            <Save className="w-4 h-4"/> Save
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Gallery Title</label>
          <input 
            value={form.title || ''} 
            onChange={e => update({ title: e.target.value })} 
            placeholder="Hotel Photo Gallery"
            className="w-full p-3 border rounded"
          />
        </div>
        
        <div className="border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-4">
            <Grid className="w-5 h-5"/>
            <h3 className="font-semibold">Gallery Images ({(form.images || []).length})</h3>
          </div>
          
          {!(form.images || []).length ? (
            <div className="text-center py-12 text-gray-500">
              <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50"/>
              <p>No images in gallery yet.</p>
              <button 
                onClick={() => setShowLibrary(true)} 
                className="mt-3 px-4 py-2 bg-orange-600 text-white rounded text-sm hover:bg-orange-700"
              >
                Add First Images
              </button>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {(form.images || []).map((img, i) => (
                <div key={img.url || `gallery-${i}`} className="group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                  {/* Simple image display */}
                  <div style={{ width: '100%', height: '200px', position: 'relative', backgroundColor: '#f9fafb' }}>
                    <img 
                      src={img.url} 
                      alt={img.caption || `Gallery image ${i + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        display: 'block',
                        position: 'absolute',
                        top: 0,
                        left: 0
                      }}
                      onError={(e) => {
                        console.error('Gallery image failed to load:', img.url);
                        e.currentTarget.style.backgroundColor = '#fee2e2';
                        e.currentTarget.style.border = '2px solid #ef4444';
                      }}
                      onLoad={() => {
                        console.log('Gallery image loaded successfully:', img.url);
                      }}
                    />
                    
                    {/* Hover controls */}
                    <div 
                      className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 flex items-center justify-center transition-all"
                    >
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                        <button 
                          onClick={() => setEditingIndex(i)} 
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-orange-600 shadow-lg"
                        >
                          <Edit className="w-4 h-4"/>
                        </button>
                        <button 
                          onClick={() => removeImage(i)} 
                          className="p-2 bg-white rounded-full text-gray-700 hover:text-red-600 shadow-lg"
                        >
                          <Trash2 className="w-4 h-4"/>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="p-3 space-y-2">
                    {/* Debug URL display */}
                    <div className="text-xs text-gray-500 bg-gray-50 p-1 rounded truncate">
                      {img.url}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-gray-100 px-2 py-1 rounded">{img.category}</span>
                      <div className="flex gap-1">
                        <button 
                          onClick={() => moveImage(i, Math.max(0, i - 1))} 
                          disabled={i === 0}
                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          ↑
                        </button>
                        <button 
                          onClick={() => moveImage(i, Math.min((form.images || []).length - 1, i + 1))} 
                          disabled={i === (form.images || []).length - 1}
                          className="text-xs text-gray-500 hover:text-gray-700 disabled:opacity-50"
                        >
                          ↓
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 truncate">{img.caption || 'No caption'}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      
      {editingIndex !== null && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Edit Image Details</h3>
              <button onClick={() => setEditingIndex(null)}>
                <X className="w-6 h-6"/>
              </button>
            </div>
            
            {form.images && form.images[editingIndex] && (
              <div className="space-y-4">
                <div style={{ width: '100%', height: '200px', position: 'relative', backgroundColor: '#f9fafb' }}>
                  <img 
                    src={form.images[editingIndex].url} 
                    alt="Gallery image preview"
                    style={{ 
                      width: '100%', 
                      height: '100%', 
                      objectFit: 'cover',
                      display: 'block',
                      borderRadius: '8px'
                    }}
                    onError={(e) => {
                      console.error('Edit modal image failed to load:', form.images?.[editingIndex]?.url);
                      e.currentTarget.style.backgroundColor = '#fee2e2';
                      e.currentTarget.style.border = '2px solid #ef4444';
                    }}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Caption</label>
                  <input 
                    value={form.images[editingIndex].caption || ''} 
                    onChange={e => updateImage(editingIndex, { caption: e.target.value })} 
                    placeholder="Enter image caption..."
                    className="w-full p-3 border rounded"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select 
                    value={form.images[editingIndex].category} 
                    onChange={e => updateImage(editingIndex, { category: e.target.value })} 
                    className="w-full p-3 border rounded"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="flex gap-3 pt-4">
                  <button 
                    onClick={() => setEditingIndex(null)} 
                    className="flex-1 py-3 bg-orange-600 text-white rounded hover:bg-orange-700"
                  >
                    Done
                  </button>
                  <button 
                    onClick={() => {
                      removeImage(editingIndex);
                      setEditingIndex(null);
                    }} 
                    className="px-6 py-3 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      
      <ImageLibraryModal 
        isOpen={showLibrary} 
        multiple={true} 
        onClose={() => setShowLibrary(false)} 
        onSelect={addImages}
      />
    </div>
  );
}
