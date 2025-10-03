import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Box, Typography, Paper } from '@mui/material';

// Fix for default markers in react-leaflet - use simple div icons instead
const createCustomIcon = (color = '#1976d2') => {
  return L.divIcon({
    className: 'custom-pin',
    html: `<div style="
      background-color: ${color}; 
      width: 20px; 
      height: 20px; 
      border-radius: 50% 50% 50% 0; 
      transform: rotate(-45deg); 
      border: 2px solid white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 20]
  });
};

// Custom component to update map center when location changes
const MapUpdater = ({ center, zoom }) => {
  const map = useMap();
  
  useEffect(() => {
    if (center && center.lat && center.lng) {
      map.setView([center.lat, center.lng], zoom || 13);
    }
  }, [center, zoom, map]);

  return null;
};

const LiveMap = ({ 
  startLocation, 
  endLocation,
  height = 300, 
  showPopup = true,
  zoom = 13,
  title = "Location Preview"
}) => {
  const [mapCenter, setMapCenter] = useState([34.1064, -117.7106]); // Default to Claremont

  useEffect(() => {
    // Center map on start location, or end location if no start, or default
    if (startLocation && startLocation.lat && startLocation.lng) {
      setMapCenter([startLocation.lat, startLocation.lng]);
    } else if (endLocation && endLocation.lat && endLocation.lng) {
      setMapCenter([endLocation.lat, endLocation.lng]);
    }
  }, [startLocation, endLocation]);

  const getLocationDisplayName = (loc) => {
    if (!loc) return 'No location selected';
    
    if (loc.displayName) {
      // Truncate very long names
      const maxLength = 60;
      return loc.displayName.length > maxLength 
        ? loc.displayName.substring(0, maxLength) + '...'
        : loc.displayName;
    }
    
    return `${loc.lat.toFixed(4)}, ${loc.lng.toFixed(4)}`;
  };

  const getLocationDetails = (loc) => {
    if (!loc) return null;
    
    const details = [];
    if (loc.address) {
      if (loc.address.city) details.push(loc.address.city);
      if (loc.address.state) details.push(loc.address.state);
      if (loc.address.country) details.push(loc.address.country);
    }
    
    return details.length > 0 ? details.join(', ') : null;
  };

  return (
    <Paper elevation={2} sx={{ p: 2, height: height + 60 }}>
      <Typography variant="h6" gutterBottom>
        {title}
      </Typography>
      
      <Box sx={{ 
        height: height, 
        borderRadius: 1, 
        overflow: 'hidden',
        border: '1px solid',
        borderColor: 'divider'
      }}>
        <MapContainer
          center={mapCenter}
          zoom={zoom}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {/* Update map center when location changes */}
          <MapUpdater center={startLocation || endLocation} zoom={zoom} />
          
          {/* Show start location marker */}
          {startLocation && startLocation.lat && startLocation.lng && (
            <Marker 
              position={[startLocation.lat, startLocation.lng]}
              icon={createCustomIcon('#4caf50')}
            >
              {showPopup && (
                <Popup>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="success.main">
                      🚀 Start Location
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {startLocation.displayName || `${startLocation.lat.toFixed(4)}, ${startLocation.lng.toFixed(4)}`}
                    </Typography>
                    {startLocation.address && (
                      <Typography variant="caption" color="text.secondary">
                        {getLocationDetails(startLocation)}
                      </Typography>
                    )}
                  </Box>
                </Popup>
              )}
            </Marker>
          )}

          {/* Show end location marker */}
          {endLocation && endLocation.lat && endLocation.lng && (
            <Marker 
              position={[endLocation.lat, endLocation.lng]}
              icon={createCustomIcon('#f44336')}
            >
              {showPopup && (
                <Popup>
                  <Box>
                    <Typography variant="subtitle2" gutterBottom color="error.main">
                      🎯 End Location
                    </Typography>
                    <Typography variant="body2" gutterBottom>
                      {endLocation.displayName || `${endLocation.lat.toFixed(4)}, ${endLocation.lng.toFixed(4)}`}
                    </Typography>
                    {endLocation.address && (
                      <Typography variant="caption" color="text.secondary">
                        {getLocationDetails(endLocation)}
                      </Typography>
                    )}
                  </Box>
                </Popup>
              )}
            </Marker>
          )}

          {/* Show line between start and end if both exist */}
          {startLocation && endLocation && startLocation.lat && startLocation.lng && endLocation.lat && endLocation.lng && (
            <Polyline
              positions={[
                [startLocation.lat, startLocation.lng],
                [endLocation.lat, endLocation.lng]
              ]}
              color="#ff9800"
              weight={3}
              opacity={0.8}
              dashArray="5, 10"
            />
          )}

          {/* Show actual route waypoints if available */}
          {startLocation && startLocation.waypoints && startLocation.waypoints.length > 0 && (
            <Polyline
              positions={startLocation.waypoints.map(wp => [wp.lat, wp.lng])}
              color="#1976d2"
              weight={4}
              opacity={0.8}
            />
          )}

          {/* Show route waypoints from route data if available */}
          {startLocation && startLocation.routeData && startLocation.routeData.waypoints && startLocation.routeData.waypoints.length > 0 && (
            <Polyline
              positions={startLocation.routeData.waypoints.map(wp => [wp.lat, wp.lng])}
              color="#1976d2"
              weight={4}
              opacity={0.8}
            />
          )}
        </MapContainer>
      </Box>
      
      {/* Location info below map */}
      <Box sx={{ mt: 1 }}>
        {startLocation && (
          <Box sx={{ mb: 1 }}>
            <Typography variant="body2" color="success.main" sx={{ fontWeight: 'bold' }}>
              🚀 Start: {getLocationDisplayName(startLocation)}
            </Typography>
            {getLocationDetails(startLocation) && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                {getLocationDetails(startLocation)}
              </Typography>
            )}
          </Box>
        )}
        
        {endLocation && (
          <Box>
            <Typography variant="body2" color="error.main" sx={{ fontWeight: 'bold' }}>
              🎯 End: {getLocationDisplayName(endLocation)}
            </Typography>
            {getLocationDetails(endLocation) && (
              <Typography variant="caption" color="text.secondary" sx={{ ml: 2 }}>
                {getLocationDetails(endLocation)}
              </Typography>
            )}
          </Box>
        )}
        
        {!startLocation && !endLocation && (
          <Typography variant="body2" color="text.secondary">
            No locations selected
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default LiveMap;
