import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, useColorScheme, Platform } from 'react-native';
import { IconSymbol } from './IconSymbol';
import * as Haptics from 'expo-haptics';

interface StepperInputProps {
  value: string;
  onChange: (value: string) => void;
  onEndEditing?: () => void;
  min?: number;
  max?: number;
  label: string;
}

export function StepperInput({ value, onChange, onEndEditing, min = 0, max = 100, label }: StepperInputProps) {
  const colorScheme = useColorScheme();
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const borderColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';
  const buttonColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  const handleIncrement = () => {
    if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const current = parseInt(value || '0', 10);
    if (isNaN(current)) {
      onChange(min.toString());
      return;
    }
    if (current < max) {
      onChange((current + 1).toString());
    }
  };

  const handleDecrement = () => {
     if (Platform.OS !== 'web') {
      Haptics.selectionAsync();
    }
    const current = parseInt(value || '0', 10);
    if (isNaN(current)) {
      onChange(min.toString());
      return;
    }
    if (current > min) {
      onChange((current - 1).toString());
    }
  };

  return (
    <View style={[styles.container, { borderColor: borderColor }]}>
      <TouchableOpacity
        onPress={handleDecrement}
        style={[styles.button, { borderRightColor: borderColor, borderRightWidth: 1 }]}
        accessibilityLabel={`Decrease ${label}`}
        accessibilityRole="button"
        disabled={parseInt(value) <= min}
      >
        <IconSymbol name="minus" size={20} color={parseInt(value) <= min ? buttonColor + '50' : buttonColor} />
      </TouchableOpacity>

      <TextInput
        style={[styles.input, { color: textColor }]}
        keyboardType="numeric"
        value={value}
        onChangeText={onChange}
        onEndEditing={onEndEditing}
        returnKeyType="done"
        accessibilityLabel={label}
        textAlign="center"
      />

      <TouchableOpacity
        onPress={handleIncrement}
        style={[styles.button, { borderLeftColor: borderColor, borderLeftWidth: 1 }]}
        accessibilityLabel={`Increase ${label}`}
        accessibilityRole="button"
        disabled={parseInt(value) >= max}
      >
        <IconSymbol name="plus" size={20} color={parseInt(value) >= max ? buttonColor + '50' : buttonColor} />
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
    overflow: 'hidden',
  },
  button: {
    padding: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    // Add border to buttons to separate from input
    // But we need to apply borderRight to the left button and borderLeft to the right button
    // I'll do this inline in the component to use the prop color
  },
  input: {
    padding: 8,
    width: 50,
    fontSize: 16,
    textAlign: 'center',
  },
});
