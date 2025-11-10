/**
 * Accessibility utilities for VerMed app
 */

/**
 * Generates accessible labels for medicine verification status
 */
export function getStatusAccessibilityLabel(status: string): string {
  switch (status) {
    case 'registered':
      return 'Medicine is registered with NAFDAC';
    case 'not_found':
      return 'Medicine not found in NAFDAC database';
    case 'error':
      return 'Error occurred during verification';
    default:
      return 'Verification status unknown';
  }
}

/**
 * Generates accessible labels for input types
 */
export function getInputTypeAccessibilityLabel(inputType: string): string {
  switch (inputType) {
    case 'barcode':
      return 'Barcode scan';
    case 'manual':
      return 'Manual search';
    case 'ocr':
      return 'Label scan';
    default:
      return 'Unknown input type';
  }
}

/**
 * Creates accessibility hints for buttons
 */
export function getButtonAccessibilityHint(action: string): string {
  const hints: Record<string, string> = {
    scan: 'Double tap to open camera for scanning',
    search: 'Double tap to search for medicine',
    verify: 'Double tap to verify medicine',
    open_greenbook: 'Double tap to open NAFDAC Greenbook website',
    mas_helper: 'Double tap to get help with Mobile Authentication Service',
    recent: 'Double tap to view recent verifications',
    settings: 'Double tap to open app settings'
  };
  
  return hints[action] || 'Double tap to proceed';
}

/**
 * Generates announcements for screen readers
 */
export function generateAnnouncement(message: string): void {
  // This would typically use a screen reader API
  // For React Native, we might use AccessibilityInfo.announceForAccessibility
  console.log('Accessibility announcement:', message);
}