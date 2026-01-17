import React from 'react';
import { StyleSheet, TextInput, TouchableOpacity, View, TextInputProps, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import * as Haptics from 'expo-haptics';

interface StepperInputProps extends Omit<TextInputProps, 'onChange' | 'onChangeText'> {
  value: string;
  onChange: (value: string) => void;
  min?: number;
  max?: number;
  label: string;
  color: string;
  borderColor: string;
}

export function StepperInput({
  value,
  onChange,
  min = 0,
  max = 100,
  label,
  color,
  borderColor,
  style,
  ...props
}: StepperInputProps) {
  const triggerHaptic = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
  };

  const handleIncrement = () => {
    triggerHaptic();
    const currentVal = parseInt(value, 10);
    if (isNaN(currentVal)) {
      onChange(min.toString());
      return;
    }
    if (currentVal < max) {
      onChange((currentVal + 1).toString());
    }
  };

  const handleDecrement = () => {
    triggerHaptic();
    const currentVal = parseInt(value, 10);
    if (isNaN(currentVal)) {
      onChange(min.toString());
      return;
    }
    if (currentVal > min) {
      onChange((currentVal - 1).toString());
    }
  };

  const handleChangeText = (text: string) => {
    // Only allow numeric input
    const filteredText = text.replace(/[^0-9]/g, '');
    onChange(filteredText);
  };

  const isAtMin = parseInt(value, 10) <= min;
  const isAtMax = parseInt(value, 10) >= max;

  return (
    <View style={[styles.container, { borderColor }, style]}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={[styles.button, { borderRightColor: borderColor, borderRightWidth: 1, opacity: isAtMin ? 0.3 : 1 }]}
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
        disabled={isAtMin}
        activeOpacity={0.7}
      >
        <IconSymbol name="minus" size={20} color={color} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color }]}
        value={value}
        onChangeText={handleChangeText}
        keyboardType="numeric"
        textAlign="center"
        accessibilityLabel={label}
        {...props}
      />

      <TouchableOpacity
        onPress={handleIncrement}
        style={[styles.button, { borderLeftColor: borderColor, borderLeftWidth: 1, opacity: isAtMax ? 0.3 : 1 }]}
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
        disabled={isAtMax}
        activeOpacity={0.7}
      >
        <IconSymbol name="plus" size={20} color={color} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 8,
  },
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 40,
  },
  input: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 4,
    fontSize: 16,
    minWidth: 40,
  },
});
