import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MyListingsScreen({ navigation }) {
  const [refreshing, setRefreshing] = useState(false);
  const [listings, setListings] = useState([]);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch user's listings from backend
    setTimeout(() => setRefreshing(false), 1000);
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {listings.length === 0 ? (
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
            <Text style={styles.title}>My Listings ({listings.length})</Text>
            {/* Listings will be mapped here when backend is ready */}
          </>
        )}
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
});

