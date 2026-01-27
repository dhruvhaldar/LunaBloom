import { useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ScreenCapture from 'expo-screen-capture';

export function useScreenProtection() {
  useEffect(() => {
    const initProtection = async () => {
      try {
        const value = await AsyncStorage.getItem('preventScreenshots');
        if (value && JSON.parse(value)) {
          await ScreenCapture.preventScreenCaptureAsync();
        }
      } catch (e) {
        console.error('Failed to initialize screen protection', e);
      }
    };
    initProtection();
  }, []);
}
