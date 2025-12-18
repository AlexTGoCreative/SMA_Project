import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

export default function MapScreen() {
  const [selectedListing, setSelectedListing] = useState(null);

  // Mock listings with coordinates
  const mockListings = [
    {
      id: 1,
      title: 'Modern Apartment',
      location: 'New York',
      price: 120,
      lat: 40.7128,
      lng: -74.0060,
    },
    {
      id: 2,
      title: 'Beach House',
      location: 'Miami',
      price: 200,
      lat: 25.7617,
      lng: -80.1918,
    },
    {
      id: 3,
      title: 'Mountain Cabin',
      location: 'Colorado',
      price: 150,
      lat: 39.5501,
      lng: -105.7821,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Map Placeholder */}
      <View style={styles.mapContainer}>
        <View style={styles.mapPlaceholder}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <Text style={styles.mapText}>Map View</Text>
          <Text style={styles.mapSubtext}>
            React Native Maps will be integrated here
          </Text>
          
          {/* Mock map markers */}
          <View style={styles.markersContainer}>
            {mockListings.map((listing) => (
              <TouchableOpacity
                key={listing.id}
                style={[
                  styles.marker,
                  selectedListing?.id === listing.id && styles.markerSelected,
                ]}
                onPress={() => setSelectedListing(listing)}
              >
                <Text style={styles.markerText}>${listing.price}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Map Controls */}
        <View style={styles.mapControls}>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>📍</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>+</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.controlButton}>
            <Text style={styles.controlIcon}>−</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Selected Listing Card */}
      {selectedListing && (
        <View style={styles.selectedCard}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.cardContent}>
              <View style={styles.cardImagePlaceholder}>
                <Text style={styles.cardImageIcon}>🏠</Text>
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardTitle}>{selectedListing.title}</Text>
                <Text style={styles.cardLocation}>
                  📍 {selectedListing.location}
                </Text>
                <Text style={styles.cardPrice}>
                  <Text style={styles.cardPriceAmount}>
                    ${selectedListing.price}
                  </Text>
                  <Text style={styles.cardPriceUnit}> / night</Text>
                </Text>
              </View>
              <TouchableOpacity style={styles.cardButton}>
                <Text style={styles.cardButtonText}>View</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      )}

      {/* Bottom Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.filterBarButton}>
          <Text style={styles.filterBarIcon}>💰</Text>
          <Text style={styles.filterBarText}>Price</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBarButton}>
          <Text style={styles.filterBarIcon}>🏠</Text>
          <Text style={styles.filterBarText}>Type</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBarButton}>
          <Text style={styles.filterBarIcon}>⭐</Text>
          <Text style={styles.filterBarText}>Rating</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterBarButton}>
          <Text style={styles.filterBarIcon}>📅</Text>
          <Text style={styles.filterBarText}>Dates</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  mapContainer: {
    flex: 1,
    position: 'relative',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e8f4f8',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapIcon: {
    fontSize: 64,
    marginBottom: 15,
  },
  mapText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  mapSubtext: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  markersContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
  marker: {
    backgroundColor: '#fff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  markerSelected: {
    backgroundColor: '#007AFF',
  },
  markerText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  mapControls: {
    position: 'absolute',
    right: 15,
    top: 60,
  },
  controlButton: {
    width: 45,
    height: 45,
    backgroundColor: '#fff',
    borderRadius: 22.5,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  controlIcon: {
    fontSize: 20,
  },
  selectedCard: {
    position: 'absolute',
    bottom: 80,
    left: 0,
    right: 0,
    paddingHorizontal: 15,
  },
  cardContent: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 15,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  cardImagePlaceholder: {
    width: 80,
    height: 80,
    backgroundColor: '#007AFF',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  cardImageIcon: {
    fontSize: 32,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  cardLocation: {
    fontSize: 12,
    color: '#666',
    marginBottom: 6,
  },
  cardPrice: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  cardPriceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  cardPriceUnit: {
    fontSize: 12,
    color: '#666',
  },
  cardButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginLeft: 10,
  },
  cardButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  filterBar: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    justifyContent: 'space-around',
  },
  filterBarButton: {
    alignItems: 'center',
    paddingHorizontal: 15,
  },
  filterBarIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  filterBarText: {
    fontSize: 12,
    color: '#666',
  },
});

