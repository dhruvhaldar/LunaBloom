import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HistoryItem, { HistoryEntry } from '../HistoryItem';

// Mock IconSymbol as it uses native vector icons
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('HistoryItem', () => {
  const mockItem: HistoryEntry = {
    date: '2023-10-01T10:00:00.000Z',
    lastPeriod: '2023-10-01T00:00:00.000Z',
    cycleLength: 28,
    selectedSymptoms: ['Cramps', 'Fatigue'],
    selectedFlow: 'Medium',
    notes: 'Feeling okay',
    predictedNextPeriod: null,
    predictedNextOvulation: null,
  };

  const mockOnDelete = jest.fn();

  it('renders correctly and has accessible delete button', () => {
    const { getByLabelText, getByText } = render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        textColor="#000"
        deleteIconColor="red"
      />
    );

    // Verify individual texts are present (checking content)
    expect(getByText('Cycle Length: 28 days')).toBeTruthy();

    // Check delete button accessibility
    const deleteButton = getByLabelText('Delete entry from 1 Oct 2023');
    expect(deleteButton).toBeTruthy();

    fireEvent.press(deleteButton);
    expect(mockOnDelete).toHaveBeenCalledWith(mockItem.date);
  });

  it('groups entry details into a single accessible element', () => {
    const { getByLabelText } = render(
      <HistoryItem
        item={mockItem}
        onDelete={mockOnDelete}
        textColor="#000"
        deleteIconColor="red"
      />
    );

    const expectedLabel = "Entry for 1 Oct 2023. Last Period: 1 Oct 2023. Cycle Length: 28 days. Symptoms: Cramps, Fatigue. Flow: Medium. Notes: Feeling okay";

    const container = getByLabelText(expectedLabel);
    expect(container).toBeTruthy();
  });
});
