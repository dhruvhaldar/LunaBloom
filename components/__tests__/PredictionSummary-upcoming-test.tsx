import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PredictionSummary from '../PredictionSummary';

describe('PredictionSummary Upcoming', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2023-12-27T00:00:00.000Z'));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders upcoming indicator for periods in 2-3 days', () => {
    const predictedPeriods = [
      new Date('2023-12-29T00:00:00.000Z'), // 2 days away
      new Date('2023-12-30T00:00:00.000Z'), // 3 days away
      new Date('2023-12-31T00:00:00.000Z'), // 4 days away
    ];

    render(
      <PredictionSummary
        predictedPeriods={predictedPeriods}
        predictedOvulations={[]}
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    );

    // 29 Dec: 2 days away
    // Label format: `Predicted period starting ${formatDate(date, DateFormats.MonthDay)}${daysRemainingLabel}, ending ${formatDate(periodEndDate, DateFormats.MonthDay)}`
    // daysRemainingLabel: `, coming up in ${diffDays} days`
    // formatDate('2023-12-29'): "29 Dec"
    // periodEndDate: 29 Dec + 4 days = 2 Jan (29, 30, 31, 1, 2)
    const label2Days = "Predicted period starting 29 Dec, coming up in 2 days, ending 2 Jan";

    // 30 Dec: 3 days away
    // periodEndDate: 30 Dec + 4 days = 3 Jan
    const label3Days = "Predicted period starting 30 Dec, coming up in 3 days, ending 3 Jan";

    // 31 Dec: 4 days away
    // periodEndDate: 31 Dec + 4 days = 4 Jan
    // daysRemainingLabel: `, in ${diffDays} days`
    const label4Days = "Predicted period starting 31 Dec, in 4 days, ending 4 Jan";

    expect(screen.getByLabelText(label2Days)).toBeTruthy();
    expect(screen.getByLabelText(label3Days)).toBeTruthy();
    expect(screen.getByLabelText(label4Days)).toBeTruthy();
  });
});
