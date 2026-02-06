import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatInput } from '../ChatInput';

describe('ChatInput', () => {
  const mockOnSubmit = jest.fn();

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    expect(getByPlaceholderText('Ask a menstrual health question...')).toBeTruthy();
  });

  it('is disabled when input is empty', () => {
    const { getByRole } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    const button = getByRole('button', { name: 'Send question to AI assistant' });
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('is disabled when input is whitespace', () => {
    const { getByRole, getByPlaceholderText } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');
    fireEvent.changeText(input, '   ');

    const button = getByRole('button', { name: 'Send question to AI assistant' });
    expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('is enabled when input has text', () => {
    const { getByRole, getByPlaceholderText } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');
    fireEvent.changeText(input, 'Hello');

    const button = getByRole('button', { name: 'Send question to AI assistant' });
    expect(button.props.accessibilityState.disabled).toBeFalsy();
  });

  it('is disabled when isLoading is true, even with text', () => {
    const { getByRole, getByPlaceholderText } = render(
        <ChatInput
          onSubmit={mockOnSubmit}
          isLoading={true}
          textColor="#000"
          placeholderTextColor="#666"
        />
      );
      const input = getByPlaceholderText('Ask a menstrual health question...');
      fireEvent.changeText(input, 'Hello');

      const button = getByRole('button', { name: 'Send question to AI assistant' });
      expect(button.props.accessibilityState.disabled).toBe(true);
  });

  it('has correct accessibility hint', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');
    expect(input.props.accessibilityHint).toBe('Double tap to enter text. Submit sends the question.');
  });

  it('changes border width on focus', () => {
    const { getByPlaceholderText } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');

    // Initial state (blurred)
    // Check if flat style object contains borderWidth: 1
    // Note: styles are often flattened in tests, checking the style array/object
    // Depending on how style prop is constructed, it might be an array.
    // The component uses [styles.input, { color, borderWidth }]
    // So the last element should contain the dynamic borderWidth.

    const flatStyle = [input.props.style].flat();
    const dynamicStyle = flatStyle[flatStyle.length - 1];
    expect(dynamicStyle.borderWidth).toBe(1);

    // Focus
    fireEvent(input, 'focus');
    const focusedStyle = [input.props.style].flat();
    const focusedDynamicStyle = focusedStyle[focusedStyle.length - 1];
    expect(focusedDynamicStyle.borderWidth).toBe(2);

    // Blur
    fireEvent(input, 'blur');
    const blurredStyle = [input.props.style].flat();
    const blurredDynamicStyle = blurredStyle[blurredStyle.length - 1];
    expect(blurredDynamicStyle.borderWidth).toBe(1);
  });
});
