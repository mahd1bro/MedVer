import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Vibration,
} from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '@/state/store';
import { BarcodeService, ScanResult } from '@/services/barcode';
import { ApiService } from '@/services/api';
import { getButtonAccessibilityHint } from '@/utils/a11y';

type ScannerScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Scanner'>;

interface Props {
  navigation: ScannerScreenNavigationProp;
}

export default function ScannerScreen({ navigation }: Props): React.JSX.Element {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);
  const [lastScan, setLastScan] = useState<string | null>(null);
  
  const { setVerifying, addRecentLookup } = useAppStore();

  useEffect(() => {
    checkCameraPermission();
  }, []);

  const checkCameraPermission = async () => {
    const hasPermission = await BarcodeService.checkPermissions();
    setHasPermission(hasPermission);

    if (!hasPermission) {
      const granted = await BarcodeService.requestPermissions();
      setHasPermission(granted);
      
      if (!granted) {
        Alert.alert(
          'Camera Permission Required',
          'Camera permission is required to scan medicine barcodes. Please enable camera access in your device settings.',
          [
            { text: 'Cancel', onPress: () => navigation.goBack() },
            { text: 'Settings', onPress: () => navigation.goBack() }
          ]
        );
      }
    }
  };

  const handleBarcodeScanned = async (result: any) => {
    if (!isScanning) return;

    const scanResult: ScanResult = {
      value: result.data,
      type: result.type,
      timestamp: Date.now(),
    };

    const processed = BarcodeService.processScan(scanResult);
    if (!processed) return;

    // Prevent duplicate scans
    if (lastScan === processed.value) {
      return;
    }

    setLastScan(processed.value);
    setIsScanning(false);
    Vibration.vibrate(100);

    // Extract medicine info from barcode
    const medicineInfo = BarcodeService.extractMedicineInfo(processed.value);
    
    // Show confirmation dialog
    Alert.alert(
      'Barcode Scanned',
      `Scanned: ${processed.value}\n\nProceed with verification?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => resumeScanning() },
        { 
          text: 'Verify', 
          onPress: () => verifyMedicine(medicineInfo.query, medicineInfo.type)
        }
      ]
    );
  };

  const verifyMedicine = async (query: string, inputType: 'barcode' | 'qr') => {
    setVerifying(true);

    try {
      const response = await ApiService.verify({
        barcode: query,
      });

      addRecentLookup(response.product);
      setVerifying(false);
      
      navigation.navigate('Results', { lookupId: response.product.id });
    } catch (error) {
      setVerifying(false);
      Alert.alert(
        'Verification Failed',
        'Failed to verify medicine. Please try again or use manual search.',
        [
          { text: 'Try Again', onPress: () => resumeScanning() },
          { text: 'Manual Search', onPress: () => navigation.navigate('Search') }
        ]
      );
    }
  };

  const resumeScanning = () => {
    setIsScanning(true);
    setLastScan(null);
  };

  const handleManualInput = () => {
    Alert.alert(
      'Manual Entry',
      'Enter barcode or medicine code manually:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Enter',
          onPress: () => {
            // This would open a text input dialog
            // For now, navigate to manual search
            navigation.navigate('Search');
          }
        }
      ]
    );
  };

  const showScanTips = () => {
    Alert.alert(
      'Scanning Tips',
      '• Ensure good lighting\n• Hold camera steady\n• Position barcode within frame\n• Avoid glare and shadows\n• Scan from 10-20cm distance',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text style={styles.messageText}>No access to camera</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        barcodeScannerSettings={{
          barcodeTypes: BarcodeService.getSupportedFormats(),
        }}
        onBarcodeScanned={isScanning ? handleBarcodeScanned : undefined}
      >
        {/* Scanning Overlay */}
        <View style={styles.overlay}>
          <View style={styles.topOverlay}>
            <Text style={styles.title}>Scan Medicine Barcode</Text>
            <Text style={styles.subtitle}>Position barcode within frame</Text>
          </View>

          {/* Scanning Frame */}
          <View style={styles.scanningFrame}>
            <View style={styles.cornerTopLeft} />
            <View style={styles.cornerTopRight} />
            <View style={styles.cornerBottomLeft} />
            <View style={styles.cornerBottomRight} />
            
            {/* Scanning Line */}
            {isScanning && (
              <View style={styles.scanningLine} />
            )}
          </View>

          <View style={styles.bottomOverlay}>
            {lastScan && (
              <View style={styles.lastScan}>
                <Text style={styles.lastScanText}>Last: {lastScan}</Text>
              </View>
            )}
            
            <View style={styles.actions}>
              <TouchableOpacity
                style={[styles.actionButton, styles.secondaryButton]}
                onPress={showScanTips}
                accessible={true}
                accessibilityLabel="Show scanning tips"
                accessibilityHint="Get help with scanning barcodes"
              >
                <Text style={styles.secondaryButtonText}>💡 Tips</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.primaryButton]}
                onPress={handleManualInput}
                accessible={true}
                accessibilityLabel="Enter code manually"
                accessibilityHint="Type barcode or medicine code manually"
              >
                <Text style={styles.primaryButtonText}>⌨️ Manual Entry</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionButton, styles.tertiaryButton]}
                onPress={() => navigation.goBack()}
                accessible={true}
                accessibilityLabel="Close scanner"
                accessibilityHint="Go back to previous screen"
              >
                <Text style={styles.tertiaryButtonText}>✕ Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'space-between',
  },
  topOverlay: {
    alignItems: 'center',
    paddingTop: 60,
    paddingBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#ffffff',
    opacity: 0.8,
  },
  scanningFrame: {
    width: 250,
    height: 250,
    alignSelf: 'center',
    position: 'relative',
  },
  cornerTopLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#3b82f6',
  },
  cornerTopRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderColor: '#3b82f6',
  },
  cornerBottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderColor: '#3b82f6',
  },
  cornerBottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderColor: '#3b82f6',
  },
  scanningLine: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#3b82f6',
    marginTop: -1,
  },
  bottomOverlay: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  lastScan: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderWidth: 1,
    borderColor: '#3b82f6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    width: '100%',
  },
  lastScanText: {
    color: '#ffffff',
    fontSize: 14,
    textAlign: 'center',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    gap: 12,
  },
  actionButton: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  tertiaryButton: {
    backgroundColor: '#ef4444',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
  },
  messageText: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    marginTop: 100,
  },
  button: {
    backgroundColor: '#3b82f6',
    padding: 16,
    borderRadius: 8,
    marginTop: 20,
    alignSelf: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
});