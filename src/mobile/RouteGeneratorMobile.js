import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Switch
} from 'react-native';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import RouteService from '../services/RouteService';

const RouteGeneratorMobile = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    activity: 'biking',
    distance: '',
    elevation: '',
    startLocation: '',
    useCurrentLocation: true
  });
  const [userLocation, setUserLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationLoading, setLocationLoading] = useState(false);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    setLocationLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this app.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setUserLocation({
        lat: location.coords.latitude,
        lng: location.coords.longitude
      });
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your current location.');
    } finally {
      setLocationLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleLocationToggle = () => {
    setFormData(prev => ({
      ...prev,
      useCurrentLocation: !prev.useCurrentLocation,
      startLocation: prev.useCurrentLocation ? '' : prev.startLocation
    }));
  };

  const validateForm = () => {
    if (!formData.distance || !formData.elevation) {
      Alert.alert('Error', 'Please fill in both distance and elevation gain');
      return false;
    }
    
    if (formData.distance <= 0 || formData.elevation < 0) {
      Alert.alert('Error', 'Distance must be positive and elevation gain must be non-negative');
      return false;
    }

    if (!formData.useCurrentLocation && !formData.startLocation.trim()) {
      Alert.alert('Error', 'Please provide a starting location');
      return false;
    }

    return true;
  };

  const handleGenerateRoute = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const routeParams = {
        activity: formData.activity,
        distance: parseFloat(formData.distance),
        elevation: parseFloat(formData.elevation),
        startLocation: formData.useCurrentLocation ? userLocation : formData.startLocation
      };

      const route = await RouteService.generateRoute(routeParams);
      
      if (route) {
        navigation.navigate('Route', { route });
      } else {
        Alert.alert('No Route Found', 'No suitable route found. Try adjusting your parameters.');
      }
    } catch (err) {
      Alert.alert('Error', 'Error generating route: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Generate Your Perfect Route</Text>
        <Text style={styles.subtitle}>
          Enter your preferences and we'll find the best biking or running route for you
        </Text>

        <View style={styles.form}>
          {/* Activity Type */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Activity Type</Text>
            <View style={styles.activityButtons}>
              <TouchableOpacity
                style={[
                  styles.activityButton,
                  formData.activity === 'biking' && styles.activityButtonActive
                ]}
                onPress={() => handleInputChange('activity', 'biking')}
              >
                <Text style={[
                  styles.activityButtonText,
                  formData.activity === 'biking' && styles.activityButtonTextActive
                ]}>
                  🚴‍♂️ Biking
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.activityButton,
                  formData.activity === 'running' && styles.activityButtonActive
                ]}
                onPress={() => handleInputChange('activity', 'running')}
              >
                <Text style={[
                  styles.activityButtonText,
                  formData.activity === 'running' && styles.activityButtonTextActive
                ]}>
                  🏃‍♂️ Running
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Distance */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Distance (miles)</Text>
            <TextInput
              style={styles.input}
              value={formData.distance}
              onChangeText={(value) => handleInputChange('distance', value)}
              placeholder="e.g., 30"
              keyboardType="numeric"
            />
          </View>

          {/* Elevation */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Elevation Gain (feet)</Text>
            <TextInput
              style={styles.input}
              value={formData.elevation}
              onChangeText={(value) => handleInputChange('elevation', value)}
              placeholder="e.g., 5000"
              keyboardType="numeric"
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <View style={styles.locationHeader}>
              <Text style={styles.label}>Starting Location</Text>
              {locationLoading && <ActivityIndicator size="small" />}
            </View>
            
            <View style={styles.locationToggle}>
              <Text style={styles.toggleLabel}>
                {userLocation ? 'Use Current Location' : 'Location not available'}
              </Text>
              <Switch
                value={formData.useCurrentLocation}
                onValueChange={handleLocationToggle}
                disabled={!userLocation}
              />
            </View>

            {!formData.useCurrentLocation && (
              <TextInput
                style={styles.input}
                value={formData.startLocation}
                onChangeText={(value) => handleInputChange('startLocation', value)}
                placeholder="e.g., Harvey Mudd College, Claremont, CA"
                multiline
              />
            )}
          </View>

          {/* Generate Button */}
          <TouchableOpacity
            style={[styles.generateButton, loading && styles.generateButtonDisabled]}
            onPress={handleGenerateRoute}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.generateButtonText}>Generate Route</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
    lineHeight: 22,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  activityButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  activityButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  activityButtonActive: {
    backgroundColor: '#1976d2',
    borderColor: '#1976d2',
  },
  activityButtonText: {
    fontSize: 16,
    color: '#666',
  },
  activityButtonTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  locationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  locationToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
  },
  toggleLabel: {
    fontSize: 14,
    color: '#666',
  },
  generateButton: {
    backgroundColor: '#1976d2',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  generateButtonDisabled: {
    backgroundColor: '#ccc',
  },
  generateButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default RouteGeneratorMobile;
