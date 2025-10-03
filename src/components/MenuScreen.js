import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListItemButton,
  Divider,
  Paper,
  Avatar
} from '@mui/material';
import {
  Home,
  Newspaper,
  Route,
  LocationOn,
  Add,
  Settings,
  Person,
  Help,
  Info
} from '@mui/icons-material';

const MenuScreen = ({ onNavigate }) => {
  const menuItems = [
    { icon: <Home />, text: 'Home', action: 'home' },
    { icon: <Newspaper />, text: 'News', action: 'news' },
    { icon: <Route />, text: 'Previous Routes', action: 'previous-routes' },
    { icon: <LocationOn />, text: 'Rides Near You', action: 'rides-near-you' },
    { icon: <Add />, text: 'Create a Ride', action: 'create-ride' },
  ];

  const otherItems = [
    { icon: <Person />, text: 'Profile', action: 'profile' },
    { icon: <Settings />, text: 'Settings', action: 'settings' },
    { icon: <Help />, text: 'Help & Support', action: 'help' },
    { icon: <Info />, text: 'About', action: 'about' },
  ];

  return (
    <Box sx={{ padding: 2, paddingBottom: 8 }}>
      {/* Header */}
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Avatar
          sx={{
            width: 80,
            height: 80,
            mx: 'auto',
            mb: 2,
            bgcolor: 'primary.main',
            fontSize: '2rem'
          }}
        >
          🚴
        </Avatar>
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 'bold' }}>
          Menu
        </Typography>
        <Typography variant="subtitle1" color="text.secondary">
          Navigate through the app
        </Typography>
      </Box>

      {/* Main Menu Items */}
      <Paper elevation={2} sx={{ borderRadius: 2, mb: 2 }}>
        <List>
          {menuItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => onNavigate(item.action)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'primary.light',
                    '& .MuiListItemIcon-root': {
                      color: 'white',
                    },
                    '& .MuiListItemText-primary': {
                      color: 'white',
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'primary.main', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: 'medium',
                    fontSize: '1.1rem'
                  }}
                />
              </ListItemButton>
              {index < menuItems.length - 1 && <Divider />}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* Other Menu Items */}
      <Paper elevation={2} sx={{ borderRadius: 2 }}>
        <List>
          {otherItems.map((item, index) => (
            <ListItem key={index} disablePadding>
              <ListItemButton
                onClick={() => onNavigate(item.action)}
                sx={{
                  py: 1.5,
                  px: 2,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                  }
                }}
              >
                <ListItemIcon sx={{ color: 'text.secondary', minWidth: 40 }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText 
                  primary={item.text}
                  primaryTypographyProps={{
                    fontSize: '1rem'
                  }}
                />
              </ListItemButton>
              {index < otherItems.length - 1 && <Divider />}
            </ListItem>
          ))}
        </List>
      </Paper>

      {/* App Version */}
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <Typography variant="caption" color="text.secondary">
          Cycling Hub v1.0.0
        </Typography>
      </Box>
    </Box>
  );
};

export default MenuScreen;

