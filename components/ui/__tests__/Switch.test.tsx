import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { Switch } from '../Switch';

describe('Switch', () => {
  it('renders correctly with default props', () => {
    const { getByRole } = render(
      <Switch
        value={false}
        onValueChange={() => {}}
        accessibilityLabel="Test Switch"
      />
    );
    const switchElement = getByRole('switch');
    expect(switchElement).toBeTruthy();
    expect(switchElement.props.accessibilityLabel).toBe('Test Switch');
    expect(switchElement.props.accessibilityState.checked).toBe(false);
  });

  it('renders correctly when checked', () => {
    const { getByRole } = render(
      <Switch
        value={true}
        onValueChange={() => {}}
        accessibilityLabel="Test Switch"
      />
    );
    const switchElement = getByRole('switch');
    expect(switchElement.props.accessibilityState.checked).toBe(true);
  });

  it('calls onValueChange when pressed', () => {
    const onValueChange = jest.fn();
    const { getByRole } = render(
      <Switch
        value={false}
        onValueChange={onValueChange}
        accessibilityLabel="Test Switch"
      />
    );

    const switchElement = getByRole('switch');
    fireEvent.press(switchElement);

    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});
