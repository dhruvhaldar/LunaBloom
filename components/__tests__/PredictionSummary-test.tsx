import React from 'react';
import renderer from 'react-test-renderer';
import PredictionSummary from '../PredictionSummary';

describe('PredictionSummary', () => {
  it('renders correctly', () => {
    const tree = renderer.create(
      <PredictionSummary
        predictedPeriods={[new Date('2024-01-01'), new Date('2024-02-01')]}
        predictedOvulations={[new Date('2024-01-14'), new Date('2024-02-14')]}
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
