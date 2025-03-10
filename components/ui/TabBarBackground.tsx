import React, { useMemo } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useColorScheme } from '@/hooks/useColorScheme';

const TranslucentBackground = React.memo(() => {
  const colorScheme = useColorScheme();

  const backgroundStyle = useMemo(() => {
    if (Platform.OS === 'ios') {
      return null; // BlurView will handle iOS
    }
    
    return [
      styles.absolute,
      { 
        backgroundColor: colorScheme === 'dark' 
          ? 'rgba(21, 23, 24, 0.7)' 
          : 'rgba(255, 255, 255, 0.7)' 
      }
    ];
  }, [colorScheme]);

  if (Platform.OS === 'ios') {
    return (
      <BlurView 
        intensity={50} 
        style={styles.absolute}
        tint={colorScheme === 'dark' ? 'dark' : 'light'}
      />
    );
  }

  return <View style={backgroundStyle} />;
});

// Default export as undefined for web/other platforms
export default undefined;

// Stable hook implementation
export function useBottomTabOverflow() {
  return Platform.OS === 'ios' ? 50 : 0;
}

const styles = StyleSheet.create({
  absolute: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: 'transparent',
  },
});