import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { config } from '@/config/env';
import { getButtonAccessibilityHint } from '@/utils/a11y';

type MasHelperScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'MasHelper'>;

interface Props {
  navigation: MasHelperScreenNavigationProp;
}

export default function MasHelperScreen({ navigation }: Props): React.JSX.Element {
  const handleSendSms = () => {
    const smsBody = 'MAS'; // The SMS body to send
    const smsUrl = `sms:${config.MAS_SHORTCODE}?body=${encodeURIComponent(smsBody)}`;
    
    Alert.alert(
      'Send SMS Verification',
      `This will open your messaging app to send an SMS to ${config.MAS_SHORTCODE}.\n\nStandard SMS rates may apply.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send SMS',
          onPress: () => {
            Linking.openURL(smsUrl).catch(() => {
              Alert.alert(
                'Error',
                'Unable to open messaging app. Please manually send "MAS" to ' + config.MAS_SHORTCODE
              );
            });
          }
        }
      ]
    );
  };

  const handleInterpretReply = (replyType: string) => {
    const interpretations: Record<string, string> = {
      valid: '✅ Valid: The medicine is authentic and registered with NAFDAC',
      invalid: '❌ Invalid: The medicine is not authentic or not registered',
      expired: '⚠️ Expired: The medicine registration has expired',
      notFound: '❓ Not Found: The code is not recognized in the system',
      error: '⚠️ Error: Unable to process the request. Try again later'
    };

    Alert.alert(
      'Reply Interpretation',
      interpretations[replyType] || 'Unknown response format',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const showExampleFlow = () => {
    Alert.alert(
      'MAS Verification Example',
      '1. Locate 11-digit MAS number on medicine pack\n2. Send SMS: "MAS [11-digit-number]" to 38353\n3. Wait for reply from NAFDAC\n4. Check reply interpretation in this app\n\nExample: "MAS 12345678901"',
      [{ text: 'Got it', style: 'default' }]
    );
  };

  const handleContactNafdac = () => {
    Alert.alert(
      'Contact NAFDAC',
      'For verification issues or to report suspicious medicines:\n\n📞 Hotline: 0800-162-3322\n📧 Email: nafdac@nafdac.gov.ng\n🌐 Website: www.nafdac.gov.ng\n\nAvailable Monday-Friday, 8am-5pm',
      [{ text: 'OK', style: 'default' }]
    );
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>MAS Helper</Text>
        <Text style={styles.subtitle}>Mobile Authentication Service Guide</Text>
      </View>

      {/* What is MAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>What is MAS?</Text>
        <Text style={styles.sectionText}>
          The Mobile Authentication Service (MAS) allows you to verify medicine authenticity by sending an SMS with the medicine's unique MAS number. NAFDAC will reply with the verification status.
        </Text>
      </View>

      {/* How to Use MAS */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>How to Use MAS</Text>
        <View style={styles.stepList}>
          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <Text style={styles.stepText}>
              Find the 11-digit MAS number on the medicine packaging (usually under a scratch panel)
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <Text style={styles.stepText}>
              Send an SMS with format: "MAS [11-digit-number]" to {config.MAS_SHORTCODE}
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <Text style={styles.stepText}>
              Wait for SMS reply from NAFDAC (usually within seconds)
            </Text>
          </View>

          <View style={styles.step}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            <Text style={styles.stepText}>
              Check the reply interpretation below to understand the result
            </Text>
          </View>
        </View>
      </View>

      {/* Quick SMS Button */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick SMS</Text>
        <TouchableOpacity
          style={styles.smsButton}
          onPress={handleSendSms}
          accessible={true}
          accessibilityLabel="Send SMS verification"
          accessibilityHint="Open messaging app to send MAS SMS"
        >
          <Text style={styles.smsButtonText}>📱 Send MAS SMS</Text>
          <Text style={styles.smsSubtext}>to {config.MAS_SHORTCODE}</Text>
        </TouchableOpacity>
      </View>

      {/* Reply Interpretations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Understanding Replies</Text>
        
        <TouchableOpacity
          style={styles.replyItem}
          onPress={() => handleInterpretReply('valid')}
        >
          <View style={styles.replyIndicator} />
          <View style={styles.replyContent}>
            <Text style={styles.replyTitle}>"VALID" or "AUTHENTIC"</Text>
            <Text style={styles.replyDescription}>
              Medicine is genuine and registered with NAFDAC
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.replyItem}
          onPress={() => handleInterpretReply('invalid')}
        >
          <View style={[styles.replyIndicator, styles.invalidIndicator]} />
          <View style={styles.replyContent}>
            <Text style={styles.replyTitle}>"INVALID" or "FAKE"</Text>
            <Text style={styles.replyDescription}>
              Medicine is not genuine - DO NOT USE
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.replyItem}
          onPress={() => handleInterpretReply('expired')}
        >
          <View style={[styles.replyIndicator, styles.expiredIndicator]} />
          <View style={styles.replyContent}>
            <Text style={styles.replyTitle}>"EXPIRED"</Text>
            <Text style={styles.replyDescription}>
              Medicine registration has expired
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.replyItem}
          onPress={() => handleInterpretReply('notFound')}
        >
          <View style={[styles.replyIndicator, styles.notFoundIndicator]} />
          <View style={styles.replyContent}>
            <Text style={styles.replyTitle}>"NOT FOUND" or "INVALID CODE"</Text>
            <Text style={styles.replyDescription}>
              MAS number not recognized in system
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Important Notes */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Important Notes</Text>
        <View style={styles.noteList}>
          <Text style={styles.noteText}>• Standard SMS charges apply</Text>
          <Text style={styles.noteText}>• MAS numbers are unique per medicine pack</Text>
          <Text style={styles.noteText}>• Each MAS number can only be verified once</Text>
          <Text style={styles.noteText}>• Keep the original medicine packaging</Text>
          <Text style={styles.noteText}>• Report suspicious medicines immediately</Text>
        </View>
      </View>

      {/* Actions */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          style={[styles.actionButton, styles.secondaryButton]}
          onPress={showExampleFlow}
          accessible={true}
          accessibilityLabel="See example verification flow"
          accessibilityHint="Show detailed example of MAS verification"
        >
          <Text style={styles.secondaryButtonText}>📋 See Example</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, styles.primaryButton]}
          onPress={handleContactNafdac}
          accessible={true}
          accessibilityLabel="Contact NAFDAC for help"
          accessibilityHint="Get NAFDAC contact information"
        >
          <Text style={styles.primaryButtonText}>📞 Contact NAFDAC</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Privacy Notice</Text>
        <Text style={styles.disclaimerText}>
          MAS SMS verification is handled directly by NAFDAC. VerMed does not store or process any SMS content or personal information during MAS verification.
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
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
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
    marginBottom: 12,
  },
  sectionText: {
    fontSize: 15,
    color: '#374151',
    lineHeight: 22,
  },
  stepList: {
    gap: 16,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  stepText: {
    fontSize: 15,
    color: '#374151',
    flex: 1,
    lineHeight: 22,
  },
  smsButton: {
    backgroundColor: '#10b981',
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
  },
  smsButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 4,
  },
  smsSubtext: {
    fontSize: 14,
    color: '#ffffff',
    opacity: 0.9,
  },
  replyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  replyIndicator: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10b981',
    marginRight: 12,
  },
  invalidIndicator: {
    backgroundColor: '#ef4444',
  },
  expiredIndicator: {
    backgroundColor: '#f59e0b',
  },
  notFoundIndicator: {
    backgroundColor: '#6b7280',
  },
  replyContent: {
    flex: 1,
  },
  replyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  replyDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  noteList: {
    gap: 8,
  },
  noteText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  actionsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionButton: {
    flex: 1,
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
});