import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Room } from '@/models';
import { hasMongoURI } from '@/lib/mongodb';

export async function GET() {
  try {
    let rooms: any[] = [];
    if (hasMongoURI) {
      try {
        await connectDB();
        rooms = await Room.find();
      } catch (dbErr) {
        rooms = [];
      }
    }
    
    if (rooms.length === 0) {
      // Default rooms data
      const defaultRooms = [
        {
          _id: "deluxe-suite",
          name: "Deluxe Suite",
          shortDescription: "Spacious suite with city views",
          description: "Experience luxury in our Deluxe Suite featuring a spacious bedroom, separate living area, and stunning city views. Perfect for business travelers and couples seeking comfort and elegance.",
          price: 299,
          images: [
            "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          ],
          amenities: ["King Bed", "City View", "Mini Bar", "Work Desk", "Free Wi-Fi", "Room Service"],
          capacity: 2,
          size: "45 sqm",
          available: true
        },
        {
          _id: "executive-room",
          name: "Executive Room",
          shortDescription: "Perfect for business travelers",
          description: "Our Executive Room combines comfort with functionality, featuring premium amenities and a dedicated workspace. Ideal for business travelers who demand excellence.",
          price: 199,
          images: [
            "https://images.unsplash.com/photo-1563298723-dcfebaa392e3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1520637836862-4d197d17c0a8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          ],
          amenities: ["Queen Bed", "Work Station", "Mini Bar", "Free Wi-Fi", "Coffee Machine"],
          capacity: 2,
          size: "35 sqm",
          available: true
        },
        {
          _id: "standard-room",
          name: "Standard Room",
          shortDescription: "Comfortable and affordable",
          description: "Our Standard Room offers all essential amenities for a comfortable stay. Clean, modern, and thoughtfully designed for relaxation and convenience.",
          price: 129,
          images: [
            "https://images.unsplash.com/photo-1568495248636-6432b97bd949?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
          ],
          amenities: ["Double Bed", "Private Bathroom", "Free Wi-Fi", "TV", "Air Conditioning"],
          capacity: 2,
          size: "25 sqm",
          available: true
        }
      ];
      
      return NextResponse.json(defaultRooms);
    }
    
    return NextResponse.json(rooms);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch rooms data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Prepare room data with defaults for required fields
    const roomData = {
      name: body.name || 'New Room',
      shortDescription: body.shortDescription || 'A comfortable room',
      description: body.description || 'A detailed description of this room.',
      price: body.price || 100,
      images: body.images || [],
      amenities: body.amenities || [],
      capacity: body.capacity || 2,
      size: body.size || '25 sqm',
      available: body.available !== undefined ? body.available : true
    };
    
    if (hasMongoURI) {
      try {
        await connectDB();
        const room = new Room(roomData);
        await room.save();
        return NextResponse.json(room);
      } catch (dbError) {
        console.error('Database save failed, using fallback:', dbError);
        // If database fails, fall back to mock response
        const newRoom = {
          _id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ...roomData
        };
        return NextResponse.json(newRoom);
      }
    } else {
      // No database configured, return mock room
      const newRoom = {
        _id: `room-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...roomData
      };
      return NextResponse.json(newRoom);
    }
  } catch (error) {
    console.error('Failed to create room:', error);
    return NextResponse.json(
      { error: 'Failed to create room' },
      { status: 500 }
    );
  }
}
