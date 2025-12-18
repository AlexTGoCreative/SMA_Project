import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const [notifications, setNotifications] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(false);

  return (
    <ScrollView style={styles.container}>
      {/* Notifications Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Notifications</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="notifications-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Push Notifications</Text>
              <Text style={styles.settingDescription}>
                Receive notifications about bids and messages
              </Text>
            </View>
          </View>
          <Switch
            value={notifications}
            onValueChange={setNotifications}
            trackColor={{ false: '#767577', true: '#007AFF' }}
          />
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingInfo}>
            <Ionicons name="mail-outline" size={24} color="#007AFF" />
            <View style={styles.settingText}>
              <Text style={styles.settingLabel}>Email Updates</Text>
              <Text style={styles.settingDescription}>
                Receive email updates about your listings
              </Text>
            </View>
          </View>
          <Switch
            value={emailUpdates}
            onValueChange={setEmailUpdates}
            trackColor={{ false: '#767577', true: '#007AFF' }}
          />
        </View>
      </View>

      {/* Account Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Account</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="lock-closed-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Change Password</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="shield-checkmark-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Privacy</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="card-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Payment Methods</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* Support Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="help-circle-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Help Center</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="document-text-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Terms of Service</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionItem}>
          <Ionicons name="shield-outline" size={24} color="#007AFF" />
          <Text style={styles.actionText}>Privacy Policy</Text>
          <Ionicons name="chevron-forward" size={24} color="#ccc" />
        </TouchableOpacity>
      </View>

      {/* About Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <View style={styles.infoItem}>
          <Text style={styles.infoLabel}>Version</Text>
          <Text style={styles.infoValue}>1.0.0</Text>
        </View>
      </View>

      <View style={styles.bottomPadding} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
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
    backgroundColor: '#f5f5f5',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingText: {
    marginLeft: 16,
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1a1a1a',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666',
  },
  actionItem: {
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
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  infoLabel: {
    fontSize: 16,
    color: '#666',
  },
  infoValue: {
    fontSize: 16,
    color: '#1a1a1a',
    fontWeight: '500',
  },
  bottomPadding: {
    height: 40,
  },
});

