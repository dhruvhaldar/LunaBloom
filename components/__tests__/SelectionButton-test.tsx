import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import SelectionButton from '../SelectionButton';

describe('SelectionButton', () => {
  const mockToggle = jest.fn();
  const colors = {
    borderColor: 'gray',
    selectedBackgroundColor: 'blue',
    textColor: 'black',
  };

  beforeEach(() => {
    mockToggle.mockClear();
  });

  it('renders correctly when unselected', () => {
    const { getByText } = render(
      <SelectionButton
        label="Test Option"
        isSelected={false}
        onToggle={mockToggle}
        type="checkbox"
        colors={colors}
        accessibilityLabel="Test Option"
      />
    );

    const buttonText = getByText('Test Option');
    expect(buttonText).toBeTruthy();

    // Should not have selected style (can't easily check style calc in unit test without snapshot, but functional check is good)
  });

  it('renders correctly when selected', () => {
    const { getByText } = render(
      <SelectionButton
        label="Test Option"
        isSelected={true}
        onToggle={mockToggle}
        type="checkbox"
        colors={colors}
        accessibilityLabel="Test Option"
      />
    );

    const buttonText = getByText('Test Option');
    expect(buttonText).toBeTruthy();
    // In a real browser/device we'd check for checkmark, but checkmark is an icon which might be mocked or just a View.
    // The component code renders IconSymbol when selected.
  });

  it('calls onToggle with label when pressed', () => {
    const { getByRole } = render(
      <SelectionButton
        label="Test Option"
        isSelected={false}
        onToggle={mockToggle}
        type="checkbox"
        colors={colors}
        accessibilityLabel="Test Option"
      />
    );

    const button = getByRole('checkbox');
    fireEvent.press(button);

    expect(mockToggle).toHaveBeenCalledWith('Test Option');
    expect(mockToggle).toHaveBeenCalledTimes(1);
  });

  it('passes accessibilityHint to TouchableOpacity', () => {
    const hint = 'Double tap to select';
    const { getByRole } = render(
      <SelectionButton
        label="Test Option"
        isSelected={false}
        onToggle={mockToggle}
        type="checkbox"
        colors={colors}
        accessibilityLabel="Test Option"
        accessibilityHint={hint}
      />
    );

    const button = getByRole('checkbox');
    expect(button.props.accessibilityHint).toBe(hint);
  });
});
