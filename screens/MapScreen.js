import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, Callout } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mapRegion, setMapRegion] = useState(null);
  const [listings, setListings] = useState([]);
  const [selectedListing, setSelectedListing] = useState(null);

  useEffect(() => {
    requestLocationPermission();
    fetchListings();
  }, []);

  const fetchListings = async () => {
    try {
      const data = await api.getListings();
      setListings(data);
    } catch (error) {
      console.error('Error fetching listings for map:', error);
    }
  };

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
        {/* Listings markers */}
        {listings.map((listing) => (
          <Marker
            key={listing._id}
            coordinate={{
              latitude: listing.location.coordinates.latitude,
              longitude: listing.location.coordinates.longitude,
            }}
            onPress={() => setSelectedListing(listing)}
          >
            <View style={styles.customMarker}>
              <Text style={styles.markerPrice}>${listing.monthlyRent}</Text>
            </View>
            <Callout
              tooltip
              onPress={() => {
                // TODO: Navigate to listing details
                console.log('View listing:', listing._id);
              }}
            >
              <View style={styles.calloutContainer}>
                {listing.images && listing.images.length > 0 ? (
                  <Image
                    source={{ uri: listing.images[0] }}
                    style={styles.calloutImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.calloutImage, styles.calloutImagePlaceholder]}>
                    <Text style={styles.calloutPlaceholderIcon}>🏠</Text>
                  </View>
                )}
                <View style={styles.calloutContent}>
                  <Text style={styles.calloutTitle} numberOfLines={1}>
                    {listing.title}
                  </Text>
                  <Text style={styles.calloutLocation} numberOfLines={1}>
                    📍 {listing.location.address}
                  </Text>
                  <View style={styles.calloutFooter}>
                    <Text style={styles.calloutPrice}>${listing.monthlyRent}/mo</Text>
                    <View style={styles.calloutBadge}>
                      <Text style={styles.calloutBadgeText}>{listing.propertyType}</Text>
                    </View>
                  </View>
                  <Text style={styles.calloutTap}>Tap to view details</Text>
                </View>
              </View>
            </Callout>
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
      <View style={styles.infoCard}>
        <View style={styles.infoCardHeader}>
          <Ionicons name="home" size={20} color="#007AFF" />
          <Text style={styles.infoText}>
            {listings.length} {listings.length === 1 ? 'Property' : 'Properties'} Available
          </Text>
        </View>
        {listings.length === 0 && (
          <Text style={styles.infoSubtext}>
            No listings to show on the map yet
          </Text>
        )}
      </View>
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
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  infoText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginLeft: 8,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginLeft: 28,
  },
  calloutContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    width: 280,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  calloutImage: {
    width: '100%',
    height: 150,
    backgroundColor: '#f0f0f0',
  },
  calloutImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  calloutPlaceholderIcon: {
    fontSize: 48,
    opacity: 0.3,
  },
  calloutContent: {
    padding: 12,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 6,
  },
  calloutLocation: {
    fontSize: 13,
    color: '#666',
    marginBottom: 8,
  },
  calloutFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  calloutPrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  calloutBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  calloutBadgeText: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  calloutTap: {
    fontSize: 11,
    color: '#999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
});
