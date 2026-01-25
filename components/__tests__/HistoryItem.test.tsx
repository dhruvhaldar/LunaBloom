import React from 'react';
import { render } from '@testing-library/react-native';
import HistoryItem from '../HistoryItem';

// Mock IconSymbol
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => null,
}));

describe('HistoryItem', () => {
  const mockOnDelete = jest.fn();
  const mockItem = {
    date: '2023-10-01T10:00:00.000Z',
    lastPeriod: '2023-10-01T00:00:00.000Z',
    cycleLength: 28,
    selectedSymptoms: ['Cramps', 'Headache'],
    selectedFlow: 'Medium',
    notes: 'Feeling okay',
  };

  const props = {
    item: mockItem,
    onDelete: mockOnDelete,
    textColor: '#000',
    deleteIconColor: 'red',
  };

  it('groups details into a single accessible element', () => {
    const { getByLabelText } = render(<HistoryItem {...props} />);

    // Expected label based on DateFormats.ShortDate ("1 Oct 2023")
    const expectedLabel = "Entry for 1 Oct 2023. Last Period: 1 Oct 2023. Cycle Length: 28 days. Symptoms: Cramps, Headache. Flow: Medium. Notes: Feeling okay.";

    expect(getByLabelText(expectedLabel)).toBeTruthy();
  });
});
