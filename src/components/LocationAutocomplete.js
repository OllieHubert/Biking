import React, { useState, useEffect, useRef } from 'react';
import {
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
  Box,
  Typography
} from '@mui/material';
import { LocationOn } from '@mui/icons-material';
import GeocodingService from '../services/GeocodingService';

const LocationAutocomplete = ({ 
  value, 
  onChange, 
  onLocationSelect, 
  placeholder = "Enter a location...",
  disabled = false,
  helperText = ""
}) => {
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const suggestionsRef = useRef(null);
  const debounceRef = useRef(null);

  // Debounced search function
  const searchSuggestions = async (query) => {
    if (query.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    setLoading(true);
    try {
      const results = await GeocodingService.getLocationSuggestions(query, 8);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
  };

  // Handle input change with debouncing
  const handleInputChange = (event) => {
    const newValue = event.target.value;
    onChange(newValue);

    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Set new timeout for debounced search
    debounceRef.current = setTimeout(() => {
      searchSuggestions(newValue);
    }, 300);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion) => {
    onChange(suggestion.displayName);
    onLocationSelect(suggestion);
    setShowSuggestions(false);
    setSuggestions([]);
    setSelectedIndex(-1);
  };

  // Handle keyboard navigation
  const handleKeyDown = (event) => {
    if (!showSuggestions || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const formatSuggestionText = (suggestion) => {
    // Truncate very long display names
    const maxLength = 80;
    let displayName = suggestion.displayName;
    
    if (displayName.length > maxLength) {
      displayName = displayName.substring(0, maxLength) + '...';
    }

    return displayName;
  };

  const getSuggestionSubtext = (suggestion) => {
    if (suggestion.address) {
      const parts = [];
      if (suggestion.address.city) parts.push(suggestion.address.city);
      if (suggestion.address.state) parts.push(suggestion.address.state);
      if (suggestion.address.country) parts.push(suggestion.address.country);
      return parts.join(', ');
    }
    return suggestion.type || '';
  };

  return (
    <Box sx={{ position: 'relative', width: '100%' }}>
      <TextField
        ref={inputRef}
        fullWidth
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) {
            setShowSuggestions(true);
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        helperText={helperText}
        InputProps={{
          startAdornment: <LocationOn sx={{ mr: 1, color: 'text.secondary' }} />
        }}
      />

      {/* Loading indicator */}
      {loading && (
        <Box sx={{ 
          position: 'absolute', 
          right: 12, 
          top: '50%', 
          transform: 'translateY(-50%)',
          zIndex: 1
        }}>
          <CircularProgress size={20} />
        </Box>
      )}

      {/* Suggestions dropdown */}
      {showSuggestions && suggestions.length > 0 && (
        <Paper
          ref={suggestionsRef}
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            maxHeight: 300,
            overflow: 'auto',
            mt: 0.5,
            boxShadow: 3
          }}
        >
          <List dense>
            {suggestions.map((suggestion, index) => (
              <ListItem
                key={`${suggestion.lat}-${suggestion.lng}-${index}`}
                button
                onClick={() => handleSuggestionSelect(suggestion)}
                sx={{
                  backgroundColor: index === selectedIndex ? 'action.hover' : 'transparent',
                  '&:hover': {
                    backgroundColor: 'action.hover'
                  }
                }}
              >
                <LocationOn sx={{ mr: 1, color: 'text.secondary', fontSize: 20 }} />
                <ListItemText
                  primary={formatSuggestionText(suggestion)}
                  secondary={getSuggestionSubtext(suggestion)}
                  primaryTypographyProps={{
                    fontSize: '0.9rem',
                    noWrap: true
                  }}
                  secondaryTypographyProps={{
                    fontSize: '0.8rem',
                    color: 'text.secondary'
                  }}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !loading && value.length >= 2 && (
        <Paper
          sx={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            zIndex: 1000,
            mt: 0.5,
            p: 2,
            boxShadow: 3
          }}
        >
          <Typography variant="body2" color="text.secondary" align="center">
            No locations found for "{value}"
          </Typography>
        </Paper>
      )}
    </Box>
  );
};

export default LocationAutocomplete;
