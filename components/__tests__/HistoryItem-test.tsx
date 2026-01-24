import React from 'react';
import { render } from '@testing-library/react-native';
import HistoryItem from '../HistoryItem';

// Mock IconSymbol
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => 'IconSymbol',
}));

describe('HistoryItem', () => {
  const mockItem = {
    date: '2023-10-01T10:00:00.000Z',
    lastPeriod: '2023-09-01T10:00:00.000Z',
    cycleLength: 30,
    selectedSymptoms: ['Cramps', 'Headache'],
    selectedFlow: 'Medium',
    notes: 'Feeling okay',
  };

  const mockDelete = jest.fn();

  it('renders correctly and contains accessible information', () => {
    const { getByLabelText } = render(
      <HistoryItem
        item={mockItem}
        onDelete={mockDelete}
        textColor="#000"
        deleteIconColor="red"
      />,
    );

    // We expect the component to have a comprehensive accessibility label for the text container
    // Dates: 2023-10-01 -> "1 Oct 2023" (assuming ShortDate defaults)
    const expectedLabel =
      'History entry from 1 Oct 2023. Last Period: 1 Sept 2023. Cycle Length: 30 days. Symptoms: Cramps, Headache. Flow: Medium. Notes: Feeling okay.';

    expect(getByLabelText(expectedLabel)).toBeTruthy();
  });
});
