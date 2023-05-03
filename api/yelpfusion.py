import enum
from typing import Any, Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
import requests
import string


@enum.unique
class Categories(enum.Enum):
    DEFAULT = 'Default'
    ARTS_AND_ENTERTAINMENT = 'Arts & Entertainment'
    HEALTH_AND_MEDICAL = 'Health & Medical'
    HOTELS_AND_TRAVEL = 'Hotels & Travel'
    FOOD = 'Food'
    PROFESSIONAL_SERVICES = 'Professional Services'

    @classmethod
    def _missing_(cls, value):
        return cls.DEFAULT


@dataclass
class Business:
    name: str
    status: str
    address: str
    more_info: str
    phone_number: str
    price: str
    transactions_supported: List[str]
    categories: List[str]
    photos: Tuple[str, str, str]


def handleYelpSearchRequest(
    term: str,
    category: Categories,
    latitude: float, 
    longitude: float,
    api_key: str,
    radius: Optional[int]=None,
):

    yelp_url = 'https://api.yelp.com/v3/businesses/search'

    headers = {'Authorization': f"Bearer {api_key}"}

    parameters = {
        'term': term,
        'category': category.value if category != Categories.DEFAULT else 'all',
        'latitude': latitude,
        'longitude': longitude,
    }

    if radius:
        parameters['radius'] = radius
    response = requests.get(yelp_url, params=parameters, headers=headers)
    businesses = response.json()['businesses']

    return {
        'results': [
            {
                'id': business['id'],
                'image_url': business['image_url'],
                'name': business['name'],
                'rating': business['rating'],
                'distance': f"{business['distance']/ 1609.34:.2f}",
            } 
            for business in businesses
        ]
    }


def handleYelpBusinessId(id: str, api_key: str) -> Dict[str, Any]:

    url = f"https://api.yelp.com/v3/businesses/{id}"
    headers = {'Authorization': f"Bearer {api_key}"}
    response = requests.get(url, headers=headers)
    data = response.json()
    business = {}

    attributes = set([
        'name',
        'url',
        'display_phone',
        'price',
        'photos',
    ])

    for attribute in attributes.intersection(data.keys()):
        business[attribute] = data[attribute]
    
    for attribute in set(['display_phone', 'url', 'price']).intersection(data.keys()):
        if len(business[attribute]) == 0:
            business[attribute] = None

    address = None
    if 'location' in data.keys() and 'display_address' in data['location']:
        address = " ".join(data['location']['display_address'])
    
    if len(address) == 0:
        address = None

    is_closed = None
    if 'hours' in data.keys() and len(data['hours']) > 0 and 'is_open_now' in data['hours'][0]:
        is_closed = not bool(data['hours'][0]['is_open_now'])
    
    categories = [
        string.capwords(categories.get('title', '')) 
        for categories in data.get('categories', [])
    ]
    if len(categories) == 0:
        categories = None

    cleantransaction = {
        "pickup": "Pickup",
        "delivery": "Delivery",
        "restaurant_reservation": "Restaurant Reservation"
    }

    transactions = None
    if 'transactions' in data.keys() and len(data['transactions']) > 0:
        transactions = [cleantransaction.get(d, "") for d in data['transactions']]

    business['address'] = address,
    business['categories'] = categories
    business['is_closed'] = is_closed
    business['transactions'] = transactions

    #! YOU NEED TO HANDLE STATUS CODE 301 and 404

    return business