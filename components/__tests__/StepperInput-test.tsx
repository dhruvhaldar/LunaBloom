import * as React from 'react';
import renderer from 'react-test-renderer';
import { StepperInput } from '../ui/StepperInput';

// Mock dependencies
jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(),
}));

jest.mock('../ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('StepperInput', () => {
  it('renders correctly with default props', () => {
    const tree = renderer.create(
      <StepperInput
        value="28"
        onChange={() => {}}
        label="Test Stepper"
        color="black"
        borderColor="gray"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled decrement button at min value', () => {
    const tree = renderer.create(
      <StepperInput
        value="1"
        onChange={() => {}}
        min={1}
        label="Test Stepper"
        color="black"
        borderColor="gray"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('renders disabled increment button at max value', () => {
    const tree = renderer.create(
      <StepperInput
        value="10"
        onChange={() => {}}
        max={10}
        label="Test Stepper"
        color="black"
        borderColor="gray"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
