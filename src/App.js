import React, { useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, Container, BottomNavigation, BottomNavigationAction, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import MenuIcon from '@mui/icons-material/Menu';
import RouteIcon from '@mui/icons-material/Route';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import AddIcon from '@mui/icons-material/Add';
import NewspaperIcon from '@mui/icons-material/Newspaper';

// Import components
import HomeScreen from './components/HomeScreen';
import MenuScreen from './components/MenuScreen';
import NewsScreen from './components/NewsScreen';
import PreviousRoutesScreen from './components/PreviousRoutesScreen';
import RidesNearYouScreen from './components/RidesNearYouScreen';
import CreateRideScreen from './components/CreateRideScreen';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [currentScreen, setCurrentScreen] = useState('home');

  const handleNavigation = (screen) => {
    setCurrentScreen(screen);
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'home':
        return <HomeScreen onNavigate={handleNavigation} />;
      case 'news':
        return <NewsScreen />;
      case 'previous-routes':
        return <PreviousRoutesScreen />;
      case 'rides-near-you':
        return <RidesNearYouScreen />;
      case 'create-ride':
        return <CreateRideScreen />;
      default:
        return <HomeScreen />;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ 
          display: 'flex',
          flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: 'background.default'
      }}>
        {/* Main Content */}
        <Container 
          maxWidth="sm" 
          sx={{ 
            flexGrow: 1, 
            padding: 0,
            marginBottom: 7 // Space for bottom navigation
          }}
        >
          {renderScreen()}
        </Container>

        {/* Bottom Navigation */}
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: 1000,
            borderTop: '1px solid #e0e0e0'
          }} 
          elevation={3}
        >
          <BottomNavigation
            value={currentScreen}
            onChange={(event, newValue) => {
              setCurrentScreen(newValue);
            }}
            showLabels
            sx={{
              '& .MuiBottomNavigationAction-root': {
                minWidth: 'auto',
                padding: '6px 0',
              },
              '& .MuiBottomNavigationAction-label': {
                fontSize: '0.75rem',
                marginTop: '4px',
              },
            }}
          >
            <BottomNavigationAction
              label="Home"
              value="home"
              icon={<HomeIcon />}
            />
            <BottomNavigationAction
              label="News"
              value="news"
              icon={<NewspaperIcon />}
            />
            <BottomNavigationAction
              label="Routes"
              value="previous-routes"
              icon={<RouteIcon />}
            />
            <BottomNavigationAction
              label="Near You"
              value="rides-near-you"
              icon={<LocationOnIcon />}
            />
            <BottomNavigationAction
              label="Create"
              value="create-ride"
              icon={<AddIcon />}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </ThemeProvider>
  );
}

export default App;

