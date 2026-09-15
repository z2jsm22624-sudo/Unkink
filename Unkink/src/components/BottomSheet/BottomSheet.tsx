import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../constants/themes';
import type { MuscleGroupData } from '../../constants/data';

interface BottomSheetProps {
  theme: Theme;
  data: MuscleGroupData | null;
  isDeskMode: boolean;
  startStepIndex?: number;
  onClose: () => void;
  onCompleteReset: () => void;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  theme,
  data,
  isDeskMode,
  startStepIndex = 0,
  onClose,
  onCompleteReset,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);

  if (!data) return null;

  const exercises = isDeskMode ? data.deskExercises : data.openSpaceExercises;
  const currentExercise = exercises[currentStepIndex] ?? exercises[0];

  useEffect(() => {
    setCurrentStepIndex(startStepIndex);
    setSecondsLeft(30);
    setIsPlaying(false);
  }, [data?.id, isDeskMode, startStepIndex]);

  useEffect(() => {
    if (!isPlaying) return;

    if (secondsLeft > 0) {
      const timer = setTimeout(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    if (currentStepIndex < exercises.length - 1) {
      setCurrentStepIndex((prev) => prev + 1);
      setSecondsLeft(30);
      return;
    }

    setIsPlaying(false);
    onCompleteReset();
  }, [isPlaying, secondsLeft, currentStepIndex, exercises.length, onCompleteReset]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    setCurrentStepIndex(startStepIndex);
    setSecondsLeft(30);
    setIsPlaying(true);
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCurrentStepIndex(0);
    setSecondsLeft(30);
    onClose();
  };

  return (
    <View style={[styles.sheetContainer, { backgroundColor: theme.cardBg }]}>
      <TouchableOpacity style={styles.closeButton} onPress={handleClose}>
        <Text style={[styles.closeText, { color: theme.textSecondary }]}>✕</Text>
      </TouchableOpacity>

      {!isPlaying ? (
        <View style={styles.contentWrapper}>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{data.displayName}</Text>
          <Text style={[styles.insightText, { color: theme.textSecondary }]}>{data.insight}</Text>

          <TouchableOpacity
            style={[styles.actionButton, { backgroundColor: theme.accent }]}
            onPress={handleStart}
          >
            <Text style={styles.actionText}>⚡ Start Reset ({exercises.length} Steps)</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentWrapper}>
          <View style={styles.timerHeader}>
            <Text style={[styles.stepLabel, { color: theme.accent }]}>
              Step {currentStepIndex + 1} of {exercises.length}
            </Text>
            <Text style={[styles.timerCountdown, { color: theme.textPrimary }]}>
              {secondsLeft}s
            </Text>
          </View>

          <Text style={[styles.exerciseTitle, { color: theme.textPrimary }]}>
            {currentExercise.title}
          </Text>
          <Text style={[styles.instructionText, { color: theme.textSecondary }]}>
            {currentExercise.steps.join(' ')}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 220,
    elevation: 10,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  contentWrapper: {
    marginTop: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  actionButton: {
    paddingVertical: 14,
    borderRadius: 16,
    alignItems: 'center',
  },
  actionText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '700',
  },
  timerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepLabel: {
    fontSize: 13,
    fontWeight: '700',
  },
  timerCountdown: {
    fontSize: 28,
    fontWeight: '800',
  },
  exerciseTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
  },
  instructionText: {
    fontSize: 14,
    lineHeight: 20,
  },
});