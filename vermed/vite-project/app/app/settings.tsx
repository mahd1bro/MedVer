import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const languages = {
  en: 'English',
  ha: 'Hausa',
  yo: 'Yoruba',
  ig: 'Igbo',
};

export default function SettingsScreen() {
  const router = useRouter();
  const [currentLanguage, setCurrentLanguage] = useState<keyof typeof languages>('en');

  const handleClearCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to clear all cached translations?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Success', 'Cache cleared successfully');
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView style={styles.content}>
        {/* Language Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="globe-outline" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>Language</Text>
          </View>
          <View style={styles.cardContent}>
            {Object.entries(languages).map(([code, name]) => (
              <TouchableOpacity
                key={code}
                style={[
                  styles.languageButton,
                  currentLanguage === code && styles.languageButtonActive,
                ]}
                onPress={() => setCurrentLanguage(code as keyof typeof languages)}
              >
                <Text
                  style={[
                    styles.languageText,
                    currentLanguage === code && styles.languageTextActive,
                  ]}
                >
                  {name}
                </Text>
                {currentLanguage === code && (
                  <View style={styles.checkmark}>
                    <Ionicons name="checkmark" size={16} color="white" />
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Camera Settings */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="camera-outline" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>Camera</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Camera Access</Text>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>Enabled</Text>
              </View>
            </View>
            <Text style={styles.settingDescription}>
              Camera is used to scan medicine barcodes
            </Text>
          </View>
        </View>

        {/* Storage */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="trash-outline" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>Storage</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Cache Size</Text>
              <Text style={styles.settingValue}>2.4 KB</Text>
            </View>
            <TouchableOpacity style={styles.clearButton} onPress={handleClearCache}>
              <Text style={styles.clearButtonText}>Clear Cache</Text>
            </TouchableOpacity>
            <Text style={styles.settingDescription}>
              Clear cached translations to free up space
            </Text>
          </View>
        </View>

        {/* About */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="information-circle-outline" size={20} color="#16a34a" />
            <Text style={styles.cardTitle}>About</Text>
          </View>
          <View style={styles.cardContent}>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Version</Text>
              <Text style={styles.settingValue}>1.0.0</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Developer</Text>
              <Text style={styles.settingValue}>MedVerify Team</Text>
            </View>
            <View style={styles.settingRow}>
              <Text style={styles.settingLabel}>Last Updated</Text>
              <Text style={styles.settingValue}>Nov 12, 2025</Text>
            </View>
          </View>
        </View>

        {/* Security Info */}
        <View style={styles.securityCard}>
          <Ionicons name="shield-checkmark" size={20} color="#2563eb" />
          <View style={styles.securityContent}>
            <Text style={styles.securityTitle}>Privacy & Security</Text>
            <Text style={styles.securityText}>
              Your medicine verification data is processed locally. No personal information 
              is stored or shared.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#16a34a',
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
    gap: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
  },
  cardContent: {
    padding: 8,
  },
  languageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    marginVertical: 4,
  },
  languageButtonActive: {
    backgroundColor: '#dcfce7',
    borderWidth: 1,
    borderColor: '#22c55e',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#374151',
  },
  languageTextActive: {
    color: '#15803d',
  },
  checkmark: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#16a34a',
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  settingLabel: {
    fontSize: 14,
    color: '#374151',
  },
  settingValue: {
    fontSize: 14,
    color: '#1f2937',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  badge: {
    backgroundColor: '#dcfce7',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#15803d',
  },
  clearButton: {
    backgroundColor: '#fef2f2',
    padding: 12,
    borderRadius: 8,
    marginVertical: 8,
    marginHorizontal: 8,
  },
  clearButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#dc2626',
    textAlign: 'center',
  },
  settingDescription: {
    fontSize: 12,
    color: '#6b7280',
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  securityCard: {
    flexDirection: 'row',
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  securityContent: {
    flex: 1,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 4,
  },
  securityText: {
    fontSize: 14,
    color: '#1e3a8a',
  },
});
