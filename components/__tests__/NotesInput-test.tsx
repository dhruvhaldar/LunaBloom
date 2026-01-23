import React, { createRef } from 'react';
import { render, fireEvent, act } from '@testing-library/react-native';
import { NotesInput, NotesInputHandle } from '../NotesInput';

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

  it('clears notes via clear button', () => {
    const { getByPlaceholderText, getByLabelText, queryByLabelText } = render(
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

    // Type something
    fireEvent.changeText(input, 'Mistake');

    // Clear button should appear
    const clearButton = getByLabelText('Clear notes');
    expect(clearButton).toBeTruthy();

    // Press clear button
    fireEvent.press(clearButton);

    // Notes should be empty
    expect(input.props.value).toBe('');

    // Clear button should disappear
    expect(queryByLabelText('Clear notes')).toBeNull();
  });
});
