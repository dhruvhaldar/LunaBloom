import React, { memo } from 'react';
import { StyleSheet, View, TouchableOpacity, StyleProp, ViewStyle } from 'react-native';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { ThemedText } from '@/components/ThemedText';

interface SelectionButtonProps {
  label: string;
  isSelected: boolean;
  onToggle: (label: string) => void;
  type: 'checkbox' | 'radio';
  colors: {
    borderColor: string;
    selectedBackgroundColor: string;
    textColor: string;
  };
  accessibilityLabel: string;
}

const SelectionButton = memo(function SelectionButton({
  label,
  isSelected,
  onToggle,
  type,
  colors,
  accessibilityLabel,
}: SelectionButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        { borderColor: colors.borderColor },
        isSelected && { backgroundColor: colors.selectedBackgroundColor },
      ]}
      onPress={() => onToggle(label)}
      accessibilityRole={type}
      accessibilityState={{ checked: isSelected }}
      accessibilityLabel={accessibilityLabel}
    >
      <View style={styles.content}>
        {isSelected && (
          <IconSymbol
            name="checkmark"
            size={16}
            color={colors.textColor}
            style={styles.icon}
          />
        )}
        <ThemedText
          style={[
            { color: colors.textColor },
            isSelected && styles.selectedText,
          ]}
        >
          {label}
        </ThemedText>
      </View>
    </TouchableOpacity>
  );
});

const styles = StyleSheet.create({
  button: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: 4,
  },
  selectedText: {
    fontWeight: 'bold',
  },
});

export default SelectionButton;
