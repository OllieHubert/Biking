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

const InteractiveMap = ({ startLocation, isochroneData, loading, error }) => {
  const mapRef = useRef();
  const mapInstanceRef = useRef();

  useEffect(() => {
    if (!startLocation || !isochroneData) return;

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

    // Add OpenStreetMap as fallback
    const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19
    });

    // Add base layers
    const baseLayers = {
      "Satellite": satelliteLayer,
      "OpenStreetMap": osmLayer
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

    // Add isochrone data as GeoJSON layers
    if (isochroneData.features && isochroneData.features.length > 0) {
      console.log('Adding isochrone features to map:', isochroneData.features);
      console.log('Isochrone ranges:', isochroneData.ranges);
      console.log('Start location:', startLocation);

      // Use colors from Mapbox data or fallback colors
      const colors = isochroneData.colors || [
        "#08519c", // Dark blue - closest range
        "#3182bd", // Medium-dark blue
        "#6baed6", // Medium blue
        "#bdd7e7", // Light blue
        "#9ecae1", // Very light blue
        "#74a9cf", // Additional light blue
        "#4292c6", // Additional medium blue
        "#2171b5"  // Additional dark blue
      ];

      // Sort features by range value to ensure proper ordering
      const sortedFeatures = isochroneData.features.sort((a, b) => a.properties.value - b.properties.value);
      
      sortedFeatures.forEach((feature, index) => {
        // Get the actual range from the ranges array (now in meters from Mapbox)
        const actualRangeMeters = isochroneData.ranges[index] || feature.properties.value || feature.properties.range;
        // Reverse the color assignment so closest ranges get darkest colors
        const reversedIndex = sortedFeatures.length - 1 - index;
        const color = feature.properties.color || colors[reversedIndex % colors.length];
        const distanceKm = (actualRangeMeters / 1000).toFixed(1);
        // Estimate time based on cycling speed (15 km/h average)
        const timeMinutes = Math.round((distanceKm / 15) * 60);

        console.log(`Feature ${index}: range=${actualRangeMeters}m, time=${timeMinutes}min, distance=${distanceKm}km`);

        // Style the GeoJSON feature with semi-transparent colors
        const geoJsonLayer = L.geoJSON(feature, {
          style: {
            fillColor: color,
            weight: 2,
            opacity: 1,
            color: color,
            dashArray: '0',
            fillOpacity: 0.3  // Semi-transparent so base map is visible
          },
          onEachFeature: function(feature, layer) {
            // Add popup with correct range information
            layer.bindPopup(`
              <div style="text-align: center;">
                <strong>Cycling Range</strong><br>
                <span style="color: #1976d2;">${distanceKm} km</span><br>
                <span style="color: #666;">~${timeMinutes} minutes</span><br>
                <small style="color: #999;">Range: ${actualRangeMeters}m</small>
              </div>
            `);

            // Add hover effects
            layer.on('mouseover', function(e) {
              this.setStyle({
                fillOpacity: 0.6,
                weight: 3,
                opacity: 1
              });
            });

            layer.on('mouseout', function(e) {
              this.setStyle({
                fillOpacity: 0.3,
                weight: 2,
                opacity: 1
              });
            });
          }
        }).addTo(map);

        // Add to layer control
        geoJsonLayer.addTo(map);
      });

      // Add legend to map
      const legend = L.control({ position: 'bottomright' });
      legend.onAdd = function(map) {
        const div = L.DomUtil.create('div', 'info legend');
        div.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
        div.style.padding = '10px';
        div.style.borderRadius = '5px';
        div.style.border = '1px solid #ccc';
        div.style.fontSize = '12px';
        
        let legendHTML = '<strong>Cycling Ranges</strong><br>';
        isochroneData.ranges.forEach((rangeMeters, index) => {
          const distanceKm = (rangeMeters / 1000).toFixed(1);
          // Estimate time based on cycling speed (15 km/h average)
          const timeMinutes = Math.round((distanceKm / 15) * 60);
          // Reverse the color assignment for the legend too
          const reversedIndex = isochroneData.ranges.length - 1 - index;
          const color = colors[reversedIndex % colors.length];
          legendHTML += `<div style="margin: 2px 0;">
            <span style="display: inline-block; width: 15px; height: 15px; background-color: ${color}; margin-right: 5px; border: 1px solid #1976d2;"></span>
            ${distanceKm}km (~${timeMinutes}min)
          </div>`;
        });
        
        div.innerHTML = legendHTML;
        return div;
      };
      legend.addTo(map);

      // Fit map to show all isochrone data
      const group = new L.featureGroup();
      isochroneData.features.forEach(feature => {
        group.addLayer(L.geoJSON(feature));
      });
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

  }, [startLocation, isochroneData]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ ml: 2 }}>
          Loading interactive map...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading map: {error}
      </Alert>
    );
  }

  if (!startLocation || !isochroneData) {
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
          Enter a start location to generate the interactive map
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

export default InteractiveMap;
