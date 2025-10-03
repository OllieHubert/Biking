import axios from 'axios';

class GeocodingService {
  constructor() {
    // Using Nominatim (OpenStreetMap's geocoding service) - free and no API key required
    this.baseUrl = 'https://nominatim.openstreetmap.org';
  }

  // Convert a location string to coordinates
  async geocodeLocation(locationString) {
    try {
      if (!locationString || locationString.trim() === '') {
        throw new Error('Location string is required');
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: locationString,
          format: 'json',
          limit: 1,
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'BikingRouteApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          address: result.address
        };
      } else {
        throw new Error('Location not found');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      throw new Error(`Could not find location: ${locationString}`);
    }
  }

  // Get autocomplete suggestions for a location string
  async getLocationSuggestions(locationString, limit = 5) {
    try {
      if (!locationString || locationString.trim().length < 2) {
        return [];
      }

      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          q: locationString,
          format: 'json',
          limit: limit,
          addressdetails: 1,
          dedupe: 1
        },
        headers: {
          'User-Agent': 'BikingRouteApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        return response.data.map(result => ({
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          address: result.address,
          type: result.type,
          importance: result.importance
        }));
      } else {
        return [];
      }
    } catch (error) {
      console.error('Autocomplete error:', error);
      return [];
    }
  }

  // Reverse geocode - convert coordinates to address
  async reverseGeocode(lat, lng) {
    try {
      const response = await axios.get(`${this.baseUrl}/reverse`, {
        params: {
          lat: lat,
          lon: lng,
          format: 'json',
          addressdetails: 1
        },
        headers: {
          'User-Agent': 'BikingRouteApp/1.0'
        }
      });

      if (response.data) {
        return {
          displayName: response.data.display_name,
          address: response.data.address
        };
      } else {
        throw new Error('Could not get address for coordinates');
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
      throw new Error('Could not get address for location');
    }
  }

  // Get user's current location with better error handling
  async getCurrentLocation() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get address for the coordinates
            const addressInfo = await this.reverseGeocode(latitude, longitude);
            
            resolve({
              lat: latitude,
              lng: longitude,
              displayName: addressInfo.displayName,
              address: addressInfo.address,
              accuracy: position.coords.accuracy
            });
          } catch (error) {
            // If reverse geocoding fails, still return coordinates
            resolve({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
              displayName: `${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
              accuracy: position.coords.accuracy
            });
          }
        },
        (error) => {
          let errorMessage = 'Could not get your location';
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Location access denied by user';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Location information is unavailable';
              break;
            case error.TIMEOUT:
              errorMessage = 'Location request timed out';
              break;
          }
          reject(new Error(errorMessage));
        },
        options
      );
    });
  }

  // Validate if coordinates are within reasonable bounds
  isValidCoordinates(lat, lng) {
    return (
      lat >= -90 && lat <= 90 &&
      lng >= -180 && lng <= 180 &&
      !isNaN(lat) && !isNaN(lng)
    );
  }

  // Calculate distance between two points (in miles)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }
}

const geocodingService = new GeocodingService();
export default geocodingService;

// For testing purposes
if (typeof module !== 'undefined' && module.exports) {
  module.exports = geocodingService;
}
