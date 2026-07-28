import requests
from typing import Dict, Any, Optional

class NCATBridge:
    """
    Bridge to the NGS Coordinate Conversion and Transformation Tool (NCAT) API.
    Used for vertical datum transformations (NGVD29 <-> NAVD88) critical for flood elevation data.
    """
    BASE_URL = "https://geodesy.noaa.gov/api/ncat/llh"

    def __init__(self):
        self.session = requests.Session()
        self.session.headers.update({
            "User-Agent": "PTDT-v23-NCAT-Bridge (admin@pointtownship.gov)"
        })

    def transform_height(
        self, 
        lat: float, 
        lon: float, 
        in_height: float, 
        in_datum: str = "ngvd29", 
        out_datum: str = "navd88"
    ) -> Dict[str, Any]:
        """
        Transforms orthometric height between vertical datums at a specific coordinate.
        
        Args:
            lat: Latitude in decimal degrees
            lon: Longitude in decimal degrees
            in_height: Input orthometric height in meters (NCAT usually uses meters for API)
            in_datum: Input vertical datum (ngvd29, navd88)
            out_datum: Output vertical datum (ngvd29, navd88)
            
        Returns:
            Dict containing the transformed height and metadata.
        """
        params = {
            "lat": lat,
            "lon": lon,
            "in_datum": in_datum,
            "out_datum": out_datum,
            "in_ortho_ht": in_height,
            "f": "json" # Request JSON format
        }

        try:
            response = self.session.get(self.BASE_URL, params=params, timeout=10)
            response.raise_for_status()
            data = response.json()
            
            # NCAT returns a complex nested structure
            # We want to extract the transformed orthometric height
            return {
                "status": "success",
                "input": {
                    "lat": lat,
                    "lon": lon,
                    "height": in_height,
                    "datum": in_datum
                },
                "output": {
                    "height": data.get("outOrthoHt"),
                    "datum": out_datum,
                    "shift": data.get("vertShift"),
                    "uncertainty": data.get("vertUncertainty")
                },
                "raw_response": data
            }
        except Exception as e:
            return {
                "status": "error",
                "message": str(e)
            }

if __name__ == "__main__":
    # Test with 13101 Bonebank Road approx coords
    bridge = NCATBridge()
    result = bridge.transform_height(37.8459, -88.0051, 114.30) # ~375 ft in meters
    print(result)
