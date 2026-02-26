import React, { useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { formatDate, DateFormats } from '@/utils/dateFormatter';
import { IconSymbol } from '@/components/ui/IconSymbol';

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

          // Calculate days remaining
          let daysRemainingText = '';
          let daysRemainingLabel = '';
          let isLate = false;
          let isUpcoming = false;

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
          } else if (diffDays > 1 && diffDays <= 3) {
            daysRemainingText = ` (in ${diffDays} days)`;
            daysRemainingLabel = `, coming up in ${diffDays} days`;
            isUpcoming = true;
          } else if (diffDays > 3) {
            daysRemainingText = ` (in ${diffDays} days)`;
            daysRemainingLabel = `, in ${diffDays} days`;
          } else if (diffDays < 0) {
            isLate = true;
            const absDays = Math.abs(diffDays);
            const daysString = absDays === 1 ? 'day' : 'days';
            daysRemainingText = ` (${absDays} ${daysString} late)`;
            daysRemainingLabel = `, Warning: ${absDays} ${daysString} late`;
          }

          const lateColor = '#E63946';
          const upcomingColor = '#457B9D';

          const itemBorderColor = isLate ? lateColor : (isUpcoming ? upcomingColor : textColor);
          const itemBorderWidth = isLate || isUpcoming ? 2 : 1;
          const daysTextColor = isLate ? lateColor : (isUpcoming ? upcomingColor : textColor);
          const backgroundColor = isLate ? 'rgba(230, 57, 70, 0.1)' : (isUpcoming ? 'rgba(69, 123, 157, 0.1)' : undefined);

          return (
            <ThemedView
              key={index}
              style={[
                styles.predictionItem,
                { borderColor: itemBorderColor, borderWidth: itemBorderWidth, backgroundColor }
              ]}
              accessible={true}
              accessibilityLabel={`Predicted period starting ${formatDate(date, DateFormats.MonthDay)}${daysRemainingLabel}, ending ${formatDate(periodEndDate, DateFormats.MonthDay)}`}
            >
              <View style={styles.row}>
                {(isLate || isUpcoming) && (
                  <IconSymbol
                    name={isLate ? "calendar.badge.exclamationmark" : "calendar"}
                    size={24}
                    color={isLate ? lateColor : upcomingColor}
                    style={{ marginRight: 10 }}
                  />
                )}
                <View style={{ flex: 1 }}>
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
                </View>
              </View>
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
          let backgroundColor: string | undefined = undefined;
          let iconName: 'exclamationmark.triangle.fill' | 'sparkles' | undefined = undefined;

          if (diffDays === 0) {
            statusText = ' (Peak Fertility! 🥚)';
            statusLabel = ', Today is peak fertility day';
            statusColor = '#2a9d8f'; // Teal/Success color for peak fertility
            backgroundColor = 'rgba(42, 157, 143, 0.1)';
            iconName = 'sparkles';
          } else if (diffDays > 0 && diffDays <= 5) {
            statusText = ' (High Chance 🌟)';
            statusLabel = ', High chance of fertility';
            statusColor = '#2a9d8f'; // Green/Success color for fertility
            backgroundColor = 'rgba(42, 157, 143, 0.1)';
            iconName = 'sparkles';
          } else if (diffDays > 5) {
            statusText = ` (in ${diffDays} days)`;
            statusLabel = `, in ${diffDays} days`;
          }

          const itemBorderColor = iconName ? statusColor : textColor;
          const itemBorderWidth = iconName ? 2 : 1;

          return (
            <ThemedView
              key={index}
              style={[
                styles.predictionItem,
                { borderColor: itemBorderColor, borderWidth: itemBorderWidth, backgroundColor }
              ]}
              accessible={true}
              accessibilityLabel={`Ovulation on ${formatDate(date, DateFormats.MonthDay)}${statusLabel}. Fertile window from ${formatDate(fertileWindowStart, DateFormats.MonthDay)} to ${formatDate(date, DateFormats.MonthDay)}`}
            >
              <View style={styles.row}>
                {iconName && (
                  <IconSymbol name={iconName} size={24} color={statusColor} style={{ marginRight: 10 }} />
                )}
                <View style={{ flex: 1 }}>
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
                </View>
              </View>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

export default PredictionSummary;
