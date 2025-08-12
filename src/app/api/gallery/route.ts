import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Gallery } from '@/models';
import { hasMongoURI } from '@/lib/mongodb';

export async function GET() {
  try {
    let gallery = null;
    if (hasMongoURI) {
      try {
        await connectDB();
        gallery = await Gallery.findOne().sort({ createdAt: -1 });
      } catch (dbErr) {
        gallery = null;
      }
    }
    
    if (!gallery) {
      return NextResponse.json({
        title: "Hotel Gallery",
        images: [
          {
            url: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            caption: "Hotel Lobby",
            category: "interior"
          },
          {
            url: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            caption: "Deluxe Suite",
            category: "rooms"
          },
          {
            url: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            caption: "Restaurant",
            category: "dining"
          },
          {
            url: "https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            caption: "Hotel Exterior",
            category: "exterior"
          },
          {
            url: "https://images.unsplash.com/photo-1590490360182-c33d57733427?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            caption: "Executive Room",
            category: "rooms"
          },
          {
            url: "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
            caption: "Pool Area",
            category: "amenities"
          }
        ]
      });
    }
    
    return NextResponse.json(gallery);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch gallery data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!hasMongoURI) {
      return NextResponse.json({ error: 'Database not configured' }, { status: 503 });
    }
    const body = await request.json();
    await connectDB();
    const galleryDoc = await Gallery.findOneAndUpdate({}, body, { upsert: true, new: true });
    return NextResponse.json(galleryDoc);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update gallery data' },
      { status: 500 }
    );
  }
}
