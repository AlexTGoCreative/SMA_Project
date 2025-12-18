import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../utils/api';

export default function AddListingScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [address, setAddress] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');
  const [images, setImages] = useState([]);
  const [selectedFacilities, setSelectedFacilities] = useState([]);
  const [loading, setLoading] = useState(false);
  
  // Location state
  const [currentLocation, setCurrentLocation] = useState(null);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [showMap, setShowMap] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const mapRef = React.useRef(null);

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to use the map');
        setLocationLoading(false);
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setCurrentLocation(coords);
      setSelectedLocation(coords); // Set initial marker to current location
      setLocationLoading(false);
    } catch (error) {
      console.error('Error getting location:', error);
      setLocationLoading(false);
    }
  };

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment', icon: '🏢' },
    { id: 'house', label: 'House', icon: '🏠' },
    { id: 'villa', label: 'Villa', icon: '🏡' },
    { id: 'cabin', label: 'Cabin', icon: '🏔️' },
  ];

  const facilitiesList = [
    // Internet & Entertainment
    { id: 'wifi', label: 'Free WiFi', icon: '📶' },
    { id: 'tv', label: 'Flat-screen TV', icon: '📺' },
    { id: 'streaming', label: 'Streaming service', icon: '🎬' },
    
    // Kitchen & Dining
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'dishwasher', label: 'Dishwasher', icon: '🍽️' },
    { id: 'microwave', label: 'Microwave', icon: '📻' },
    { id: 'coffee', label: 'Coffee maker', icon: '☕' },
    
    // Bathroom
    { id: 'washer', label: 'Washing machine', icon: '🧺' },
    { id: 'dryer', label: 'Dryer', icon: '👕' },
    { id: 'hairdryer', label: 'Hair dryer', icon: '💨' },
    { id: 'towels', label: 'Towels', icon: '🛁' },
    
    // Comfort
    { id: 'ac', label: 'Air conditioning', icon: '❄️' },
    { id: 'heating', label: 'Heating', icon: '🔥' },
    { id: 'balcony', label: 'Balcony', icon: '🪴' },
    { id: 'terrace', label: 'Terrace', icon: '🌿' },
    
    // Outdoor & Parking
    { id: 'parking', label: 'Free parking', icon: '🅿️' },
    { id: 'garden', label: 'Garden', icon: '🌳' },
    { id: 'pool', label: 'Swimming pool', icon: '🏊' },
    { id: 'bbq', label: 'BBQ facilities', icon: '🍖' },
    
    // Safety & Security
    { id: 'security', label: '24-hour security', icon: '🔒' },
    { id: 'smoke_alarm', label: 'Smoke alarm', icon: '🚨' },
    { id: 'first_aid', label: 'First aid kit', icon: '🏥' },
    
    // Accessibility
    { id: 'elevator', label: 'Elevator', icon: '🛗' },
    { id: 'wheelchair', label: 'Wheelchair accessible', icon: '♿' },
    
    // Pet-friendly
    { id: 'pets', label: 'Pets allowed', icon: '🐕' },
  ];

  const toggleFacility = (facilityId) => {
    if (selectedFacilities.includes(facilityId)) {
      setSelectedFacilities(selectedFacilities.filter(id => id !== facilityId));
    } else {
      setSelectedFacilities([...selectedFacilities, facilityId]);
    }
  };

  const handleMapPress = async (event) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
    
    // Reverse geocoding - get address from coordinates
    try {
      const result = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (result && result.length > 0) {
        const location = result[0];
        // Build address string from components
        const addressParts = [
          location.street,
          location.streetNumber,
          location.city,
          location.region,
          location.country,
          location.postalCode,
        ].filter(Boolean); // Remove null/undefined values
        
        const fullAddress = addressParts.join(', ');
        setAddress(fullAddress);
      }
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      // Don't show error to user, just log it
    }
  };

  // Geocoding - convert address to coordinates
  const searchAddress = async () => {
    if (!address || address.trim().length < 3) {
      Alert.alert('Error', 'Please enter a valid address');
      return;
    }

    setGeocoding(true);
    try {
      const result = await Location.geocodeAsync(address);
      if (result && result.length > 0) {
        const { latitude, longitude } = result[0];
        setSelectedLocation({ latitude, longitude });
        
        // Animate map to new location if map is visible
        if (showMap && mapRef.current) {
          mapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01,
          }, 1000);
        } else {
          // If map is not visible, show it
          setShowMap(true);
        }
        
        Alert.alert('Success', 'Location found on map!');
      } else {
        Alert.alert('Not Found', 'Could not find this address. Please try a different one.');
      }
    } catch (error) {
      console.error('Error geocoding:', error);
      Alert.alert('Error', 'Could not search for this address. Please try again.');
    } finally {
      setGeocoding(false);
    }
  };

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Camera permission is required to take photos');
      return false;
    }
    return true;
  };

  const requestGalleryPermission = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Gallery permission is required to select photos');
      return false;
    }
    return true;
  };

  const takePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImages([...images, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    const hasPermission = await requestGalleryPermission();
    if (!hasPermission) return;

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages([...images, ...newImages]);
    }
  };

  const removeImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
  };

  const showImageOptions = () => {
    Alert.alert(
      'Add Photos',
      'Choose an option',
      [
        {
          text: 'Take Photo',
          onPress: takePhoto,
        },
        {
          text: 'Choose from Gallery',
          onPress: pickImage,
        },
        {
          text: 'Cancel',
          style: 'cancel',
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!title || !description || !price || !address) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Error', 'Please add at least one photo');
      return;
    }

    if (!selectedLocation) {
      Alert.alert('Error', 'Please select a location on the map');
      return;
    }

    setLoading(true);

    try {
      // Convert images to base64 (for simplicity, in production use cloud storage)
      const base64Images = images.map(uri => uri);

      const listingData = {
        title,
        description,
        monthlyRent: parseFloat(price),
        propertyType,
        location: {
          address,
          coordinates: {
            latitude: selectedLocation.latitude,
            longitude: selectedLocation.longitude,
          },
        },
        images: base64Images,
        amenities: selectedFacilities,
      };

      await api.createListing(listingData);

      Alert.alert(
        'Success',
        'Your listing has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setTitle('');
              setDescription('');
              setPrice('');
              setAddress('');
              setImages([]);
              setSelectedFacilities([]);
              setPropertyType('apartment');
              navigation.navigate('Explore');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', error.toString());
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      <View style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerIcon}>🏠</Text>
          <Text style={styles.headerTitle}>List Your Property</Text>
          <Text style={styles.headerSubtitle}>
            Share your space with travelers
          </Text>
        </View>

        {/* Property Type */}
        <View style={styles.section}>
          <Text style={styles.label}>Property Type</Text>
          <View style={styles.typeGrid}>
            {propertyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.typeCard,
                  propertyType === type.id && styles.typeCardSelected,
                ]}
                onPress={() => setPropertyType(type.id)}
              >
                <Text style={styles.typeIcon}>{type.icon}</Text>
                <Text
                  style={[
                    styles.typeLabel,
                    propertyType === type.id && styles.typeLabelSelected,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Title */}
        <View style={styles.section}>
          <Text style={styles.label}>Title</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g., Cozy apartment in downtown"
            value={title}
            onChangeText={setTitle}
          />
        </View>

        {/* Description */}
        <View style={styles.section}>
          <Text style={styles.label}>Description</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Describe your property..."
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
          />
        </View>

        {/* Location */}
        <View style={styles.section}>
          <Text style={styles.label}>Address</Text>
          <View style={styles.addressContainer}>
            <View style={styles.inputWithIcon}>
              <Text style={styles.inputIcon}>📍</Text>
              <TextInput
                style={[styles.input, styles.inputWithIconText]}
                placeholder="Full address (e.g., 123 Main St, City, Country)"
                value={address}
                onChangeText={setAddress}
                multiline
                returnKeyType="search"
                onSubmitEditing={searchAddress}
              />
            </View>
            <TouchableOpacity 
              style={styles.searchButton}
              onPress={searchAddress}
              disabled={geocoding || !address}
            >
              {geocoding ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Ionicons name="search" size={20} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
          <Text style={styles.addressHint}>
            💡 Type an address and tap search to find it on the map
          </Text>
        </View>

        {/* Map Location Picker */}
        <View style={styles.section}>
          <View style={styles.mapHeader}>
            <Text style={styles.label}>Pin Location on Map</Text>
            <TouchableOpacity onPress={() => setShowMap(!showMap)}>
              <Ionicons 
                name={showMap ? 'chevron-up' : 'chevron-down'} 
                size={24} 
                color="#007AFF" 
              />
            </TouchableOpacity>
          </View>
          
          {showMap && (
            <View style={styles.mapContainer}>
              {locationLoading ? (
                <View style={styles.mapLoading}>
                  <ActivityIndicator size="large" color="#007AFF" />
                  <Text style={styles.mapLoadingText}>Loading map...</Text>
                </View>
              ) : currentLocation ? (
                <>
                  <MapView
                    ref={mapRef}
                    style={styles.map}
                    initialRegion={{
                      latitude: currentLocation.latitude,
                      longitude: currentLocation.longitude,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    onPress={handleMapPress}
                  >
                    {selectedLocation && (
                      <Marker
                        coordinate={selectedLocation}
                        title="Property Location"
                        pinColor="#007AFF"
                      />
                    )}
                  </MapView>
                  <View style={styles.mapHintContainer}>
                    <Ionicons name="information-circle" size={16} color="#007AFF" />
                    <Text style={styles.mapHint}>
                      Tap on map to pin location - address will auto-fill above
                    </Text>
                  </View>
                  {selectedLocation && (
                    <View style={styles.coordinatesInfo}>
                      <Ionicons name="location" size={14} color="#007AFF" />
                      <Text style={styles.coordinatesText}>
                        Lat: {selectedLocation.latitude.toFixed(6)}, Lng: {selectedLocation.longitude.toFixed(6)}
                      </Text>
                    </View>
                  )}
                </>
              ) : (
                <View style={styles.mapError}>
                  <Text style={styles.mapErrorText}>
                    Unable to load map. Please check location permissions.
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>

        {/* Price */}
        <View style={styles.section}>
          <Text style={styles.label}>Monthly Rent</Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.inputIcon}>💰</Text>
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              placeholder="0"
              value={price}
              onChangeText={setPrice}
              keyboardType="numeric"
            />
            <Text style={styles.inputSuffix}>USD/month</Text>
          </View>
        </View>

        {/* Facilities */}
        <View style={styles.section}>
          <Text style={styles.label}>Facilities ({selectedFacilities.length} selected)</Text>
          <Text style={styles.sublabel}>Select all that apply</Text>
          <View style={styles.amenitiesGrid}>
            {facilitiesList.map((facility) => (
              <TouchableOpacity
                key={facility.id}
                style={[
                  styles.amenityChip,
                  selectedFacilities.includes(facility.id) && styles.amenityChipSelected,
                ]}
                onPress={() => toggleFacility(facility.id)}
              >
                <Text style={styles.amenityIcon}>{facility.icon}</Text>
                <Text
                  style={[
                    styles.amenityText,
                    selectedFacilities.includes(facility.id) && styles.amenityTextSelected,
                  ]}
                >
                  {facility.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Photos */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos ({images.length})</Text>
          
          {/* Image Grid */}
          {images.length > 0 && (
            <View style={styles.imageGrid}>
              {images.map((uri, index) => (
                <View key={index} style={styles.imageContainer}>
                  <Image source={{ uri }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    <Text style={styles.removeImageText}>✕</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          )}

          {/* Add Photo Button */}
          <TouchableOpacity 
            style={styles.photoUpload}
            onPress={showImageOptions}
          >
            <Text style={styles.photoUploadIcon}>📷</Text>
            <Text style={styles.photoUploadText}>
              {images.length === 0 ? 'Add Photos' : 'Add More Photos'}
            </Text>
            <Text style={styles.photoUploadSubtext}>
              Take a photo or choose from gallery
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity 
          style={[styles.submitButton, loading && styles.submitButtonDisabled]} 
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Create Listing</Text>
          )}
        </TouchableOpacity>

        <View style={styles.bottomPadding} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    paddingTop: 50,
  },
  content: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  headerIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    marginBottom: 25,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
  },
  sublabel: {
    fontSize: 13,
    color: '#999',
    marginBottom: 15,
    marginTop: -5,
  },
  typeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  typeCard: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    margin: '1%',
    borderWidth: 2,
    borderColor: '#e0e0e0',
  },
  typeCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f8ff',
  },
  typeIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  typeLabel: {
    fontSize: 14,
    color: '#666',
    fontWeight: '500',
  },
  typeLabelSelected: {
    color: '#007AFF',
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textArea: {
    height: 100,
    paddingTop: 15,
  },
  addressContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  inputWithIcon: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 15,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  inputWithIconText: {
    flex: 1,
    borderWidth: 0,
    padding: 15,
  },
  inputSuffix: {
    fontSize: 14,
    color: '#666',
    fontWeight: '600',
  },
  searchButton: {
    backgroundColor: '#007AFF',
    width: 50,
    height: 50,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 0,
  },
  addressHint: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    fontStyle: 'italic',
  },
  amenitiesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -5,
  },
  amenityChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    margin: 5,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  amenityChipSelected: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  amenityIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  amenityTextSelected: {
    color: '#fff',
  },
  mapHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  mapContainer: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  map: {
    width: '100%',
    height: 250,
  },
  mapLoading: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLoadingText: {
    marginTop: 10,
    color: '#666',
  },
  mapError: {
    height: 250,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  mapErrorText: {
    color: '#ff3b30',
    textAlign: 'center',
  },
  mapHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f0f8ff',
    gap: 6,
  },
  mapHint: {
    fontSize: 12,
    color: '#007AFF',
    textAlign: 'center',
  },
  coordinatesInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    gap: 6,
  },
  coordinatesText: {
    fontSize: 11,
    color: '#666',
    textAlign: 'center',
  },
  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
    marginHorizontal: -5,
  },
  imageContainer: {
    width: '31%',
    aspectRatio: 1,
    margin: '1%',
    position: 'relative',
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  removeImageButton: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removeImageText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  photoUpload: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 30,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e0e0e0',
    borderStyle: 'dashed',
  },
  photoUploadIcon: {
    fontSize: 48,
    marginBottom: 10,
  },
  photoUploadText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 5,
  },
  photoUploadSubtext: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    backgroundColor: '#ccc',
    shadowOpacity: 0,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

