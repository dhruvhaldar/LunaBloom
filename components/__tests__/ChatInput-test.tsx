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

    const flatStyle = [input.props.style].flat();
    const dynamicStyle = flatStyle[flatStyle.length - 1];
    expect(dynamicStyle.borderWidth).toBe(1);

    fireEvent(input, 'focus');
    const focusedStyle = [input.props.style].flat();
    const focusedDynamicStyle = focusedStyle[focusedStyle.length - 1];
    expect(focusedDynamicStyle.borderWidth).toBe(2);

    fireEvent(input, 'blur');
    const blurredStyle = [input.props.style].flat();
    const blurredDynamicStyle = blurredStyle[blurredStyle.length - 1];
    expect(blurredDynamicStyle.borderWidth).toBe(1);
  });

  it('shows clear button when text is present and clears it on press', () => {
    const { getByRole, queryByRole, getByPlaceholderText } = render(
      <ChatInput
        onSubmit={mockOnSubmit}
        isLoading={false}
        textColor="#000"
        placeholderTextColor="#666"
      />
    );
    const input = getByPlaceholderText('Ask a menstrual health question...');

    // Initially clear button should not be present
    expect(queryByRole('button', { name: 'Clear question' })).toBeNull();

    // Type text
    fireEvent.changeText(input, 'Some text');

    // Clear button should appear
    const clearButton = getByRole('button', { name: 'Clear question' });
    expect(clearButton).toBeTruthy();

    // Press clear button
    fireEvent.press(clearButton);

    // Text should be cleared
    // Note: in React Native Testing Library, verifying value prop might need re-query or check state effect
    // But since fireEvent.press triggers state update, render should re-render.
    // However, `input` variable is a reference to the element node from previous render.
    // We should probably check input.props.value if it's updated.
    // Or check that button disappeared.

    expect(queryByRole('button', { name: 'Clear question' })).toBeNull();
  });
});
