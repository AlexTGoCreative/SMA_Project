import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
} from 'react-native';

export default function AddListingScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState('apartment');

  const propertyTypes = [
    { id: 'apartment', label: 'Apartment', icon: '🏢' },
    { id: 'house', label: 'House', icon: '🏠' },
    { id: 'villa', label: 'Villa', icon: '🏡' },
    { id: 'cabin', label: 'Cabin', icon: '🏔️' },
  ];

  const handleSubmit = () => {
    if (!title || !description || !price || !location) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    Alert.alert(
      'Success',
      'Your listing will be created once backend is ready!',
      [{ text: 'OK', onPress: () => navigation.goBack() }]
    );
  };

  return (
    <ScrollView style={styles.container}>
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
          <Text style={styles.label}>Location</Text>
          <View style={styles.inputWithIcon}>
            <Text style={styles.inputIcon}>📍</Text>
            <TextInput
              style={[styles.input, styles.inputWithIconText]}
              placeholder="City, Country"
              value={location}
              onChangeText={setLocation}
            />
          </View>
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

        {/* Amenities (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.label}>Amenities</Text>
          <View style={styles.amenitiesGrid}>
            <TouchableOpacity style={styles.amenityChip}>
              <Text style={styles.amenityIcon}>📶</Text>
              <Text style={styles.amenityText}>WiFi</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.amenityChip}>
              <Text style={styles.amenityIcon}>🅿️</Text>
              <Text style={styles.amenityText}>Parking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.amenityChip}>
              <Text style={styles.amenityIcon}>🏊</Text>
              <Text style={styles.amenityText}>Pool</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.amenityChip}>
              <Text style={styles.amenityIcon}>🍳</Text>
              <Text style={styles.amenityText}>Kitchen</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Photos (Placeholder) */}
        <View style={styles.section}>
          <Text style={styles.label}>Photos</Text>
          <TouchableOpacity style={styles.photoUpload}>
            <Text style={styles.photoUploadIcon}>📷</Text>
            <Text style={styles.photoUploadText}>Add Photos</Text>
            <Text style={styles.photoUploadSubtext}>
              (Camera integration coming soon)
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.submitButtonText}>Create Listing</Text>
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
  inputWithIcon: {
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
  amenityIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  amenityText: {
    fontSize: 14,
    color: '#333',
  },
  photoUpload: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 40,
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
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  bottomPadding: {
    height: 20,
  },
});

