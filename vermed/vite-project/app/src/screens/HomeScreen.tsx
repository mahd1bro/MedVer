import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '@/state/store';
import { RootStackParamList } from '@/navigation/AppNavigator';
import { getButtonAccessibilityHint } from '@/utils/a11y';

type HomeScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Home'>;

interface Props {
  navigation: HomeScreenNavigationProp;
}

export default function HomeScreen({ navigation }: Props): React.JSX.Element {
  const { recentLookups, clearAllData } = useAppStore();

  const handleScanBarcode = () => {
    navigation.navigate('Scanner');
  };

  const handleManualSearch = () => {
    navigation.navigate('Search');
  };

  const handleMasHelper = () => {
    navigation.navigate('MasHelper');
  };

  const handleRecent = () => {
    navigation.navigate('Recent');
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all recent verifications from your device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: clearAllData,
        },
      ]
    );
  };

  const showDisclaimer = () => {
    Alert.alert(
      'Important Notice',
      'Visual screening using camera scans is for preliminary reference only. Always confirm medicine authenticity through NAFDAC Greenbook or MAS SMS verification for final verification.',
      [{ text: 'I Understand', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>VerMed</Text>
        <Text style={styles.subtitle}>Nigerian Medicine Verification</Text>
      </View>

      {/* Disclaimer */}
      <TouchableOpacity style={styles.disclaimer} onPress={showDisclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ Visual screening only - confirm via Greenbook or MAS
        </Text>
      </TouchableOpacity>

      {/* Main Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleScanBarcode}
          accessible={true}
          accessibilityLabel="Scan barcode or QR code"
          accessibilityHint={getButtonAccessibilityHint('scan')}
        >
          <Text style={styles.primaryButtonText}>📷 Scan Barcode/QR</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleManualSearch}
          accessible={true}
          accessibilityLabel="Search medicine manually"
          accessibilityHint={getButtonAccessibilityHint('search')}
        >
          <Text style={styles.secondaryButtonText}>🔍 Manual Search</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryButton]}
          onPress={handleMasHelper}
          accessible={true}
          accessibilityLabel="Get help with Mobile Authentication Service"
          accessibilityHint={getButtonAccessibilityHint('mas_helper')}
        >
          <Text style={styles.tertiaryButtonText}>📱 MAS Helper</Text>
        </TouchableOpacity>
      </View>

      {/* Recent Lookups */}
      <View style={styles.recentSection}>
        <View style={styles.recentHeader}>
          <Text style={styles.recentTitle}>Recent Verifications</Text>
          <TouchableOpacity onPress={handleRecent}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>
        
        {recentLookups.length === 0 ? (
          <Text style={styles.noRecentText}>No recent verifications</Text>
        ) : (
          recentLookups.slice(0, 3).map((lookup) => (
            <TouchableOpacity
              key={lookup.id}
              style={styles.recentItem}
              onPress={() => navigation.navigate('Results', { lookupId: lookup.id })}
            >
              <View style={styles.recentItemContent}>
                <Text style={styles.recentItemTitle}>
                  {lookup.greenbook.title || lookup.inputValue}
                </Text>
                <Text style={styles.recentItemTime}>
                  {new Date(lookup.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <View style={[
                styles.statusBadge,
                { backgroundColor: lookup.greenbook.status === 'registered' ? '#10b981' : '#ef4444' }
              ]}>
                <Text style={styles.statusText}>
                  {lookup.greenbook.status}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Footer Actions */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.footerButton}
          onPress={() => navigation.navigate('Settings')}
        >
          <Text style={styles.footerButtonText}>⚙️ Settings</Text>
        </TouchableOpacity>
        
        {recentLookups.length > 0 && (
          <TouchableOpacity
            style={styles.footerButton}
            onPress={handleClearData}
          >
            <Text style={styles.footerButtonText}>🗑️ Clear Data</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  contentContainer: {
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#92400e',
    textAlign: 'center',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: '100%',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#10b981',
  },
  tertiaryButton: {
    backgroundColor: '#8b5cf6',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  recentSection: {
    marginBottom: 32,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  recentTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
  },
  viewAllText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  noRecentText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  recentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  recentItemContent: {
    flex: 1,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
    marginBottom: 4,
  },
  recentItemTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  statusText: {
    fontSize: 12,
    color: '#ffffff',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
  },
  footerButton: {
    padding: 12,
  },
  footerButtonText: {
    fontSize: 14,
    color: '#6b7280',
  },
});