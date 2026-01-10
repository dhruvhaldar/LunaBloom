import React from 'react';
import { StyleSheet } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

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

  return (
    <>
      {/* Predicted Periods */}
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ color: predictedHeadingColor, marginBottom: 10, marginTop: 15 }}>
          Predicted Periods
        </ThemedText>
        {predictedPeriods.map((date, index) => {
          // Calculate period start date
          const periodStartDate = new Date(date);

          // Calculate period end date
          const periodEndDate = new Date(date);
          periodEndDate.setDate(periodEndDate.getDate() + Number(periodDuration) - 1);

          return (
            <ThemedView
              key={index}
              style={[
                styles.predictionItem,
                { borderColor: textColor, borderWidth: 1 }
              ]}
            >
              <ThemedText style={{ color: textColor }}>
                {date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })}
              </ThemedText>
              <ThemedText
                style={{
                  color: textColor,
                  fontSize: 12,
                  marginTop: 5
                }}
              >
                {periodStartDate.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })} - {periodEndDate.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })}
              </ThemedText>
            </ThemedView>
          );
        })}
      </ThemedView>

      {/* Predicted Ovulations */}
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

          // Calculate fertile window end (day of ovulation)
          const fertileWindowEnd = new Date(date);

          return (
            <ThemedView
              key={index}
              style={[
                styles.predictionItem,
                { borderColor: textColor, borderWidth: 1 }
              ]}
            >
              <ThemedText style={{ color: textColor }}>
                Ovulation: {date.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })}
              </ThemedText>
              <ThemedText
                style={{
                  color: textColor,
                  fontSize: 12,
                  marginTop: 5
                }}
              >
                Fertile Window: {fertileWindowStart.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })} - {fertileWindowEnd.toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short'
                })}
              </ThemedText>
            </ThemedView>
          );
        })}
      </ThemedView>
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
