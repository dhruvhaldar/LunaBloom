import React from 'react';
import { StyleSheet, TouchableOpacity, ViewStyle } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol, IconSymbolName } from '@/components/ui/IconSymbol';
import { useColorScheme } from '@/hooks/useColorScheme';

interface EmptyStateProps {
  title: string;
  message: string;
  icon?: IconSymbolName;
  actionLabel?: string;
  onAction?: () => void;
  style?: ViewStyle;
}

export function EmptyState({ title, message, icon, actionLabel, onAction, style }: EmptyStateProps) {
  const colorScheme = useColorScheme();
  const iconColor = colorScheme === 'dark' ? '#457B9D' : '#A8DADC'; // Muted brand color
  const textColor = colorScheme === 'dark' ? '#F1FAEE' : '#1D3557';

  return (
    <ThemedView style={[styles.container, style]}>
      {icon && (
        <IconSymbol
          name={icon}
          size={80}
          color={iconColor}
          style={styles.icon}
        />
      )}
      <ThemedText type="subtitle" style={[styles.title, { color: textColor }]}>
        {title}
      </ThemedText>
      <ThemedText style={[styles.message, { color: textColor }]}>
        {message}
      </ThemedText>
      {actionLabel && onAction && (
        <TouchableOpacity
          style={styles.button}
          onPress={onAction}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}
        >
          <ThemedText style={styles.buttonText}>{actionLabel}</ThemedText>
        </TouchableOpacity>
      )}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40,
  },
  icon: {
    marginBottom: 24,
    opacity: 0.8,
  },
  title: {
    textAlign: 'center',
    marginBottom: 12,
  },
  message: {
    textAlign: 'center',
    opacity: 0.7,
    marginBottom: 32,
    lineHeight: 22,
    maxWidth: 300,
  },
  button: {
    backgroundColor: '#E63946',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 30,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 16,
  },
});
