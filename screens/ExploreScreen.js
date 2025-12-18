import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Keyboard,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

export default function ExploreScreen({ navigation }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);
  const [searchRadius, setSearchRadius] = useState(10); // km
  const [searchLocation, setSearchLocation] = useState(null);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    fetchListings();
    getUserLocation();
  }, []);

  const getUserLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const location = await Location.getCurrentPositionAsync({});
        setUserLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        });
      }
    } catch (error) {
      console.log('Error getting user location:', error);
    }
  };

  const fetchListings = async () => {
    try {
      setError(null);
      const data = await api.getListings();
      setListings(data);
    } catch (err) {
      console.error('Error fetching listings:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchListings();
    setRefreshing(false);
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Distance in km
  };

  const handleSearch = async () => {
    Keyboard.dismiss();
    
    if (!searchQuery.trim()) {
      // If empty search, reset and show all listings
      setSearchLocation(null);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);

    try {
      // Try to geocode the search query
      const geocoded = await Location.geocodeAsync(searchQuery);
      
      if (geocoded && geocoded.length > 0) {
        const newSearchLocation = {
          latitude: geocoded[0].latitude,
          longitude: geocoded[0].longitude,
        };

        setSearchLocation(newSearchLocation);

        // Filter listings by proximity
        const nearby = listings.filter(listing => {
          if (!listing.location?.coordinates) return false;
          
          const distance = calculateDistance(
            newSearchLocation.latitude,
            newSearchLocation.longitude,
            listing.location.coordinates.latitude,
            listing.location.coordinates.longitude
          );
          
          return distance <= searchRadius;
        });

        if (nearby.length === 0) {
          Alert.alert(
            'No Results',
            `No properties found within ${searchRadius}km of "${searchQuery}". Try increasing the search radius or a different location.`,
            [
              { text: 'OK' },
              { 
                text: 'Search 20km', 
                onPress: () => {
                  setSearchRadius(20);
                  setTimeout(() => handleSearch(), 100);
                }
              }
            ]
          );
        } else {
          Alert.alert('Search Results', `Found ${nearby.length} ${nearby.length === 1 ? 'property' : 'properties'} near "${searchQuery}"`);
        }
      } else {
        // Fallback to text search
        setSearchLocation(null);
        Alert.alert('Info', 'Location not found. Searching by property name and address instead.');
      }
    } catch (error) {
      console.error('Search error:', error);
      setSearchLocation(null);
      Alert.alert('Error', 'Could not search location. Showing text-based results.');
    }
  };

  const filteredListings = listings.filter((listing) => {
    // If we have a search location (proximity search)
    if (searchLocation && isSearching) {
      if (!listing.location?.coordinates) return false;
      
      const distance = calculateDistance(
        searchLocation.latitude,
        searchLocation.longitude,
        listing.location.coordinates.latitude,
        listing.location.coordinates.longitude
      );
      
      return distance <= searchRadius;
    }
    
    // Text-based search fallback
    if (!searchQuery.trim()) return true;
    
    const matchesText = 
      listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      listing.location.address.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesText;
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="location-outline" size={20} color="#007AFF" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by location (e.g., New York, London)..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={handleSearch}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity 
              onPress={() => {
                setSearchQuery('');
                setSearchLocation(null);
                setIsSearching(false);
                Keyboard.dismiss();
              }}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={styles.searchButton}
          onPress={handleSearch}
        >
          <Ionicons name="search" size={20} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Search Info */}
      {userLocation && (
        <View style={styles.searchInfo}>
          <Ionicons name="information-circle-outline" size={16} color="#666" />
          <Text style={styles.searchInfoText}>
            Searching within {searchRadius}km radius
          </Text>
          <TouchableOpacity 
            onPress={() => {
              Alert.alert(
                'Search Radius',
                'Choose search radius:',
                [
                  { text: '5 km', onPress: () => setSearchRadius(5) },
                  { text: '10 km', onPress: () => setSearchRadius(10) },
                  { text: '20 km', onPress: () => setSearchRadius(20) },
                  { text: '50 km', onPress: () => setSearchRadius(50) },
                  { text: 'Cancel', style: 'cancel' }
                ]
              );
            }}
            style={styles.changeRadiusButton}
          >
            <Text style={styles.changeRadiusText}>Change</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Listings */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.listingsContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchListings}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : filteredListings.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🏠</Text>
              <Text style={styles.emptyStateTitle}>
                {searchQuery ? 'No Results Found' : 'No Listings Yet'}
              </Text>
              <Text style={styles.emptyStateText}>
                {searchQuery
                  ? 'Try adjusting your search'
                  : 'Be the first to post a home for rent!'}
              </Text>
              {!searchQuery && (
                <TouchableOpacity
                  style={styles.emptyStateButton}
                  onPress={() => navigation.navigate('AddListing')}
                >
                  <Text style={styles.emptyStateButtonText}>Post a Listing</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <>
              <Text style={styles.sectionTitle}>
                {searchQuery ? `Found ${filteredListings.length} home(s)` : 'Available Homes'}
              </Text>
              {filteredListings.map((listing) => (
                <TouchableOpacity
                  key={listing._id}
                  style={styles.listingCard}
                  onPress={() => {
                    navigation.navigate('ListingDetail', { listingId: listing._id });
                  }}
                >
                  {/* Image */}
                  {listing.images && listing.images.length > 0 ? (
                    <Image
                      source={{ uri: listing.images[0] }}
                      style={styles.listingImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.listingImage, styles.listingImagePlaceholder]}>
                      <Text style={styles.placeholderIcon}>🏠</Text>
                    </View>
                  )}

                  {/* Content */}
                  <View style={styles.listingContent}>
                    <View style={styles.listingHeader}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <View style={styles.propertyTypeBadge}>
                        <Text style={styles.propertyTypeText}>
                          {listing.propertyType}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.locationRow}>
                      <Text style={styles.locationIcon}>📍</Text>
                      <Text style={styles.locationText} numberOfLines={1}>
                        {listing.location.address}
                      </Text>
                    </View>

                    {listing.amenities && listing.amenities.length > 0 && (
                      <View style={styles.amenitiesRow}>
                        {listing.amenities.slice(0, 3).map((amenity, index) => (
                          <View key={index} style={styles.amenityTag}>
                            <Text style={styles.amenityTagText}>{amenity}</Text>
                          </View>
                        ))}
                        {listing.amenities.length > 3 && (
                          <Text style={styles.moreAmenities}>
                            +{listing.amenities.length - 3} more
                          </Text>
                        )}
                      </View>
                    )}

                    <View style={styles.listingFooter}>
                      <View style={styles.priceContainer}>
                        <Text style={styles.price}>${listing.monthlyRent}</Text>
                        <Text style={styles.priceLabel}>/month</Text>
                      </View>
                      <Text style={styles.postedBy}>
                        by {listing.userId?.name || 'Unknown'}
                      </Text>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    gap: 10,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    paddingHorizontal: 15,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
  },
  clearButton: {
    padding: 4,
  },
  searchButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 15,
    paddingVertical: 10,
    gap: 8,
  },
  searchInfoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
  },
  changeRadiusButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#007AFF',
    borderRadius: 6,
  },
  changeRadiusText: {
    fontSize: 12,
    color: '#fff',
    fontWeight: '600',
  },
  listingsContainer: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 15,
    marginHorizontal: 15,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyStateIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  emptyStateButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  emptyStateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  errorIcon: {
    fontSize: 64,
    marginBottom: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  listingCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  listingImage: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
  },
  listingImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    opacity: 0.3,
  },
  listingContent: {
    padding: 15,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  listingTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 10,
  },
  propertyTypeBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  propertyTypeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  locationIcon: {
    fontSize: 14,
    marginRight: 5,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  amenitiesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    marginBottom: 12,
  },
  amenityTag: {
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginRight: 6,
    marginBottom: 4,
  },
  amenityTagText: {
    fontSize: 11,
    color: '#666',
    textTransform: 'capitalize',
  },
  moreAmenities: {
    fontSize: 11,
    color: '#007AFF',
    fontWeight: '600',
  },
  listingFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  postedBy: {
    fontSize: 12,
    color: '#999',
  },
});

