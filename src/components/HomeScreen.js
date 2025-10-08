import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
  CardContent,
  Grid,
  Container,
  Button,
  Chip,
  Paper,
  CircularProgress
} from '@mui/material';
import {
  DirectionsBike,
  Terrain,
  Speed,
  Route,
  OpenInNew
} from '@mui/icons-material';
import NewsService from '../services/NewsService';

const HomeScreen = ({ onNavigate }) => {
  const [recentNews, setRecentNews] = useState([]);
  const [newsLoading, setNewsLoading] = useState(true);

  useEffect(() => {
    loadRecentNews();
  }, []);

  const loadRecentNews = async () => {
    try {
      setNewsLoading(true);
      const news = await NewsService.getRecentNews();
      setRecentNews(news);
    } catch (error) {
      console.error('Error loading recent news:', error);
    } finally {
      setNewsLoading(false);
    }
  };

  const featuredImages = [
    {
      url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'UCI World Championships',
      description: 'Professional cycling at its finest'
    },
    {
      url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Mountain Biking Adventure',
      description: 'Explore challenging terrains'
    },
    {
      url: 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80',
      title: 'Road Cycling Excellence',
      description: 'Speed and endurance on paved roads'
    }
  ];

  const quickStats = [
    { icon: <DirectionsBike />, label: 'Total Rides', value: '24' },
    { icon: <Route />, label: 'Routes Created', value: '12' },
    { icon: <Terrain />, label: 'Elevation Gained', value: '15,240 ft' },
    { icon: <Speed />, label: 'Avg Speed', value: '18.5 mph' }
  ];

  return (
    <Box sx={{ padding: 2, paddingBottom: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
          Cycling Hub
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Your ultimate cycling companion
        </Typography>
      </Box>

      {/* Quick Stats */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {quickStats.map((stat, index) => (
          <Grid item xs={6} sm={3} key={index}>
            <Paper 
              elevation={2} 
              sx={{ 
                p: 2, 
                textAlign: 'center',
                backgroundColor: 'white',
                borderRadius: 2
              }}
            >
              <Box sx={{ color: 'primary.main', mb: 1 }}>
                {stat.icon}
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                {stat.value}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {stat.label}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* Recent News */}
      <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
        Latest Cycling News
      </Typography>
      
      {newsLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      ) : recentNews.length > 0 ? (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          {recentNews.map((article, index) => (
            <Grid item xs={12} sm={6} key={article.id || index}>
              <Card 
                elevation={3}
                sx={{ 
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="200"
                  image={article.image || 'https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80'}
                  alt={article.title}
                  sx={{ objectFit: 'cover' }}
                />
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                    <Chip 
                      label={article.category} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    {article.trending && (
                      <Chip 
                        label="Trending" 
                        size="small" 
                        color="secondary"
                      />
                    )}
                  </Box>
                  <Typography variant="h6" component="h3" gutterBottom>
                    {article.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" paragraph>
                    {article.summary}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary">
                      {article.source} • {article.date}
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<OpenInNew />}
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Read More
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Paper elevation={2} sx={{ p: 3, textAlign: 'center', mb: 3 }}>
          <Typography variant="body1" color="text.secondary">
            No recent cycling news available. Check back later!
          </Typography>
        </Paper>
      )}

      {/* Quick Actions */}
      <Box sx={{ mt: 3 }}>
        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
          Quick Actions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <Button
              variant="contained"
              fullWidth
              size="large"
              startIcon={<Route />}
              onClick={() => onNavigate && onNavigate('create-ride')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Create Route
            </Button>
          </Grid>
          <Grid item xs={6}>
            <Button
              variant="outlined"
              fullWidth
              size="large"
              startIcon={<DirectionsBike />}
              onClick={() => onNavigate && onNavigate('previous-routes')}
              sx={{ 
                py: 1.5,
                borderRadius: 2,
                textTransform: 'none',
                fontSize: '1rem'
              }}
            >
              Start Ride
            </Button>
          </Grid>
        </Grid>
      </Box>

    </Box>
  );
};

export default HomeScreen;

