/**
 * @jest-environment jsdom
 */
import React from 'react';
import { render } from '@testing-library/react-native';

import RootLayout from '../_layout.web';

// Mock window.matchMedia for Reanimated
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock Platform.OS to be 'web'
jest.mock('react-native/Libraries/Utilities/Platform', () => ({
  OS: 'web',
  select: jest.fn((objs) => objs.web),
}));

// Mock expo-router Head component
jest.mock('expo-router/head', () => {
    // eslint-disable-next-line react/display-name
    return ({ children }: { children: React.ReactNode }) => <>{children}</>;
});

// Mock expo-router
jest.mock('expo-router', () => {
    // eslint-disable-next-line react/display-name
    const Stack = ({ children }: { children: React.ReactNode }) => <>{children}</>;
    Stack.Screen = jest.fn(() => null);
    return {
        Stack,
        usePathname: jest.fn(() => '/'),
    };
});

// Mock other dependencies that might be used in layout
jest.mock('expo-font', () => ({
  useFonts: jest.fn(() => [true]),
}));

jest.mock('expo-splash-screen', () => ({
  preventAutoHideAsync: jest.fn(),
  hideAsync: jest.fn(),
}));

jest.mock('@/hooks/useColorScheme', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));

describe('Web Layout CSP', () => {
  it('renders Content Security Policy meta tag', () => {
    const { UNSAFE_getAllByType } = render(<RootLayout />);

    // In a real browser environment, Head would inject into document.head
    // Here we are checking if the meta tag is present in the rendered output of our mock Head
    const metaTags = UNSAFE_getAllByType('meta');

    const cspTag = metaTags.find(tag => tag.props['httpEquiv'] === 'Content-Security-Policy');

    expect(cspTag).toBeDefined();
    expect(cspTag?.props['content']).toContain("default-src 'self'");
    expect(cspTag?.props['content']).toContain("connect-src 'self'");
    expect(cspTag?.props['content']).not.toContain("https://cdn.jsdelivr.net");
    expect(cspTag?.props['content']).not.toContain("https://huggingface.co");
  });
});
