import { Linking } from 'react-native';

export function isExternalUrl(url: string, currentAppUrl: string): boolean {
  try {
    const targetUrl = new URL(url);
    const appUrl = new URL(currentAppUrl);
    
    // Only allow navigation on the exact same host
    if (targetUrl.host === appUrl.host) {
      return false;
    }
    
    return true;
  } catch (e) {
    // If we can't parse it (like mailto:, tel:, or custom schemas), treat as external
    return true;
  }
}

export async function handleExternalUrl(url: string) {
  try {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    }
  } catch (error) {
    console.error('Failed to open URL:', error);
  }
}
