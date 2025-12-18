import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

export default function MyBidsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchMyBids();
  }, []);

  const fetchMyBids = async () => {
    try {
      setError(null);
      const data = await api.getMyBids();
      setBids(data);
    } catch (err) {
      console.error('Error fetching my bids:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchMyBids();
    setRefreshing(false);
  };

  const handleWithdrawBid = (bidId, listingTitle) => {
    Alert.alert(
      'Withdraw Bid',
      `Are you sure you want to withdraw your bid for "${listingTitle}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Withdraw',
          style: 'destructive',
          onPress: async () => {
            try {
              await api.withdrawBid(bidId);
              Alert.alert('Success', 'Bid withdrawn successfully');
              fetchMyBids();
            } catch (err) {
              Alert.alert('Error', err.toString());
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return '#ff9500';
      case 'accepted':
        return '#34c759';
      case 'rejected':
        return '#ff3b30';
      case 'withdrawn':
        return '#8e8e93';
      default:
        return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending':
        return 'time-outline';
      case 'accepted':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'withdrawn':
        return 'remove-circle-outline';
      default:
        return 'help-circle-outline';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading your bids...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
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
            <TouchableOpacity style={styles.retryButton} onPress={fetchMyBids}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : bids.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hammer-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Bids Yet</Text>
            <Text style={styles.emptyStateText}>
              Browse available homes and place your first bid!
            </Text>
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Explore')}
            >
              <Text style={styles.browseButtonText}>Browse Listings</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <Text style={styles.title}>
              {bids.length} {bids.length === 1 ? 'Bid' : 'Bids'}
            </Text>
            {bids.map((bid) => (
              <View key={bid._id} style={styles.bidCard}>
                <TouchableOpacity
                  onPress={() => {
                    if (bid.listingId) {
                      navigation.navigate('ListingDetail', {
                        listingId: bid.listingId._id,
                      });
                    }
                  }}
                >
                  {/* Listing Image */}
                  {bid.listingId?.images && bid.listingId.images.length > 0 ? (
                    <Image
                      source={{ uri: bid.listingId.images[0] }}
                      style={styles.bidImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={[styles.bidImage, styles.bidImagePlaceholder]}>
                      <Ionicons name="home-outline" size={48} color="#ccc" />
                    </View>
                  )}

                  {/* Status Badge */}
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(bid.status) },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(bid.status)}
                      size={14}
                      color="#fff"
                    />
                    <Text style={styles.statusText}>{bid.status}</Text>
                  </View>
                </TouchableOpacity>

                {/* Bid Info */}
                <View style={styles.bidContent}>
                  <Text style={styles.bidTitle} numberOfLines={2}>
                    {bid.listingId?.title || 'Listing not available'}
                  </Text>

                  <View style={styles.locationRow}>
                    <Ionicons name="location-outline" size={16} color="#666" />
                    <Text style={styles.locationText} numberOfLines={1}>
                      {bid.listingId?.location?.address || 'Unknown location'}
                    </Text>
                  </View>

                  <View style={styles.priceComparison}>
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Your Offer</Text>
                      <Text style={styles.bidAmount}>${bid.amount}</Text>
                    </View>
                    <Ionicons name="arrow-forward" size={20} color="#ccc" />
                    <View style={styles.priceItem}>
                      <Text style={styles.priceLabel}>Asking Price</Text>
                      <Text style={styles.askingPrice}>
                        ${bid.listingId?.monthlyRent || 0}
                      </Text>
                    </View>
                  </View>

                  {bid.message && (
                    <View style={styles.messageContainer}>
                      <Text style={styles.messageLabel}>Your Message:</Text>
                      <Text style={styles.messageText} numberOfLines={2}>
                        {bid.message}
                      </Text>
                    </View>
                  )}

                  <View style={styles.bidFooter}>
                    <View style={styles.dateRow}>
                      <Ionicons name="time-outline" size={14} color="#999" />
                      <Text style={styles.dateText}>
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </Text>
                    </View>

                    {bid.status === 'pending' && (
                      <TouchableOpacity
                        style={styles.withdrawButton}
                        onPress={() =>
                          handleWithdrawBid(bid._id, bid.listingId?.title)
                        }
                      >
                        <Ionicons name="close-circle-outline" size={18} color="#ff3b30" />
                        <Text style={styles.withdrawButtonText}>Withdraw</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              </View>
            ))}
          </>
        )}
        <View style={styles.bottomPadding} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
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
  browseButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 10,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bidCard: {
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
  bidImage: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
  },
  bidImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  statusBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  bidContent: {
    padding: 15,
  },
  bidTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 8,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: '#666',
    marginLeft: 5,
  },
  priceComparison: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
  },
  priceItem: {
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  askingPrice: {
    fontSize: 18,
    fontWeight: '600',
    color: '#666',
  },
  messageContainer: {
    backgroundColor: '#f0f8ff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  bidFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 12,
    color: '#999',
    marginLeft: 5,
  },
  withdrawButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: '#fff0f0',
    gap: 4,
  },
  withdrawButtonText: {
    fontSize: 14,
    color: '#ff3b30',
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});


