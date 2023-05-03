from dataclasses import dataclass
from typing import Optional, Protocol, Tuple
import requests

class GeocodingNotFound(Exception):
    pass


class GeoCodingStrategy(Protocol):
    
    def geocode(self) -> Tuple[float, float]:
        raise NotImplementedError()


@dataclass
class GoogleGeocode:
    api_key: str
    address: str

    def geocode(self) -> Tuple[float, float]:
        response = requests.get(
            "https://maps.googleapis.com/maps/api/geocode/json", 
            params={
                'address': self.address,
                'key': self.api_key
            }
        )
        res = response.json()
        if res['status'] == "OK" and len(res['results']):
            location = res['results'][0]['geometry']['location']
            latitude = location['lat']
            longitude = location['lng']
            return latitude, longitude
        else:
            raise GeocodingNotFound()


@dataclass
class IPInfoGeocode:
    api_key: str
    ip_address: str

    def geocode(self) -> Tuple[float, float]:
        response = requests.get(
            f"https://ipinfo.io/{self.ip_address}", 
            params={
                'token': self.api_key
            }
        )
        res = response.json()
        print(res)
        if response.status_code == 200 and 'loc' in res.keys():
            latitude, longitude = res['loc'].split(',')
            return latitude, longitude
        else:
            raise GeocodingNotFound()
    
    