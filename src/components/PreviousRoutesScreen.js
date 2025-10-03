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
  ListItemSecondaryAction,
  IconButton,
  Tabs,
  Tab,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Route,
  Terrain,
  Speed,
  Schedule,
  Search,
  FilterList,
  Share,
  Delete,
  Edit,
  Visibility
} from '@mui/icons-material';

const PreviousRoutesScreen = () => {
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const routes = [
    {
      id: 1,
      name: 'Morning Commute',
      distance: '12.5 km',
      duration: '45 min',
      elevation: '120 m',
      difficulty: 'Easy',
      date: '2024-01-15',
      type: 'Commute',
      rating: 4.2,
      description: 'Daily commute through the city center'
    },
    {
      id: 2,
      name: 'Weekend Adventure',
      distance: '45.2 km',
      duration: '2h 30min',
      elevation: '850 m',
      difficulty: 'Hard',
      date: '2024-01-12',
      type: 'Recreation',
      rating: 4.8,
      description: 'Challenging mountain route with great views'
    },
    {
      id: 3,
      name: 'Evening Loop',
      distance: '8.7 km',
      duration: '25 min',
      elevation: '45 m',
      difficulty: 'Easy',
      date: '2024-01-10',
      type: 'Exercise',
      rating: 3.9,
      description: 'Quick evening ride around the neighborhood'
    },
    {
      id: 4,
      name: 'Coastal Ride',
      distance: '32.1 km',
      duration: '1h 45min',
      elevation: '200 m',
      difficulty: 'Medium',
      date: '2024-01-08',
      type: 'Recreation',
      rating: 4.5,
      description: 'Beautiful coastal route with ocean views'
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

  const filteredRoutes = routes.filter(route =>
    route.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    route.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  return (
    <Box sx={{ padding: 2, paddingBottom: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Previous Routes
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your cycling history and saved routes
        </Typography>
      </Box>

      {/* Search and Filter */}
      <Box sx={{ mb: 3 }}>
        <TextField
          fullWidth
          placeholder="Search routes..."
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
        
        <Tabs value={tabValue} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
          <Tab label="All Routes" />
          <Tab label="Commute" />
          <Tab label="Recreation" />
          <Tab label="Exercise" />
        </Tabs>
      </Box>

      {/* Routes List */}
      <Grid container spacing={2}>
        {filteredRoutes.map((route) => (
          <Grid item xs={12} key={route.id}>
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
                    {route.name}
                  </Typography>
                  <Chip 
                    label={route.difficulty} 
                    color={getDifficultyColor(route.difficulty)}
                    size="small"
                  />
                </Box>

                <Typography variant="body2" color="text.secondary" paragraph>
                  {route.description}
                </Typography>

                {/* Route Stats */}
                <Grid container spacing={2} sx={{ mb: 2 }}>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Route sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {route.distance}
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
                        {route.duration}
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
                        {route.elevation}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Elevation
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Box sx={{ textAlign: 'center' }}>
                      <Speed sx={{ color: 'primary.main', mb: 0.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {route.rating}/5
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Rating
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="caption" color="text.secondary">
                    {route.type} • {route.date}
                  </Typography>
                </Box>
              </CardContent>

              <CardActions sx={{ px: 2, pb: 2 }}>
                <Button size="small" startIcon={<Visibility />}>
                  View
                </Button>
                <Button size="small" startIcon={<Edit />}>
                  Edit
                </Button>
                <Button size="small" startIcon={<Share />}>
                  Share
                </Button>
                <Button size="small" color="error" startIcon={<Delete />} sx={{ ml: 'auto' }}>
                  Delete
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Empty State */}
      {filteredRoutes.length === 0 && (
        <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 2 }}>
          <Route sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No routes found
          </Typography>
          <Typography variant="body2" color="text.secondary" paragraph>
            {searchTerm ? 'Try adjusting your search terms' : 'Start creating your first route!'}
          </Typography>
          <Button variant="contained" startIcon={<Route />}>
            Create First Route
          </Button>
        </Paper>
      )}
    </Box>
  );
};

export default PreviousRoutesScreen;

