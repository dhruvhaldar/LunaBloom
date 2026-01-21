import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import HistoryItem, { HistoryEntry } from '../HistoryItem';

describe('HistoryItem', () => {
  const mockDelete = jest.fn();
  const mockItem: HistoryEntry = {
    date: '2023-10-27T10:00:00.000Z',
    lastPeriod: '2023-10-01T10:00:00.000Z',
    cycleLength: 28,
    periodDuration: 5,
    selectedSymptoms: ['Cramps', 'Headache'],
    selectedFlow: 'Medium',
    notes: 'Feeling okay',
  };

  const props = {
    item: mockItem,
    onDelete: mockDelete,
    textColor: '#000',
    deleteIconColor: 'red',
  };

  beforeEach(() => {
    mockDelete.mockClear();
  });

  it('renders correctly with grouped accessibility label', () => {
    const { getByLabelText, getByText } = render(<HistoryItem {...props} />);

    // Verify visual text is present
    // Assuming "en-GB" ShortDate: "1 Oct 2023"
    expect(getByText('Last Period: 1 Oct 2023')).toBeTruthy();
    expect(getByText('Cycle Length: 28 days')).toBeTruthy();
    expect(getByText('Symptoms: Cramps, Headache')).toBeTruthy();

    // Verify the grouped accessibility label
    // This expects the accessible container to exist.
    // Since it doesn't exist yet, this test will fail, confirming we need to implement it.
    const accessibleGroup = getByLabelText(/Entry for 1 Oct 2023/);
    expect(accessibleGroup).toBeTruthy();
  });

  it('renders delete button with accessibility label', () => {
    const { getByRole, getByLabelText } = render(<HistoryItem {...props} />);

    // Button is separate
    const deleteButton = getByRole('button');
    expect(deleteButton).toBeTruthy();

    // Check label contains date
    expect(getByLabelText(/Delete entry from 27 Oct 2023/)).toBeTruthy();
  });

  it('calls onDelete when delete button is pressed', () => {
    const { getByRole } = render(<HistoryItem {...props} />);

    const deleteButton = getByRole('button');
    fireEvent.press(deleteButton);

    expect(mockDelete).toHaveBeenCalledWith(mockItem.date);
  });
});
