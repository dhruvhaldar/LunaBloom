import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { EmptyState } from '../ui/EmptyState';
import { Animated } from 'react-native';

// Mock IconSymbol
jest.mock('@/components/ui/IconSymbol', () => ({
  IconSymbol: 'IconSymbol',
}));

describe('EmptyState', () => {
  beforeEach(() => {
    // Mock Animated methods to return an object with start that executes callback immediately
    const mockCompositeAnimation = {
      start: (callback: any) => {
         if (callback) callback({ finished: true });
      },
      stop: jest.fn(),
      reset: jest.fn(),
    };

    jest.spyOn(Animated, 'timing').mockReturnValue(mockCompositeAnimation as any);
    jest.spyOn(Animated, 'spring').mockReturnValue(mockCompositeAnimation as any);
    jest.spyOn(Animated, 'parallel').mockReturnValue(mockCompositeAnimation as any);
    jest.spyOn(Animated, 'sequence').mockReturnValue(mockCompositeAnimation as any);
    jest.spyOn(Animated, 'loop').mockReturnValue(mockCompositeAnimation as any);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders correctly with title and message', () => {
    const { getByText } = render(
      <EmptyState
        title="No Data"
        message="There is no data to display."
      />
    );
    expect(getByText('No Data')).toBeTruthy();
    expect(getByText('There is no data to display.')).toBeTruthy();
  });

  it('renders action button and handles press', () => {
    const onAction = jest.fn();
    const { getByText, getByRole } = render(
      <EmptyState
        title="No Data"
        message="Message"
        actionLabel="Retry"
        onAction={onAction}
      />
    );

    // Check button role
    const button = getByRole('button', { name: 'Retry' });
    expect(button).toBeTruthy();

    fireEvent.press(button);
    expect(onAction).toHaveBeenCalled();
  });

  it('renders icon with accessibility props', () => {
    const { getByLabelText } = render(
      <EmptyState
        title="No Insights"
        message="Log more data"
        icon="chart.bar.fill"
      />
    );

    // Query by label text which I added
    const iconContainer = getByLabelText('No Insights illustration');
    expect(iconContainer).toBeTruthy();
    expect(iconContainer.props.accessibilityRole).toBe('image');
  });
});
