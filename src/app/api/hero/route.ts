import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Hero } from '@/models';
import { hasMongoURI } from '@/lib/mongodb';

export async function GET() {
  try {
    let hero = null;
    if (hasMongoURI) {
      try {
        await connectDB();
        hero = await Hero.findOne().sort({ createdAt: -1 });
      } catch (dbErr) {
        // Silently fall back to default data if DB connection fails.
        hero = null;
      }
    }
    
    if (!hero) {
      return NextResponse.json({
        title: "Welcome to Grand Hotel",
        subtitle: "Experience luxury and comfort in the heart of the city",
        hotelName: "Grand Hotel",
        backgroundImage: "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80",
        ctaText: "Book Now"
      });
    }
    
    // Ensure hotelName is present, use default if missing
    const heroResponse = {
      ...hero.toObject(),
      hotelName: hero.hotelName || "Grand Hotel"
    };
    
    return NextResponse.json(heroResponse);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch hero data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    await connectDB();
    
    const hero = await Hero.findOneAndUpdate(
      {},
      body,
      { upsert: true, new: true }
    );
    
    return NextResponse.json(hero);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update hero data' },
      { status: 500 }
    );
  }
}
