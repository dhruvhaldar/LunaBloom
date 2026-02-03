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
});
