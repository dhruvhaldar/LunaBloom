import React from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useThemeColor } from '@/hooks/useThemeColor';

interface EmptyStateProps {
  title: string;
  message?: string;
  iconName?: IconSymbolName;
}

export function EmptyState({
  title,
  message,
  iconName = 'calendar'
}: EmptyStateProps) {
  const iconColor = useThemeColor({}, 'icon');

  return (
    <View style={styles.container}>
      <View
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        accessibilityElementsHidden={true}
        style={styles.iconContainer}
      >
        <IconSymbol
          name={iconName}
          size={48}
          color={iconColor}
        />
      </View>
      <ThemedText type="subtitle" style={styles.title}>
        {title}
      </ThemedText>
      {message && (
        <ThemedText style={styles.message}>
          {message}
        </ThemedText>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 20,
  },
  iconContainer: {
    marginBottom: 16,
    opacity: 0.8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    opacity: 0.9,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    fontSize: 14,
  },
});
