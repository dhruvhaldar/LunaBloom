import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform, Alert } from 'react-native';
import { isValidExternalUrl } from '@/utils/validation';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  const isSafeUrl = isValidExternalUrl(href);
  // If the URL is unsafe, replace it with '#' to prevent navigation on Web
  const safeHref = isSafeUrl ? href : '#';

  return (
    <Link
      target="_blank"
      // @ts-ignore: 'rel' is a valid prop for web (passed to <a>), but might not be in the shared type definition
      rel="noopener noreferrer"
      {...rest}
      href={safeHref as any}
      onPress={async (event) => {
        if (!isSafeUrl) {
           event.preventDefault();
           if (Platform.OS !== 'web') {
               Alert.alert("Security Warning", "This link was blocked because it uses an unsafe protocol.");
           } else {
               console.warn(`Blocked navigation to unsafe URL: ${href}`);
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
