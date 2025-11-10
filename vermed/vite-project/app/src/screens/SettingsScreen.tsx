import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  Linking,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppStore } from '@/state/store';
import { getButtonAccessibilityHint } from '@/utils/a11y';

type SettingsScreenNavigationProp = NativeStackNavigationProp<RootStackParamList, 'Settings'>;

interface Props {
  navigation: SettingsScreenNavigationProp;
}

export default function SettingsScreen({ navigation }: SettingsScreenNavigationProp): React.JSX.Element {
  const { 
    analyticsEnabled, 
    setAnalyticsEnabled, 
    recentLookups, 
    clearAllData 
  } = useAppStore();

  const handleToggleAnalytics = (value: boolean) => {
    setAnalyticsEnabled(value);
    
    if (!value) {
      Alert.alert(
        'Analytics Disabled',
        'Anonymous usage analytics have been disabled. You can enable them again anytime in settings.',
        [{ text: 'OK', style: 'default' }]
      );
    }
  };

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will remove all recent verifications and cached data from your device. This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear All',
          style: 'destructive',
          onPress: clearAllData,
        }
      ]
    );
  };

  const handlePrivacyPolicy = () => {
    Alert.alert(
      'Privacy Policy',
      'VerMed respects your privacy:\n\n• No personal information is stored\n• Verification data is stored locally only\n• Camera access is used only for scanning\n• MAS SMS verification is handled by NAFDAC\n• Optional anonymous analytics help improve the app\n\nFull privacy policy available at: https://vermed.app/privacy',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About VerMed',
      'Version: 1.0.0\n\nVerMed helps verify Nigerian medicines using NAFDAC Greenbook and Mobile Authentication Service (MAS).\n\nDeveloped for Nigerian civilians, pharmacists, and healthcare workers to ensure medicine safety.\n\n© 2024 VerMed',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleContactNafdac = () => {
    Alert.alert(
      'Contact NAFDAC',
      'For medicine verification issues or to report suspicious medicines:\n\n📞 Hotline: 0800-162-3322\n📧 Email: nafdac@nafdac.gov.ng\n🌐 Website: www.nafdac.gov.ng\n\nAvailable Monday-Friday, 8am-5pm',
      [
        { text: 'Call Hotline', onPress: () => Linking.openURL('tel:08001623322') },
        { text: 'Visit Website', onPress: () => Linking.openURL('https://www.nafdac.gov.ng') },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleAccessibility = () => {
    Alert.alert(
      'Accessibility',
      'VerMed is designed to be accessible to all users:\n\n• Large tap targets for easy interaction\n• High contrast colors for better visibility\n• Screen reader support with descriptive labels\n• Clear text and simple navigation\n• VoiceOver and TalkBack compatible\n\nIf you need assistance or have accessibility suggestions, please contact us.',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleLanguage = () => {
    Alert.alert(
      'Language',
      'Language selection is coming soon!\n\nCurrently supported:\n• English\n\nPlanned languages:\n• Pidgin English\n• Hausa\n• Yoruba\n• Igbo',
      [{ text: 'OK', style: 'default' }]
    );
  };

  const getDataSize = () => {
    const itemCount = recentLookups.length;
    if (itemCount === 0) return 'No data';
    if (itemCount < 5) return 'Small';
    if (itemCount < 15) return 'Medium';
    return 'Large';
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* App Information */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>About</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleAbout}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Version</Text>
            <Text style={styles.settingValue}>1.0.0</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={handlePrivacyPolicy}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Privacy Policy</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Data & Storage */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Data & Storage</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Storage Used</Text>
            <Text style={styles.settingValue}>{getDataSize()}</Text>
          </View>
        </View>

        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Recent Verifications</Text>
            <Text style={styles.settingValue}>{recentLookups.length}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleClearData}>
          <View style={styles.settingContent}>
            <Text style={[styles.settingLabel, styles.dangerText]}>Clear All Data</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Preferences */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Anonymous Analytics</Text>
            <Text style={styles.settingDescription}>Help improve VerMed</Text>
          </View>
          <Switch
            value={analyticsEnabled}
            onValueChange={handleToggleAnalytics}
            trackColor={{ false: '#e5e7eb', true: '#3b82f6' }}
            thumbColor={analyticsEnabled ? '#ffffff' : '#ffffff'}
          />
        </View>

        <TouchableOpacity style={styles.settingItem} onPress={handleLanguage}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Language</Text>
            <Text style={styles.settingValue}>English</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Accessibility */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Accessibility</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleAccessibility}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Accessibility Options</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Support */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Support</Text>
        
        <TouchableOpacity style={styles.settingItem} onPress={handleContactNafdac}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Contact NAFDAC</Text>
            <Text style={styles.settingDescription}>Report issues or get help</Text>
          </View>
          <Text style={styles.settingArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {/* Legal */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Legal</Text>
        
        <View style={styles.settingItem}>
          <View style={styles.settingContent}>
            <Text style={styles.settingLabel}>Disclaimer</Text>
            <Text style={styles.settingDescription}>
              VerMed is for reference only. Always consult healthcare professionals and verify with official NAFDAC sources.
            </Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Made with ❤️ for Nigeria's healthcare safety
        </Text>
        <Text style={styles.footerSubtext}>
          © 2024 VerMed. All rights reserved.
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
  section: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    overflow: 'hidden',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1f2937',
    padding: 16,
    paddingBottom: 8,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  settingContent: {
    flex: 1,
  },
  settingLabel: {
    fontSize: 16,
    color: '#1f2937',
    marginBottom: 2,
  },
  settingValue: {
    fontSize: 14,
    color: '#6b7280',
  },
  settingDescription: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 2,
  },
  settingArrow: {
    fontSize: 20,
    color: '#9ca3af',
    fontWeight: 'bold',
  },
  dangerText: {
    color: '#ef4444',
  },
  footer: {
    alignItems: 'center',
    paddingVertical: 32,
    marginTop: 20,
  },
  footerText: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
  },
});