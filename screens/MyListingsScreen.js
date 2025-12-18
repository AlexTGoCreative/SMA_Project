import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

export default function MyListingsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyListings();
  }, []);

  const fetchMyListings = async () => {
    try {
      setError(null);
      const data = await api.getMyListings();
      setListings(data);
    } catch (err) {
      console.error('Error fetching my listings:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyListings();
    setRefreshing(false);
  };

  const handleDeleteListing = (listingId, listingTitle) => {
    Alert.alert(
      'Delete Listing',
      `Are you sure you want to delete "${listingTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.deleteListing(listingId);
              Alert.alert('Success', 'Listing deleted successfully');
              fetchMyListings();
            } catch (err) {
              Alert.alert('Error', err.toString());
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Listings</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('AddListing')}
          style={styles.addHeaderButton}
        >
          <Ionicons name="add" size={28} color="#007AFF" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading your listings...</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.content}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
              <TouchableOpacity style={styles.retryButton} onPress={fetchMyListings}>
                <Text style={styles.retryButtonText}>Retry</Text>
              </TouchableOpacity>
            </View>
          ) : listings.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="home-outline" size={80} color="#ccc" />
              <Text style={styles.emptyStateTitle}>No Listings Yet</Text>
              <Text style={styles.emptyStateText}>
                Start earning by posting your first property!
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AddListing')}
              >
                <Ionicons name="add-circle" size={24} color="#fff" />
                <Text style={styles.addButtonText}>Add Listing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.title}>
                {listings.length} {listings.length === 1 ? 'Listing' : 'Listings'}
              </Text>
              {listings.map((listing) => (
                <View key={listing._id} style={styles.listingCard}>
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

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      listing.status === 'active' && styles.statusActive,
                      listing.status === 'inactive' && styles.statusInactive,
                      listing.status === 'rented' && styles.statusRented,
                    ]}
                  >
                    <Text style={styles.statusText}>{listing.status}</Text>
                  </View>

                  {/* Content */}
                  <View style={styles.listingContent}>
                    <View style={styles.listingHeader}>
                      <Text style={styles.listingTitle} numberOfLines={1}>
                        {listing.title}
                      </Text>
                      <View style={styles.propertyTypeBadge}>
                        <Text style={styles.propertyTypeText}>{listing.propertyType}</Text>
                      </View>
                    </View>

                    <View style={styles.locationRow}>
                      <Ionicons name="location-outline" size={16} color="#666" />
                      <Text style={styles.locationText} numberOfLines={1}>
                        {listing.location.address}
                      </Text>
                    </View>

                    <View style={styles.priceRow}>
                      <Text style={styles.price}>${listing.monthlyRent}</Text>
                      <Text style={styles.priceLabel}>/month</Text>
                    </View>

                    <View style={styles.createdAtRow}>
                      <Ionicons name="time-outline" size={14} color="#999" />
                      <Text style={styles.createdAtText}>
                        Posted {new Date(listing.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {/* Actions */}
                    <View style={styles.actionsRow}>
                      <TouchableOpacity
                        style={[styles.actionButton, styles.viewBidsButton]}
                        onPress={() => {
                          navigation.navigate('ListingBids', {
                            listingId: listing._id,
                            listingTitle: listing.title,
                          });
                        }}
                      >
                        <Ionicons name="mail-outline" size={20} color="#fff" />
                        <Text style={[styles.actionButtonText, styles.viewBidsButtonText]}>
                          View Bids
                        </Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={styles.actionButton}
                        onPress={() => {
                          // TODO: Navigate to edit screen
                          Alert.alert('Edit', 'Edit functionality coming soon!');
                        }}
                      >
                        <Ionicons name="create-outline" size={20} color="#007AFF" />
                        <Text style={styles.actionButtonText}>Edit</Text>
                      </TouchableOpacity>

                      <TouchableOpacity
                        style={[styles.actionButton, styles.deleteButton]}
                        onPress={() => handleDeleteListing(listing._id, listing.title)}
                      >
                        <Ionicons name="trash-outline" size={20} color="#ff3b30" />
                        <Text style={[styles.actionButtonText, styles.deleteButtonText]}>
                          Delete
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </>
          )}
          <View style={styles.bottomPadding} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 15,
    paddingTop: 50,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  addHeaderButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    padding: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingTop: 100,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginBottom: 30,
  },
  addButton: {
    flexDirection: 'row',
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
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
    position: 'relative',
  },
  listingImage: {
    width: '100%',
    height: 180,
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
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusActive: {
    backgroundColor: '#34c759',
  },
  statusInactive: {
    backgroundColor: '#ff9500',
  },
  statusRented: {
    backgroundColor: '#8e8e93',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
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
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  price: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  createdAtRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  createdAtText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  actionsRow: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#f0f8ff',
    marginHorizontal: 5,
  },
  viewBidsButton: {
    backgroundColor: '#007AFF',
  },
  viewBidsButtonText: {
    color: '#fff',
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#007AFF',
    marginLeft: 6,
  },
  deleteButton: {
    backgroundColor: '#fff0f0',
  },
  deleteButtonText: {
    color: '#ff3b30',
  },
  bottomPadding: {
    height: 20,
  },
});


