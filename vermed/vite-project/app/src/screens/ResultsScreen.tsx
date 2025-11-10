import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackRouteProp } from '@react-navigation/native-stack';
import { useAppStore } from '@/state/store';
import { ProductLookup } from '@/types';
import { formatTimestamp, getStatusAccessibilityLabel } from '@/utils/format';
import { getButtonAccessibilityHint } from '@/utils/a11y';

type ResultsScreenRouteProp = NativeStackRouteProp<RootStackParamList, 'Results'>;

interface Props {
  route: ResultsScreenRouteProp;
}

export default function ResultsScreen({ route }: Props): React.JSX.Element {
  const { lookupId } = route.params;
  const { recentLookups, addRecentLookup } = useAppStore();
  const [lookup, setLookup] = useState<ProductLookup | null>(null);

  useEffect(() => {
    const foundLookup = recentLookups.find(item => item.id === lookupId);
    if (foundLookup) {
      setLookup(foundLookup);
    }
  }, [lookupId, recentLookups]);

  const handleOpenGreenbook = async () => {
    if (!lookup?.greenbook.link) return;

    try {
      await Linking.openURL(lookup.greenbook.link);
    } catch (error) {
      Alert.alert('Error', 'Unable to open NAFDAC Greenbook. Please try again.');
    }
  };

  const handleReverify = () => {
    // Navigate back to search with the original query
    if (lookup) {
      // This would typically trigger a new verification
      Alert.alert('Re-verify', 'This feature will re-verify the medicine with latest data.');
    }
  };

  const handleShare = () => {
    if (!lookup) return;

    const message = `Medicine Verification Result:\n\nName: ${lookup.greenbook.title || 'Unknown'}\nStatus: ${lookup.greenbook.status.toUpperCase()}\n${lookup.greenbook.regNo ? `Reg. No: ${lookup.greenbook.regNo}` : ''}\n\nVerified with VerMed - Nigerian Medicine Verification App`;
    
    Alert.alert('Share Result', message, [
      { text: 'OK', style: 'default' }
    ]);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'registered':
        return '#10b981';
      case 'not_found':
        return '#ef4444';
      case 'error':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getStatusMessage = (status: string) => {
    switch (status) {
      case 'registered':
        return '✅ This medicine is registered with NAFDAC';
      case 'not_found':
        return '❌ This medicine was not found in NAFDAC database';
      case 'error':
        return '⚠️ Error occurred during verification';
      default:
        return '❓ Verification status unknown';
    }
  };

  const getSafetyGuidance = (status: string) => {
    switch (status) {
      case 'registered':
        return {
          title: 'Medicine is Registered',
          points: [
            'This medicine appears in NAFDAC\'s official database',
            'Always purchase from licensed pharmacies',
            'Check packaging integrity before use',
            'Consult healthcare professionals if unsure'
          ]
        };
      case 'not_found':
        return {
          title: 'Medicine Not Found',
          points: [
            'This medicine may not be registered with NAFDAC',
            'Exercise extreme caution with this product',
            'Consult a pharmacist or healthcare provider',
            'Consider alternative registered medicines',
            'Report suspicious medicines to NAFDAC'
          ]
        };
      case 'error':
        return {
          title: 'Verification Error',
          points: [
            'Unable to complete verification at this time',
            'Try again when you have better internet connection',
            'Contact NAFDAC directly for verification',
            'Use MAS SMS verification as alternative'
          ]
        };
      default:
        return {
          title: 'Unknown Status',
          points: [
            'Unable to determine medicine status',
            'Please try verification again',
            'Contact healthcare provider for guidance'
          ]
        };
    }
  };

  if (!lookup) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Verification result not found</Text>
      </View>
    );
  }

  const statusColor = getStatusColor(lookup.greenbook.status);
  const statusMessage = getStatusMessage(lookup.greenbook.status);
  const safetyGuidance = getSafetyGuidance(lookup.greenbook.status);

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Status Header */}
      <View style={[styles.statusHeader, { backgroundColor: statusColor }]}>
        <Text style={styles.statusText}>{lookup.greenbook.status.toUpperCase()}</Text>
        <Text style={styles.statusMessage}>{statusMessage}</Text>
      </View>

      {/* Medicine Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Medicine Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Name:</Text>
          <Text style={styles.infoValue}>
            {lookup.greenbook.title || lookup.inputValue}
          </Text>
        </View>

        {lookup.greenbook.regNo && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>NAFDAC Reg. No.:</Text>
            <Text style={styles.infoValue}>{lookup.greenbook.regNo}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Input Type:</Text>
          <Text style={styles.infoValue}>
            {lookup.inputType.charAt(0).toUpperCase() + lookup.inputType.slice(1)}
          </Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Verified:</Text>
          <Text style={styles.infoValue}>
            {formatTimestamp(lookup.createdAt)}
          </Text>
        </View>
      </View>

      {/* Safety Guidance */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{safetyGuidance.title}</Text>
        {safetyGuidance.points.map((point, index) => (
          <View key={index} style={styles.guidancePoint}>
            <Text style={styles.guidanceBullet}>•</Text>
            <Text style={styles.guidanceText}>{point}</Text>
          </View>
        ))}
      </View>

      {/* Alerts */}
      {lookup.alerts && lookup.alerts.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Important Alerts</Text>
          {lookup.alerts.map((alert, index) => (
            <View key={index} style={styles.alert}>
              <Text style={styles.alertTitle}>{alert.title}</Text>
              <Text style={styles.alertDescription}>{alert.description}</Text>
              {alert.link && (
                <TouchableOpacity
                  style={styles.alertLink}
                  onPress={() => Linking.openURL(alert.link!)}
                >
                  <Text style={styles.alertLinkText}>Learn More</Text>
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {lookup.greenbook.link && (
          <TouchableOpacity
            style={[styles.actionButton, styles.primaryButton]}
            onPress={handleOpenGreenbook}
            accessible={true}
            accessibilityLabel="Open in NAFDAC Greenbook"
            accessibilityHint={getButtonAccessibilityHint('open_greenbook')}
          >
            <Text style={styles.primaryButtonText}>🔗 Open in NAFDAC Greenbook</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={handleReverify}
          accessible={true}
          accessibilityLabel="Re-verify medicine"
          accessibilityHint="Double tap to verify medicine again"
        >
          <Text style={styles.secondaryButtonText}>🔄 Re-verify</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.tertiaryButton]}
          onPress={handleShare}
          accessible={true}
          accessibilityLabel="Share verification result"
          accessibilityHint="Double tap to share this result"
        >
          <Text style={styles.tertiaryButtonText}>📤 Share Result</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Important Disclaimer</Text>
        <Text style={styles.disclaimerText}>
          This verification is for reference only. Always confirm with healthcare professionals and purchase medicines from licensed pharmacies. The final authority on medicine registration is NAFDAC.
        </Text>
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
  statusHeader: {
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 24,
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 8,
  },
  statusMessage: {
    fontSize: 16,
    color: '#ffffff',
    textAlign: 'center',
  },
  section: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    color: '#6b7280',
    fontWeight: '500',
    flex: 1,
  },
  infoValue: {
    fontSize: 16,
    color: '#1f2937',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  guidancePoint: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  guidanceBullet: {
    fontSize: 16,
    color: '#3b82f6',
    fontWeight: 'bold',
    marginRight: 8,
    marginTop: 2,
  },
  guidanceText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  alert: {
    backgroundColor: '#fef2f2',
    borderWidth: 1,
    borderColor: '#ef4444',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#991b1b',
    marginBottom: 4,
  },
  alertDescription: {
    fontSize: 14,
    color: '#7f1d1d',
    marginBottom: 8,
  },
  alertLink: {
    alignSelf: 'flex-start',
  },
  alertLinkText: {
    fontSize: 14,
    color: '#3b82f6',
    fontWeight: '500',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  actionButton: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryButton: {
    backgroundColor: '#3b82f6',
  },
  secondaryButton: {
    backgroundColor: '#6b7280',
  },
  tertiaryButton: {
    backgroundColor: '#10b981',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  tertiaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  disclaimer: {
    backgroundColor: '#fef3c7',
    borderWidth: 1,
    borderColor: '#f59e0b',
    borderRadius: 8,
    padding: 16,
  },
  disclaimerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 8,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#78350f',
    lineHeight: 20,
  },
  errorText: {
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: 100,
  },
});