import React from 'react';
import renderer from 'react-test-renderer';
import { StepperInput } from '../ui/StepperInput';

describe('StepperInput', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <StepperInput
        value="28"
        onChange={() => {}}
        label="Test Stepper"
        min={10}
        max={50}
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
