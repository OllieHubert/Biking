import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  LocationOn,
  Route,
  Terrain,
  Speed,
  Schedule,
  People,
  Search,
  FilterList,
  MyLocation,
  Directions,
  Star,
  StarBorder
} from '@mui/icons-material';

const RidesNearYouScreen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyNearby, setShowOnlyNearby] = useState(true);

  const nearbyRides = [
    {
      id: 1,
      name: 'Downtown Cycling Group',
      organizer: 'Sarah Johnson',
      distance: '15.2 km',
      duration: '1h 15min',
      difficulty: 'Medium',
      participants: 12,
      maxParticipants: 20,
      date: 'Today, 6:00 PM',
      location: 'Central Park',
      distanceFromYou: '0.8 km',
      rating: 4.6,
      description: 'Weekly group ride through downtown with coffee stop',
      type: 'Group Ride',
      elevation: '150 m'
    },
    {
      id: 2,
      name: 'Morning Commute Buddy',
      organizer: 'Mike Chen',
      distance: '8.5 km',
      duration: '35 min',
      difficulty: 'Easy',
      participants: 3,
      maxParticipants: 5,
      date: 'Tomorrow, 7:30 AM',
      location: 'Main Street Station',
      distanceFromYou: '1.2 km',
      rating: 4.3,
      description: 'Casual morning commute with fellow cyclists',
      type: 'Commute',
      elevation: '45 m'
    },
    {
      id: 3,
      name: 'Weekend Mountain Adventure',
      organizer: 'Adventure Cycling Club',
      distance: '42.1 km',
      duration: '3h 30min',
      difficulty: 'Hard',
      participants: 8,
      maxParticipants: 15,
      date: 'Saturday, 8:00 AM',
      location: 'Mountain Trail Head',
      distanceFromYou: '5.3 km',
      rating: 4.8,
      description: 'Challenging mountain route with scenic views',
      type: 'Adventure',
      elevation: '1200 m'
    },
    {
      id: 4,
      name: 'Family Friendly Ride',
      organizer: 'Family Cycling Group',
      distance: '6.2 km',
      duration: '45 min',
      difficulty: 'Easy',
      participants: 15,
      maxParticipants: 25,
      date: 'Sunday, 10:00 AM',
      location: 'Riverside Park',
      distanceFromYou: '2.1 km',
      rating: 4.4,
      description: 'Perfect for families with kids, flat terrain',
      type: 'Family',
      elevation: '20 m'
    }
  ];

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Easy': return 'success';
      case 'Medium': return 'warning';
      case 'Hard': return 'error';
      default: return 'default';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Group Ride': return 'primary';
      case 'Commute': return 'info';
      case 'Adventure': return 'warning';
      case 'Family': return 'success';
      default: return 'default';
    }
  };

  const filteredRides = nearbyRides.filter(ride =>
    ride.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ride.organizer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ padding: 2, paddingBottom: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Rides Near You
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Discover cycling groups and events in your area
        </Typography>
      </Box>

      {/* Location and Search */}
      <Paper elevation={2} sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <MyLocation sx={{ color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Current Location
          </Typography>
        </Box>
        
        <TextField
          fullWidth
          placeholder="Search rides, organizers, or locations..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <FilterList />
                </IconButton>
              </InputAdornment>
            ),
          }}
          sx={{ mb: 2 }}
        />

        <FormControlLabel
          control={
            <Switch
              checked={showOnlyNearby}
              onChange={(e) => setShowOnlyNearby(e.target.checked)}
              color="primary"
            />
          }
          label="Show only nearby rides (within 5km)"
        />
      </Paper>

      {/* Filter Tabs */}
      <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto" sx={{ mb: 2 }}>
        <Tab label="All Rides" />
        <Tab label="Group Rides" />
        <Tab label="Commute" />
        <Tab label="Adventure" />
        <Tab label="Family" />
      </Tabs>

      {/* Rides List */}
      <Grid container spacing={2}>
        {filteredRides.map((ride) => (
          <Grid item xs={12} key={ride.id}>
            <Card 
              elevation={3}
              sx={{ 
                borderRadius: 2,
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'translateY(-2px)',
                }
              }}
            >
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Typography variant="h6" component="h3" sx={{ fontWeight: 'bold' }}>
                    {ride.name}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip 
                      label={ride.difficulty} 
                      color={getDifficultyColor(ride.difficulty)}
                      size="small"
                    />
                    <Chip 
                      label={ride.type} 
                      color={getTypeColor(ride.type)}
                      size="small"
                      variant="outlined"
                    />
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.8rem' }}>
                    {ride.organizer.charAt(0)}
                  </Avatar>
                  <Typography variant="body2" color="text.secondary">
                    Organized by {ride.organizer}
                  </Typography>
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {ride.description}
                </Typography>

                {/* Ride Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Route sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {ride.distance}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Distance
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Schedule sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {ride.duration}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Duration
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Terrain sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {ride.elevation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Elevation
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <People sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {ride.participants}/{ride.maxParticipants}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Participants
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <LocationOn sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {ride.location} • {ride.distanceFromYou} away
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Star sx={{ fontSize: '1rem', mr: 0.5, color: 'warning.main' }} />
                    <Typography variant="body2" color="text.secondary">
                      {ride.rating}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="body2" color="primary.main" sx={{ fontWeight: 'bold' }}>
                  {ride.date}
                </Typography>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" startIcon={<StarBorder />}>
                  Save
                </Button>
                <Button size="small" startIcon={<Directions />}>
                  Directions
                </Button>
                <Button size="small" variant="contained" sx={{ ml: 'auto' }}>
                  Join Ride
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredRides.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <LocationOn sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No rides found nearby
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm ? 'Try adjusting your search terms' : 'Check back later for new rides in your area!'}
          </Typography>
          <Button variant="contained" startIcon={<LocationOn />}>
            Refresh Location
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default RidesNearYouScreen;

