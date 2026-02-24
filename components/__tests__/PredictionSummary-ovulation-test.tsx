import React from 'react';
import { render, screen } from '@testing-library/react-native';
import PredictionSummary from '../PredictionSummary';

describe('PredictionSummary Ovulation Logic', () => {
  beforeAll(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2024-05-15T00:00:00.000Z')); // Today is May 15
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('renders "Peak Fertility" for ovulation day (today)', () => {
    render(
      <PredictionSummary
        predictedPeriods={[]}
        predictedOvulations={[new Date('2024-05-15T00:00:00.000Z')]} // Ovulation today
        periodDuration="5"
        textColor="#000"
        predictedHeadingColor="#123"
      />
    );

    // Expect updated text
    // Note: The text is part of a larger string, e.g. "Ovulation: 15 May (Peak Fertility! 🥚)"
    const peakText = screen.getByText(/Peak Fertility! 🥚/i);
    expect(peakText).toBeTruthy();

    // Expect updated accessibility label
    // e.g., "Ovulation on 15 May, Today is peak fertility day. Fertile window from 10 May to 15 May"
    const a11yLabel = screen.getByLabelText(/Today is peak fertility day/i);
    expect(a11yLabel).toBeTruthy();
  });
});
