import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Alert } from 'react-native';
import { isValidExternalUrl } from '@/utils/validation';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  const isSafe = isValidExternalUrl(href);

  // Security: Prevent rendering unsafe hrefs (like javascript:) on Web
  const safeHref = isSafe ? href : '#';

  const handlePress = async (event: any) => {
    if (!isSafe) {
      event.preventDefault();
      if (Platform.OS === 'web') {
        window.alert('Security Warning: Link blocked due to unsafe protocol.');
      } else {
        Alert.alert('Security Warning', 'Link blocked due to unsafe protocol.');
      }
      return;
    }

    if (Platform.OS !== 'web') {
      // Prevent the default behavior of linking to the default browser on native.
      event.preventDefault();
      // Open the link in an in-app browser.
      await openBrowserAsync(href);
    }
  };

  return (
    <Link
      target="_blank"
      {...rest}
      href={safeHref}
      onPress={handlePress}
    />
  );
}
