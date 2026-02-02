import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { ChatInput } from '../ChatInput';

// Mock IconSymbol to avoid issues with vector icons
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => 'IconSymbol',
}));

describe('ChatInput', () => {
  const mockOnSubmit = jest.fn();
  const defaultProps = {
    onSubmit: mockOnSubmit,
    isLoading: false,
    textColor: '#000',
    placeholderTextColor: '#666',
  };

  beforeEach(() => {
    mockOnSubmit.mockClear();
  });

  it('renders correctly', () => {
    const { getByPlaceholderText, getByText } = render(<ChatInput {...defaultProps} />);
    expect(getByPlaceholderText('Ask a menstrual health question...')).toBeTruthy();
    expect(getByText('Ask 🔍')).toBeTruthy();
  });

  it('should have button disabled initially (empty input)', () => {
    const { getByRole } = render(<ChatInput {...defaultProps} />);
    const button = getByRole('button', { name: 'Send question to AI assistant' });

    // Check accessibility state
    expect(button.props.accessibilityState.disabled).toBe(true);
    // Check functional disabled state (fireEvent.press shouldn't trigger submit if disabled,
    // but in RNTL we often check the prop or simulate press and check callback)
    fireEvent.press(button);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should enable button when text is entered', () => {
    const { getByRole, getByPlaceholderText } = render(<ChatInput {...defaultProps} />);
    const input = getByPlaceholderText('Ask a menstrual health question...');
    const button = getByRole('button', { name: 'Send question to AI assistant' });

    fireEvent.changeText(input, 'Hello');

    expect(button.props.accessibilityState.disabled).toBe(false);

    fireEvent.press(button);
    expect(mockOnSubmit).toHaveBeenCalledWith('Hello');
  });

  it('should disable button if text is only whitespace', () => {
    const { getByRole, getByPlaceholderText } = render(<ChatInput {...defaultProps} />);
    const input = getByPlaceholderText('Ask a menstrual health question...');
    const button = getByRole('button', { name: 'Send question to AI assistant' });

    fireEvent.changeText(input, '   ');

    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it('should disable button when loading', () => {
    const { getByRole, getByPlaceholderText } = render(<ChatInput {...defaultProps} isLoading={true} />);
    const input = getByPlaceholderText('Ask a menstrual health question...');
    const button = getByRole('button', { name: 'Send question to AI assistant' });

    // Even with text, it should be disabled if loading
    fireEvent.changeText(input, 'Hello');
    expect(button.props.accessibilityState.disabled).toBe(true);

    fireEvent.press(button);
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });
});
