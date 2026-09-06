import httpx
import logging
from .business_data_adapter import BusinessDataAdapter, BusinessListing
from ..config import settings

logger = logging.getLogger(__name__)

class MapplsAdapter(BusinessDataAdapter):
    def __init__(self):
        self.client = httpx.Client(timeout=10.0)

    def get_nearby_businesses(self, lat: float, lon: float, radius_km: float, business_type: str) -> list[BusinessListing]:
        if not settings.MAPPLS_API_KEY:
            logger.error("Mappls API key is missing. Cannot fetch nearby businesses.")
            raise ValueError("MAPPLS_API_KEY is required but not set in the environment.")

        radius_meters = int(radius_km * 1000)
        
        # The standard Nearby API endpoint for static REST keys
        url = "https://search.mappls.com/search/places/nearby/json"
        
        params = {
            "keywords": business_type,
            "refLocation": f"{lat},{lon}",
            "radius": radius_meters,
            # Mappls static key authentication is passed here
            "access_token": settings.MAPPLS_API_KEY
        }
        
        try:
            response = self.client.get(url, params=params)
            response.raise_for_status()
            
            # Mappls returns 204 No Content if no businesses match
            if response.status_code == 204 or not response.text.strip():
                return []
                
            data = response.json()
            
            places = data.get("suggestedLocations", [])
            results = []
            for p in places:
                results.append(BusinessListing(
                    id=p.get("eLoc", ""),
                    name=p.get("placeName", "Unknown"),
                    business_type=p.get("keyword", business_type),
                    lat=float(p.get("latitude", 0.0)),
                    lon=float(p.get("longitude", 0.0))
                ))
            return results
            
        except httpx.HTTPStatusError as e:
            logger.error(f"Mappls Nearby API Failed (Status {e.response.status_code}): {e.response.text}")
            raise Exception(f"Failed to fetch from Mappls Nearby API: {e.response.status_code}")
        except httpx.RequestError as e:
            logger.error(f"Mappls Nearby API Request Error: {str(e)}")
            raise Exception("Timeout or network error while fetching from Mappls.")
        except Exception as e:
            logger.error(f"Error parsing Mappls response: {str(e)}")
            raise Exception("Unexpected error processing Mappls data.")
