import { Platform } from 'react-native';

// Default export as undefined for web/other platforms
export default undefined;

// Stable hook implementation
export function useBottomTabOverflow() {
  return Platform.OS === 'ios' ? 50 : 0;
}