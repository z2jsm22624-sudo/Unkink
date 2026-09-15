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

export const WorkplaceToggle: React.FC = ({
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
    
      
        Unkink
        
          🔥 {streakCount} Day{streakCount === 1 ? '' : 's'} Streak
        
      

      
        
          
            {isDeskMode ? 'DESK' : 'OPEN'}
          
        
        
      
    
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
    direction: 'ltr',
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
    direction: 'ltr',
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