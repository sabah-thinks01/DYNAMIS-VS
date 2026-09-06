from abc import ABC, abstractmethod
from pydantic import BaseModel

class BusinessListing(BaseModel):
    id: str
    name: str
    business_type: str
    lat: float
    lon: float

class BusinessDataAdapter(ABC):
    @abstractmethod
    def get_nearby_businesses(self, lat: float, lon: float, radius_km: float, business_type: str) -> list[BusinessListing]:
        """Fetch nearby businesses matching the type within the given radius (in km)."""
        pass
