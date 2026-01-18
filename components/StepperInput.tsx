import React from 'react';
import { StyleSheet, View, TouchableOpacity, useColorScheme, Platform, ViewStyle, StyleProp } from 'react-native';
import * as Haptics from 'expo-haptics';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';
import { Colors } from '@/constants/Colors';

interface StepperInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  style?: StyleProp<ViewStyle>;
}

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  label,
  style,
}: StepperInputProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];
  const textColor = themeColors.text;

  const handleDecrement = () => {
    if (value > min) {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      onChange(Math.max(min, value - step));
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      if (Platform.OS !== 'web') {
        Haptics.selectionAsync();
      }
      onChange(Math.min(max, value + step));
    }
  };

  const isMin = value <= min;
  const isMax = value >= max;
  const disabledColor = colorScheme === 'dark' ? '#555' : '#ccc';

  return (
    <View
      style={[
        styles.container,
        { borderColor: textColor },
        style
      ]}
      accessible
      accessibilityRole="spinbutton"
      accessibilityLabel={label}
      accessibilityValue={{ min, max, now: value }}
    >
      <TouchableOpacity
        onPress={handleDecrement}
        disabled={isMin}
        style={[styles.button, isMin && styles.disabledButton]}
        accessibilityRole="button"
        accessibilityLabel="Decrease value"
      >
        <IconSymbol
          name="minus"
          size={24}
          color={isMin ? disabledColor : textColor}
        />
      </TouchableOpacity>

      <View style={[styles.valueContainer, { borderColor: textColor }]}>
        <ThemedText style={[styles.valueText, { color: textColor }]}>
          {value}
        </ThemedText>
      </View>

      <TouchableOpacity
        onPress={handleIncrement}
        disabled={isMax}
        style={[styles.button, isMax && styles.disabledButton]}
        accessibilityRole="button"
        accessibilityLabel="Increase value"
      >
        <IconSymbol
          name="plus"
          size={24}
          color={isMax ? disabledColor : textColor}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 8,
    padding: 0,
    minWidth: 140,
    height: 46,
  },
  button: {
    padding: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: 46,
    height: '100%',
  },
  disabledButton: {
    opacity: 0.5,
  },
  valueContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    borderLeftWidth: 0, // Using transparency or just relying on spacing might be cleaner, but let's try this
    borderRightWidth: 0,
  },
  valueText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
