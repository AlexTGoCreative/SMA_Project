import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

export default function ListingBidsScreen({ route, navigation }) {
  const { listingId, listingTitle } = route.params;
  
  const [bids, setBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBids();
  }, [listingId]);

  const fetchBids = async () => {
    try {
      setError(null);
      const data = await api.getListingBids(listingId);
      setBids(data);
    } catch (err) {
      console.error('Error fetching bids:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchBids();
  };

  const handleUpdateBidStatus = async (bidId, status, bidderName) => {
    const statusMessages = {
      accepted: 'Accept this bid?',
      rejected: 'Reject this bid?',
    };

    Alert.alert(
      'Confirm Action',
      `${statusMessages[status]}\n\nBidder: ${bidderName}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: status === 'accepted' ? 'Accept' : 'Reject',
          style: status === 'accepted' ? 'default' : 'destructive',
          onPress: async () => {
            try {
              await api.updateBidStatus(bidId, status);
              Alert.alert('Success', `Bid ${status} successfully!`);
              fetchBids();
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
        <Text style={styles.loadingText}>Loading bids...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Bids Received</Text>
          <Text style={styles.headerSubtitle} numberOfLines={1}>
            {listingTitle}
          </Text>
        </View>
        <View style={styles.placeholder} />
      </View>

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
            <TouchableOpacity style={styles.retryButton} onPress={fetchBids}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : bids.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="mail-open-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Bids Yet</Text>
            <Text style={styles.emptyStateText}>
              When someone makes an offer on your property, it will appear here.
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>{bids.length}</Text>
                <Text style={styles.statLabel}>Total Bids</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statNumber}>
                  {bids.filter((b) => b.status === 'pending').length}
                </Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={[styles.statNumber, { color: '#34c759' }]}>
                  {bids.filter((b) => b.status === 'accepted').length}
                </Text>
                <Text style={styles.statLabel}>Accepted</Text>
              </View>
            </View>

            {bids.map((bid) => (
              <View key={bid._id} style={styles.bidCard}>
                {/* Bidder Info */}
                <View style={styles.bidderSection}>
                  <View style={styles.bidderAvatar}>
                    <Ionicons name="person" size={24} color="#007AFF" />
                  </View>
                  <View style={styles.bidderInfo}>
                    <Text style={styles.bidderName}>
                      {bid.bidderId?.name || 'Unknown Bidder'}
                    </Text>
                    <Text style={styles.bidderEmail}>
                      {bid.bidderId?.email || 'No email'}
                    </Text>
                  </View>
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
                </View>

                {/* Bid Amount */}
                <View style={styles.amountSection}>
                  <Text style={styles.bidAmountLabel}>Offer Amount</Text>
                  <Text style={styles.bidAmount}>${bid.amount}/month</Text>
                </View>

                {/* Message */}
                {bid.message && (
                  <View style={styles.messageSection}>
                    <Text style={styles.messageLabel}>Message:</Text>
                    <Text style={styles.messageText}>{bid.message}</Text>
                  </View>
                )}

                {/* Date */}
                <View style={styles.dateSection}>
                  <Ionicons name="time-outline" size={14} color="#999" />
                  <Text style={styles.dateText}>
                    {new Date(bid.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </Text>
                </View>

                {/* Actions */}
                {bid.status === 'pending' && (
                  <View style={styles.actionsSection}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() =>
                        handleUpdateBidStatus(
                          bid._id,
                          'accepted',
                          bid.bidderId?.name
                        )
                      }
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() =>
                        handleUpdateBidStatus(
                          bid._id,
                          'rejected',
                          bid.bidderId?.name
                        )
                      }
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.actionButtonText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}
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
  headerTextContainer: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 10,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  placeholder: {
    width: 34,
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
  },
  statsContainer: {
    flexDirection: 'row',
    padding: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  bidCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginHorizontal: 15,
    marginBottom: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bidderSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  bidderAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  bidderInfo: {
    flex: 1,
  },
  bidderName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 2,
  },
  bidderEmail: {
    fontSize: 13,
    color: '#666',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
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
  amountSection: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    alignItems: 'center',
  },
  bidAmountLabel: {
    fontSize: 13,
    color: '#666',
    marginBottom: 5,
  },
  bidAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  messageSection: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
  },
  messageLabel: {
    fontSize: 12,
    color: '#999',
    fontWeight: '600',
    marginBottom: 5,
  },
  messageText: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  dateSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 13,
    color: '#999',
    marginLeft: 6,
  },
  actionsSection: {
    flexDirection: 'row',
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 6,
  },
  acceptButton: {
    backgroundColor: '#34c759',
  },
  rejectButton: {
    backgroundColor: '#ff3b30',
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  bottomPadding: {
    height: 20,
  },
});


