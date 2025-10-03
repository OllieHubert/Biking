import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Box, Typography, CircularProgress, Alert } from '@mui/material';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png'),
});

const HeightRoutesMap = ({ startLocation, routes, loading, error }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef();

  useEffect(() => {
    if (!startLocation || !routes || routes.length === 0) return;

    // Initialize map
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
    }

    const map = L.map(mapRef.current, {
      center: [startLocation.lat, startLocation.lng],
      zoom: 13,
      zoomControl: true,
      scrollWheelZoom: true,
      doubleClickZoom: true,
      boxZoom: true,
      keyboard: true,
      dragging: true,
      touchZoom: true
    });

    mapInstanceRef.current = map;

    // Add satellite tile layer
    const satelliteLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
      attribution: '© Esri — Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community',
      maxZoom: 19
    });

    // Add OpenStreetMap as street layer
    const streetLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });

    // Add base layers
    const baseLayers = {
      "Satellite": satelliteLayer,
      "Street": streetLayer
    };

    // Add layer control
    L.control.layers(baseLayers).addTo(map);

    // Add satellite layer by default
    satelliteLayer.addTo(map);

    // Add start location marker
    const startMarker = L.circleMarker([startLocation.lat, startLocation.lng], {
      radius: 8,
      fillColor: '#f44336',
      color: '#ffffff',
      weight: 3,
      opacity: 1,
      fillOpacity: 0.8
    }).addTo(map);

    // Add pulsing effect for start marker
    const pulsingIcon = L.divIcon({
      className: 'pulsing-marker',
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: #f44336;
        border-radius: 50%;
        border: 3px solid #ffffff;
        animation: pulse 2s infinite;
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    L.marker([startLocation.lat, startLocation.lng], { icon: pulsingIcon }).addTo(map);

    // Add start location label
    L.popup()
      .setLatLng([startLocation.lat, startLocation.lng])
      .setContent(`
        <div style="text-align: center;">
          <strong style="color: #f44336;">Start Location</strong><br>
          ${startLocation.displayName || 'Cycling Start Point'}
        </div>
      `)
      .openOn(map);

    // Define colors for different routes
    const routeColors = [
      '#ff6b6b', // Red
      '#4ecdc4', // Teal
      '#45b7d1', // Blue
      '#96ceb4', // Green
      '#feca57', // Yellow
      '#ff9ff3', // Pink
      '#54a0ff', // Light Blue
      '#5f27cd'  // Purple
    ];

    // Add routes to map
    routes.forEach((route, index) => {
      if (route.waypoints && route.waypoints.length > 0) {
        const color = routeColors[index % routeColors.length];
        
        // Create polyline for the route
        const routePolyline = L.polyline(
          route.waypoints.map(wp => [wp.lat, wp.lng]),
          {
            color: color,
            weight: 4,
            opacity: 0.8,
            dashArray: index % 2 === 0 ? '0' : '10, 10' // Alternate solid and dashed lines
          }
        ).addTo(map);

        // Add popup with route information
        routePolyline.bindPopup(`
          <div style="text-align: center;">
            <strong style="color: ${color};">${route.name}</strong><br>
            <strong>Distance:</strong> ${route.distance.toFixed(1)} km<br>
            <strong>Elevation:</strong> ${route.elevation.toFixed(0)} m<br>
            <strong>Match Score:</strong> ${(route.score * 100).toFixed(1)}%<br>
            <small>${route.description}</small>
          </div>
        `);

        // Add hover effects
        routePolyline.on('mouseover', function(e) {
          this.setStyle({
            weight: 6,
            opacity: 1
          });
        });

        routePolyline.on('mouseout', function(e) {
          this.setStyle({
            weight: 4,
            opacity: 0.8
          });
        });
      }
    });

    // Add legend
    const legend = L.control({ position: 'bottomright' });
    legend.onAdd = function(map) {
      const div = L.DomUtil.create('div', 'info legend');
      div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
      div.style.padding = '10px';
      div.style.borderRadius = '5px';
      div.style.border = '1px solid #ccc';
      div.style.fontSize = '12px';
      
      let legendHTML = '<strong>Height API Routes</strong><br>';
      routes.forEach((route, index) => {
        const color = routeColors[index % routeColors.length];
        legendHTML += `<div style="margin: 2px 0;">
          <span style="display: inline-block; width: 15px; height: 3px; background-color: ${color}; margin-right: 5px; border: 1px solid #333;"></span>
          ${route.name} (${route.distance.toFixed(1)}km, ${route.elevation.toFixed(0)}m)
        </div>`;
      });
      
      div.innerHTML = legendHTML;
      return div;
    };
    legend.addTo(map);

    // Fit map to show all routes
    const group = new L.featureGroup();
    routes.forEach(route => {
      if (route.waypoints && route.waypoints.length > 0) {
        group.addLayer(L.polyline(route.waypoints.map(wp => [wp.lat, wp.lng])));
      }
    });
    if (group.getLayers().length > 0) {
      map.fitBounds(group.getBounds().pad(0.1));
    }

    // Add CSS for pulsing animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes pulse {
        0% {
          transform: scale(1);
          opacity: 1;
        }
        50% {
          transform: scale(1.2);
          opacity: 0.7;
        }
        100% {
          transform: scale(1);
          opacity: 1;
        }
      }
      .pulsing-marker {
        background: transparent !important;
        border: none !important;
      }
    `;
    document.head.appendChild(style);

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      if (style.parentNode) {
        style.parentNode.removeChild(style);
      }
    };

  }, [startLocation, routes]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading Height routes map...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading Height routes map: {error}
      </Alert>
    );
  }

  if (!startLocation || !routes || routes.length === 0) {
    return (
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: 400,
        border: '2px dashed #ccc',
        borderRadius: 2
      }}>
        <Typography variant="body1" color="text.secondary">
          Generate Height routes to see the detailed cycling map
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', height: '500px', position: 'relative' }}>
      <div 
        ref={mapRef} 
        style={{ 
          width: '100%', 
          height: '100%',
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}
      />
      
      {/* Map controls info */}
      <Box sx={{
        position: 'absolute',
        top: 10,
        left: 10,
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 1,
        borderRadius: 1,
        fontSize: '12px',
        color: '#666'
      }}>
        <Typography variant="caption">
          🖱️ Drag to pan • 🔍 Scroll to zoom • 🛰️ Switch layers
        </Typography>
      </Box>
    </Box>
  );
};

export default HeightRoutesMap;
