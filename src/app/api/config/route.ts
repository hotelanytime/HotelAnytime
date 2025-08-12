import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Hero } from '@/models';
import { hasMongoURI } from '@/lib/mongodb';

export async function GET() {
  try {
    let hotelName = null; // No default fallback

    if (hasMongoURI) {
      try {
        await connectDB();
        const hero = await Hero.findOne().sort({ createdAt: -1 });
        
        if (hero) {
          // First try to get hotelName field
          if (hero.hotelName && hero.hotelName.trim()) {
            hotelName = hero.hotelName.trim();
          } else if (hero.title && hero.title.trim()) {
            // Extract hotel name from title if hotelName is not set
            let extractedName = hero.title.trim();
            
            // Remove common prefixes
            extractedName = extractedName.replace(/^(Welcome to|Visit|Experience|Stay at)\s+/i, '');
            
            if (extractedName.length > 2) {
              hotelName = extractedName;
            }
          }
        }
      } catch (dbErr) {
        console.error('Database error in config API:', dbErr);
        // Don't use any fallback, keep hotelName as null
      }
    }

    return NextResponse.json({
      hotelName,
      success: true
    });
  } catch (error) {
    console.error('Config API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch config', success: false },
      { status: 500 }
    );
  }
}
