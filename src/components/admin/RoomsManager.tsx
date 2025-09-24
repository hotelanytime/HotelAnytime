"use client";
import { useState, useEffect } from 'react';
import { Room } from '@/types';
import ImageLibraryModal from './ImageLibraryModal';
import { Plus, Trash2, Image as ImageIcon, Save, Edit, X, Star } from 'lucide-react';
import toast from 'react-hot-toast';
import Image from 'next/image';

interface Props { 
  data: Room[] | null; 
  onSaved: (rooms: Room[]) => void; 
}

interface EditingRoom extends Partial<Room> {
  isNew?: boolean;
}

export default function RoomsManager({ data, onSaved }: Props) {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [editingRoom, setEditingRoom] = useState<EditingRoom | null>(null);
  const [showLibrary, setShowLibrary] = useState(false);
  
  useEffect(() => { 
    if (data) setRooms(data); 
  }, [data]);

  const startEditing = (room?: Room) => {
    setEditingRoom(room || { 
      isNew: true, 
      name: '', 
      type: '', 
      description: '', 
      price: 0, 
      images: [], 
      amenities: [], 
      rating: 0, 
      maxGuests: 2 
    });
  };
  
  const updateEditing = (patch: Partial<Room>) => {
    setEditingRoom(prev => ({ ...prev, ...patch }));
  };
  
  const addAmenity = () => {
    const amenities = [...(editingRoom?.amenities || []), ''];
    updateEditing({ amenities });
  };
  
  const updateAmenity = (i: number, value: string) => {
    const amenities = [...(editingRoom?.amenities || [])];
    amenities[i] = value;
    updateEditing({ amenities });
  };
  
  const removeAmenity = (i: number) => {
    const amenities = [...(editingRoom?.amenities || [])];
    amenities.splice(i, 1);
    updateEditing({ amenities });
  };
  
  const saveRoom = async () => {
    if (!editingRoom) return;
    
    try {
      const method = editingRoom.isNew ? 'POST' : 'PUT';
      const url = editingRoom.isNew ? '/api/rooms' : `/api/rooms/${editingRoom._id}`;
      
      const { isNew, ...roomData } = editingRoom;
      
      console.log('Saving room:', { method, url, roomData });
      
      const res = await fetch(url, {
        method, 
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify(roomData)
      });
      
      console.log('Save response:', { status: res.status, ok: res.ok });
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error('Save error response:', errorText);
        throw new Error(`HTTP ${res.status}: ${errorText}`);
      }
      
      const savedRoom = await res.json();
      console.log('Saved room:', savedRoom);
      
      if (editingRoom.isNew) {
        const newRooms = [...rooms, savedRoom];
        setRooms(newRooms);
        onSaved(newRooms);
      } else {
        const newRooms = rooms.map(r => r._id === savedRoom._id ? savedRoom : r);
        setRooms(newRooms);
        onSaved(newRooms);
      }
      
      setEditingRoom(null);
      toast.success('Room saved');
    } catch (error) { 
      console.error('Save failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error(`Save failed: ${errorMessage}`); 
    } 
  };
  
  const deleteRoom = async (roomId?: string) => {
    if (!roomId || !confirm('Delete this room?')) return;
    
    try {
      const res = await fetch(`/api/rooms/${roomId}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      
      const newRooms = rooms.filter(r => r._id !== roomId);
      setRooms(newRooms);
      onSaved(newRooms);
      toast.success('Room deleted');
    } catch { 
      toast.error('Delete failed'); 
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <h2 className="text-xl sm:text-2xl font-bold  text-gray-900">Rooms Management</h2>
        <button 
          onClick={() => startEditing()} 
          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded text-sm hover:bg-green-700 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4"/> Add Room
        </button>
      </div>
      
      <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {rooms.map(room => (
          <div key={room._id} className="border border-gray-300 bg-white rounded-lg p-3 sm:p-4 space-y-3 shadow-sm">
            <div className="flex justify-between items-start gap-2">
              <h3 className="font-semibold text-gray-700 text-sm sm:text-base truncate flex-1">{room.name}</h3>
              <div className="flex gap-1 flex-shrink-0">
                <button 
                  onClick={() => startEditing(room)} 
                  className="text-orange-600 hover:text-orange-700 p-1"
                  title="Edit room"
                >
                  <Edit className="w-4 h-4"/>
                </button>
                <button 
                  onClick={() => deleteRoom(room._id)} 
                  className="text-red-600 hover:text-red-700 p-1"
                  title="Delete room"
                >
                  <Trash2 className="w-4 h-4"/>
                </button>
              </div>
            </div>
            
            {room.images?.[0] && (
              <div className="w-full h-32 sm:h-40 rounded overflow-hidden bg-gray-100">
                <Image 
                  src={room.images[0]} 
                  alt={room.name} 
                  width={200} 
                  height={160} 
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            
            <div className="text-sm space-y-1">
              <div className="text-gray-600 truncate">{room.type}</div>
              <div className="font-medium text-gray-700">₹{room.price}/night</div>
              <div className="flex items-center gap-1">
                <Star className="w-4 h-4 text-yellow-500 flex-shrink-0"/>
                <span>{room.rating}</span>
                <span className="text-gray-500">• {room.maxGuests} guests</span>
              </div>
            </div>
          </div>
        ))}
        
        {!rooms.length && (
          <div className="col-span-full text-center py-8 text-gray-500 border border-dashed border-gray-300 rounded-lg">
            <div className="space-y-2">
              <p>No rooms added yet.</p>
              <p className="text-xs text-gray-400">Click "Add Room" to create your first room listing.</p>
            </div>
          </div>
        )}
      </div>
      
      {editingRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg p-3 sm:p-6 max-w-2xl w-full my-4 sm:my-0 max-h-[95vh] sm:max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4 sm:mb-6 sticky top-0 bg-white pb-2 border-b sm:border-b-0 sm:pb-0">
              <h3 className="text-lg sm:text-xl text-gray-900 font-semibold">
                {editingRoom.isNew ? 'Add Room' : 'Edit Room'}
              </h3>
              <button 
                onClick={() => setEditingRoom(null)} 
                className="p-1 hover:bg-gray-100 rounded"
                title="Close"
              >
                <X className="w-5 h-5 sm:w-6 sm:h-6"/>
              </button>
            </div>
            
            <div className="space-y-3 sm:space-y-4">
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Room Name</label>
                  <input 
                    value={editingRoom.name || ''} 
                    onChange={e => updateEditing({ name: e.target.value })} 
                    className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base"
                    placeholder="Deluxe Suite"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Room Type</label>
                  <input 
                    value={editingRoom.type || ''} 
                    onChange={e => updateEditing({ type: e.target.value })} 
                    className="w-full p-2 sm:p-3 border text-gray-700 rounded text-sm sm:text-base"
                    placeholder="Suite"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Description</label>
                <textarea 
                  value={editingRoom.description || ''} 
                  onChange={e => updateEditing({ description: e.target.value })} 
                  rows={3} 
                  className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base resize-none"
                  placeholder="Describe the room features and amenities..."
                />
              </div>
              
              <div className="grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Price (₹ per night)</label>
                  <input 
                    type="number" 
                    value={editingRoom.price || 0} 
                    onChange={e => updateEditing({ price: parseFloat(e.target.value) || 0 })} 
                    className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base"
                    placeholder="e.g., 3500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Rating (0-5)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="5" 
                    step="0.1" 
                    value={editingRoom.rating || 0} 
                    onChange={e => updateEditing({ rating: parseFloat(e.target.value) || 0 })} 
                    className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base"
                    placeholder="4.5"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1 text-gray-800">Max Guests</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={editingRoom.maxGuests || 2} 
                    onChange={e => updateEditing({ maxGuests: parseInt(e.target.value) || 2 })} 
                    className="w-full p-2 sm:p-3 border rounded text-gray-700 text-sm sm:text-base"
                    placeholder="2"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1 text-gray-800">Images</label>
                <div className="space-y-2">
                  <button 
                    onClick={() => setShowLibrary(true)} 
                    className="w-full sm:w-auto px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm flex items-center justify-center gap-2 text-gray-700"
                  >
                    <ImageIcon className="w-4 h-4"/> Select Images ({(editingRoom.images || []).length} selected)
                  </button>
                  
                  {(editingRoom.images || []).length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {(editingRoom.images || []).slice(0, 4).map((img, i) => (
                        <div key={img || `image-${i}`} className="aspect-square">
                          <Image 
                            alt="room image" 
                            src={img} 
                            width={80} 
                            height={80} 
                            className="w-full h-full object-cover rounded"
                          />
                        </div>
                      ))}
                      {(editingRoom.images || []).length > 4 && (
                        <div className="aspect-square bg-gray-100 rounded flex items-center justify-center text-sm">
                          +{(editingRoom.images || []).length - 4}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <label className="block text-sm font-medium text-gray-800">Room Amenities</label>
                  <button 
                    onClick={addAmenity} 
                    className="text-sm text-orange-600 flex items-center justify-center gap-1 px-3 py-1 rounded border border-orange-200 hover:bg-orange-50 w-full sm:w-auto"
                  >
                    <Plus className="w-4 h-4"/> Add Amenity
                  </button>
                </div>
                
                <div className="space-y-2">
                  {(editingRoom.amenities || []).map((amenity, i) => (
                    <div key={`amenity-input-${i}`} className="flex flex-col sm:flex-row gap-2">
                      <input 
                        value={amenity} 
                        onChange={e => updateAmenity(i, e.target.value)} 
                        className="flex-1 p-2 border text-gray-700 rounded text-sm"
                        placeholder="e.g., Free WiFi, Air Conditioning, Room Service"
                      />
                      <button 
                        onClick={() => removeAmenity(i)} 
                        className="text-red-600 hover:text-red-700 p-2 w-full sm:w-auto flex items-center justify-center gap-1 border border-red-200 rounded hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4"/>
                        <span className="sm:hidden">Remove</span>
                      </button>
                    </div>
                  ))}
                  {!(editingRoom.amenities || []).length && (
                    <div className="text-sm text-gray-500 text-center py-3 border border-dashed border-gray-300 rounded">
                      No amenities added yet. Click "Add Amenity" to get started.
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
                <button 
                  onClick={saveRoom} 
                  className="flex-1 py-2 sm:py-3 bg-orange-600 text-white rounded hover:bg-orange-700 flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <Save className="w-4 h-4"/> Save Room
                </button>
                <button 
                  onClick={() => setEditingRoom(null)} 
                  className="flex-1 sm:flex-none px-6 py-2 sm:py-3 bg-gray-200 rounded text-gray-700 hover:bg-gray-300 text-sm sm:text-base"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <ImageLibraryModal 
        isOpen={showLibrary} 
        multiple={true} 
        onClose={() => setShowLibrary(false)} 
        onSelect={urls => updateEditing({ images: urls })}
      />
    </div>
  );
}
