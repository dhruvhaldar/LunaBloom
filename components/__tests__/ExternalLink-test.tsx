import React from 'react';
import { Text } from 'react-native';
import { render } from '@testing-library/react-native';
import { ExternalLink } from '../ExternalLink';
import { Link } from 'expo-router';

// Mock expo-router
jest.mock('expo-router', () => ({
  Link: jest.fn(({ children }) => <>{children}</>),
}));

// Mock expo-web-browser
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

describe('ExternalLink Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks dangerous javascript: href and renders children only', () => {
    const dangerousHref = 'javascript:alert(1)';
    const childText = 'Click me';

    const { getByText } = render(
      <ExternalLink href={dangerousHref}>
        <Text>{childText}</Text>
      </ExternalLink>
    );

    // Verify Link was NOT used
    expect(Link).not.toHaveBeenCalled();

    // Verify children are still rendered
    expect(getByText(childText)).toBeTruthy();
  });

  it('passes valid https: href to Link component', () => {
    const validHref = 'https://example.com';
    const childText = 'Valid Link';
    render(
      <ExternalLink href={validHref}>
        <Text>{childText}</Text>
      </ExternalLink>
    );

    expect(Link).toHaveBeenCalledWith(
      expect.objectContaining({ href: validHref }),
      expect.anything()
    );
  });
});
