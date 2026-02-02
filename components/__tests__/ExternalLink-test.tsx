import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ExternalLink } from '../ExternalLink';
import { openBrowserAsync } from 'expo-web-browser';
import { Platform, Alert } from 'react-native';

// Mock dependencies
jest.mock('expo-web-browser', () => ({
  openBrowserAsync: jest.fn(),
}));

jest.spyOn(Alert, 'alert');

// Mock Link from expo-router
jest.mock('expo-router', () => ({
  Link: jest.fn(({ children, onPress, href }) => {
    // We render a View with testID to simulate the Link component
    // We attach the onPress handler passed from ExternalLink to this View
    const React = require('react');
    const { View } = require('react-native');
    return (
      <View
        testID="link-wrapper"
        onTouchEnd={onPress} // For some RN setups, or we can use fireEvent.press if it's Touchable
        // But Link usually wraps a Touchable. ExternalLink passes onPress to Link.
        // Let's assume fireEvent.press works if we pass the prop.
        // Actually, fireEvent.press calls the 'onPress' prop directly if it exists on the element.
        onPress={onPress}
      >
        {children}
      </View>
    );
  }),
}));

describe('ExternalLink Security', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks dangerous schemes and shows alert on native', async () => {
    // Ensure we are simulating native
    Platform.OS = 'ios';

    const dangerousHref = 'javascript:alert(1)';

    const { getByTestId } = render(
      <ExternalLink href={dangerousHref}>
        Click me
      </ExternalLink>
    );

    const link = getByTestId('link-wrapper');

    // Simulate the press event
    const mockEvent = { preventDefault: jest.fn() };
    fireEvent.press(link, mockEvent);

    // Assert that openBrowserAsync was NOT called
    expect(openBrowserAsync).not.toHaveBeenCalled();

    // Assert that the event was prevented
    expect(mockEvent.preventDefault).toHaveBeenCalled();

    // Assert that Alert was shown
    expect(Alert.alert).toHaveBeenCalledWith(
        'Security Warning',
        expect.stringContaining('blocked')
    );
  });
});
