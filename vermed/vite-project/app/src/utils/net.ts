import NetInfo from '@react-native-netinfo/netinfo';
import { NetworkStatus } from '@/types';

/**
 * Gets current network status
 */
export async function getNetworkStatus(): Promise<NetworkStatus> {
  const state = await NetInfo.fetch();
  
  return {
    isConnected: state.isConnected ?? false,
    type: state.type
  };
}

/**
 * Checks if device is online
 */
export async function isOnline(): Promise<boolean> {
  const status = await getNetworkStatus();
  return status.isConnected;
}

/**
 * Waits for network connection with timeout
 */
export async function waitForConnection(timeoutMs = 10000): Promise<boolean> {
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeoutMs) {
    const online = await isOnline();
    if (online) return true;
    
    // Wait 500ms before checking again
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  return false;
}