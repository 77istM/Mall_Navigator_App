// screens/HomeScreen.js
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';

export default function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Mall Navigator App</Text>
      <Text style={styles.subtitle}>Choose your mode to begin</Text>

      <TouchableOpacity 
        style={styles.globalButton}
        onPress={() => navigation.navigate('GlobalTabs')}
      >
        <Text style={styles.buttonText}>Public Mode</Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={styles.privateButton}
        onPress={() => navigation.navigate('PrivateDashboard')}
      >
        <Text style={styles.buttonText}>Private Mode</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20, backgroundColor: '#f8f9fa' },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10, color: '#333' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 40 },
  globalButton: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center', marginBottom: 15 },
  privateButton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, width: '100%', alignItems: 'center' },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: '600' }
});