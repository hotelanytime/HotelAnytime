'use client';

import { useEffect, useState } from 'react';

export default function TestImages() {
  const [heroData, setHeroData] = useState<any>(null);
  const [galleryData, setGalleryData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [heroRes, galleryRes] = await Promise.all([
          fetch('/api/hero'),
          fetch('/api/gallery')
        ]);
        
        const hero = await heroRes.json();
        const gallery = await galleryRes.json();
        
        console.log('Test page - Hero data:', hero);
        console.log('Test page - Gallery data:', gallery);
        
        setHeroData(hero);
        setGalleryData(gallery);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <h1 className="text-3xl font-bold mb-8">Image Loading Test</h1>
      
      <div className="space-y-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Hero Image</h2>
          {heroData?.backgroundImage ? (
            <div className="space-y-4">
              <p className="text-sm text-gray-600">URL: {heroData.backgroundImage}</p>
              <img 
                src={heroData.backgroundImage}
                alt="Hero background"
                className="w-full max-w-md h-64 object-cover border rounded"
                onLoad={() => console.log('Hero image loaded successfully')}
                onError={(e) => {
                  console.error('Hero image failed to load:', heroData.backgroundImage);
                  e.currentTarget.style.border = '2px solid red';
                }}
              />
            </div>
          ) : (
            <p>No hero image data</p>
          )}
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Gallery Images</h2>
          {galleryData?.images?.length ? (
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              {galleryData.images.map((img: any, i: number) => (
                <div key={i} className="space-y-2">
                  <p className="text-xs text-gray-600 truncate">{img.url}</p>
                  <img 
                    src={img.url}
                    alt={img.caption || 'Gallery image'}
                    className="w-full h-32 object-cover border rounded"
                    onLoad={() => console.log(`Gallery image ${i} loaded successfully`)}
                    onError={(e) => {
                      console.error(`Gallery image ${i} failed to load:`, img.url);
                      e.currentTarget.style.border = '2px solid red';
                    }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <p>No gallery images</p>
          )}
        </div>
      </div>
    </div>
  );
}
