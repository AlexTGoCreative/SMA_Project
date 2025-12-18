import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);
  const [listings, setListings] = useState([]);

  useEffect(() => {
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert(
          'Permission Denied',
          'Location permission is required to show your position on the map'
        );
        setLoading(false);
        return;
      }

      getCurrentLocation();
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = currentLocation.coords;
      
      setLocation({
        latitude,
        longitude,
      });

      setMapRegion({
        latitude,
        longitude,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      });

      setLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      Alert.alert('Error', 'Could not get your location');
      setLoading(false);
    }
  };

  const goToMyLocation = () => {
    if (location && mapRegion) {
      setMapRegion({
        ...mapRegion,
        latitude: location.latitude,
        longitude: location.longitude,
      });
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  if (!mapRegion) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="location-outline" size={64} color="#ccc" />
        <Text style={styles.errorTitle}>Location Not Available</Text>
        <Text style={styles.errorText}>
          Please enable location services to use the map
        </Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={requestLocationPermission}
        >
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        region={mapRegion}
        onRegionChangeComplete={setMapRegion}
        showsUserLocation={true}
        showsMyLocationButton={false}
        showsCompass={true}
        showsScale={true}
      >
        {/* User's current location marker */}
        {location && (
          <Marker
            coordinate={location}
            title="You are here"
            pinColor="#007AFF"
          />
        )}

        {/* Mock listings markers - will be replaced with real data */}
        {listings.map((listing) => (
          <Marker
            key={listing.id}
            coordinate={{
              latitude: listing.latitude,
              longitude: listing.longitude,
            }}
            title={listing.title}
            description={`$${listing.price}/month`}
          >
            <View style={styles.customMarker}>
              <Text style={styles.markerPrice}>${listing.price}</Text>
            </View>
          </Marker>
        ))}
      </MapView>

      {/* Map Controls */}
      <View style={styles.controls}>
        {/* My Location Button */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={goToMyLocation}
        >
          <Ionicons name="locate" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Zoom In */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setMapRegion({
              ...mapRegion,
              latitudeDelta: mapRegion.latitudeDelta / 2,
              longitudeDelta: mapRegion.longitudeDelta / 2,
            });
          }}
        >
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>

        {/* Zoom Out */}
        <TouchableOpacity
          style={styles.controlButton}
          onPress={() => {
            setMapRegion({
              ...mapRegion,
              latitudeDelta: mapRegion.latitudeDelta * 2,
              longitudeDelta: mapRegion.longitudeDelta * 2,
            });
          }}
        >
          <Ionicons name="remove" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {/* Info Card */}
      {listings.length === 0 && (
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            📍 Showing your current location
          </Text>
          <Text style={styles.infoSubtext}>
            Listings will appear here when available
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 15,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 40,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  errorText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  controls: {
    position: 'absolute',
    right: 15,
    top: 60,
  },
  controlButton: {
    width: 50,
    height: 50,
    backgroundColor: '#fff',
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  customMarker: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  markerPrice: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  infoCard: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    right: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
  },
});
