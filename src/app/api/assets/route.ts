import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

// Force dynamic so the list isn't cached
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const max = parseInt(url.searchParams.get('max') || '100', 10);
    const folder = url.searchParams.get('folder') || 'hotel-website';
    const nextCursor = url.searchParams.get('nextCursor') || undefined;

    // Cloudinary search API
    const search = (cloudinary as any).search
      .expression(`folder=${folder}`)
      .sort_by('created_at', 'desc')
      .max_results(Math.min(max, 100));

    if (nextCursor) search.next_cursor(nextCursor);

    const result: any = await search.execute();
    const resources = (result.resources || []).map((r: any) => ({
      url: r.secure_url,
      public_id: r.public_id,
      format: r.format,
      bytes: r.bytes,
      width: r.width,
      height: r.height,
      created_at: r.created_at,
    }));
    return NextResponse.json({ assets: resources, nextCursor: result.next_cursor || null });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 });
  }
}
