import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

export interface WaterFootnoteProps {
  currentWeeklyWater: number;
  previousWeeklyWater: number;
}

export const WaterFootnote: React.FC<WaterFootnoteProps> = ({
  currentWeeklyWater,
  previousWeeklyWater,
}) => {
  const diff = currentWeeklyWater - previousWeeklyWater;

  // Format percentage number (omit decimal if integer, otherwise 1 decimal place)
  const formatPercentage = (val: number) => {
    const absVal = Math.abs(val);
    return Number.isInteger(absVal) ? absVal.toString() : absVal.toFixed(1);
  };

  if (previousWeeklyWater === 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.neutral]}>• First week of tracking</Text>
      </View>
    );
  }

  if (diff > 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.positive]}>
          ▲ +{formatPercentage(diff)}% vs last week
        </Text>
      </View>
    );
  }

  if (diff < 0) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.negative]}>
          ▼ -{formatPercentage(diff)}% vs last week
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={[styles.text, styles.neutral]}>• Same level as last week</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginTop: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  positive: {
    color: '#00E676',
  },
  negative: {
    color: '#FF5252',
  },
  neutral: {
    color: '#888888',
  },
});

export default WaterFootnote;
