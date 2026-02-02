import * as React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatInput } from '../ChatInput';

// Mock ThemedText if needed, but it should work if it just uses contexts provided by render or defaults.
// However, the component uses `ThemedText` which might use `useColorScheme`.
// Let's assume the test environment handles it or use default mocks.

describe('ChatInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        onSubmit={() => {}}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#ccc"
      />
    );
    expect(getByPlaceholderText('Ask a menstrual health question...')).toBeTruthy();
  });

  it('button is disabled when input is empty', () => {
    const { getByRole } = render(
      <ChatInput
        onSubmit={() => {}}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#ccc"
      />
    );
    const button = getByRole('button');
    // We expect this to be true AFTER our changes.
    // Currently it will be false (undefined/null usually results in falsy check, but strict check might fail)
    // The current implementation has accessibilityState={{ disabled: isLoading }}
    // If isLoading is false, disabled is false.
    // So this test is expected to FAIL currently.
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('button is enabled when input has text', () => {
    const { getByRole, getByPlaceholderText } = render(
      <ChatInput
        onSubmit={() => {}}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#ccc"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');
    fireEvent.changeText(input, 'Hello');

    const button = getByRole('button');
    expect(button.props.accessibilityState.disabled).toBeFalsy();
  });

  it('button is disabled when input is whitespace', () => {
    const { getByRole, getByPlaceholderText } = render(
      <ChatInput
        onSubmit={() => {}}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#ccc"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');
    fireEvent.changeText(input, '   ');

    const button = getByRole('button');
    // Should stay disabled
    expect(button.props.accessibilityState.disabled).toBe(true);
  });
});
