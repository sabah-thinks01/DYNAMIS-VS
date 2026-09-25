import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get('address');

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 });
  }

  // Use the same key used for map tiles.
  // Although NEXT_PUBLIC keys are exposed to the client, this endpoint is called server-side
  // to bypass CORS restrictions on search.mappls.com which blocks direct browser fetches.
  const apiKey = process.env.NEXT_PUBLIC_MAPPLS_MAP_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'Mappls API key is not configured' }, { status: 500 });
  }

  try {
    const url = `https://search.mappls.com/search/address/geocode?access_token=${apiKey}&address=${encodeURIComponent(address)}`;
    
    // Server-side fetch bypasses CORS
    const res = await fetch(url);
    const data = await res.json();
    
    // Check if we got results
    const results = Array.isArray(data.copResults) ? data.copResults : (data.copResults ? [data.copResults] : []);
    
    if (results.length > 0) {
      const first = results[0];
      const lat = first.latitude ?? first.lat;
      const lng = first.longitude ?? first.lng;

      // If we only got an eLoc and no direct coordinates, call the Place Details API
      if (lat == null && lng == null && first.eLoc) {
        const placeDetailsUrl = `https://explore.mappls.com/apis/O2O/entity/${first.eLoc}`;
        
        const placeRes = await fetch(placeDetailsUrl, {
          headers: {
            'Authorization': `Bearer ${apiKey}`
          }
        });
        
        if (placeRes.ok) {
          const placeData = await placeRes.json();
          // Mappls O2O entity response usually puts lat/lng at the root or inside 'latitude'/'longitude'
          const resolvedLat = placeData.latitude ?? placeData.lat;
          const resolvedLng = placeData.longitude ?? placeData.lng;
          
          if (resolvedLat != null && resolvedLng != null) {
            // Inject resolved coordinates back into the primary result for the frontend
            first.latitude = resolvedLat;
            first.longitude = resolvedLng;
          }
        }
      }
    }
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Server-side geocoding error:', error);
    return NextResponse.json({ error: 'Failed to fetch geocode data' }, { status: 500 });
  }
}
