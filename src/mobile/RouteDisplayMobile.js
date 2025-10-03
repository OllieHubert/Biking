import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import RouteService from '../services/RouteService';

const RouteDisplayMobile = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { route: routeData } = route.params || {};
  
  const [directions, setDirections] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (routeData) {
      loadDirections();
    }
  }, [routeData]);

  const loadDirections = async () => {
    if (!routeData) return;
    
    setLoading(true);
    try {
      const routeDirections = await RouteService.getDirections(routeData);
      setDirections(routeDirections);
    } catch (error) {
      console.error('Error loading directions:', error);
      Alert.alert('Error', 'Could not load directions');
    } finally {
      setLoading(false);
    }
  };

  if (!routeData) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>No Route Selected</Text>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>Generate New Route</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const getActivityIcon = () => {
    return routeData.activity === 'biking' ? '🚴‍♂️' : '🏃‍♂️';
  };

  const formatDistance = (distance) => {
    return `${distance.toFixed(1)} mi`;
  };

  const formatElevation = (elevation) => {
    return `${Math.round(elevation)} ft`;
  };

  const formatDuration = (distance, activity) => {
    const avgSpeed = activity === 'biking' ? 12 : 6; // mph
    const hours = distance / avgSpeed;
    const minutes = Math.round(hours * 60);
    return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  };

  const getMapRegion = () => {
    if (!routeData.waypoints || routeData.waypoints.length === 0) {
      return {
        latitude: 34.1064,
        longitude: -117.7106,
        latitudeDelta: 0.1,
        longitudeDelta: 0.1,
      };
    }

    const lats = routeData.waypoints.map(wp => wp.lat);
    const lngs = routeData.waypoints.map(wp => wp.lng);
    
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLng = Math.min(...lngs);
    const maxLng = Math.max(...lngs);
    
    const centerLat = (minLat + maxLat) / 2;
    const centerLng = (minLng + maxLng) / 2;
    const deltaLat = (maxLat - minLat) * 1.2;
    const deltaLng = (maxLng - minLng) * 1.2;
    
    return {
      latitude: centerLat,
      longitude: centerLng,
      latitudeDelta: Math.max(deltaLat, 0.01),
      longitudeDelta: Math.max(deltaLng, 0.01),
    };
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Route Info */}
        <View style={styles.routeInfo}>
          <Text style={styles.routeName}>{routeData.name}</Text>
          
          {routeData.isAlternative && (
            <View style={styles.alertBox}>
              <Text style={styles.alertText}>
                This is the closest alternative to your requested parameters
              </Text>
            </View>
          )}

          <View style={styles.activityInfo}>
            <Text style={styles.activityText}>
              {getActivityIcon()} {routeData.activity.charAt(0).toUpperCase() + routeData.activity.slice(1)}
            </Text>
          </View>

          <View style={styles.statsContainer}>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatDistance(routeData.distance)}</Text>
              <Text style={styles.statLabel}>Distance</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatElevation(routeData.elevation)}</Text>
              <Text style={styles.statLabel}>Elevation</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statValue}>{formatDuration(routeData.distance, routeData.activity)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
          </View>

          {routeData.description && (
            <Text style={styles.description}>{routeData.description}</Text>
          )}

          {routeData.isAlternative && (
            <View style={styles.originalRequest}>
              <Text style={styles.originalRequestTitle}>Original Request:</Text>
              <Text style={styles.originalRequestText}>
                Distance: {formatDistance(routeData.originalDistance)}
              </Text>
              <Text style={styles.originalRequestText}>
                Elevation: {formatElevation(routeData.originalElevation)}
              </Text>
            </View>
          )}
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <Text style={styles.sectionTitle}>Route Map</Text>
          <MapView
            style={styles.map}
            region={getMapRegion()}
            showsUserLocation={true}
            showsMyLocationButton={true}
          >
            {routeData.waypoints && routeData.waypoints.length > 0 && (
              <>
                {/* Start marker */}
                <Marker
                  coordinate={{
                    latitude: routeData.waypoints[0].lat,
                    longitude: routeData.waypoints[0].lng
                  }}
                  title="Start"
                  description={routeData.name}
                />
                
                {/* End marker */}
                {routeData.waypoints.length > 1 && (
                  <Marker
                    coordinate={{
                      latitude: routeData.waypoints[routeData.waypoints.length - 1].lat,
                      longitude: routeData.waypoints[routeData.waypoints.length - 1].lng
                    }}
                    title="End"
                    description={routeData.name}
                  />
                )}
                
                {/* Route polyline */}
                <Polyline
                  coordinates={routeData.waypoints.map(wp => ({
                    latitude: wp.lat,
                    longitude: wp.lng
                  }))}
                  strokeColor={routeData.activity === 'biking' ? '#1976d2' : '#dc004e'}
                  strokeWidth={4}
                />
              </>
            )}
          </MapView>
        </View>

        {/* Directions */}
        <View style={styles.directionsContainer}>
          <Text style={styles.sectionTitle}>Turn-by-Turn Directions</Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" />
            </View>
          ) : (
            <View style={styles.directionsList}>
              {directions.map((step, index) => (
                <View key={index} style={styles.directionItem}>
                  <View style={styles.directionNumber}>
                    <Text style={styles.directionNumberText}>{index + 1}</Text>
                  </View>
                  <View style={styles.directionContent}>
                    <Text style={styles.directionText}>{step.instruction}</Text>
                    <Text style={styles.directionDistance}>
                      {step.distance.toFixed(1)} mi • {step.duration} min
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          )}
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
  header: {
    marginBottom: 20,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 10,
  },
  backButtonText: {
    fontSize: 16,
    color: '#1976d2',
    fontWeight: '600',
  },
  routeInfo: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  routeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  alertBox: {
    backgroundColor: '#e3f2fd',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  alertText: {
    color: '#1976d2',
    fontSize: 14,
  },
  activityInfo: {
    marginBottom: 15,
  },
  activityText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  statBox: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  description: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 15,
  },
  originalRequest: {
    backgroundColor: '#f5f5f5',
    padding: 10,
    borderRadius: 5,
  },
  originalRequestTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  originalRequestText: {
    fontSize: 12,
    color: '#666',
  },
  mapContainer: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  map: {
    height: 300,
    borderRadius: 10,
  },
  directionsContainer: {
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
  loadingContainer: {
    padding: 20,
    alignItems: 'center',
  },
  directionsList: {
    gap: 15,
  },
  directionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 15,
  },
  directionNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1976d2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  directionNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  directionContent: {
    flex: 1,
  },
  directionText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 2,
  },
  directionDistance: {
    fontSize: 12,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    color: '#666',
    marginBottom: 20,
  },
});

export default RouteDisplayMobile;
