import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Grid,
  Alert,
  CircularProgress
} from '@mui/material';
import { LocationOn, DirectionsBike, DirectionsRun } from '@mui/icons-material';
import RouteService from '../services/RouteService';
import GeocodingService from '../services/GeocodingService';
import LocationAutocomplete from './LocationAutocomplete';
import LiveMap from './LiveMap';

const RouteGenerator = ({ onRouteGenerated, userLocation }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    activity: 'biking',
    distance: '',
    elevation: '',
    startLocation: '',
    endLocation: '',
    useCurrentLocation: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [startLocation, setStartLocation] = useState(null);
  const [endLocation, setEndLocation] = useState(null);
  const [useEndLocation, setUseEndLocation] = useState(false);

  const handleInputChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
  };

  const handleLocationToggle = () => {
    setFormData(prev => ({
      ...prev,
      useCurrentLocation: !prev.useCurrentLocation,
      startLocation: prev.useCurrentLocation ? '' : prev.startLocation
    }));
    setStartLocation(null);
  };

  const handleEndLocationToggle = () => {
    setUseEndLocation(!useEndLocation);
    if (useEndLocation) {
      setEndLocation(null);
      setFormData(prev => ({ ...prev, endLocation: '' }));
    }
  };

  const handleStartLocationInput = async (locationString) => {
    if (!locationString || locationString.trim() === '') {
      setStartLocation(null);
      return;
    }

    setLocationLoading(true);
    setError(null);

    try {
      const locationData = await GeocodingService.geocodeLocation(locationString);
      setStartLocation(locationData);
    } catch (err) {
      setError(`Start location error: ${err.message}`);
      setStartLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleStartLocationSelect = (locationData) => {
    setStartLocation(locationData);
  };

  const handleEndLocationInput = async (locationString) => {
    if (!locationString || locationString.trim() === '') {
      setEndLocation(null);
      return;
    }

    setLocationLoading(true);
    setError(null);

    try {
      const locationData = await GeocodingService.geocodeLocation(locationString);
      setEndLocation(locationData);
    } catch (err) {
      setError(`End location error: ${err.message}`);
      setEndLocation(null);
    } finally {
      setLocationLoading(false);
    }
  };

  const handleEndLocationSelect = (locationData) => {
    setEndLocation(locationData);
  };

  const handleGetCurrentLocation = async () => {
    setLocationLoading(true);
    setError(null);

    try {
      const locationData = await GeocodingService.getCurrentLocation();
      setStartLocation(locationData);
      setFormData(prev => ({ ...prev, useCurrentLocation: true }));
    } catch (err) {
      setError(`Location error: ${err.message}`);
    } finally {
      setLocationLoading(false);
    }
  };

  const validateForm = () => {
    if (!formData.distance || parseFloat(formData.distance) <= 0) {
      setError('Please enter a valid distance');
      return false;
    }

    if (!formData.elevation || parseFloat(formData.elevation) < 0) {
      setError('Please enter a valid elevation gain');
      return false;
    }

    const routeStartLocation = formData.useCurrentLocation ? userLocation : startLocation;
    if (!routeStartLocation) {
      setError('Please select a valid starting location');
      return false;
    }

    if (useEndLocation && !endLocation) {
      setError('Please select a valid end location');
      return false;
    }

    return true;
  };

  const handleGenerateRoute = async () => {
    if (!validateForm()) return;

    setLoading(true);
    setError(null);

    try {
      const routeStartLocation = formData.useCurrentLocation ? userLocation : startLocation;
      const params = {
        activity: formData.activity,
        distance: parseFloat(formData.distance),
        elevation: parseFloat(formData.elevation),
        startLocation: routeStartLocation,
        endLocation: useEndLocation ? endLocation : null
      };

      const route = await RouteService.generateRoute(params);
      
      if (route) {
        onRouteGenerated(route);
        navigate('/route');
      } else {
        setError('No route could be generated with those parameters. Try adjusting your distance or elevation requirements.');
      }
    } catch (err) {
      setError(`Route generation failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom align="center">
        🚴‍♂️ Generate Your Perfect Route
      </Typography>
      
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 4 }}>
        Enter your preferences and we'll find the best biking or running route for you
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Box component="form" className="route-form">
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel id="activity-label">Activity</InputLabel>
              <Select
                labelId="activity-label"
                value={formData.activity}
                label="Activity"
                onChange={handleInputChange('activity')}
              >
                <MenuItem value="biking">
                  <DirectionsBike sx={{ mr: 1 }} />
                  Biking
                </MenuItem>
                <MenuItem value="running">
                  <DirectionsRun sx={{ mr: 1 }} />
                  Running
                </MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Distance (miles)"
              type="number"
              value={formData.distance}
              onChange={handleInputChange('distance')}
              placeholder="e.g., 30"
              inputProps={{ min: 0.1, step: 0.1 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Elevation Gain (feet)"
              type="number"
              value={formData.elevation}
              onChange={handleInputChange('elevation')}
              placeholder="e.g., 5000"
              inputProps={{ min: 0, step: 100 }}
            />
          </Grid>

          <Grid item xs={12} md={6}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <LocationOn />
              <Typography variant="body2">
                {formData.useCurrentLocation 
                  ? (userLocation ? 'Current location detected' : 'Click to get current location')
                  : (startLocation ? 'Location found' : 'Enter a location')
                }
              </Typography>
              {locationLoading && <CircularProgress size={16} />}
            </Box>
            
            <Button
              variant={formData.useCurrentLocation ? "contained" : "outlined"}
              onClick={formData.useCurrentLocation ? handleGetCurrentLocation : handleLocationToggle}
              disabled={locationLoading}
              fullWidth
              sx={{ mb: 2 }}
            >
              {formData.useCurrentLocation 
                ? (userLocation ? 'Current Location Ready' : 'Get Current Location')
                : 'Enter Custom Location'
              }
            </Button>

            {!formData.useCurrentLocation && (
              <Button
                variant="outlined"
                onClick={handleLocationToggle}
                fullWidth
                sx={{ mb: 2 }}
              >
                Use Current Location Instead
              </Button>
            )}
          </Grid>

          {!formData.useCurrentLocation && (
            <Grid item xs={12}>
              <LocationAutocomplete
                value={formData.startLocation}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, startLocation: value }));
                  if (value.trim().length > 2) {
                    handleStartLocationInput(value);
                  }
                }}
                onLocationSelect={handleStartLocationSelect}
                placeholder="e.g., Harvey Mudd College, Claremont, CA"
                helperText="Start typing to see location suggestions"
                disabled={locationLoading}
              />
            </Grid>
          )}

          {/* End Location Input */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
              <Typography variant="body2">
                Add end location (optional)
              </Typography>
              <Button
                variant={useEndLocation ? "contained" : "outlined"}
                size="small"
                onClick={handleEndLocationToggle}
                disabled={locationLoading}
              >
                {useEndLocation ? 'Remove End Location' : 'Add End Location'}
              </Button>
            </Box>
            
            {useEndLocation && (
              <LocationAutocomplete
                value={formData.endLocation || ''}
                onChange={(value) => {
                  setFormData(prev => ({ ...prev, endLocation: value }));
                  if (value.trim().length > 2) {
                    handleEndLocationInput(value);
                  }
                }}
                onLocationSelect={handleEndLocationSelect}
                placeholder="e.g., Los Angeles, CA"
                helperText="Start typing to see location suggestions"
                disabled={locationLoading}
              />
            )}
          </Grid>
        </Grid>

        {/* Live Map Display */}
        <Grid container spacing={3} sx={{ mt: 2 }}>
          <Grid item xs={12}>
            <LiveMap
              startLocation={startLocation || userLocation}
              endLocation={endLocation}
              height={250}
              title="Location Preview"
              zoom={13}
            />
          </Grid>
        </Grid>

        <Box sx={{ mt: 4, textAlign: 'center' }}>
          <Button
            variant="contained"
            size="large"
            onClick={handleGenerateRoute}
            disabled={loading}
            sx={{ minWidth: 200 }}
          >
            {loading ? (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CircularProgress size={20} />
                Generating Route...
              </Box>
            ) : (
              'Generate Route'
            )}
          </Button>
        </Box>
      </Box>
    </Paper>
  );
};

export default RouteGenerator;
