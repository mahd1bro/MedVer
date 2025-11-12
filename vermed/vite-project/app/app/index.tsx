import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { Camera, Keyboard, Settings } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.headerLeft}>
            <Text style={styles.headerTitle}>MedVerify</Text>
            <Text style={styles.headerSubtitle}>Verify medicine authenticity</Text>
          </View>
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={() => router.push('/settings')}
          >
            <Settings size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Main Content */}
      <View style={styles.mainContent}>
        {/* Scan Button */}
        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => router.push('/scan')}
        >
          <View style={styles.iconContainer}>
            <Camera size={48} color="#16a34a" />
          </View>
          <Text style={styles.actionTitle}>Scan Barcode</Text>
          <Text style={styles.actionSubtitle}>Use camera to scan barcode</Text>
        </TouchableOpacity>

        {/* Manual Entry Button */}
        <TouchableOpacity 
          style={[styles.actionButton, { marginTop: 16 }]}
          onPress={() => router.push('/manual-entry')}
        >
          <View style={[styles.iconContainer, { backgroundColor: '#dbeafe' }]}>
            <Keyboard size={48} color="#2563eb" />
          </View>
          <Text style={styles.actionTitle}>Enter Serial Number</Text>
          <Text style={styles.actionSubtitle}>Enter serial number manually</Text>
        </TouchableOpacity>

        {/* Features */}
        <View style={styles.featuresContainer}>
          <View style={styles.featureCard}>
            <View style={[styles.featureIcon, { backgroundColor: '#dcfce7' }]}>
              <Text style={styles.featureIconText}>✓</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Instant Verification</Text>
              <Text style={styles.featureDescription}>Check medicine authenticity in seconds</Text>
            </View>
          </View>

          <View style={[styles.featureCard, { marginTop: 16 }]}>
            <View style={[styles.featureIcon, { backgroundColor: '#dbeafe' }]}>
              <Text style={styles.featureIconText}>🌐</Text>
            </View>
            <View style={styles.featureContent}>
              <Text style={styles.featureTitle}>Multi-Language</Text>
              <Text style={styles.featureDescription}>Support for Nigerian languages</Text>
            </View>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0fdf4',
  },
  header: {
    backgroundColor: '#16a34a',
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#dcfce7',
    marginTop: 4,
  },
  settingsButton: {
    padding: 8,
    borderRadius: 24,
    backgroundColor: '#15803d',
  },
  mainContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  actionButton: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  iconContainer: {
    backgroundColor: '#dcfce7',
    padding: 16,
    borderRadius: 48,
    marginBottom: 16,
  },
  actionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 8,
  },
  actionSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  featuresContainer: {
    marginTop: 48,
  },
  featureCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  featureIconText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
  },
});
