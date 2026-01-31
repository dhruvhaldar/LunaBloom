import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PredictionSummary from '../PredictionSummary';

describe('PredictionSummary Late Logic', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-01-10T00:00:00.000Z')); // Today is Jan 10
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('handles past predicted periods (late)', () => {
    render(
      <PredictionSummary
        predictedPeriods={[new Date('2024-01-08T00:00:00.000Z')]} // Predicted Jan 8 (2 days ago)
        predictedOvulations={[]}
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    );

    // Now we expect "late" indicator
    const lateText = screen.getByText(/2 days late/i);
    expect(lateText).toBeTruthy();

    // Verify accessibility label
    // Jan 8 + 5 days - 1 = Jan 12 end date
    // Label should be: "Predicted period starting 8 Jan, 2 days late, ending 12 Jan"
    // Note: formatDate(DateFormats.MonthDay) usually formats as "8 Jan" (d MMM) or "Jan 8" depending on locale.
    // Based on memory/previous tests, it seems to be "8 Jan".

    // We can use a regex for the accessibility label to be safe about date formatting if unsure,
    // but looking at previous output or code:
    // `Predicted period starting ${formatDate(date, DateFormats.MonthDay)}${daysRemainingLabel}, ending ${formatDate(periodEndDate, DateFormats.MonthDay)}`

    const a11yLabel = screen.getByLabelText(/Predicted period starting .*2 days late/i);
    expect(a11yLabel).toBeTruthy();
  });

  it('handles 1 day late correctly (singular)', () => {
    // Current date is 2024-01-10 (from beforeAll)
    // We want 1 day late, so predicted was 2024-01-09
    render(
      <PredictionSummary
        predictedPeriods={[new Date('2024-01-09T00:00:00.000Z')]}
        predictedOvulations={[]}
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    );

    const lateText = screen.getByText(/1 day late/i);
    expect(lateText).toBeTruthy();

    const a11yLabel = screen.getByLabelText(/Predicted period starting .*1 day late/i);
    expect(a11yLabel).toBeTruthy();
  });
});
