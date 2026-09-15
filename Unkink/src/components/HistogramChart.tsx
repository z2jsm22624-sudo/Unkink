import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

interface HistogramChartProps {
  data: number[];
}

const DAY_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export const HistogramChart: React.FC<HistogramChartProps> = ({ data }) => {
  const maxValue = Math.max(...data, 1);

  return (
    <View style={styles.card}>
      <Text style={styles.label}>SESSION FREQUENCY</Text>
      <View style={styles.chartWrap}>
        {data.map((value, index) => {
          const relativeHeight = maxValue === 0 || value === 0 ? 0 : (value / maxValue) * 100;

          return (
            <View key={`${DAY_LABELS[index]}-${value}`} style={styles.barColumn}>
              <View style={styles.barArea}>
                <View style={[styles.bar, { height: `${relativeHeight}%` }]} />
              </View>
              <Text style={styles.dayLabel}>{DAY_LABELS[index]}</Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  label: {
    color: 'rgba(234,251,255,0.75)',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 14,
  },
  chartWrap: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: 140,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barArea: {
    width: 18,
    height: 110,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderRadius: 999,
    backgroundColor: '#00E5FF',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.45,
    shadowRadius: 12,
    elevation: 6,
  },
  dayLabel: {
    marginTop: 8,
    color: 'rgba(234,251,255,0.7)',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default HistogramChart;
