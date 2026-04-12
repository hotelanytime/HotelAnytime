import { NextRequest, NextResponse } from 'next/server';
import { listCloudinaryImages } from '@/lib/cloudinary';
import { Asset } from '@/types';

// Force dynamic so the list isn't cached
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const max = parseInt(url.searchParams.get('max') || '100', 10);
    const folder = url.searchParams.get('folder') || 'hotel-website';

    const resources: Asset[] = await listCloudinaryImages(folder, max);

    return NextResponse.json({ assets: resources });
  } catch {
    return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 });
  }
}
