import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform, Dimensions, StatusBar } from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const STATUS_BAR_HEIGHT = Platform.OS === 'ios' ? 44 : StatusBar.currentHeight || 0;
const HEADER_HEIGHT = 60;
const BOTTOM_ACTION_HEIGHT = 100;
const BOTTOM_SAFE_AREA = Platform.OS === 'ios' ? 34 : 20;
const AVAILABLE_CONTENT_HEIGHT = SCREEN_HEIGHT - STATUS_BAR_HEIGHT - HEADER_HEIGHT - BOTTOM_ACTION_HEIGHT;

export default function ResultScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  // Mock medicine data (replace with actual API call)
  const medicine = {
    name: 'Paracetamol 500mg',
    manufacturer: 'PharmaCorp Nigeria',
    serialNumber: params.barcode || params.query || 'PM500MBN2024001',
    barcode: '123456789001',
    batchNumber: 'BTH2024001',
    expiryDate: '12/2026',
    nafdacNumber: 'A7-1234',
    isOriginal: true,
    description: 'Pain relief and fever reduction medication',
  };

  return (
    <View style={styles.container}>
      {/* Status Bar Spacer */}
      <View style={[styles.statusBarSpacer, { height: STATUS_BAR_HEIGHT }]} />
      
      {/* Header */}
      <View style={[styles.header, medicine.isOriginal ? styles.headerGreen : styles.headerRed]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Verification Result</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView 
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View style={[styles.statusCard, medicine.isOriginal ? styles.statusCardGreen : styles.statusCardRed]}>
          <View style={[styles.statusIcon, medicine.isOriginal ? styles.statusIconGreen : styles.statusIconRed]}>
            <Ionicons 
              name={medicine.isOriginal ? "checkmark-circle" : "close-circle"} 
              size={64} 
              color={medicine.isOriginal ? "#16a34a" : "#dc2626"} 
            />
          </View>
          <Text style={[styles.statusTitle, medicine.isOriginal ? styles.textGreen : styles.textRed]}>
            {medicine.isOriginal ? 'Original Medicine' : 'Counterfeit Detected'}
          </Text>
          <Text style={[styles.statusSubtitle, medicine.isOriginal ? styles.subtitleGreen : styles.subtitleRed]}>
            Medicine verified successfully
          </Text>
        </View>

        {/* Medicine Details */}
        <View style={styles.detailsCard}>
          <Text style={styles.detailsTitle}>Medicine Information</Text>
          
          <DetailRow label="Product" value={medicine.name} />
          <DetailRow label="Manufacturer" value={medicine.manufacturer} />
          <DetailRow label="Serial Number" value={medicine.serialNumber} mono />
          <DetailRow label="Barcode" value={medicine.barcode} mono />
          <DetailRow label="Batch Number" value={medicine.batchNumber} />
          <DetailRow label="Expiry Date" value={medicine.expiryDate} />
          <DetailRow label="NAFDAC Number" value={medicine.nafdacNumber} />
        </View>

        {/* Warning for Counterfeit */}
        {!medicine.isOriginal && (
          <View style={styles.warningCard}>
            <Ionicons name="warning" size={20} color="#ea580c" />
            <View style={styles.warningContent}>
              <Text style={styles.warningTitle}>Safety Warning</Text>
              <Text style={styles.warningText}>
                This medicine appears to be counterfeit. Please do not consume it. 
                Report to the nearest pharmacy or healthcare provider.
              </Text>
            </View>
          </View>
        )}

        {/* Description */}
        <View style={styles.descriptionCard}>
          <Text style={styles.descriptionTitle}>Description</Text>
          <Text style={styles.descriptionText}>{medicine.description}</Text>
        </View>

        {/* Verification Info */}
        <View style={styles.verifiedCard}>
          <View>
            <Text style={styles.verifiedLabel}>Verified on</Text>
            <Text style={styles.verifiedDate}>{new Date().toLocaleDateString()}</Text>
          </View>
          <View style={styles.verifiedIcon}>
            <Ionicons name="checkmark-circle" size={20} color="#16a34a" />
          </View>
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButtonGray} onPress={() => {}}>
          <Ionicons name="call" size={20} color="#374151" />
          <Text style={styles.actionButtonGrayText}>Report Issue</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.actionButtonGreen}
          onPress={() => router.push('/')}
        >
          <Ionicons name="home" size={20} color="white" />
          <Text style={styles.actionButtonGreenText}>Home</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function DetailRow({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, mono && styles.monoText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  statusBarSpacer: {
    backgroundColor: '#16a34a',
  },
  header: {
    height: HEADER_HEIGHT,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerGreen: {
    backgroundColor: '#16a34a',
  },
  headerRed: {
    backgroundColor: '#dc2626',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: 'white',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 30,
  },
  statusCard: {
    borderRadius: 16,
    borderWidth: 2,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  statusCardGreen: {
    backgroundColor: '#f0fdf4',
    borderColor: '#22c55e',
  },
  statusCardRed: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
  },
  statusIcon: {
    padding: 20,
    borderRadius: 64,
    marginBottom: 16,
  },
  statusIconGreen: {
    backgroundColor: '#dcfce7',
  },
  statusIconRed: {
    backgroundColor: '#fee2e2',
  },
  statusTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  textGreen: {
    color: '#15803d',
  },
  textRed: {
    color: '#b91c1c',
  },
  statusSubtitle: {
    fontSize: 18,
  },
  subtitleGreen: {
    color: '#16a34a',
  },
  subtitleRed: {
    color: '#dc2626',
  },
  detailsCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  detailsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  detailLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1f2937',
  },
  monoText: {
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    fontSize: 12,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#ffedd5',
    borderWidth: 1,
    borderColor: '#fed7aa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  warningContent: {
    flex: 1,
    marginLeft: 12,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#9a3412',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#9a3412',
  },
  descriptionCard: {
    backgroundColor: '#dbeafe',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e40af',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#1e3a8a',
  },
  verifiedCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
  },
  verifiedLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  verifiedDate: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1f2937',
  },
  verifiedIcon: {
    backgroundColor: '#dcfce7',
    padding: 8,
    borderRadius: 24,
  },
  actions: {
    flexDirection: 'row',
    padding: 16,
    paddingTop: 20,
    paddingBottom: BOTTOM_SAFE_AREA,
    backgroundColor: 'white',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    gap: 16,
  },
  actionButtonGray: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f3f4f6',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonGrayText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  actionButtonGreen: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#16a34a',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  actionButtonGreenText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});