import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext';

const ProfileScreen = ({ navigation }) => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    // For web, use window.confirm instead of Alert.alert
    if (Platform.OS === 'web') {
      if (window.confirm('Are you sure you want to logout?')) {
        logout();
      }
    } else {
      Alert.alert(
        'Logout',
        'Are you sure you want to logout?',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Logout',
            style: 'destructive',
            onPress: logout,
          },
        ]
      );
    }
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#007AFF" />
        </View>
        <Text style={styles.name}>{user?.name || 'User'}</Text>
        <Text style={styles.email}>{user?.email}</Text>
      </View>

      {/* Profile Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account Information</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user?.email}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Name</Text>
          <Text style={styles.infoValue}>{user?.name}</Text>
        </View>

        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>User ID</Text>
          <Text style={styles.infoValue} numberOfLines={1}>
            {user?.id}
          </Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.section}>
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Ionicons name="create-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Edit Profile</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyListings')}
        >
          <Ionicons name="list-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>My Listings</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('MyBids')}
        >
          <Ionicons name="hammer-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>My Bids</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Ionicons name="settings-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Settings</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#fff',
    padding: 30,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a1a1a',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  section: {
    backgroundColor: '#fff',
    marginTop: 20,
    paddingVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#1a1a1a',
    fontWeight: '500',
    flex: 1,
    textAlign: 'right',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  actionText: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    marginLeft: 16,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    marginTop: 20,
    marginHorizontal: 20,
    marginBottom: 40,
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ff3b30',
  },
  logoutText: {
    fontSize: 16,
    color: '#ff3b30',
    fontWeight: '600',
    marginLeft: 8,
  },
});

export default ProfileScreen;

