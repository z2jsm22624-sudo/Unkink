import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { getDayOfWeekIndex, DAY_NAMES } from '../services/waterStorageService';

export interface WeeklyHistogramProps {
  /** Array of daily percentage gains for [Mon, Tue, Wed, Thu, Fri, Sat, Sun] */
  data?: number[];
  dailyGains?: number[];
  /** Target daily percentage increase for full bar height (default: 20%) */
  dailyTarget?: number;
}

const SHORT_DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const WeeklyHistogram: React.FC<WeeklyHistogramProps> = ({
  data,
  dailyGains,
  dailyTarget = 20,
}) => {
  const gains = dailyGains ?? data ?? [0, 0, 0, 0, 0, 0, 0];
  const todayIndex = getDayOfWeekIndex();

  const formatPercentage = (val: number): string => {
    if (!val || val === 0) {
      return '0%';
    }
    const formatted = Number.isInteger(val) ? val.toString() : val.toFixed(1);
    return `+${formatted}%`;
  };

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>DAILY PROGRESS CONTRIBUTION</Text>
        <Text style={styles.targetHint}>Target: {dailyTarget}%/day</Text>
      </View>

      <View style={styles.chartWrap}>
        {SHORT_DAY_LABELS.map((dayLabel, index) => {
          const value = gains[index] ?? 0;
          const isToday = index === todayIndex;
          const hasValue = value > 0;

          // Scale bar height relative to daily target percentage
          const calculatedHeight = Math.min(100, Math.max(0, (value / dailyTarget) * 100));
          // Provide minimum visible height if there was a contribution
          const displayHeight = hasValue ? Math.max(calculatedHeight, 8) : 0;

          return (
            <View key={DAY_NAMES[index]} style={styles.barColumn}>
              {/* Tooltip / Value Text displaying exact daily percentage increase */}
              <View style={styles.tooltipWrap}>
                <Text
                  style={[
                    styles.valueText,
                    isToday && styles.valueTextToday,
                    !hasValue && styles.valueTextMuted,
                  ]}
                  numberOfLines={1}
                >
                  {formatPercentage(value)}
                </Text>
              </View>

              {/* Bar container & Fill */}
              <View style={styles.barArea}>
                <View style={styles.barTrack}>
                  {displayHeight > 0 ? (
                    <View
                      style={[
                        styles.barFill,
                        { height: `${displayHeight}%` },
                        isToday ? styles.barFillToday : styles.barFillDefault,
                      ]}
                    />
                  ) : null}
                </View>
              </View>

              {/* Day Label with today highlight */}
              <Text
                style={[
                  styles.dayLabel,
                  isToday && styles.dayLabelToday,
                ]}
              >
                {dayLabel}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

export const HistogramChart = WeeklyHistogram;

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.15)',
    paddingVertical: 18,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    color: 'rgba(234,251,255,0.85)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.1,
  },
  targetHint: {
    color: 'rgba(234,251,255,0.45)',
    fontSize: 11,
    fontWeight: '600',
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 155,
    paddingTop: 10,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingHorizontal: 2,
  },
  tooltipWrap: {
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  valueText: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '700',
  },
  valueTextToday: {
    color: '#00B0FF',
    fontWeight: '800',
  },
  valueTextMuted: {
    color: 'rgba(255,255,255,0.2)',
    fontSize: 9,
  },
  barArea: {
    width: 22,
    height: 95,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  barTrack: {
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 11,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 11,
  },
  barFillDefault: {
    backgroundColor: 'rgba(0, 229, 255, 0.65)',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.35,
    shadowRadius: 6,
    elevation: 4,
  },
  barFillToday: {
    backgroundColor: '#00B0FF',
    shadowColor: '#00B0FF',
    shadowOpacity: 0.7,
    shadowRadius: 10,
    elevation: 8,
    borderWidth: 1,
    borderColor: '#E1F5FE',
  },
  dayLabel: {
    marginTop: 8,
    color: 'rgba(234,251,255,0.6)',
    fontSize: 11,
    fontWeight: '600',
  },
  dayLabelToday: {
    color: '#00B0FF',
    fontWeight: '800',
  },
});

export default WeeklyHistogram;
