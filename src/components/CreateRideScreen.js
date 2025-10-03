import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  TextField,
  Grid,
  Paper,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Switch,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  Alert,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  IconButton,
  CircularProgress
} from '@mui/material';
import {
  Route,
  Terrain,
  Speed,
  Schedule,
  LocationOn,
  DirectionsBike,
  Add,
  Remove,
  CheckCircle,
  Warning,
  Info,
  Search,
  Map
} from '@mui/icons-material';
import RouteService from '../services/RouteService';
import InteractiveMap from './InteractiveMap';
import HeightRoutesMap from './HeightRoutesMap';

const CreateRideScreen = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [geocodingLoading, setGeocodingLoading] = useState(false);
  const [isochroneLoading, setIsochroneLoading] = useState(false);
  const [geocodedLocation, setGeocodedLocation] = useState(null);
  const [isochroneData, setIsochroneData] = useState(null);
  const [geocodingError, setGeocodingError] = useState(null);
  const [isochroneError, setIsochroneError] = useState(null);
  const [routeLoading, setRouteLoading] = useState(false);
  const [generatedRoute, setGeneratedRoute] = useState(null);
  const [routeError, setRouteError] = useState(null);
  const [heightRoutesLoading, setHeightRoutesLoading] = useState(false);
  const [heightRoutes, setHeightRoutes] = useState(null);
  const [heightRoutesError, setHeightRoutesError] = useState(null);
  const [rideConfig, setRideConfig] = useState({
    // Basic Settings
    name: '',
    description: '',
    rideType: 'recreation',
    
    // Distance and Duration
    targetDistance: 30,
    maxDistance: 80,
    targetDuration: 90,
    maxDuration: 300,
    
    // Elevation Settings
    targetElevation: 200,
    maxElevation: 1000,
    elevationPreference: 'moderate', // low, moderate, high
    
    // Route Preferences
    avoidHighways: true,
    avoidFreeways: true,
    preferBikePaths: true,
    avoidBusyRoads: false,
    
    // Advanced Settings
    startLocation: '',
    endLocation: '',
    waypoints: [],
    
    // Algorithm Settings (for future DFS implementation)
    algorithmType: 'dfs', // dfs, dijkstra, a-star
    maxNodes: 1000,
    searchRadius: 5000, // meters
    roadTypeWeights: {
      bikePath: 1.0,
      residential: 1.2,
      arterial: 1.5,
      highway: 2.0,
      freeway: 3.0
    }
  });

  const rideTypes = [
    { value: 'commute', label: 'Commute' },
    { value: 'recreation', label: 'Recreation' },
    { value: 'training', label: 'Training' },
    { value: 'adventure', label: 'Adventure' },
    { value: 'family', label: 'Family' }
  ];

  const elevationPreferences = [
    { value: 'low', label: 'Flat (0-100m)' },
    { value: 'moderate', label: 'Moderate (100-500m)' },
    { value: 'high', label: 'Hilly (500m+)' }
  ];

  const steps = [
    'Basic Information',
    'Distance & Duration',
    'Elevation & Terrain',
    'Route Preferences',
    'Location & Generate'
  ];

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleReset = () => {
    setActiveStep(0);
  };

  const updateConfig = (field, value) => {
    setRideConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const updateNestedConfig = (parent, field, value) => {
    setRideConfig(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  // Geocode address to coordinates
  const handleGeocodeAddress = async () => {
    if (!rideConfig.startLocation.trim()) {
      setGeocodingError('Please enter a start location');
      return;
    }

    try {
      setGeocodingLoading(true);
      setGeocodingError(null);
      
      const location = await RouteService.geocodeAddress(rideConfig.startLocation);
      setGeocodedLocation(location);
      
      // Update the ride config with coordinates
      updateConfig('startLocationCoords', location);
      
    } catch (error) {
      setGeocodingError(error.message || 'Failed to geocode address');
      console.error('Geocoding error:', error);
    } finally {
      setGeocodingLoading(false);
    }
  };

  // Generate isochrone map
  const handleGenerateIsochrone = async () => {
    if (!geocodedLocation) {
      setIsochroneError('Please geocode a start location first');
      return;
    }

    try {
      setIsochroneLoading(true);
      setIsochroneError(null);
      
      console.log('Generating Mapbox isochrone for distance:', rideConfig.targetDistance, 'km');
      
      const isochrone = await RouteService.generateIsochrone(
        geocodedLocation, 
        rideConfig.targetDistance // Pass target distance in km
      );
      
      setIsochroneData(isochrone);
      
    } catch (error) {
      setIsochroneError(error.message || 'Failed to generate isochrone map');
      console.error('Isochrone error:', error);
    } finally {
      setIsochroneLoading(false);
    }
  };

  // Auto-generate isochrone when location is geocoded
  useEffect(() => {
    if (geocodedLocation && !isochroneData) {
      handleGenerateIsochrone();
    }
  }, [geocodedLocation]);

  // Generate actual route using Mapbox API
  const handleGenerateRoute = async () => {
    console.log('🔥 BUTTON CLICKED - handleGenerateRoute called!');
    console.log('🚀 Starting route generation...');
    console.log('Geocoded location:', geocodedLocation);
    console.log('Target distance:', rideConfig.targetDistance);
    console.log('Route loading state:', routeLoading);
    console.log('Ride config:', rideConfig);
    
    if (!geocodedLocation) {
      console.error('❌ No geocoded location found');
      setRouteError('Please geocode a start location first');
      alert('Please geocode a start location first');
      return;
    }

    try {
      setRouteLoading(true);
      setRouteError(null);
      
      console.log('📝 Saving route configuration...');
      
      // Save route configuration as variables
      const routeConfig = {
        name: rideConfig.name || 'Generated Route',
        description: rideConfig.description || 'Route generated using Mapbox API',
        rideType: rideConfig.rideType,
        targetDistance: rideConfig.targetDistance,
        targetElevation: rideConfig.targetElevation,
        startLocation: geocodedLocation,
        endLocation: rideConfig.endLocation,
        avoidHighways: rideConfig.avoidHighways,
        avoidFreeways: rideConfig.avoidFreeways,
        preferBikePaths: rideConfig.preferBikePaths,
        avoidBusyRoads: rideConfig.avoidBusyRoads
      };
      
      console.log('✅ Route configuration saved:', routeConfig);
      
      console.log('🗺️ Generating Mapbox isochrone for distance:', routeConfig.targetDistance, 'km');
      console.log('📍 Using location:', geocodedLocation);
      
      // Use the new Mapbox API format - just pass location and target distance
      const isochroneData = await RouteService.generateIsochrone(
        geocodedLocation, 
        routeConfig.targetDistance // Pass target distance in km
      );
      
      console.log('✅ Isochrone data received:', isochroneData);
      
      // Create route object with saved configuration
      const generatedRoute = {
        id: `route_${Date.now()}`,
        name: routeConfig.name,
        description: routeConfig.description,
        activity: 'biking',
        distance: routeConfig.targetDistance,
        elevation: routeConfig.targetElevation,
        startLocation: geocodedLocation,
        isochroneData: isochroneData,
        config: routeConfig,
        generatedAt: new Date().toISOString(),
        isMapboxRoute: true
      };
      
      console.log('🎉 Route generated successfully:', generatedRoute);
      setGeneratedRoute(generatedRoute);
      
      // Automatically generate Height routes after isochrone map (CHAINED API CALL)
      console.log('🔥 CHAINED API CALL: Automatically generating Height routes...');
      console.log('🔥 Isochrone data features:', isochroneData.features);
      console.log('🔥 Target distance:', routeConfig.targetDistance);
      console.log('🔥 Target elevation:', routeConfig.targetElevation);
      
      try {
        setHeightRoutesLoading(true);
        setHeightRoutesError(null);
        
        // Get the largest isochrone polygon (farthest range)
        const largestFeature = isochroneData.features
          .sort((a, b) => b.properties.value - a.properties.value)[0];
        
        console.log('🔥 Largest feature:', largestFeature);
        
        if (largestFeature && largestFeature.geometry) {
          console.log('🔥 CHAINED CALL: Using isochrone polygon for Height API:', largestFeature.geometry);
          
          // Call Height API to generate routes (CHAINED WITH ISOCHRONE)
          const heightRoutes = await RouteService.generateHeightRoutes(
            largestFeature.geometry,
            routeConfig.targetDistance,
            routeConfig.targetElevation
          );
          
          console.log('✅ CHAINED CALL SUCCESS: Height routes generated:', heightRoutes);
          setHeightRoutes(heightRoutes);
        } else {
          console.error('❌ CHAINED CALL FAILED: No isochrone polygon data available for Height API');
          setHeightRoutesError('No isochrone polygon data available for Height API');
        }
      } catch (heightError) {
        console.error('❌ CHAINED CALL ERROR: Error generating Height routes:', heightError);
        setHeightRoutesError(heightError.message || 'Failed to generate Height routes');
      } finally {
        setHeightRoutesLoading(false);
      }
      
    } catch (error) {
      console.error('❌ Route generation error:', error);
      setRouteError(error.message || 'Failed to generate route');
    } finally {
      setRouteLoading(false);
    }
  };

  // Generate Height API routes based on isochrone polygon
  const handleGenerateHeightRoutes = async () => {
    if (!generatedRoute || !generatedRoute.isochroneData) {
      setHeightRoutesError('Please generate an isochrone map first');
      return;
    }

    try {
      setHeightRoutesLoading(true);
      setHeightRoutesError(null);
      
      console.log('🔥 Generating Height API routes...');
      console.log('Generated route:', generatedRoute);
      
      // Get the largest isochrone polygon (farthest range)
      const largestFeature = generatedRoute.isochroneData.features
        .sort((a, b) => b.properties.value - a.properties.value)[0];
      
      if (!largestFeature || !largestFeature.geometry) {
        throw new Error('No isochrone polygon data available');
      }

      console.log('Using isochrone polygon:', largestFeature.geometry);
      
      // Call Height API to generate routes
      const routes = await RouteService.generateHeightRoutes(
        largestFeature.geometry,
        rideConfig.targetDistance,
        rideConfig.targetElevation
      );
      
      console.log('✅ Height routes generated:', routes);
      setHeightRoutes(routes);
      
    } catch (error) {
      console.error('❌ Error generating Height routes:', error);
      setHeightRoutesError(error.message || 'Failed to generate Height routes');
    } finally {
      setHeightRoutesLoading(false);
    }
  };

  const renderBasicInfo = () => (
    <Box>
      <TextField
        fullWidth
        label="Ride Name"
        value={rideConfig.name}
        onChange={(e) => updateConfig('name', e.target.value)}
        sx={{ mb: 2 }}
      />
      <TextField
        fullWidth
        label="Description"
        multiline
        rows={3}
        value={rideConfig.description}
        onChange={(e) => updateConfig('description', e.target.value)}
        sx={{ mb: 2 }}
      />
      <FormControl fullWidth>
        <InputLabel>Ride Type</InputLabel>
        <Select
          value={rideConfig.rideType}
          onChange={(e) => updateConfig('rideType', e.target.value)}
        >
          {rideTypes.map((type) => (
            <MenuItem key={type.value} value={type.value}>
              {type.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Box>
  );

  const renderDistanceDuration = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Target Distance: {rideConfig.targetDistance} km
      </Typography>
      <Slider
        value={rideConfig.targetDistance}
        onChange={(e, value) => updateConfig('targetDistance', value)}
        min={5}
        max={80}
        step={5}
        marks={[
          { value: 10, label: '10km' },
          { value: 25, label: '25km' },
          { value: 50, label: '50km' },
          { value: 80, label: '80km' }
        ]}
        sx={{ mb: 3 }}
      />
      
      <Typography variant="h6" gutterBottom>
        Maximum Distance: {rideConfig.maxDistance} km
      </Typography>
      <Slider
        value={rideConfig.maxDistance}
        onChange={(e, value) => updateConfig('maxDistance', value)}
        min={rideConfig.targetDistance}
        max={100}
        step={5}
        sx={{ mb: 3 }}
      />

      <Typography variant="h6" gutterBottom>
        Target Duration: {rideConfig.targetDuration} minutes
      </Typography>
      <Slider
        value={rideConfig.targetDuration}
        onChange={(e, value) => updateConfig('targetDuration', value)}
        min={15}
        max={300}
        step={15}
        marks={[
          { value: 30, label: '30min' },
          { value: 60, label: '1h' },
          { value: 120, label: '2h' },
          { value: 180, label: '3h' }
        ]}
      />
    </Box>
  );

  const renderElevation = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Target Elevation Gain: {rideConfig.targetElevation}m
      </Typography>
      <Slider
        value={rideConfig.targetElevation}
        onChange={(e, value) => updateConfig('targetElevation', value)}
        min={0}
        max={2000}
        step={50}
        marks={[
          { value: 100, label: '100m' },
          { value: 500, label: '500m' },
          { value: 1000, label: '1000m' },
          { value: 1500, label: '1500m' }
        ]}
        sx={{ mb: 3 }}
      />

      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel>Elevation Preference</InputLabel>
        <Select
          value={rideConfig.elevationPreference}
          onChange={(e) => updateConfig('elevationPreference', e.target.value)}
        >
          {elevationPreferences.map((pref) => (
            <MenuItem key={pref.value} value={pref.value}>
              {pref.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      <Alert severity="info" sx={{ mb: 2 }}>
        The Mapbox API will generate cycling accessibility maps that show areas reachable within your target distance.
      </Alert>
    </Box>
  );

  const renderRoutePreferences = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Road Type Preferences
      </Typography>
      
      <List>
        <ListItem>
          <ListItemIcon>
            <DirectionsBike />
          </ListItemIcon>
          <ListItemText 
            primary="Prefer Bike Paths" 
            secondary="Prioritize dedicated cycling infrastructure"
          />
          <Switch
            checked={rideConfig.preferBikePaths}
            onChange={(e) => updateConfig('preferBikePaths', e.target.checked)}
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          <ListItemText 
            primary="Avoid Highways" 
            secondary="Exclude highway segments from routes"
          />
          <Switch
            checked={rideConfig.avoidHighways}
            onChange={(e) => updateConfig('avoidHighways', e.target.checked)}
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Warning />
          </ListItemIcon>
          <ListItemText 
            primary="Avoid Freeways" 
            secondary="Exclude freeway segments from routes"
          />
          <Switch
            checked={rideConfig.avoidFreeways}
            onChange={(e) => updateConfig('avoidFreeways', e.target.checked)}
          />
        </ListItem>
        
        <ListItem>
          <ListItemIcon>
            <Speed />
          </ListItemIcon>
          <ListItemText 
            primary="Avoid Busy Roads" 
            secondary="Minimize time on high-traffic roads"
          />
          <Switch
            checked={rideConfig.avoidBusyRoads}
            onChange={(e) => updateConfig('avoidBusyRoads', e.target.checked)}
          />
        </ListItem>
      </List>

      <Alert severity="info" sx={{ mt: 2 }}>
        These preferences will be used by the Mapbox API to generate cycling accessibility maps that match your preferences.
      </Alert>
    </Box>
  );

  const renderLocationAndGenerate = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Enter Start Location
      </Typography>
      
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={8}>
          <TextField
            fullWidth
            label="Start Location"
            value={rideConfig.startLocation}
            onChange={(e) => updateConfig('startLocation', e.target.value)}
            placeholder="Enter address, city, or coordinates"
            InputProps={{
              startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
            }}
          />
        </Grid>
        <Grid item xs={12} sm={4}>
          <Button
            variant="contained"
            startIcon={geocodingLoading ? <CircularProgress size={20} /> : <Search />}
            onClick={handleGeocodeAddress}
            disabled={geocodingLoading || !rideConfig.startLocation.trim()}
            fullWidth
            sx={{ height: '56px' }}
          >
            {geocodingLoading ? 'Geocoding...' : 'Find Location'}
          </Button>
        </Grid>
      </Grid>

      {geocodingError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {geocodingError}
        </Alert>
      )}

      {geocodedLocation && (
        <Alert severity="success" sx={{ mb: 2 }}>
          <Typography variant="body2">
            <strong>Location Found:</strong> {geocodedLocation.displayName}
            <br />
            <strong>Coordinates:</strong> {geocodedLocation.lat.toFixed(6)}, {geocodedLocation.lng.toFixed(6)}
            <br />
            <strong>Confidence:</strong> {(geocodedLocation.confidence * 100).toFixed(1)}%
          </Typography>
        </Alert>
      )}

      <Alert severity="info" sx={{ mb: 2 }}>
        <Typography variant="body2">
          <strong>Ready to Generate:</strong> Once you find your location, click "Generate Route" below to create your cycling accessibility map.
        </Typography>
      </Alert>

      {/* Show generated route if available */}
      {generatedRoute && (
        <Box sx={{ mt: 3, p: 2, border: '1px solid #e0e0e0', borderRadius: 2 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <Typography variant="h6" gutterBottom>
              Route Generated Successfully!
            </Typography>
            <Typography variant="body2">
              <strong>Route Name:</strong> {generatedRoute.name}
              <br />
              <strong>Distance:</strong> {generatedRoute.distance.toFixed(2)} km
              <br />
              <strong>Elevation Gain:</strong> {generatedRoute.elevation.toFixed(0)}m
              <br />
              <strong>Activity:</strong> {generatedRoute.activity}
              <br />
              <strong>Description:</strong> {generatedRoute.description}
              <br />
              <strong>Generated using Mapbox API</strong>
            </Typography>
          </Alert>

          {/* Display the D3 map with the generated route */}
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Route Map
            </Typography>
            <Typography variant="body2" color="text.secondary" paragraph>
              This interactive map shows your cycling accessibility from the start location. You can zoom, pan, and switch between satellite and street views. The red dot marks your start location, and the semi-transparent blue regions represent different cycling ranges.
            </Typography>
            
            <InteractiveMap
              startLocation={generatedRoute.startLocation}
              isochroneData={generatedRoute.isochroneData}
              loading={false}
              error={null}
            />

            {/* Height Routes Section */}
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" gutterBottom>
                Generate Detailed Routes
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Use the Height API to generate multiple cycling routes within the accessibility area that match your target distance and elevation gain.
              </Typography>
              
              <Button
                variant="contained"
                color="secondary"
                onClick={handleGenerateHeightRoutes}
                disabled={heightRoutesLoading}
                startIcon={heightRoutesLoading ? <CircularProgress size={20} /> : <DirectionsBike />}
                sx={{ mb: 2 }}
              >
                {heightRoutesLoading ? 'Generating Routes...' : 'Generate Height Routes'}
              </Button>

              {heightRoutesError && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {heightRoutesError}
                </Alert>
              )}

              {heightRoutes && heightRoutes.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Alert severity="success" sx={{ mb: 2 }}>
                    <Typography variant="h6" gutterBottom>
                      {heightRoutes.length} Route Options Generated!
                    </Typography>
                    <Typography variant="body2">
                      Routes generated using Height API with elevation data and cycling road networks.
                    </Typography>
                  </Alert>

                  {/* Display route options */}
                  <Grid container spacing={2}>
                    {heightRoutes.map((route, index) => (
                      <Grid item xs={12} md={6} key={route.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardContent>
                            <Typography variant="h6" gutterBottom>
                              {route.name}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" paragraph>
                              {route.description}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                              <Typography variant="body2">
                                <strong>Distance:</strong> {route.distance.toFixed(1)} km
                              </Typography>
                              <Typography variant="body2">
                                <strong>Elevation:</strong> {route.elevation.toFixed(0)} m
                              </Typography>
                            </Box>
                            
                            <Typography variant="body2" color="text.secondary">
                              <strong>Match Score:</strong> {(route.score * 100).toFixed(1)}%
                            </Typography>
                          </CardContent>
                          <CardActions>
                            <Button size="small" color="primary">
                              View on Map
                            </Button>
                            <Button size="small">
                              Download GPX
                            </Button>
                          </CardActions>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>

                  {/* Height Routes Map */}
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Route Map
                    </Typography>
                    <Typography variant="body2" color="text.secondary" paragraph>
                      Interactive map showing all generated Height API routes. Each route is color-coded and shows the actual streets and paths you'll be cycling on.
                    </Typography>
                    
                    <HeightRoutesMap
                      startLocation={generatedRoute.startLocation}
                      routes={heightRoutes}
                      loading={heightRoutesLoading}
                      error={heightRoutesError}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      )}
    </Box>
  );


  const getStepContent = (step) => {
    switch (step) {
      case 0: return renderBasicInfo();
      case 1: return renderDistanceDuration();
      case 2: return renderElevation();
      case 3: return renderRoutePreferences();
      case 4: return renderLocationAndGenerate();
      default: return 'Unknown step';
    }
  };

  return (
    <Box sx={{ padding: 2, paddingBottom: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Create a Ride
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Configure your ideal cycling route with Mapbox API integration
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Stepper activeStep={activeStep} orientation="horizontal">
          {steps.map((label, index) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Step Content */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        {getStepContent(activeStep)}
      </Paper>

      {/* Navigation */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          disabled={activeStep === 0}
          onClick={handleBack}
          sx={{ mr: 1 }}
        >
          Back
        </Button>
        <Box>
          {generatedRoute ? (
            <Button variant="contained" onClick={handleReset} sx={{ mr: 1 }}>
              Create Another Route
            </Button>
          ) : null}
          <Button
            variant="contained"
            onClick={() => {
              console.log('🔥 BUTTON CLICKED - activeStep:', activeStep, 'steps.length:', steps.length);
              console.log('🔥 Route loading:', routeLoading);
              console.log('🔥 Geocoded location:', geocodedLocation);
              if (activeStep === steps.length - 1) {
                console.log('🔥 Calling handleGenerateRoute');
                handleGenerateRoute();
              } else {
                console.log('🔥 Calling handleNext');
                handleNext();
              }
            }}
            disabled={routeLoading}
          >
            {activeStep === steps.length - 1 ? (routeLoading ? 'Generating...' : 'Generate Route') : 'Next'}
          </Button>
        </Box>
      </Box>

      {/* Configuration Summary */}
      {activeStep > 0 && (
        <Paper elevation={1} sx={{ p: 2, mt: 3, backgroundColor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom>
            Configuration Summary
          </Typography>
          <Grid container spacing={1}>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Distance: {rideConfig.targetDistance}km
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Duration: {rideConfig.targetDuration}min
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Elevation: {rideConfig.targetElevation}m
              </Typography>
            </Grid>
            <Grid item xs={6}>
              <Typography variant="body2" color="text.secondary">
                Type: {rideTypes.find(t => t.value === rideConfig.rideType)?.label}
              </Typography>
            </Grid>
          </Grid>
        </Paper>
      )}
    </Box>
  );
};

export default CreateRideScreen;

