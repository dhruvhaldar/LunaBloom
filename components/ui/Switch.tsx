import React, { useEffect, useRef } from 'react';
import { Animated, TouchableOpacity, StyleSheet, Platform, ColorValue, TouchableOpacityProps } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';

interface SwitchProps extends Omit<TouchableOpacityProps, 'value' | 'onValueChange'> {
  value: boolean;
  onValueChange: (value: boolean) => void;
  accessibilityLabel: string;
  activeColor?: ColorValue;
  inactiveColor?: ColorValue;
}

export function Switch({
  value,
  onValueChange,
  accessibilityLabel,
  activeColor = '#457B9D',
  inactiveColor = '#3f3f3f',
  style,
  ...otherProps
}: SwitchProps) {
  const animatedValue = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(animatedValue, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      bounciness: 6,
      speed: 12,
    }).start();
  }, [value, animatedValue]);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [2, 22],
  });

  const backgroundColor = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [inactiveColor as string, activeColor as string],
  });

  const iconOpacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <TouchableOpacity
      onPress={() => {
        if (Platform.OS !== 'web') {
          Haptics.selectionAsync();
        }
        onValueChange(!value);
      }}
      activeOpacity={0.8}
      accessibilityRole="switch"
      accessibilityState={{ checked: value }}
      accessibilityLabel={accessibilityLabel}
      style={[style]}
      {...otherProps}
    >
      <Animated.View style={[styles.container, { backgroundColor }]}>
        <Animated.View style={[styles.thumb, { transform: [{ translateX }] }]}>
           <Animated.View style={{ opacity: iconOpacity }}>
             <IconSymbol name="checkmark" size={16} color={activeColor} />
           </Animated.View>
        </Animated.View>
      </Animated.View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 50,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
  },
  thumb: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#ffffff',
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 1.5,
    elevation: 2,
  },
});
