import { Link } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import { type ComponentProps } from 'react';
import { Platform } from 'react-native';

type Props = Omit<ComponentProps<typeof Link>, 'href'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  // Security: Validate protocol to prevent XSS (e.g. javascript: schemes)
  const isSafe = /^https?:\/\//i.test(href);

  if (!isSafe) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn(`Blocked potentially unsafe ExternalLink href: ${href}`);
    }
    // Render children safely without link wrapper
    return <>{rest.children}</>;
  }

  return (
    <Link
      target="_blank"
      {...rest}
      href={href}
      onPress={async (event) => {
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
