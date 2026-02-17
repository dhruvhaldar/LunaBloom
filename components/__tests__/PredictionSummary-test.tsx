import React from 'react';
import renderer from 'react-test-renderer';
import { render, screen } from '@testing-library/react-native';
import PredictionSummary from '../PredictionSummary';

describe('PredictionSummary', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-27'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

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
        predictedPeriods={[new Date('2024-01-01'), new Date('2024-02-01')]}
        predictedOvulations={[new Date('2024-01-14')]}
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    );

    // Assuming en-GB locale (1 Jan)
    // 27 Dec 2023 to 1 Jan 2024 is 5 days
    const periodLabel1 = "Predicted period starting 1 Jan, in 5 days, ending 5 Jan";
    // 27 Dec 2023 to 1 Feb 2024 is 36 days (5 in Dec + 31 in Jan)
    const periodLabel2 = "Predicted period starting 1 Feb, in 36 days, ending 5 Feb";

    // Ovulation: 14 Jan. Fertile window: 9 Jan - 14 Jan. Days away: 18 days (27 Dec -> 14 Jan)
    const ovulationLabel = "Ovulation on 14 Jan, in 18 days. Fertile window from 9 Jan to 14 Jan";

    expect(screen.getByLabelText(periodLabel1)).toBeTruthy();
    expect(screen.getByLabelText(periodLabel2)).toBeTruthy();
    expect(screen.getByLabelText(ovulationLabel)).toBeTruthy();
  });
});
