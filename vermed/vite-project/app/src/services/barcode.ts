import { BarCodeScanner } from 'expo-barcode-scanner';
import { normalizeQuery, isBarcode } from '@/utils/format';

export interface ScanResult {
  value: string;
  type: string;
  timestamp: number;
}

export class BarcodeService {
  private static lastScanTime = 0;
  private static readonly SCAN_COOLDOWN = 2000; // 2 seconds between scans
  private static readonly SUPPORTED_FORMATS = [
    BarCodeScanner.Constants.BarCodeType.qr,
    BarCodeScanner.Constants.BarCodeType.ean13,
    BarCodeScanner.Constants.BarCodeType.ean8,
    BarCodeScanner.Constants.BarCodeType.upc_a,
    BarCodeScanner.Constants.BarCodeType.upc_e,
    BarCodeScanner.Constants.BarCodeType.code128,
  ];

  /**
   * Check if device has camera capabilities
   */
  static async checkPermissions(): Promise<boolean> {
    const { status } = await BarCodeScanner.getPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Request camera permissions
   */
  static async requestPermissions(): Promise<boolean> {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    return status === 'granted';
  }

  /**
   * Get supported barcode formats
   */
  static getSupportedFormats(): string[] {
    return this.SUPPORTED_FORMATS;
  }

  /**
   * Process scanned barcode with cooldown and validation
   */
  static processScan(result: ScanResult): ScanResult | null {
    const now = Date.now();
    
    // Enforce cooldown to prevent duplicate scans
    if (now - this.lastScanTime < this.SCAN_COOLDOWN) {
      return null;
    }

    // Validate barcode format
    if (!this.isValidBarcode(result.value)) {
      return null;
    }

    this.lastScanTime = now;
    
    return {
      value: normalizeQuery(result.value),
      type: result.type,
      timestamp: now
    };
  }

  /**
   * Validate if scanned value is a valid barcode
   */
  private static isValidBarcode(value: string): boolean {
    if (!value || value.trim().length === 0) {
      return false;
    }

    // Check if it's a numeric barcode (most common for medicines)
    if (isBarcode(value.trim())) {
      return true;
    }

    // Check if it's a QR code with medicine information
    if (value.length > 10 && /[A-Za-z0-9]/.test(value)) {
      return true;
    }

    return false;
  }

  /**
   * Extract medicine information from barcode
   */
  static extractMedicineInfo(barcode: string): {
    query: string;
    type: 'barcode' | 'qr';
    confidence: number;
  } {
    const normalized = normalizeQuery(barcode);
    
    // High confidence for standard barcodes
    if (isBarcode(normalized)) {
      return {
        query: normalized,
        type: 'barcode',
        confidence: 0.9
      };
    }

    // Medium confidence for QR codes
    if (normalized.length > 10) {
      return {
        query: normalized,
        type: 'qr',
        confidence: 0.7
      };
    }

    // Low confidence for other formats
    return {
      query: normalized,
      type: 'barcode',
      confidence: 0.5
    };
  }

  /**
   * Generate mock scan result for testing
   */
  static generateMockScan(): ScanResult {
    const mockBarcodes = [
      '1234567890123', // Standard EAN-13
      '8901234567890', // Another EAN-13
      'QR-MED-ABC-123', // Mock QR code
    ];

    return {
      value: mockBarcodes[Math.floor(Math.random() * mockBarcodes.length)],
      type: 'org.iso.QRCode',
      timestamp: Date.now()
    };
  }
}