import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../constants/themes';

interface EyeResetButtonProps {
  theme: Theme;
  onPress: () => void;
}

export const EyeResetButton: React.FC<EyeResetButtonProps> = ({ theme, onPress }) => {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onPress();
  };

  const borderColor = theme.background === '#F5EDE1' ? '#D7D7D7' : theme.accent;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: theme.cardBg, borderColor }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
      <Text style={[styles.text, { color: theme.textPrimary }]}>Eye Fatigue Reset</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    borderWidth: 1,
    gap: 8,
    marginVertical: 10,
  },
  text: {
    fontSize: 13,
    fontWeight: '600',
  },
});