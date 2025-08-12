"use client";
import { useEffect, useState } from 'react';
import { Asset } from '@/types';
import { X, Upload, RefreshCcw } from 'lucide-react';
import toast from 'react-hot-toast';

interface Props { 
  isOpen: boolean; 
  onClose: () => void; 
  onSelect: (urls: string[]) => void; 
  multiple?: boolean; 
}

export default function ImageLibraryModal({ isOpen, onClose, onSelect, multiple }: Props) {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  const fetchAssets = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/assets');
      const data = await res.json();
      setAssets(data.assets || []);
    } catch { 
      toast.error('Failed to load assets'); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { 
    if (isOpen) {
      fetchAssets();
      setSelected({});
    }
  }, [isOpen]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; 
    if (!files?.length) return; 
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const form = new FormData(); 
        form.append('file', file);
        const res = await fetch('/api/upload', { method: 'POST', body: form });
        if (!res.ok) throw new Error();
      }
      toast.success('Upload complete'); 
      await fetchAssets();
    } catch { 
      toast.error('Upload error'); 
    } finally { 
      setUploading(false); 
    }
  };

  const toggleSelect = (asset: Asset) => {
    if (!multiple) { 
      setSelected({ [asset.public_id]: true }); 
      return; 
    }
    setSelected(p => ({ ...p, [asset.public_id]: !p[asset.public_id] }));
  };

  const confirm = () => {
    const urls = assets.filter(a => selected[a.public_id]).map(a => a.url);
    if (!urls.length) { 
      toast.error('Select at least one image'); 
      return; 
    }
    onSelect(urls); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[80vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Image Library</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded">
            <X className="w-5 h-5"/>
          </button>
        </div>
        
        <div className="p-4 flex items-center gap-4 border-b">
          <label className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded cursor-pointer text-sm">
            <Upload className="w-4 h-4"/> Upload
            <input type="file" multiple className="hidden" onChange={handleUpload} />
          </label>
          <button onClick={fetchAssets} className="flex items-center gap-2 px-4 py-2 border rounded text-sm hover:bg-gray-50 text-gray-700">
            <RefreshCcw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`}/> Refresh
          </button>
          {uploading && <span className="text-sm text-gray-500">Uploading...</span>}
        </div>
        
        <div className="flex-1 overflow-auto p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {loading && <div className="col-span-full text-center text-gray-500">Loading...</div>}
          {!loading && assets.map(a => {
            const sel = !!selected[a.public_id];
            return (
              <button 
                key={a.public_id} 
                type="button" 
                onClick={() => toggleSelect(a)} 
                className={`relative group rounded overflow-hidden border ${sel ? 'ring-2 ring-orange-500' : 'hover:shadow'}`}
              >
                <img src={a.url} alt={a.public_id} className="w-full h-32 object-cover"/>
                {sel && (
                  <span className="absolute top-1 right-1 bg-orange-600 text-white text-xs px-2 py-0.5 rounded">
                    Selected
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        <div className="p-4 border-t flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm rounded border hover:bg-gray-50 text-gray-700">
            Cancel
          </button>
          <button onClick={confirm} className="px-4 py-2 text-sm rounded bg-orange-600 text-white hover:bg-orange-700">
            Use Selected
          </button>
        </div>
      </div>
    </div>
  );
}
