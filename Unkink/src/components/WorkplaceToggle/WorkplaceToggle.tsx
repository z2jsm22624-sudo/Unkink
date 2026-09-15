import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import type { Theme } from '../../constants/themes';

interface WorkplaceToggleProps {
  theme: Theme;
  isDeskMode: boolean;
  onToggle: (value: boolean) => void;
  streakCount: number;
}

export const WorkplaceToggle: React.FC<WorkplaceToggleProps> = ({
  theme,
  isDeskMode,
  onToggle,
  streakCount,
}) => {
  const handleToggle = async (value: boolean) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(value);
  };

  return (
    <View style={styles.headerContainer}>
      <View style={styles.titleWrapper}>
        <Text style={[styles.appTitle, { color: theme.textPrimary }]}>Unkink</Text>
        <Text style={[styles.streakText, { color: theme.textSecondary }]}>
          🔥 {streakCount} Day{streakCount === 1 ? '' : 's'} Streak
        </Text>
      </View>

      <View style={styles.toggleWrapper}>
        <View style={styles.labelContainer}>
          <Text style={[styles.toggleLabel, { color: theme.textPrimary }]}> {isDeskMode ? 'DESK' : 'OPEN'} </Text>
        </View>

        <Switch
          value={isDeskMode}
          onValueChange={handleToggle}
          trackColor={{ false: theme.toggleBg, true: theme.accent }}
          thumbColor={isDeskMode ? theme.background : theme.cardBg}
          ios_backgroundColor={theme.toggleBg}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 15,
    width: '100%',
  },
  titleWrapper: {
    flexDirection: 'column',
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
  streakText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 2,
  },
  toggleWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  labelContainer: {
    minWidth: 50,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  toggleLabel: {
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'right',
  },
});