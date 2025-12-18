import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import axios from 'axios';

export default function TestConnectionScreen() {
  const [status, setStatus] = useState('Not tested');
  const [loading, setLoading] = useState(false);
  const [details, setDetails] = useState('');

  const testConnection = async () => {
    setLoading(true);
    setStatus('Testing...');
    setDetails('');

    try {
      const response = await axios.get('http://192.168.255.48:3000/', {
        timeout: 5000,
      });
      setStatus('✅ Connected!');
      setDetails(JSON.stringify(response.data, null, 2));
    } catch (error) {
      setStatus('❌ Connection Failed');
      setDetails(
        `Error: ${error.message}\n\n` +
        `Code: ${error.code || 'N/A'}\n\n` +
        `Make sure:\n` +
        `1. Backend server is running\n` +
        `2. You're on the same Wi-Fi network\n` +
        `3. Windows Firewall allows port 3000`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Connection Test</Text>
      <Text style={styles.url}>http://192.168.255.48:3000</Text>

      <TouchableOpacity
        style={styles.button}
        onPress={testConnection}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Test Connection</Text>
        )}
      </TouchableOpacity>

      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{status}</Text>
        {details ? (
          <Text style={styles.detailsText}>{details}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    textAlign: 'center',
  },
  url: {
    fontSize: 14,
    color: '#666',
    marginBottom: 30,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusContainer: {
    marginTop: 30,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  detailsText: {
    fontSize: 14,
    color: '#666',
    fontFamily: 'monospace',
  },
});

