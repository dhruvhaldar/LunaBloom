import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NotesInput, NotesInputHandle } from '../NotesInput';

// Mock IconSymbol to avoid issues with vector icons
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: () => 'IconSymbol',
}));

describe('NotesInput', () => {
  it('renders correctly', () => {
    const { getByPlaceholderText } = render(
      <NotesInput
        textColor="#000"
        borderColor="#000"
        placeholderTextColor="#666"
        headingColor="#000"
      />
    );
    expect(getByPlaceholderText('Record any additional notes...')).toBeTruthy();
  });

  it('updates text on change', () => {
    const { getByPlaceholderText, getByDisplayValue } = render(
      <NotesInput
        textColor="#000"
        borderColor="#000"
        placeholderTextColor="#666"
        headingColor="#000"
      />
    );
    const input = getByPlaceholderText('Record any additional notes...');
    fireEvent.changeText(input, 'New note');
    expect(getByDisplayValue('New note')).toBeTruthy();
  });

  it('exposes getNotes via ref', () => {
    const ref = createRef<NotesInputHandle>();
    const { getByPlaceholderText } = render(
      <NotesInput
        ref={ref}
        textColor="#000"
        borderColor="#000"
        placeholderTextColor="#666"
        headingColor="#000"
      />
    );
    const input = getByPlaceholderText('Record any additional notes...');
    fireEvent.changeText(input, 'Ref test');

    expect(ref.current?.getNotes()).toBe('Ref test');
  });

  it('resets notes via ref', () => {
    const ref = createRef<NotesInputHandle>();
    const { getByPlaceholderText, getByDisplayValue } = render(
      <NotesInput
        ref={ref}
        textColor="#000"
        borderColor="#000"
        placeholderTextColor="#666"
        headingColor="#000"
      />
    );
    const input = getByPlaceholderText('Record any additional notes...');
    fireEvent.changeText(input, 'To be cleared');
    expect(getByDisplayValue('To be cleared')).toBeTruthy();

    act(() => {
      ref.current?.resetNotes();
    });

    expect(ref.current?.getNotes()).toBe('');
  });

  it('clears text when clear button is pressed', () => {
    const { getByPlaceholderText, getByLabelText, queryByLabelText, getByDisplayValue } = render(
      <NotesInput
        textColor="#000"
        borderColor="#000"
        placeholderTextColor="#666"
        headingColor="#000"
      />
    );
    const input = getByPlaceholderText('Record any additional notes...');

    // Initial state: no clear button
    expect(queryByLabelText('Clear notes')).toBeNull();

    // Type text
    fireEvent.changeText(input, 'Some text');
    expect(getByDisplayValue('Some text')).toBeTruthy();

    // Clear button should appear
    const clearButton = getByLabelText('Clear notes');
    expect(clearButton).toBeTruthy();

    // Press clear button
    fireEvent.press(clearButton);

    // Text should be cleared (clear button disappears)
    expect(queryByLabelText('Clear notes')).toBeNull();
  });
});
