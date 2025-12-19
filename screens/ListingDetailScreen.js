import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Dimensions,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { api } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function ListingDetailScreen({ route, navigation }) {
  const { listingId } = route.params;
  const { user } = useAuth();
  
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  
  // Bid modal state
  const [showBidModal, setShowBidModal] = useState(false);
  const [bidAmount, setBidAmount] = useState('');
  const [bidMessage, setBidMessage] = useState('');
  const [submittingBid, setSubmittingBid] = useState(false);

  useEffect(() => {
    fetchListing();
  }, [listingId]);

  const fetchListing = async () => {
    try {
      setError(null);
      const data = await api.getListing(listingId);
      setListing(data);
    } catch (err) {
      console.error('Error fetching listing:', err);
      setError(err.toString());
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitBid = async () => {
    if (!bidAmount || parseFloat(bidAmount) <= 0) {
      Alert.alert('Error', 'Please enter a valid bid amount');
      return;
    }

    const bidValue = parseFloat(bidAmount);
    const minimumBid = listing.monthlyRent * 0.6; // 60% of asking price

    if (bidValue < minimumBid) {
      Alert.alert(
        'Bid Too Low',
        `Your bid must be at least 60% of the asking price.\n\nMinimum bid: $${minimumBid.toFixed(2)}\nYour bid: $${bidValue.toFixed(2)}`,
        [{ text: 'OK' }]
      );
      return;
    }

    if (bidValue > listing.monthlyRent) {
      Alert.alert(
        'High Bid',
        `Your bid ($${bidAmount}) is higher than the asking price ($${listing.monthlyRent}). Continue anyway?`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Continue', onPress: submitBid },
        ]
      );
      return;
    }

    submitBid();
  };

  const submitBid = async () => {
    setSubmittingBid(true);
    try {
      await api.createBid({
        listingId: listing._id,
        amount: parseFloat(bidAmount),
        message: bidMessage,
      });

      Alert.alert(
        'Success',
        'Your offer has been submitted successfully! The property owner will review it.',
        [
          {
            text: 'OK',
            onPress: () => {
              setShowBidModal(false);
              setBidAmount('');
              setBidMessage('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.toString());
    } finally {
      setSubmittingBid(false);
    }
  };

  const handleContactOwner = () => {
    Alert.alert(
      'Contact Owner',
      `Contact ${listing.userId?.name || 'the owner'} about this property?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Message',
          onPress: () => {
            // TODO: Implement messaging
            Alert.alert('Coming Soon', 'Messaging feature will be available soon!');
          },
        },
      ]
    );
  };

  const handleCallOwner = () => {
    const phoneNumber = listing.phoneNumber || listing.userId?.phoneNumber;
    
    if (!phoneNumber) {
      Alert.alert('No Phone Number', 'The owner has not provided a phone number.');
      return;
    }

    Alert.alert(
      'Call Owner',
      `Call ${listing.userId?.name || 'the owner'} at ${phoneNumber}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
              Alert.alert('Error', 'Unable to make phone call');
            });
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading property details...</Text>
      </View>
    );
  }

  if (error || !listing) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#ff3b30" />
        <Text style={styles.errorText}>{error || 'Listing not found'}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchListing}>
          <Text style={styles.retryButtonText}>Try Again</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const isOwner = user?.id === listing.userId?._id;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#1a1a1a" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Property Details</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color="#1a1a1a" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageGallery}>
          {listing.images && listing.images.length > 0 ? (
            <>
              <ScrollView
                horizontal
                pagingEnabled
                showsHorizontalScrollIndicator={false}
                onScroll={(event) => {
                  const index = Math.round(event.nativeEvent.contentOffset.x / width);
                  setCurrentImageIndex(index);
                }}
                scrollEventThrottle={16}
              >
                {listing.images.map((image, index) => (
                  <Image
                    key={index}
                    source={{ uri: image }}
                    style={styles.image}
                    resizeMode="cover"
                  />
                ))}
              </ScrollView>
              <View style={styles.imageIndicator}>
                <Text style={styles.imageIndicatorText}>
                  {currentImageIndex + 1} / {listing.images.length}
                </Text>
              </View>
            </>
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="home-outline" size={80} color="#ccc" />
            </View>
          )}
        </View>

        {/* Property Info */}
        <View style={styles.infoSection}>
          {/* Title and Type */}
          <View style={styles.titleRow}>
            <Text style={styles.title}>{listing.title}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{listing.propertyType}</Text>
            </View>
          </View>

          {/* Price */}
          <View style={styles.priceRow}>
            <Text style={styles.price}>${listing.monthlyRent}</Text>
            <Text style={styles.priceLabel}>/month</Text>
          </View>

          {/* Location */}
          <View style={styles.locationRow}>
            <Ionicons name="location" size={20} color="#007AFF" />
            <Text style={styles.locationText}>{listing.location.address}</Text>
          </View>

          {/* Owner Info */}
          <View style={styles.ownerSection}>
            <View style={styles.ownerInfo}>
              <View style={styles.ownerAvatar}>
                <Ionicons name="person" size={24} color="#007AFF" />
              </View>
              <View style={styles.ownerDetails}>
                <Text style={styles.ownerLabel}>Listed by</Text>
                <Text style={styles.ownerName}>{listing.userId?.name || 'Unknown'}</Text>
              </View>
            </View>
            {!isOwner && (
              <View style={styles.contactButtons}>
                {(listing.phoneNumber || listing.userId?.phoneNumber) && (
                  <TouchableOpacity style={styles.contactButton} onPress={handleCallOwner}>
                    <Ionicons name="call-outline" size={20} color="#007AFF" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={styles.contactButton} onPress={handleContactOwner}>
                  <Ionicons name="chatbubble-outline" size={20} color="#007AFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{listing.description}</Text>
        </View>

        {/* Amenities */}
        {listing.amenities && listing.amenities.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Amenities</Text>
            <View style={styles.amenitiesGrid}>
              {listing.amenities.map((amenity, index) => (
                <View key={index} style={styles.amenityItem}>
                  <Ionicons name="checkmark-circle" size={20} color="#34c759" />
                  <Text style={styles.amenityText}>{amenity}</Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Map */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Location</Text>
            <TouchableOpacity 
              style={styles.openMapButton}
              onPress={() => {
                const { latitude, longitude } = listing.location.coordinates;
                const label = encodeURIComponent(listing.title);
                const url = Platform.select({
                  ios: `https://maps.google.com/?q=${latitude},${longitude}&label=${label}`,
                  android: `https://maps.google.com/?q=${latitude},${longitude}&label=${label}`,
                });
                Linking.openURL(url).catch(() => {
                  Alert.alert('Error', 'Unable to open Google Maps');
                });
              }}
            >
              <Ionicons name="navigate-outline" size={16} color="#007AFF" />
              <Text style={styles.openMapText}>Open in Google Maps</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.mapContainer}>
            <MapView
              provider={PROVIDER_GOOGLE}
              style={styles.map}
              initialRegion={{
                latitude: listing.location.coordinates.latitude,
                longitude: listing.location.coordinates.longitude,
                latitudeDelta: 0.01,
                longitudeDelta: 0.01,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
            >
              <Marker
                coordinate={{
                  latitude: listing.location.coordinates.latitude,
                  longitude: listing.location.coordinates.longitude,
                }}
                title={listing.title}
              />
            </MapView>
          </View>
        </View>

        {/* Posted Date */}
        <View style={styles.section}>
          <View style={styles.metaRow}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.metaText}>
              Posted {new Date(listing.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
        </View>

        <View style={styles.bottomPadding} />
      </ScrollView>

      {/* Bottom Action Bar */}
      {!isOwner && (
        <View style={styles.bottomBar}>
          <View style={styles.priceInfo}>
            <Text style={styles.bottomPrice}>${listing.monthlyRent}</Text>
            <Text style={styles.bottomPriceLabel}>/month</Text>
          </View>
          <TouchableOpacity
            style={styles.bidButton}
            onPress={() => setShowBidModal(true)}
          >
            <Ionicons name="pricetag" size={20} color="#fff" />
            <Text style={styles.bidButtonText}>Make an Offer</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bid Modal */}
      <Modal
        visible={showBidModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowBidModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Make an Offer</Text>
                  <TouchableOpacity onPress={() => setShowBidModal(false)}>
                    <Ionicons name="close" size={28} color="#666" />
                  </TouchableOpacity>
                </View>

            <ScrollView 
              style={styles.modalScrollView}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
            <View style={styles.priceInfoBox}>
              <View style={styles.priceInfoRow}>
                <Text style={styles.priceInfoLabel}>Asking Price:</Text>
                <Text style={styles.priceInfoValue}>${listing.monthlyRent}/month</Text>
              </View>
              <View style={styles.priceInfoRow}>
                <Text style={styles.priceInfoLabel}>Minimum Bid (60%):</Text>
                <Text style={[styles.priceInfoValue, styles.minimumBidValue]}>
                  ${(listing.monthlyRent * 0.6).toFixed(2)}/month
                </Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Your Offer Amount *</Text>
              <View style={styles.amountInput}>
                <Text style={styles.currencySymbol}>$</Text>
                <TextInput
                  style={styles.input}
                  placeholder="0"
                  keyboardType="numeric"
                  value={bidAmount}
                  onChangeText={setBidAmount}
                  returnKeyType="done"
                  onSubmitEditing={Keyboard.dismiss}
                />
                <Text style={styles.inputSuffix}>/month</Text>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Message (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Add a message to the property owner..."
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                value={bidMessage}
                onChangeText={setBidMessage}
              />
            </View>

            <TouchableOpacity
              style={[styles.submitButton, submittingBid && styles.submitButtonDisabled]}
              onPress={handleSubmitBid}
              disabled={submittingBid}
            >
              {submittingBid ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <>
                  <Ionicons name="paper-plane" size={20} color="#fff" />
                  <Text style={styles.submitButtonText}>Submit Offer</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowBidModal(false)}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
        </TouchableWithoutFeedback>
        </KeyboardAvoidingView>
      </Modal>
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
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  shareButton: {
    padding: 5,
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
    backgroundColor: '#f5f5f5',
    padding: 40,
  },
  errorText: {
    fontSize: 16,
    color: '#ff3b30',
    textAlign: 'center',
    marginTop: 20,
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
  imageGallery: {
    position: 'relative',
  },
  image: {
    width: width,
    height: 300,
    backgroundColor: '#f0f0f0',
  },
  imagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageIndicator: {
    position: 'absolute',
    bottom: 15,
    right: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageIndicatorText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  infoSection: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginRight: 10,
  },
  typeBadge: {
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  typeText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginBottom: 15,
  },
  price: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  priceLabel: {
    fontSize: 16,
    color: '#666',
    marginLeft: 6,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  locationText: {
    flex: 1,
    fontSize: 16,
    color: '#666',
    marginLeft: 8,
    lineHeight: 22,
  },
  ownerSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  ownerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  ownerDetails: {
    flex: 1,
  },
  ownerLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 2,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  contactButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  contactButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#f0f8ff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  openMapButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f8ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  openMapText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  amenityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '50%',
    marginBottom: 12,
  },
  amenityText: {
    fontSize: 15,
    color: '#333',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  mapContainer: {
    height: 200,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  map: {
    flex: 1,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
  },
  bottomPadding: {
    height: 100,
  },
  bottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  priceInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  bottomPrice: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  bottomPriceLabel: {
    fontSize: 14,
    color: '#666',
    marginLeft: 4,
  },
  bidButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  bidButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '85%',
  },
  modalScrollView: {
    flexGrow: 0,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  modalSubtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 25,
  },
  priceInfoBox: {
    backgroundColor: '#f0f8ff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  priceInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  priceInfoLabel: {
    fontSize: 15,
    color: '#666',
  },
  priceInfoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1a1a1a',
  },
  minimumBidValue: {
    color: '#007AFF',
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  amountInput: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
  },
  currencySymbol: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
    marginRight: 8,
  },
  input: {
    flex: 1,
    padding: 15,
    fontSize: 16,
    color: '#1a1a1a',
  },
  inputSuffix: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  textArea: {
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
    minHeight: 100,
    textAlignVertical: 'top',
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 10,
    marginBottom: 12,
    gap: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
  },
});


