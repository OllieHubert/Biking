import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  DirectionsBike,
  DirectionsRun,
  Terrain,
  Route,
  Timer,
  Speed
} from '@mui/icons-material';
import { MapContainer, TileLayer, Polyline, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import RouteService from '../services/RouteService';

// Fix for default markers in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const RouteDisplay = ({ route, userLocation }) => {
  const navigate = useNavigate();
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([34.1064, -117.7106]); // Default to Claremont area

  useEffect(() => {
    if (route) {
      // Set map center to the first waypoint or use a default center
      if (route?.waypoints && route.waypoints.length > 0) {
        setMapCenter([route.waypoints[0].lat, route.waypoints[0].lng]);
      } else if (userLocation) {
        setMapCenter([userLocation.lat, userLocation.lng]);
      }
      
      // Load directions
      loadDirections();
    }
  }, [route, userLocation]);

  const loadDirections = async () => {
    if (!route) return;
    
    setLoading(true);
    try {
      const routeDirections = await RouteService.getDirections(route);
      setDirections(routeDirections);
    } catch (error) {
      console.error('Error loading directions:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!route) {
    return (
      <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
        <Typography variant="h5" gutterBottom>
          No Route Selected
        </Typography>
        <Button
          variant="contained"
          onClick={() => navigate('/')}
          startIcon={<ArrowBack />}
        >
          Generate New Route
        </Button>
      </Paper>
    );
  }

  const getActivityIcon = () => {
    return (route?.activity || 'biking') === 'biking' ? <DirectionsBike /> : <DirectionsRun />;
  };

  const getActivityColor = () => {
    return (route?.activity || 'biking') === 'biking' ? 'primary' : 'secondary';
  };

  const formatDistance = (distance) => {
    return `${(distance || 0).toFixed(1)} mi`;
  };

  const formatElevation = (elevation) => {
    return `${Math.round(elevation || 0)} ft`;
  };

  const formatDuration = (distance, activity) => {
    const avgSpeed = (activity || 'biking') === 'biking' ? 12 : 6; // mph
    const hours = (distance || 0) / avgSpeed;
    const minutes = Math.round(hours * 60);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  return (
    <Box>
      <Button
        variant="outlined"
        onClick={() => navigate('/')}
        startIcon={<ArrowBack />}
        sx={{ mb: 3 }}
      >
        Back to Route Generator
      </Button>

      <Grid container spacing={3}>
        {/* Route Information */}
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
                      <Typography variant="h5" gutterBottom>
            {route?.name || 'Generated Route'}
          </Typography>
            
            {route?.isAlternative && (
              <Alert severity="info" sx={{ mb: 2 }}>
                This is the closest alternative to your requested parameters
              </Alert>
            )}

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              {getActivityIcon()}
              <Chip 
                label={(route?.activity || 'biking').charAt(0).toUpperCase() + (route?.activity || 'biking').slice(1)} 
                color={getActivityColor()}
                variant="outlined"
              />
            </Box>

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Route color="primary" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {formatDistance(route?.distance)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Distance
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={6}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Terrain color="secondary" />
                    <Typography variant="h6" sx={{ mt: 1 }}>
                      {formatElevation(route?.elevation)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Elevation
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
              <Timer color="action" />
              <Typography variant="body2">
                Est. Duration: {formatDuration(route?.distance || 0, route?.activity || 'biking')}
              </Typography>
            </Box>

            {route?.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                {route.description}
              </Typography>
            )}

            {route?.isAlternative && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Original Request:</strong><br />
                  Distance: {formatDistance(route?.originalDistance)}<br />
                  Elevation: {formatElevation(route?.originalElevation)}
                </Typography>
              </Box>
            )}
          </Paper>

          {/* Directions */}
          <Paper elevation={3} sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Turn-by-Turn Directions
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List dense>
                {directions.map((step, index) => (
                  <React.Fragment key={index}>
                    <ListItem>
                      <ListItemText
                        primary={step.instruction}
                        secondary={`${step.distance.toFixed(1)} mi • ${step.duration} min`}
                      />
                    </ListItem>
                    {index < directions.length - 1 && <Divider />}
                  </React.Fragment>
                ))}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Map */}
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Route Map
            </Typography>
            
            <MapContainer
              center={mapCenter}
              zoom={13}
              style={{ height: '500px', width: '100%' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              
              {route?.waypoints && route.waypoints.length > 0 && (
                <>
                  {/* Start marker */}
                  <Marker position={[route.waypoints[0].lat, route.waypoints[0].lng]}>
                    <Popup>
                      <strong>Start</strong><br />
                      {route?.name || 'Generated Route'}
                    </Popup>
                  </Marker>
                  
                  {/* End marker */}
                  {route.waypoints.length > 1 && (
                    <Marker position={[
                      route.waypoints[route.waypoints.length - 1].lat, 
                      route.waypoints[route.waypoints.length - 1].lng
                    ]}>
                      <Popup>
                        <strong>End</strong><br />
                        {route?.name || 'Generated Route'}
                      </Popup>
                    </Marker>
                  )}
                  
                  {/* Route polyline */}
                  <Polyline
                    positions={route.waypoints.map(wp => [wp.lat, wp.lng])}
                    color={(route?.activity || 'biking') === 'biking' ? '#1976d2' : '#dc004e'}
                    weight={4}
                    opacity={0.8}
                  />

                  {/* Show actual route waypoints if available */}
                  {route.routeData && route.routeData.waypoints && route.routeData.waypoints.length > 0 && (
                    <Polyline
                      positions={route.routeData.waypoints.map(wp => [wp.lat, wp.lng])}
                      color={(route?.activity || 'biking') === 'biking' ? '#1976d2' : '#dc004e'}
                      weight={6}
                      opacity={0.9}
                    />
                  )}
                </>
              )}
            </MapContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RouteDisplay;
