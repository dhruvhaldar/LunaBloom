import React from 'react';
import { render } from '@testing-library/react-native';
import HistoryItem, { HistoryEntry } from '../HistoryItem';

// Mock IconSymbol to avoid issues with vector icons
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => 'IconSymbol',
}));

describe('HistoryItem', () => {
  const mockEntry: HistoryEntry = {
    date: '2023-10-01T10:00:00.000Z', // Log date
    lastPeriod: '2023-09-25T10:00:00.000Z', // Last period
    cycleLength: 28,
    periodDuration: 5,
    selectedSymptoms: ['Cramps', 'Headache'],
    selectedFlow: 'Medium',
    notes: 'Feeling okay',
    predictedNextPeriod: null,
    predictedNextOvulation: null,
  };

  const mockOnDelete = jest.fn();

  it('renders history item details correctly', () => {
    const { getByText } = render(
      <HistoryItem
        item={mockEntry}
        onDelete={mockOnDelete}
        textColor="#000"
        deleteIconColor="#f00"
      />
    );

    // Verify individual texts are present (current behavior)
    // Note: 'Sept' is observed in test output for September in en-GB locale in this environment
    expect(getByText(/Last Period: 25 Sept? 2023/)).toBeTruthy();
    expect(getByText(/Cycle Length: 28 days/)).toBeTruthy();
    expect(getByText(/Symptoms: Cramps, Headache/)).toBeTruthy();
    expect(getByText(/Flow: Medium/)).toBeTruthy();
    expect(getByText(/Notes: Feeling okay/)).toBeTruthy();
    expect(getByText(/Log Date: 1 Oct 2023/)).toBeTruthy();
  });

  it('groups details into a single accessible element', () => {
    const { getByLabelText } = render(
      <HistoryItem
        item={mockEntry}
        onDelete={mockOnDelete}
        textColor="#000"
        deleteIconColor="#f00"
      />
    );

    // Construct the expected accessibility label
    // Using regex to handle potential date format differences (Sep vs Sept)
    const expectedLabelRegex = /Entry for 25 Sept? 2023\. Cycle Length: 28 days\. Symptoms: Cramps, Headache\. Flow: Medium\. Notes: Feeling okay\. Log Date: 1 Oct 2023/;

    expect(getByLabelText(expectedLabelRegex)).toBeTruthy();
  });
});
