import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { StepperInput } from '../StepperInput';

describe('StepperInput', () => {
  it('renders correctly with initial value', () => {
    const { getByDisplayValue } = render(
      <StepperInput
        value="28"
        onChangeText={() => {}}
        label="Test Input"
      />
    );
    expect(getByDisplayValue('28')).toBeTruthy();
  });

  it('calls onChangeText when increment button is pressed', () => {
    const onChangeTextMock = jest.fn();
    const { getByLabelText } = render(
      <StepperInput
        value="28"
        onChangeText={onChangeTextMock}
        label="Test Input"
      />
    );

    fireEvent.press(getByLabelText('Increase Test Input'));
    expect(onChangeTextMock).toHaveBeenCalledWith('29');
  });

  it('calls onChangeText when decrement button is pressed', () => {
    const onChangeTextMock = jest.fn();
    const { getByLabelText } = render(
      <StepperInput
        value="28"
        onChangeText={onChangeTextMock}
        label="Test Input"
      />
    );

    fireEvent.press(getByLabelText('Decrease Test Input'));
    expect(onChangeTextMock).toHaveBeenCalledWith('27');
  });

  it('respects min value', () => {
    const onChangeTextMock = jest.fn();
    const { getByLabelText } = render(
      <StepperInput
        value="1"
        min={1}
        onChangeText={onChangeTextMock}
        label="Test Input"
      />
    );

    const decrementButton = getByLabelText('Decrease Test Input');
    fireEvent.press(decrementButton);
    expect(onChangeTextMock).not.toHaveBeenCalled();
  });
});
