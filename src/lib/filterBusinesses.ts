export interface Competitor {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceKm: number;
  typeMatch: string;
}

/**
 * Calculates the Haversine distance in kilometers between two points.
 */
export function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number) => (value * Math.PI) / 180;
  
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
    
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Filters a list of competitors based on selected categories and a maximum radius from a search center.
 * 
 * @param competitors The raw list of competitors
 * @param categories Selected categories to filter by (matches 'typeMatch'). Empty array means all categories.
 * @param radiusKm Maximum allowed distance from the center.
 * @param center The center coordinates to calculate distance from [lat, lng].
 * @returns Filtered and sorted array of competitors.
 */
export function filterBusinesses(
  competitors: Competitor[],
  categories: string[],
  radiusKm: number,
  center: [number, number]
): Competitor[] {
  return competitors.filter(comp => {
    // Category match
    if (categories.length > 0 && !categories.includes(comp.typeMatch)) {
      return false;
    }
    
    // Distance match
    const dist = haversineDistance(center[0], center[1], comp.lat, comp.lng);
    if (dist > radiusKm) {
      return false;
    }
    
    return true;
  });
}
