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

  const periodsSection = useMemo(() => {
    // Bolt Optimization: Calculate expensive values once outside the map loop
    const periodDurationNum = Number(periodDuration);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    return (
      <ThemedView style={styles.section}>
        <ThemedText type="subtitle" style={{ color: predictedHeadingColor, marginBottom: 10, marginTop: 15 }}>
          Predicted Periods
        </ThemedText>
        {predictedPeriods.map((date, index) => {
          // Calculate period end date
          const periodEndDate = new Date(date);
          periodEndDate.setDate(periodEndDate.getDate() + periodDurationNum - 1);

          // Calculate days remaining for the next period
          let daysRemainingText = '';
          let daysRemainingLabel = '';
          let isLate = false;
          if (index === 0) {
            const target = new Date(date);
            target.setHours(0, 0, 0, 0);
            const diffTime = target.getTime() - todayTime;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            if (diffDays === 0) {
              daysRemainingText = ' (Today)';
              daysRemainingLabel = ', starting today';
            } else if (diffDays === 1) {
              daysRemainingText = ' (Tomorrow)';
              daysRemainingLabel = ', starting tomorrow';
            } else if (diffDays > 1) {
              daysRemainingText = ` (in ${diffDays} days)`;
              daysRemainingLabel = `, in ${diffDays} days`;
            } else if (diffDays < 0) {
              isLate = true;
              const absDays = Math.abs(diffDays);
              const daysString = absDays === 1 ? 'day' : 'days';
              daysRemainingText = ` (${absDays} ${daysString} late)`;
              daysRemainingLabel = `, Warning: ${absDays} ${daysString} late`;
            }
          }

          const lateColor = '#E63946';
          const itemBorderColor = isLate ? lateColor : textColor;
          const itemBorderWidth = isLate ? 2 : 1;
          const daysTextColor = isLate ? lateColor : textColor;

          return (
            <ThemedView
              key={index}
              style={[
                styles.predictionItem,
                { borderColor: itemBorderColor, borderWidth: itemBorderWidth }
              ]}
              accessible={true}
              accessibilityLabel={`Predicted period starting ${formatDate(date, DateFormats.MonthDay)}${daysRemainingLabel}, ending ${formatDate(periodEndDate, DateFormats.MonthDay)}`}
            >
              <ThemedText style={{ color: textColor }}>
                {formatDate(date, DateFormats.MonthDay)}
                <ThemedText style={{ fontWeight: 'bold', color: daysTextColor }}>{daysRemainingText}</ThemedText>
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
    );
  }, [predictedPeriods, periodDuration, predictedHeadingColor, textColor]);

  const ovulationSection = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayTime = today.getTime();

    return (
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
          fertileWindowStart.setDate(fertileWindowStart.getDate() - 5);

          // Calculate days remaining to ovulation
          const target = new Date(date);
          target.setHours(0, 0, 0, 0);
          const diffTime = target.getTime() - todayTime;
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          let statusText = '';
          let statusLabel = '';
          let statusColor = textColor;

          if (diffDays === 0) {
            statusText = ' (Today! 🥚)';
            statusLabel = ', Today is ovulation day';
            statusColor = '#E63946'; // Red/Warning color for importance
          } else if (diffDays > 0 && diffDays <= 5) {
            statusText = ' (High Chance 🌟)';
            statusLabel = ', High chance of fertility';
            statusColor = '#2a9d8f'; // Green/Success color for fertility
          } else if (diffDays > 5) {
            statusText = ` (in ${diffDays} days)`;
            statusLabel = `, in ${diffDays} days`;
          }

          return (
            <ThemedView
              key={index}
              style={[
                styles.predictionItem,
                { borderColor: textColor, borderWidth: 1 }
              ]}
              accessible={true}
              accessibilityLabel={`Ovulation on ${formatDate(date, DateFormats.MonthDay)}${statusLabel}. Fertile window from ${formatDate(fertileWindowStart, DateFormats.MonthDay)} to ${formatDate(date, DateFormats.MonthDay)}`}
            >
              <ThemedText style={{ color: textColor }}>
                Ovulation: {formatDate(date, DateFormats.MonthDay)}
                <ThemedText style={{ fontWeight: 'bold', color: statusColor }}>{statusText}</ThemedText>
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
    );
  }, [predictedOvulations, predictedHeadingColor, textColor]); // Independent of periodDuration

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
