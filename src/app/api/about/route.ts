import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { About } from '@/models';
import { hasMongoURI } from '@/lib/mongodb';

export async function GET() {
  try {
    let about = null;
    if (hasMongoURI) {
      try {
        await connectDB();
        about = await About.findOne().sort({ createdAt: -1 });
      } catch (dbErr) {
        about = null;
      }
    }
    
    if (!about) {
      return NextResponse.json({
        title: "About Our Hotel",
        description: "Experience unparalleled luxury and hospitality at Grand Hotel. Our commitment to excellence ensures every guest enjoys a memorable stay with world-class amenities and personalized service.",
        features: [
          {
            icon: "wifi",
            title: "Free Wi-Fi",
            description: "High-speed internet throughout the hotel"
          },
          {
            icon: "car",
            title: "Free Parking",
            description: "Complimentary valet parking service"
          },
          {
            icon: "utensils",
            title: "Restaurant",
            description: "Fine dining with international cuisine"
          },
          {
            icon: "dumbbell",
            title: "Fitness Center",
            description: "24/7 fully equipped gym"
          }
        ],
        image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
      });
    }
    
    return NextResponse.json(about);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch about data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();
    
    const about = await About.findOneAndUpdate(
      {},
      body,
      { upsert: true, new: true }
    );
    
    return NextResponse.json(about);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update about data' },
      { status: 500 }
    );
  }
}
