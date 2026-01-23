import React from 'react';
import { render, screen } from '@testing-library/react-native';
import HistoryItem, { HistoryEntry } from '../HistoryItem';

it('renders correctly with accessibility props', () => {
  const mockEntry: HistoryEntry = {
    date: '2023-10-26T12:00:00.000Z',
    lastPeriod: '2023-10-01T00:00:00.000Z',
    cycleLength: 28,
    periodDuration: 5,
    selectedSymptoms: ['Cramps', 'Headache'],
    selectedFlow: 'Normal',
    notes: 'Feeling okay',
    predictedNextPeriod: '2023-10-29T00:00:00.000Z',
  };

  render(
    <HistoryItem
      item={mockEntry}
      onDelete={() => {}}
      textColor="#000"
      deleteIconColor="#F00"
    />
  );

  // We look for an element that contains "Entry logged on" in its accessibility label
  const accessibleElement = screen.getByLabelText(/Entry logged on/);

  expect(accessibleElement).toBeTruthy();

  const label = accessibleElement.props.accessibilityLabel;
  // Verify key parts of the constructed label
  expect(label).toContain('Last Period: 1 Oct 2023');
  expect(label).toContain('Cycle Length: 28 days');
  expect(label).toContain('Symptoms: Cramps, Headache');
  expect(label).toContain('Flow: Normal');
  expect(label).toContain('Notes: Feeling okay');
});
