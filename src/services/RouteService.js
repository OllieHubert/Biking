import axios from 'axios';
import { getExampleRoute } from '../data/exampleRoutes.js';

class RouteService {
  constructor() {
    this.heightApiKey = process.env.REACT_APP_HEIGHT_API_KEY || 'eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImFmNTM3Y2JkYTU4OTQ2NjY4NTBkNTBiNGZhYWY0NTdlIiwiaCI6Im11cm11cjY0In0=';
    this.elevationApiKey = process.env.REACT_APP_OPEN_ELEVATION_API_KEY || '';
    this.routingApiKey = process.env.REACT_APP_OPEN_ROUTE_API_KEY || '';
    this.geoapifyApiKey = process.env.REACT_APP_GEOAPIFY_API_KEY || '';
    this.mapboxApiKey = process.env.REACT_APP_MAPBOX_API_KEY || 'pk.eyJ1Ijoib2xpdmVyLWh1YnMiLCJhIjoiY21md3g4ZndmMDQ2aDJucHJwMnZtYnExNyJ9.286ZUQP88C1MhR1ghLDrkA';
    this.openRouteServiceUrl = 'https://api.openrouteservice.org/v2/directions';
    this.osrmUrl = 'https://router.project-osrm.org/route/v1'; // OSRM base URL
    this.heightApiUrl = 'https://api.openrouteservice.org'; // Height API uses OpenRouteService
    this.geoapifyUrl = 'https://api.geoapify.com/v1'; // Geoapify API base URL
    this.mapboxUrl = 'https://api.mapbox.com/isochrone/v1/mapbox'; // Mapbox API base URL
    
    // Debug logging
    console.log('🔧 RouteService initialized');
    console.log('🔑 Mapbox API key loaded:', !!this.mapboxApiKey);
    console.log('🔑 Mapbox API key value:', this.mapboxApiKey);
    console.log('🔑 Height API key loaded:', !!this.heightApiKey);
    console.log('🔑 News API key loaded:', !!process.env.REACT_APP_NEWS_API_KEY);
    console.log('🔑 All env vars:', {
      MAPBOX: process.env.REACT_APP_MAPBOX_API_KEY ? 'Present' : 'Missing',
      NEWS: process.env.REACT_APP_NEWS_API_KEY ? 'Present' : 'Missing',
      HEIGHT: process.env.REACT_APP_HEIGHT_API_KEY ? 'Present' : 'Missing'
    });
  }

  // Generate route based on parameters
  async generateRoute(params) {
    try {
      const { activity, distance, elevation, startLocation, endLocation } = params;
      
      // First, check if we have an example route that matches
      const exampleRoute = getExampleRoute(startLocation, distance, elevation, activity);
      if (exampleRoute) {
        return exampleRoute;
      }
      
      // If we have Height API key, use Height API for routing
      if (this.heightApiKey) {
        return await this.generateHeightRoute(startLocation, endLocation, activity, distance, elevation);
      }
      
      // If we have both start and end locations, generate a real route
      if (startLocation && endLocation) {
        return await this.generateRealRoute(startLocation, endLocation, activity, distance, elevation);
      }
      
      // Otherwise, generate a loop route from start location
      return await this.generateLoopRoute(startLocation, distance, elevation, activity);
    } catch (error) {
      console.error('Error generating route:', error);
      throw error;
    }
  }

  // Generate route using Height API
  async generateHeightRoute(startLocation, endLocation, activity, targetDistance, targetElevation) {
    try {
      console.log('Using Height API for route generation');
      
      // Get elevation data from Height API
      const elevationData = await this.getHeightElevationData(startLocation, endLocation);
      
      // Generate route using Height API routing capabilities
      const routeData = await this.getHeightRoute(startLocation, endLocation, activity);
      
      if (!routeData) {
        throw new Error('Could not generate route using Height API');
      }

      // Calculate actual distance and elevation
      const actualDistance = routeData.distance / 1000; // Convert meters to km
      const actualElevation = elevationData?.totalElevationGain || 0;

      // Check if route meets criteria
      const distanceDiff = Math.abs(actualDistance - targetDistance) / targetDistance;
      const elevationDiff = Math.abs(actualElevation - targetElevation) / targetElevation;
      
      const score = 1 - (distanceDiff * 0.6 + elevationDiff * 0.4);
      
      return {
        id: 'height_route',
        name: `Height API Route from ${startLocation.displayName || 'Start'} to ${endLocation.displayName || 'End'}`,
        activity: activity,
        distance: actualDistance,
        elevation: actualElevation,
        waypoints: routeData.waypoints,
        description: `Route generated using Height API with elevation data`,
        isRealRoute: true,
        isHeightRoute: true,
        score: score,
        routeData: routeData,
        elevationData: elevationData
      };
    } catch (error) {
      console.error('Error generating Height API route:', error);
      throw error;
    }
  }

  // Get elevation data from Height API
  async getHeightElevationData(startLocation, endLocation) {
    try {
      if (!this.heightApiKey) {
        throw new Error('Height API key not configured');
      }

      // Create waypoints for elevation sampling
      const waypoints = this.generateWaypointsForElevation(startLocation, endLocation);
      
      // Call Height API for elevation data
      const response = await axios.get(`${this.heightApiUrl}/elevation`, {
        params: {
          points: waypoints.map(wp => `${wp.lat},${wp.lng}`).join('|'),
          key: this.heightApiKey
        }
      });

      if (response.data && response.data.elevations) {
        const elevations = response.data.elevations;
        let totalElevationGain = 0;
        
        // Calculate elevation gain
        for (let i = 1; i < elevations.length; i++) {
          const gain = elevations[i] - elevations[i - 1];
          if (gain > 0) {
            totalElevationGain += gain;
          }
        }

        return {
          elevations: elevations,
          totalElevationGain: totalElevationGain,
          waypoints: waypoints
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting Height API elevation data:', error);
      return null;
    }
  }

  // Get route from Height API
  async getHeightRoute(startLocation, endLocation, activity) {
    try {
      if (!this.heightApiKey) {
        throw new Error('Height API key not configured');
      }

      // Call Height API for routing
      const response = await axios.get(`${this.heightApiUrl}/routing`, {
        params: {
          start: `${startLocation.lat},${startLocation.lng}`,
          end: `${endLocation.lat},${endLocation.lng}`,
          profile: activity === 'biking' ? 'cycling' : 'walking',
          key: this.heightApiKey
        }
      });

      if (response.data && response.data.route) {
        const route = response.data.route;
        
        return {
          distance: route.distance || 0,
          duration: route.duration || 0,
          waypoints: route.waypoints || [],
          instructions: route.instructions || []
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting Height API route:', error);
      return null;
    }
  }

  // Generate waypoints for elevation sampling
  generateWaypointsForElevation(startLocation, endLocation, numPoints = 20) {
    const waypoints = [];
    const latStep = (endLocation.lat - startLocation.lat) / (numPoints - 1);
    const lngStep = (endLocation.lng - startLocation.lng) / (numPoints - 1);

    for (let i = 0; i < numPoints; i++) {
      waypoints.push({
        lat: startLocation.lat + (latStep * i),
        lng: startLocation.lng + (lngStep * i)
      });
    }

    return waypoints;
  }

  // Geocode address to coordinates using Height API
  async geocodeAddress(address) {
    try {
      console.log('🔥 Geocoding address:', address);
      console.log('🔑 Height API key present:', !!this.heightApiKey);
      console.log('🔑 Height API key value:', this.heightApiKey);
      
      if (!this.heightApiKey) {
        throw new Error('Height API key not configured');
      }

      const geocodeUrl = `${this.heightApiUrl}/geocode/search?api_key=${this.heightApiKey}&text=${encodeURIComponent(address)}`;
      console.log('🌐 Geocoding URL:', geocodeUrl);
      
      // Use the exact API call format you provided
      const response = await axios({
        method: 'GET',
        url: geocodeUrl,
        headers: {
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      });

      console.log('✅ Geocoding response received:', response.status);
      console.log('📍 Geocoding data:', response.data);

      if (response.data && response.data.features && response.data.features.length > 0) {
        const feature = response.data.features[0];
        const coordinates = feature.geometry.coordinates;
        
        return {
          lat: coordinates[1],
          lng: coordinates[0],
          displayName: feature.properties.label || address,
          address: feature.properties.name || address,
          confidence: feature.properties.confidence || 0
        };
      }

      throw new Error('Address not found');
    } catch (error) {
      console.error('❌ Error geocoding address:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      // Try fallback geocoding service
      console.log('🔄 Trying fallback geocoding service...');
      try {
        return await this.geocodeAddressFallback(address);
      } catch (fallbackError) {
        console.error('❌ Fallback geocoding also failed:', fallbackError);
        
        if (error.response?.status === 401) {
          throw new Error('Invalid Height API key. Please check your API key.');
        } else if (error.response?.status === 403) {
          throw new Error('Height API access forbidden. Please check your API key permissions.');
        } else if (error.code === 'NETWORK_ERROR' || error.message.includes('Network Error')) {
          throw new Error('Network error. Please check your internet connection and try again.');
        } else {
          throw new Error(`Geocoding failed: ${error.message}`);
        }
      }
    }
  }

  // Generate elevation points using Height API based on isochrone polygon
  async generateHeightRoutes(isochronePolygon, targetDistance, targetElevation) {
    try {
      console.log('🔥 Generating Height API elevation points...');
      console.log('Target distance:', targetDistance, 'km');
      console.log('Target elevation:', targetElevation, 'm');
      console.log('Isochrone polygon:', isochronePolygon);
      
      if (!this.heightApiKey) {
        throw new Error('Height API key not configured');
      }

      // Extract bounding box from isochrone polygon
      const bbox = this.extractBoundingBox(isochronePolygon);
      console.log('Extracted bounding box:', bbox);
      
      // Call Height API for elevation data using a more reliable CORS proxy
      const response = await axios({
        method: 'POST',
        url: 'https://api.codetabs.com/v1/proxy?quest=' + encodeURIComponent('https://api.openrouteservice.org/v2/export/cycling-road/topojson'),
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': this.heightApiKey,
          'X-Requested-With': 'XMLHttpRequest'
        },
        data: {
          bbox: bbox,
          elevation: true,
          elevation_smoothing: 'smooth',
          elevation_interval: 10
        }
      });

      console.log('✅ Height API response received:', response.status);
      console.log('Elevation data:', response.data);

      if (response.data && response.data.features) {
        // Process the elevation data and find points with correct elevation change
        const elevationPoints = this.processElevationPoints(response.data, targetElevation, isochronePolygon);
        return elevationPoints;
      }

      throw new Error('No elevation data received from Height API');
    } catch (error) {
      console.error('❌ Error generating Height elevation points:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data
      });
      
      if (error.response?.data) {
        throw new Error(`Height API Error: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    }
  }

  // Extract bounding box from isochrone polygon
  extractBoundingBox(polygon) {
    if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) {
      throw new Error('Invalid polygon data');
    }

    const coords = polygon.coordinates[0];
    let minLng = coords[0][0];
    let maxLng = coords[0][0];
    let minLat = coords[0][1];
    let maxLat = coords[0][1];

    coords.forEach(coord => {
      minLng = Math.min(minLng, coord[0]);
      maxLng = Math.max(maxLng, coord[0]);
      minLat = Math.min(minLat, coord[1]);
      maxLat = Math.max(maxLat, coord[1]);
    });

    return [[minLng, minLat], [maxLng, maxLat]];
  }

  // Process Height API route data and generate elevation points
  processElevationPoints(data, targetElevation, isochronePolygon) {
    const elevationPoints = [];
    
    if (data.features && data.features.length > 0) {
      data.features.forEach((feature, index) => {
        if (feature.geometry && feature.geometry.coordinates) {
          // Get the first coordinate as the point
          const coordinates = feature.geometry.coordinates[0];
          
          // Simple elevation change calculation (simulated)
          const elevationChange = Math.random() * 200 + 50; // Random between 50-250m
          
          // Simple polygon check (check if point is roughly within bounds)
          const isWithinPolygon = this.isPointWithinBounds(coordinates, isochronePolygon);
          
          if (isWithinPolygon) {
            const point = {
              id: `elevation_point_${index}`,
              name: `Elevation Point ${index + 1}`,
              description: `Point with ${elevationChange.toFixed(0)}m elevation change`,
              coordinates: coordinates,
              elevationChange: elevationChange,
              distanceFromStart: Math.random() * 10, // Random distance for now
              score: this.calculateElevationScore(elevationChange, targetElevation)
            };
            
            elevationPoints.push(point);
          }
        }
      });
    }
    
    // Sort points by how well they match the target elevation
    elevationPoints.sort((a, b) => b.score - a.score);
    
    return elevationPoints.slice(0, 10); // Return top 10 elevation points
  }

  // Create a route from a feature
  createRouteFromFeature(feature, targetDistance, targetElevation, index) {
    try {
      const coordinates = feature.geometry.coordinates;
      const waypoints = coordinates.map(coord => ({
        lng: coord[0],
        lat: coord[1]
      }));

      // Calculate route distance
      let totalDistance = 0;
      for (let i = 1; i < waypoints.length; i++) {
        totalDistance += this.calculateDistance(
          waypoints[i-1].lat, waypoints[i-1].lng,
          waypoints[i].lat, waypoints[i].lng
        );
      }

      // Estimate elevation gain (simplified calculation)
      const estimatedElevation = this.estimateElevationGain(waypoints);

      return {
        id: `height_route_${index}`,
        name: `Height Route Option ${index + 1}`,
        activity: 'biking',
        distance: totalDistance,
        elevation: estimatedElevation,
        waypoints: waypoints,
        description: `Route generated using Height API with ${totalDistance.toFixed(1)}km distance and ${estimatedElevation.toFixed(0)}m elevation gain`,
        isHeightRoute: true,
        isRealRoute: true,
        routeData: feature,
        score: this.calculateRouteScore({
          distance: totalDistance,
          elevation: estimatedElevation
        }, targetDistance, targetElevation)
      };
    } catch (error) {
      console.error('Error creating route from feature:', error);
      return null;
    }
  }

  // Calculate how well a route matches target criteria
  calculateRouteScore(route, targetDistance, targetElevation) {
    const distanceDiff = Math.abs(route.distance - targetDistance) / targetDistance;
    const elevationDiff = Math.abs(route.elevation - targetElevation) / targetElevation;
    return 1 - (distanceDiff * 0.6 + elevationDiff * 0.4);
  }
  
  // Calculate distance between two points using Haversine formula
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    const distance = R * c; // Distance in kilometers
    return distance;
  }

  // Convert degrees to radians
  deg2rad(deg) {
    return deg * (Math.PI/180);
  }

  // Calculate elevation change for a feature (simplified)
  calculateElevationChange(feature) {
    // This is a simplified calculation - in reality you'd need elevation data
    // For now, we'll simulate elevation change based on distance
    const coordinates = feature.geometry.coordinates;
    if (coordinates.length < 2) return 0;
    
    // Calculate distance and estimate elevation change
    let totalDistance = 0;
    for (let i = 1; i < coordinates.length; i++) {
      const dist = this.calculateDistance(
        coordinates[i-1][1], coordinates[i-1][0],
        coordinates[i][1], coordinates[i][0]
      );
      totalDistance += dist;
    }
    
    // Estimate elevation change (simplified - would need actual elevation data)
    return Math.random() * 200 + 50; // Random elevation between 50-250m
  }
  
  // Check if a point is within a polygon using ray casting algorithm
  isPointInPolygon(point, polygon) {
    const x = point[0], y = point[1];
    let inside = false;
    
    if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) {
      return false;
    }
    
    for (let i = 0, j = polygon.coordinates[0].length - 1; i < polygon.coordinates[0].length; j = i++) {
      const xi = polygon.coordinates[0][i][0], yi = polygon.coordinates[0][i][1];
      const xj = polygon.coordinates[0][j][0], yj = polygon.coordinates[0][j][1];
      
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
        inside = !inside;
      }
    }
    
    return inside;
  }
  
  // Calculate distance from start point (simplified)
  calculateDistanceFromStart(coordinates) {
    // This would need the actual start coordinates
    return Math.random() * 10; // Random distance for now
  }
  
  // Calculate elevation score
  calculateElevationScore(elevationChange, targetElevation) {
    const diff = Math.abs(elevationChange - targetElevation);
    return Math.max(0, 1 - diff / targetElevation);
  }
  
  // Check if point is within bounds (simplified polygon check)
  isPointWithinBounds(coordinates, polygon) {
    if (!polygon || !polygon.coordinates || !polygon.coordinates[0]) {
      return true; // If no polygon, assume all points are valid
    }
    
    const x = coordinates[0], y = coordinates[1];
    const polygonCoords = polygon.coordinates[0];
    
    // Simple bounding box check
    let minX = polygonCoords[0][0], maxX = polygonCoords[0][0];
    let minY = polygonCoords[0][1], maxY = polygonCoords[0][1];
    
    for (let i = 1; i < polygonCoords.length; i++) {
      minX = Math.min(minX, polygonCoords[i][0]);
      maxX = Math.max(maxX, polygonCoords[i][0]);
      minY = Math.min(minY, polygonCoords[i][1]);
      maxY = Math.max(maxY, polygonCoords[i][1]);
    }
    
    return x >= minX && x <= maxX && y >= minY && y <= maxY;
  }
  
  // Extract elevation data from feature
  extractElevationData(feature) {
    // This would extract actual elevation data from the API response
    // For now, we'll simulate elevation data
    const elevationChange = Math.random() * 200 + 50; // Random between 50-250m
    const elevationGain = elevationChange * 0.6; // 60% gain
    const elevationLoss = elevationChange * 0.4; // 40% loss
    
    return {
      elevationChange: elevationChange,
      elevationGain: elevationGain,
      elevationLoss: elevationLoss
    };
  }

  // Fallback geocoding using OpenStreetMap Nominatim (free service)
  async geocodeAddressFallback(address) {
    try {
      console.log('🔄 Using fallback geocoding for:', address);
      
      const response = await axios({
        method: 'GET',
        url: `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`,
        headers: {
          'User-Agent': 'BikingApp/1.0'
        }
      });

      if (response.data && response.data.length > 0) {
        const result = response.data[0];
        return {
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon),
          displayName: result.display_name,
          address: address,
          confidence: 0.8 // Lower confidence for fallback
        };
      }

      throw new Error('Address not found in fallback service');
    } catch (error) {
      console.error('❌ Fallback geocoding error:', error);
      throw error;
    }
  }

  // Generate isochrone map using Mapbox API for cycling
  async generateIsochrone(startLocation, targetDistanceKm = 20) {
    try {
      console.log('🔥 RouteService.generateIsochrone called!');
      console.log('Mapbox API key present:', !!this.mapboxApiKey);
      console.log('API key value:', this.mapboxApiKey ? 'Present' : 'Missing');
      console.log('Start location:', startLocation);
      console.log('Target distance:', targetDistanceKm);
      
      if (!this.mapboxApiKey) {
        console.error('❌ Mapbox API key is missing!');
        throw new Error('Mapbox API key not configured');
      }

      console.log('Generating Mapbox isochrone for:', startLocation);
      console.log('Target distance:', targetDistanceKm, 'km');
      
      // Generate distance-based ranges in meters (must be integers)
      let rangesInMeters;
      if (targetDistanceKm > 50) {
        // For rides over 50km, use 20km increments (max 4 ranges)
        const numRanges = Math.min(4, Math.ceil(targetDistanceKm / 20));
        rangesInMeters = [];
        for (let i = 1; i <= numRanges; i++) {
          rangesInMeters.push(Math.round(i * 20000)); // 20km increments, rounded to integers
        }
      } else if (targetDistanceKm > 20) {
        // For rides 20-50km, use 10km increments (max 5 ranges)
        const numRanges = Math.min(5, Math.ceil(targetDistanceKm / 10));
        rangesInMeters = [];
        for (let i = 1; i <= numRanges; i++) {
          rangesInMeters.push(Math.round(i * 10000)); // 10km increments, rounded to integers
        }
      } else {
        // For rides 20km or less, use 25%, 50%, 75%, 100% of target distance
        rangesInMeters = [
          Math.round(targetDistanceKm * 1000 * 0.25),  // 25%
          Math.round(targetDistanceKm * 1000 * 0.5),   // 50%
          Math.round(targetDistanceKm * 1000 * 0.75),  // 75%
          Math.round(targetDistanceKm * 1000)          // 100%
        ];
      }
      
      console.log('Generated ranges (meters):', rangesInMeters);
      
      // Generate colors for the ranges (cycling-themed blues)
      // Colors go from dark (close) to light (far)
      const colors = [
        '#08519c', // Dark blue - closest range
        '#3182bd', // Medium-dark blue
        '#6baed6', // Medium blue
        '#bdd7e7', // Light blue
        '#9ecae1', // Very light blue
        '#74a9cf', // Additional light blue
        '#4292c6', // Additional medium blue
        '#2171b5'  // Additional dark blue
      ];
      
      // Reverse the colors so closest ranges get darkest colors
      const contoursColors = rangesInMeters.map((_, index) => {
        const reversedIndex = rangesInMeters.length - 1 - index;
        return colors[reversedIndex % colors.length].replace('#', '');
      }).join(',');
      
      // Use the correct Mapbox API format: lng,lat (not URL-encoded)
      const coordinates = `${startLocation.lng},${startLocation.lat}`;
      const apiUrl = `${this.mapboxUrl}/cycling/${coordinates}`;
      console.log('🔥 Making Mapbox API call to:', apiUrl);
      console.log('Parameters:', {
        contours_meters: rangesInMeters.join(','),
        contours_colors: contoursColors,
        polygons: 'true',
        denoise: '1',
        access_token: this.mapboxApiKey ? 'Present' : 'Missing'
      });
      
      const response = await axios({
        method: 'GET',
        url: apiUrl,
        params: {
          contours_meters: rangesInMeters.join(','),
          contours_colors: contoursColors,
          polygons: true,
          denoise: 1,
          access_token: this.mapboxApiKey
        },
        headers: {
          'Accept': 'application/json'
        }
      });
      
      console.log('🔥 Mapbox API response received:', response.status);

      console.log('Mapbox isochrone response:', response.data);

      if (response.data && response.data.features) {
        // Process Mapbox response to match our expected format
        const features = response.data.features.map((feature, index) => ({
          ...feature,
          properties: {
            ...feature.properties,
            value: rangesInMeters[index] || rangesInMeters[rangesInMeters.length - 1],
            range: rangesInMeters[index] || rangesInMeters[rangesInMeters.length - 1],
            distanceKm: (rangesInMeters[index] || rangesInMeters[rangesInMeters.length - 1]) / 1000,
            color: colors[index % colors.length]
          }
        }));

        return {
          features: features,
          startLocation: startLocation,
          ranges: rangesInMeters, // Return ranges in meters
          mode: 'cycling',
          colors: colors.slice(0, rangesInMeters.length)
        };
      }

      throw new Error('Could not generate isochrone');
    } catch (error) {
      console.error('Error generating isochrone:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error config:', error.config);
      
      if (error.response?.data) {
        throw new Error(`Mapbox API Error: ${JSON.stringify(error.response.data)}`);
      } else {
        throw error;
      }
    }
  }

  // Get elevation profile for a route
  async getElevationProfile(waypoints) {
    try {
      if (!this.heightApiKey) {
        throw new Error('Height API key not configured');
      }

      const coordinates = waypoints.map(wp => [wp.lng, wp.lat]);
      
      const response = await axios.post(`${this.heightApiUrl}/v2/elevation/line`, {
        format_in: 'polyline',
        format_out: 'polyline',
        geometry: coordinates
      }, {
        headers: {
          'Accept': 'application/json',
          'Authorization': this.heightApiKey,
          'Content-Type': 'application/json'
        }
      });

      if (response.data && response.data.elevation) {
        return response.data.elevation;
      }

      return null;
    } catch (error) {
      console.error('Error getting elevation profile:', error);
      return null;
    }
  }

  // Generate a real route between two points using actual streets
  async generateRealRoute(startLocation, endLocation, activity, targetDistance, targetElevation) {
    try {
      // Get the route from OpenRouteService
      const routeData = await this.getStreetRoute(startLocation, endLocation, activity);
      
      if (!routeData) {
        throw new Error('Could not generate route between these locations');
      }

      // Calculate actual distance and elevation
      const actualDistance = routeData.distance / 1000; // Convert meters to km
      const actualElevation = routeData.elevation || 0;

      // Check if route meets criteria
      const distanceDiff = Math.abs(actualDistance - targetDistance) / targetDistance;
      const elevationDiff = Math.abs(actualElevation - targetElevation) / targetElevation;
      
      const score = 1 - (distanceDiff * 0.6 + elevationDiff * 0.4);
      
      return {
        id: 'real_route',
        name: `Route from ${startLocation.displayName || 'Start'} to ${endLocation.displayName || 'End'}`,
        activity: activity,
        distance: actualDistance,
        elevation: actualElevation,
        waypoints: routeData.waypoints,
        description: `Actual street route following roads and avoiding highways`,
        isRealRoute: true,
        score: score,
        routeData: routeData
      };
    } catch (error) {
      console.error('Error generating real route:', error);
      throw error;
    }
  }

  // Generate a loop route from a starting point
  async generateLoopRoute(startLocation, targetDistance, targetElevation, activity) {
    try {
      // Generate multiple possible loop routes
      const loopRoutes = await this.generateLoopRoutes(startLocation, targetDistance, activity);
      
      // Find the best match
      let bestRoute = null;
      let bestScore = 0;
      
      for (const route of loopRoutes) {
        const distanceDiff = Math.abs(route.distance - targetDistance) / targetDistance;
        const elevationDiff = Math.abs(route.elevation - targetElevation) / targetElevation;
        const score = 1 - (distanceDiff * 0.6 + elevationDiff * 0.4);
        
        if (score > bestScore) {
          bestScore = score;
          bestRoute = route;
        }
      }
      
      return bestRoute || loopRoutes[0];
    } catch (error) {
      console.error('Error generating loop route:', error);
      throw error;
    }
  }

  // Generate multiple loop routes using DFS-like approach
  async generateLoopRoutes(startLocation, targetDistance, activity) {
    const routes = [];
    const maxAttempts = 10;
    const attempts = 0;
    
    try {
      // Generate routes in different directions
      const directions = [
        { name: 'North', lat: 0.01, lng: 0 },
        { name: 'South', lat: -0.01, lng: 0 },
        { name: 'East', lat: 0, lng: 0.01 },
        { name: 'West', lat: 0, lng: -0.01 },
        { name: 'Northeast', lat: 0.007, lng: 0.007 },
        { name: 'Northwest', lat: 0.007, lng: -0.007 },
        { name: 'Southeast', lat: -0.007, lng: 0.007 },
        { name: 'Southwest', lat: -0.007, lng: -0.007 }
      ];
      
      for (const direction of directions) {
        if (attempts >= maxAttempts) break;
        
        try {
          // Create a waypoint in the direction
          const waypoint = {
            lat: startLocation.lat + direction.lat,
            lng: startLocation.lng + direction.lng
          };
          
          // Get route to waypoint and back
          const outboundRoute = await this.getStreetRoute(startLocation, waypoint, activity);
          const returnRoute = await this.getStreetRoute(waypoint, startLocation, activity);
          
          if (outboundRoute && returnRoute) {
            const totalDistance = (outboundRoute.distance + returnRoute.distance) / 1000; // km
            const totalElevation = (outboundRoute.elevation || 0) + (returnRoute.elevation || 0);
            
            // Combine waypoints
            const combinedWaypoints = [
              ...outboundRoute.waypoints,
              ...returnRoute.waypoints.slice(1) // Avoid duplicate waypoint
            ];
            
            routes.push({
              id: `loop_${direction.name.toLowerCase()}`,
              name: `${direction.name} Loop Route`,
              activity: activity,
              distance: totalDistance,
              elevation: totalElevation,
              waypoints: combinedWaypoints,
              description: `A ${direction.name.toLowerCase()} loop route following actual streets`,
              isRealRoute: true
            });
          }
        } catch (error) {
          console.error(`Error generating ${direction.name} route:`, error);
        }
      }
      
      return routes;
    } catch (error) {
      console.error('Error generating loop routes:', error);
      return [];
    }
  }

  // Get actual street route using OSRM (free routing service)
  async getStreetRoute(startLocation, endLocation, activity) {
    try {
      // Determine profile based on activity
      const profile = activity === 'biking' ? 'bike' : 'foot';
      
      // Build coordinates string for OSRM (format: lng1,lat1;lng2,lat2)
      const coordinates = `${startLocation.lng},${startLocation.lat};${endLocation.lng},${endLocation.lat}`;
      
      // OSRM query parameters
      const params = new URLSearchParams({
        alternatives: 'false',
        steps: 'true',
        annotations: 'true',
        overview: 'full',
        continue_straight: 'false'
      });

      // OSRM URL format: /route/v1/{profile}/{coordinates}
      const response = await axios.get(`${this.osrmUrl}/${profile}/${coordinates}?${params}`);

      if (response.data && response.data.routes && response.data.routes.length > 0) {
        const route = response.data.routes[0];
        const legs = route.legs;
        
        // Extract waypoints from the route geometry
        let waypoints = [];
        if (route.geometry && route.geometry.coordinates) {
          waypoints = route.geometry.coordinates.map(coord => ({
            lng: coord[0],
            lat: coord[1]
          }));
        } else {
          // Fallback: create waypoints from legs
          waypoints = [startLocation];
          for (const leg of legs) {
            if (leg.steps && leg.steps.length > 0) {
              for (const step of leg.steps) {
                if (step.maneuver && step.maneuver.location) {
                  waypoints.push({
                    lng: step.maneuver.location[0],
                    lat: step.maneuver.location[1]
                  });
                }
              }
            }
          }
          waypoints.push(endLocation);
        }
        
        // Calculate total distance and duration
        const totalDistance = route.distance; // in meters
        const totalDuration = route.duration; // in seconds
        
        // Calculate elevation gain (OSRM doesn't provide elevation, so we'll estimate)
        const estimatedElevation = this.estimateElevationGain(waypoints);
        
        // Extract turn-by-turn instructions
        const instructions = this.extractOSRMInstructions(legs);
        
        return {
          distance: totalDistance, // in meters
          duration: totalDuration, // in seconds
          elevation: estimatedElevation,
          waypoints: waypoints,
          instructions: instructions
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting street route from OSRM:', error);
      
      // Fallback to simple calculation if API fails
      return this.getFallbackRoute(startLocation, endLocation, activity);
    }
  }

  // Extract turn-by-turn instructions from route segments
  extractInstructions(segments) {
    const instructions = [];
    
    for (const segment of segments) {
      if (segment.steps) {
        for (const step of segment.steps) {
          instructions.push({
            instruction: step.instruction,
            distance: step.distance,
            duration: step.duration
          });
        }
      }
    }
    
    return instructions;
  }

  // Extract turn-by-turn instructions from OSRM legs
  extractOSRMInstructions(legs) {
    const instructions = [];
    for (const leg of legs) {
      if (leg.steps) {
        for (const step of leg.steps) {
          instructions.push({
            instruction: step.maneuver ? step.maneuver.instruction : step.name,
            distance: step.distance,
            duration: step.duration
          });
        }
      }
    }
    return instructions;
  }

  // Estimate elevation gain based on waypoints
  estimateElevationGain(waypoints) {
    let elevationGain = 0;
    for (let i = 1; i < waypoints.length; i++) {
      const current = waypoints[i];
      const previous = waypoints[i - 1];
      const distance = this.calculateDistance(previous.lat, previous.lng, current.lat, current.lng);
      elevationGain += distance * 0.01; // Simple estimation: 1% elevation per 100m distance
    }
    return elevationGain;
  }

  // Fallback route calculation (simple distance)
  getFallbackRoute(startLocation, endLocation, activity) {
    const distance = this.calculateDistance(startLocation.lat, startLocation.lng, endLocation.lat, endLocation.lng);
    
    return {
      distance: distance * 1000, // Convert to meters
      duration: distance * (activity === 'biking' ? 1200 : 600), // Rough time estimate
      elevation: 0, // No elevation data
      waypoints: [
        { lat: startLocation.lat, lng: startLocation.lng },
        { lat: endLocation.lat, lng: endLocation.lng }
      ],
      instructions: [
        {
          instruction: `Go from ${startLocation.displayName || 'start'} to ${endLocation.displayName || 'end'}`,
          distance: distance * 1000,
          duration: distance * (activity === 'biking' ? 1200 : 600)
        }
      ]
    };
  }

  // Calculate distance between two points (Haversine formula)
  calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
      Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  // Get turn-by-turn directions for a route
  async getDirections(route) {
    if (route.routeData && route.routeData.instructions) {
      return route.routeData.instructions;
    }
    
    // Fallback to mock directions
    return [
      {
        instruction: 'Start at your current location',
        distance: 0,
        duration: 0
      },
      {
        instruction: 'Follow the route on the map',
        distance: route.distance * 1000, // Convert to meters
        duration: route.distance * (route.activity === 'biking' ? 1200 : 600)
      }
    ];
  }

  // Sample random points from isochrone polygon edges and generate routes
  async generateRoutesFromIsochrone(isochroneData, numPoints = 5) {
    try {
      console.log('🔥 Generating routes from isochrone polygon edges...');
      console.log('Isochrone data:', isochroneData);
      console.log('Number of points to sample:', numPoints);

      if (!this.heightApiKey) {
        throw new Error('Height API key not configured');
      }

      // Extract the largest polygon from isochrone data
      const largestFeature = isochroneData.features
        .sort((a, b) => b.properties.value - a.properties.value)[0];

      if (!largestFeature || !largestFeature.geometry) {
        throw new Error('No isochrone polygon data available');
      }

      console.log('Largest feature:', largestFeature);

      // Sample random points from polygon edges
      const sampledPoints = this.samplePointsFromPolygonEdges(largestFeature.geometry, numPoints);
      console.log('Sampled points:', sampledPoints);

      // Snap points to nearest roads
      const snappedPoints = await this.snapPointsToRoads(sampledPoints);
      console.log('Snapped points to roads:', snappedPoints);

      // Generate routes between snapped points
      const routes = await this.generateRoutesBetweenPoints(snappedPoints);
      console.log('Generated routes:', routes);

      return {
        sampledPoints,
        snappedPoints,
        routes,
        isochroneFeature: largestFeature
      };

    } catch (error) {
      console.error('❌ Error generating routes from isochrone:', error);
      throw error;
    }
  }

  // Sample random points from polygon edges
  samplePointsFromPolygonEdges(geometry, numPoints) {
    console.log('🎯 Sampling points from polygon edges...');
    
    if (!geometry || !geometry.coordinates) {
      throw new Error('Invalid polygon geometry');
    }

    const coordinates = geometry.coordinates[0]; // Get outer ring
    const points = [];

    // Sample points along the polygon edges
    for (let i = 0; i < numPoints; i++) {
      const randomIndex = Math.floor(Math.random() * coordinates.length);
      const point = coordinates[randomIndex];
      
      points.push({
        lng: point[0],
        lat: point[1]
      });
    }

    console.log('Sampled points from edges:', points);
    return points;
  }

  // Snap points to nearest roads using OpenRouteService
  async snapPointsToRoads(points) {
    try {
      console.log('🛣️ Snapping points to nearest roads...');
      
      const locations = points.map(point => [point.lng, point.lat]);
      
      const response = await axios({
        method: 'POST',
        url: 'https://api.openrouteservice.org/v2/snap/driving-car/json',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8',
          'Authorization': this.heightApiKey
        },
        data: {
          locations: locations,
          radius: 350
        }
      });

      console.log('✅ Road snapping response:', response.data);

      if (response.data && response.data.snapped) {
        return response.data.snapped.map(snappedPoint => ({
          lng: snappedPoint.location[0],
          lat: snappedPoint.location[1],
          original: snappedPoint.original,
          snapped: snappedPoint.snapped
        }));
      }

      throw new Error('No snapped points received');
    } catch (error) {
      console.error('❌ Error snapping points to roads:', error);
      throw error;
    }
  }

  // Generate routes between snapped points
  async generateRoutesBetweenPoints(snappedPoints) {
    try {
      console.log('🛣️ Generating routes between snapped points...');
      
      const routes = [];
      
      // Generate routes between consecutive points
      for (let i = 0; i < snappedPoints.length - 1; i++) {
        const start = snappedPoints[i];
        const end = snappedPoints[i + 1];
        
        try {
          const route = await this.generateSingleRoute(
            start.lng, start.lat,
            end.lng, end.lat
          );
          
          if (route) {
            routes.push({
              start: start,
              end: end,
              route: route,
              distance: route.properties?.summary?.distance || 0,
              duration: route.properties?.summary?.duration || 0
            });
          }
        } catch (routeError) {
          console.error(`❌ Error generating route ${i}:`, routeError);
        }
      }

      console.log('Generated routes:', routes);
      return routes;
    } catch (error) {
      console.error('❌ Error generating routes between points:', error);
      throw error;
    }
  }

  // Generate a single route between two points
  async generateSingleRoute(startLng, startLat, endLng, endLat) {
    try {
      console.log(`🛣️ Generating route from (${startLng}, ${startLat}) to (${endLng}, ${endLat})`);
      
      const response = await axios({
        method: 'GET',
        url: `https://api.openrouteservice.org/v2/directions/driving-car?api_key=${this.heightApiKey}&start=${startLng},${startLat}&end=${endLng},${endLat}`,
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
          'Accept': 'application/json, application/geo+json, application/gpx+xml, img/png; charset=utf-8'
        }
      });

      console.log('✅ Route response:', response.data);

      if (response.data && response.data.features && response.data.features.length > 0) {
        return response.data.features[0];
      }

      throw new Error('No route found');
    } catch (error) {
      console.error('❌ Error generating single route:', error);
      throw error;
    }
  }
}

const routeService = new RouteService();

// Add global test function for debugging
if (typeof window !== 'undefined') {
  window.testMapboxAPI = async () => {
    console.log('🧪 Testing Mapbox API directly...');
    try {
      const testLocation = {
        lat: 40.7128,
        lng: -73.990593,
        displayName: 'New York City'
      };
      const result = await routeService.generateIsochrone(testLocation, 20);
      console.log('✅ Test successful:', result);
      return result;
    } catch (error) {
      console.error('❌ Test failed:', error);
      return error;
    }
  };
}

export default routeService;
