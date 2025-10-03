import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardMedia,
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
  Divider,
  CircularProgress,
  Alert
} from '@mui/material';
import {
  TrendingUp,
  Schedule,
  Person,
  Share,
  BookmarkBorder,
  Bookmark,
  Refresh
} from '@mui/icons-material';
import NewsService from '../services/NewsService';

const NewsScreen = () => {
  const [newsArticles, setNewsArticles] = useState([]);
  const [quickNews, setQuickNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newsSource, setNewsSource] = useState('Loading...');

  useEffect(() => {
    loadNews();
  }, []);

  const loadNews = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Loading cycling news...');
      const [articles, quickNewsData] = await Promise.all([
        NewsService.fetchCyclingNews(),
        NewsService.getQuickNews()
      ]);
      
      console.log('News loaded:', articles.length, 'articles');
      setNewsArticles(articles);
      setQuickNews(quickNewsData);
      
      // Determine news source
      const hasRealNews = articles.length > 0;
      setNewsSource(hasRealNews ? 'Live News' : 'No News Available');
    } catch (err) {
      setError('Failed to load news. Please try again.');
      console.error('Error loading news:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    loadNews();
  };

  return (
    <Box sx={{ padding: 2, paddingBottom: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            Cycling News
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={loading}
            size="small"
          >
            Refresh
          </Button>
        </Box>
        <Typography variant="subtitle1" color="text.secondary">
          Stay updated with the latest in cycling
        </Typography>
        <Chip 
          label={newsSource}
          color={newsSource === 'Live News' ? 'success' : 'default'}
          size="small"
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Loading State */}
      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Quick News Ticker */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, backgroundColor: 'primary.light', color: 'white' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
          <TrendingUp sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Breaking News
          </Typography>
        </Box>
        <List dense>
          {quickNews.map((news, index) => (
            <ListItem key={index} sx={{ py: 0.5 }}>
              <ListItemText 
                primary={news}
                primaryTypographyProps={{
                  fontSize: '0.9rem',
                  color: 'white'
                }}
              />
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Featured Articles */}
      {!loading && (
        <>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
            Featured Articles
          </Typography>

          {newsArticles.length === 0 ? (
            <Paper elevation={2} sx={{ p: 4, textAlign: 'center', mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                No cycling news available
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                We couldn't find any recent cycling news. Please try refreshing or check back later.
              </Typography>
              <Button variant="contained" startIcon={<Refresh />} onClick={handleRefresh}>
                Refresh News
              </Button>
            </Paper>
          ) : (
            <Grid container spacing={2}>
            {newsArticles.map((article) => (
              <Grid item xs={12} key={article.id}>
                <Card 
                  elevation={3}
                  sx={{ 
                    borderRadius: 2,
                    overflow: 'hidden',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-2px)',
                    }
                  }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={article.image}
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
                          icon={<TrendingUp />}
                          label="Trending" 
                          size="small" 
                          color="secondary"
                        />
                      )}
                    </Box>
                    
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                      {article.title}
                    </Typography>
                    
                    <Typography variant="body2" color="text.secondary" paragraph>
                      {article.summary}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Person sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                        {article.author}
                      </Typography>
                      <Schedule sx={{ fontSize: '1rem', mr: 0.5, color: 'text.secondary' }} />
                      <Typography variant="caption" color="text.secondary" sx={{ mr: 2 }}>
                        {article.date}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Source: {article.source}
                      </Typography>
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ px: 2, pb: 2 }}>
                    <Button size="small" startIcon={<BookmarkBorder />}>
                      Save
                    </Button>
                    <Button size="small" startIcon={<Share />}>
                      Share
                    </Button>
                    <Button 
                      size="small" 
                      variant="contained" 
                      sx={{ ml: 'auto' }}
                      onClick={() => window.open(article.url, '_blank')}
                    >
                      Read More
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            ))}
            </Grid>
          )}
        </>
      )}

      {/* Load More Button */}
      {!loading && newsArticles.length > 0 && (
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Button variant="outlined" size="large" onClick={handleRefresh}>
            Load More News
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NewsScreen;

