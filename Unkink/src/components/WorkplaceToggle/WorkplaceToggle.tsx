import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../constants/themes';

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
  const handleToggle = (value: boolean) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onToggle(value);
  };

  return (
    <View style={styles.headerContainer}>
      <View>
        <Text style={[styles.appTitle, { color: theme.textPrimary }]}>Unkink</Text>
        <Text style={[styles.streakText, { color: theme.accent }]}>
          🔥 {streakCount} Day{streakCount === 1 ? '' : 's'} Streak
        </Text>
      </View>

      <View style={styles.toggleWrapper}>
        <Text style={[styles.toggleLabel, { color: theme.textSecondary }]}>
          {isDeskMode ? 'Desk' : 'Open Space'}
        </Text>
        <Switch
          value={isDeskMode}
          onValueChange={handleToggle}
          trackColor={{ false: theme.toggleBg, true: theme.accent }}
          thumbColor={theme.textPrimary}
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
  toggleLabel: {
    fontSize: 12,
    fontWeight: '700',
  },
});