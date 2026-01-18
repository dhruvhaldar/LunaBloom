import React from 'react';
import renderer from 'react-test-renderer';
import { StepperInput } from '../StepperInput';

describe('StepperInput', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <StepperInput
        value={10}
        onChange={() => {}}
        min={0}
        max={100}
        label="Test Stepper"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
