import React from 'react';
import renderer from 'react-test-renderer';
import { render, screen } from '@testing-library/react-native';
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

  it('has accessible labels for predictions', () => {
    render(
      <PredictionSummary
        predictedPeriods={[new Date('2024-01-01')]}
        predictedOvulations={[new Date('2024-01-14')]}
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    );

    // Assuming en-GB locale (1 Jan)
    const periodLabel = "Predicted period starting 1 Jan, ending 5 Jan";
    // Ovulation: 14 Jan. Fertile window: 12 Jan - 14 Jan
    const ovulationLabel = "Ovulation on 14 Jan. Fertile window from 12 Jan to 14 Jan";

    expect(screen.getByLabelText(periodLabel)).toBeTruthy();
    expect(screen.getByLabelText(ovulationLabel)).toBeTruthy();
  });
});
