import React, { useMemo } from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { formatDate, DateFormats } from '@/utils/dateFormatter';

interface PredictionSummaryProps {
  predictedPeriods: Date[];
  predictedOvulations: Date[];
  periodDuration: string;
  textColor: string;
  predictedHeadingColor: string;
}

const PredictionSummary = React.memo(function PredictionSummary({
  predictedPeriods,
  predictedOvulations,
  periodDuration,
  textColor,
  predictedHeadingColor,
}: PredictionSummaryProps) {

  // Optimization: Dates are calculated inside the map, but since this component is memoized,
  // it won't re-render unless props change. This saves recalculations on parent re-renders (e.g. typing notes).
  // Further Optimization: Split sections into useMemo blocks so that changing periodDuration (which happens frequently on typing)
  // doesn't re-render the ovulation section.

  // Bolt Optimization: Calculate days remaining separately to avoid re-calculation when periodDuration changes
  const daysRemainingInfo = useMemo(() => {
    if (predictedPeriods.length === 0) return { text: '', label: '' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(predictedPeriods[0]);
    target.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    let text = '';
    let label = '';
    if (diffDays === 0) {
      text = ' (Today)';
      label = ', starting today';
    } else if (diffDays === 1) {
      text = ' (Tomorrow)';
      label = ', starting tomorrow';
    } else if (diffDays > 1) {
      text = ` (in ${diffDays} days)`;
      label = `, in ${diffDays} days`;
    }
    return { text, label };
  }, [predictedPeriods]);

  const periodsSection = useMemo(() => (
    <ThemedView style={styles.section}>
      <ThemedText type="subtitle" style={{ color: predictedHeadingColor, marginBottom: 10, marginTop: 15 }}>
        Predicted Periods
      </ThemedText>
      {predictedPeriods.map((date, index) => {
        // Calculate period end date
        const periodEndDate = new Date(date);
        periodEndDate.setDate(periodEndDate.getDate() + Number(periodDuration) - 1);

        // Get pre-calculated days remaining for the first period
        const { text: daysRemainingText, label: daysRemainingLabel } =
          index === 0 ? daysRemainingInfo : { text: '', label: '' };

        return (
          <ThemedView
            key={index}
            style={[
              styles.predictionItem,
              { borderColor: textColor, borderWidth: 1 }
            ]}
            accessible={true}
            accessibilityLabel={`Predicted period starting ${formatDate(date, DateFormats.MonthDay)}${daysRemainingLabel}, ending ${formatDate(periodEndDate, DateFormats.MonthDay)}`}
          >
            <ThemedText style={{ color: textColor }}>
              {formatDate(date, DateFormats.MonthDay)}
              <ThemedText style={{ fontWeight: 'bold' }}>{daysRemainingText}</ThemedText>
            </ThemedText>
            <ThemedText
              style={{
                color: textColor,
                fontSize: 12,
                marginTop: 5
              }}
            >
              {formatDate(date, DateFormats.MonthDay)} - {formatDate(periodEndDate, DateFormats.MonthDay)}
            </ThemedText>
          </ThemedView>
        );
      })}
    </ThemedView>
  ), [predictedPeriods, periodDuration, predictedHeadingColor, textColor, daysRemainingInfo]);

  const ovulationSection = useMemo(() => (
    <ThemedView style={styles.section}>
      <ThemedText
        type="subtitle"
        style={{ color: predictedHeadingColor, marginBottom: 10 }}
      >
        Predicted Ovulations
      </ThemedText>
      {predictedOvulations.map((date, index) => {
        // Calculate fertile window start (5 days before ovulation)
        const fertileWindowStart = new Date(date);
        fertileWindowStart.setDate(fertileWindowStart.getDate() - 2);

        return (
          <ThemedView
            key={index}
            style={[
              styles.predictionItem,
              { borderColor: textColor, borderWidth: 1 }
            ]}
            accessible={true}
            accessibilityLabel={`Ovulation on ${formatDate(date, DateFormats.MonthDay)}. Fertile window from ${formatDate(fertileWindowStart, DateFormats.MonthDay)} to ${formatDate(date, DateFormats.MonthDay)}`}
          >
            <ThemedText style={{ color: textColor }}>
              Ovulation: {formatDate(date, DateFormats.MonthDay)}
            </ThemedText>
            <ThemedText
              style={{
                color: textColor,
                fontSize: 12,
                marginTop: 5
              }}
            >
              Fertile Window: {formatDate(fertileWindowStart, DateFormats.MonthDay)} - {formatDate(date, DateFormats.MonthDay)}
            </ThemedText>
          </ThemedView>
        );
      })}
    </ThemedView>
  ), [predictedOvulations, predictedHeadingColor, textColor]); // Independent of periodDuration

  return (
    <>
      {periodsSection}
      {ovulationSection}
    </>
  );
});

const styles = StyleSheet.create({
  section: {
    borderRadius: 8,
    padding: 5,
    marginBottom: 12,
  },
  predictionItem: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
});

export default PredictionSummary;
