import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { Contact } from '@/models';
import { hasMongoURI } from '@/lib/mongodb';

export async function GET() {
  try {
    let contact = null;
    if (hasMongoURI) {
      try {
        await connectDB();
        contact = await Contact.findOne().sort({ createdAt: -1 });
      } catch (dbErr) {
        contact = null;
      }
    }
    
    if (!contact) {
      return NextResponse.json({
        address: "123 Luxury Street, Downtown City, 12345",
        phone: "+1 (555) 123-4567",
        email: "info@grandhotel.com",
        socialLinks: {
          facebook: "https://facebook.com/grandhotel",
          twitter: "https://twitter.com/grandhotel",
          instagram: "https://instagram.com/grandhotel",
          linkedin: "https://linkedin.com/company/grandhotel"
        },
        coordinates: {
          lat: 40.7128,
          lng: -74.0060
        }
      });
    }
    
    return NextResponse.json(contact);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch contact data' },
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
    const contactDoc = await Contact.findOneAndUpdate({}, body, { upsert: true, new: true });
    return NextResponse.json(contactDoc);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update contact data' },
      { status: 500 }
    );
  }
}
