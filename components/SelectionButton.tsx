import React, { memo, useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated } from 'react-native';
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
  accessibilityHint?: string;
}

// Helper component for animating icon entry
const AnimatedIcon = ({ children }: { children: React.ReactNode }) => {
  const scale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 5,
      tension: 40,
      useNativeDriver: true,
    }).start();
  }, [scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      {children}
    </Animated.View>
  );
};

const SelectionButton = memo(function SelectionButton({
  label,
  isSelected,
  onToggle,
  type,
  colors,
  accessibilityLabel,
  accessibilityHint,
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
      accessibilityHint={accessibilityHint}
    >
      <View style={styles.content}>
        {isSelected && (
          <AnimatedIcon>
            <IconSymbol
              name="checkmark"
              size={16}
              color={colors.textColor}
              style={styles.icon}
            />
          </AnimatedIcon>
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
