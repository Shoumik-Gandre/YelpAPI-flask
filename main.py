# Copyright 2018 Google LLC
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.

# [START gae_python38_app]
# [START gae_python3_app]
from typing import Optional
from flask import Flask, request, send_file, send_from_directory, jsonify

from api.geocoding import GeoCodingStrategy, GeocodingNotFound, GoogleGeocode
from api.yelpfusion import Categories, handleYelpSearchRequest, handleYelpBusinessId
from decouple import config


# If `entrypoint` is not defined in app.yaml, App Engine will look for an app
# called `app` in `main.py`.
app = Flask(__name__)

app.config['IMAGE_FOLDER'] = 'frontend/images'
app.config['CSS_FOLDER'] = 'frontend/css'
app.config['JAVASCRIPT_FOLDER'] = 'frontend/js'
app.config['STYLE_FOLDER'] = '/frontend/css'

app.config['YELP_API_KEY'] = config('YELP_API_KEY')
app.config['GEOCODE_API_KEY'] = config('GEOCODE_API_KEY')
app.config['IPINFO_API_KEY'] = config('IPINFO_API_KEY')


@app.route('/')
def index():
    """Return a friendly HTTP greeting."""
    print(request.remote_addr)
    return send_file('frontend/index.html')


@app.route('/search', methods = ['GET'])
def search():
    keyword = request.args.get('keyword')
    distance = request.args.get('distance', type=float)
    category = request.args.get('category')
    location = request.args.get('location')
    auto_location = True if request.args.get('auto-location', default=False) == 'on' else False
    latitude = request.args.get('latitude')
    latitude = latitude if latitude != "null" else None
    longitude = request.args.get('longitude')
    longitude = longitude if longitude != "null" else None


    try:
        if not (location or (longitude and latitude)):
            raise Exception()

        # Geocode to get latitude, longitude
        geocoder: Optional[GeoCodingStrategy] = None
        if (auto_location or (latitude and longitude)):
            pass
            # print(f"remote IP: {request.remote_addr}")
            # geocoder = IPInfoGeocode(api_key=app.config['IPINFO_API_KEY'], ip_address=request.remote_addr)
        else:
            geocoder = GoogleGeocode(api_key=app.config['GEOCODE_API_KEY'], address=location)
            latitude, longitude = geocoder.geocode()
        
        response = handleYelpSearchRequest(
            term=keyword,
            category=Categories(category),
            latitude=float(latitude),
            longitude=float(longitude),
            radius=int(float(distance) * 1609.34) if distance else None,
            api_key=app.config['YELP_API_KEY']
        )

        return jsonify(response), 200

    except GeocodingNotFound as e:
        return jsonify({'error': 'Geocoding Not Found'}), 404
    except Exception:
        return jsonify({'error': 'An Exception has occured'}), 404
    

@app.route('/business/<string:businessId>', methods = ['GET'])
def business(businessId: str):

    try:
        response = handleYelpBusinessId(businessId, app.config['YELP_API_KEY'])
        return jsonify(response), 200

    except Exception as e:
        return jsonify({'error': 'An Exception Has occured'}), 404


### Static Files

@app.route('/images/<path:filename>')
def images(filename):
    return send_from_directory(app.config['IMAGE_FOLDER'], filename)


@app.route('/js/<path:filename>')
def js(filename):
    return send_from_directory(app.config['JAVASCRIPT_FOLDER'], filename)

@app.route('/css/<path:filename>')
def styles(filename):
    return send_from_directory(app.config['CSS_FOLDER'], filename)


if __name__ == '__main__':
    # This is used when running locally only. When deploying to Google App
    # Engine, a webserver process such as Gunicorn will serve the app. You
    # can configure startup instructions by adding `entrypoint` to app.yaml.
    app.run(host='127.0.0.1', port=8080, debug=True)
# [END gae_python3_app]
# [END gae_python38_app]
