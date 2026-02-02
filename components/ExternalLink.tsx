import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Alert } from 'react-native';
import { isValidExternalUrl } from '@/utils/validation';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  const isSafe = isValidExternalUrl(href);

  return (
    <Link
      target={isSafe ? "_blank" : undefined}
      {...rest}
      href={isSafe ? href : '#'}
      onPress={async (event) => {
        if (!isSafe) {
          event.preventDefault();
          if (Platform.OS !== 'web') {
            Alert.alert('Security Warning', 'This link was blocked because it uses an unsafe protocol.');
          } else {
            console.error(`Blocked insecure link: ${href}`);
          }
          return;
        }

        if (Platform.OS !== 'web') {
          // Prevent the default behavior of linking to the default browser on native.
          event.preventDefault();
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        }
      }}
    />
  );
}
