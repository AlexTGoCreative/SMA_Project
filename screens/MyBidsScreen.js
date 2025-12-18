import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function MyBidsScreen() {
  const [refreshing, setRefreshing] = useState(false);
  const [bids, setBids] = useState([]);

  const onRefresh = () => {
    setRefreshing(true);
    // TODO: Fetch user's bids from backend
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
        {bids.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="hammer-outline" size={80} color="#ccc" />
            <Text style={styles.emptyStateTitle}>No Bids Yet</Text>
            <Text style={styles.emptyStateText}>
              Browse available homes and place your first bid!
            </Text>
          </View>
        ) : (
          <>
            <Text style={styles.title}>My Bids ({bids.length})</Text>
            {/* Bids will be mapped here when backend is ready */}
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
  },
});


