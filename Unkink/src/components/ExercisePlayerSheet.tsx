import React, { useEffect, useMemo, useState } from 'react';
import {
  Animated,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native';
import * as Haptics from 'expo-haptics';

import {
  EXERCISE_LIBRARY,
  getExercisesForZone,
  type BodyView,
  type BodyZoneId,
  type ExerciseItem,
} from '../constants/data';

interface ExercisePlayerSheetProps {
  zoneId: BodyZoneId;
  view: BodyView;
  isDeskMode: boolean;
  exerciseIds?: string[];
  onClose: () => void;
  onComplete: () => void;
}

const DEFAULT_SHEET_HEIGHT = 340;

export const ExercisePlayerSheet: React.FC<ExercisePlayerSheetProps> = ({
  zoneId,
  view,
  isDeskMode,
  exerciseIds,
  onClose,
  onComplete,
}) => {
  const { height: screenHeight } = useWindowDimensions();
  const sheetHeight = Math.min(screenHeight * 0.78, DEFAULT_SHEET_HEIGHT + 80);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(30);
  const [translateY] = useState(new Animated.Value(320));

  const exercises = useMemo(() => {
    const requestedExercises = exerciseIds && exerciseIds.length > 0
      ? exerciseIds
          .map((exerciseId) => EXERCISE_LIBRARY.find((exercise) => exercise.id === exerciseId))
          .filter((exercise): exercise is ExerciseItem => Boolean(exercise))
      : [];

    if (requestedExercises.length > 0) {
      return requestedExercises;
    }

    return getExercisesForZone(zoneId, isDeskMode, view);
  }, [zoneId, isDeskMode, view, exerciseIds]);

  const activeExercise = exercises[currentIndex] ?? exercises[0];

  useEffect(() => {
    Animated.spring(translateY, {
      toValue: 0,
      useNativeDriver: true,
      tension: 50,
      friction: 11,
    }).start();
  }, []);

  useEffect(() => {
    setCurrentIndex(0);
    setSecondsLeft(30);
    setIsRunning(false);
  }, [zoneId, view, isDeskMode]);

  useEffect(() => {
    if (!isRunning || !activeExercise) {
      return;
    }

    const timer = setTimeout(() => {
      if (secondsLeft > 1) {
        setSecondsLeft((prev) => prev - 1);
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (currentIndex < exercises.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setSecondsLeft(30);
        return;
      }

      setIsRunning(false);
      onComplete();
    }, 1000);

    return () => clearTimeout(timer);
  }, [isRunning, secondsLeft, activeExercise, currentIndex, exercises.length, onComplete]);

  const handleStart = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setCurrentIndex(0);
    setSecondsLeft(30);
    setIsRunning(true);
  };

  const handlePause = () => {
    Haptics.selectionAsync();
    setIsRunning(false);
  };

  const handleClose = () => {
    Haptics.selectionAsync();
    setIsRunning(false);
    setIsExpanded(false);
    onClose();
  };

  if (!activeExercise) {
    return null;
  }

  return (
    <Animated.View
      style={[
        styles.sheet,
        { height: sheetHeight, transform: [{ translateY }] },
      ]}
    >
      <View style={styles.dragHandle} />

      <View style={styles.headerRow}>
        <View>
          <Text style={styles.sheetCode}>ZONE // {zoneId.toUpperCase()}</Text>
          <Text style={styles.title}>{activeExercise.category}</Text>
        </View>

        <Pressable onPress={handleClose} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
      </View>

      <Text style={styles.description}>{activeExercise.description}</Text>

      <View style={styles.timerCard}>
        <View>
          <Text style={styles.stepLabel}>ACTIVE SET</Text>
          <Text style={styles.stepText}>
            {currentIndex + 1}/{exercises.length}
          </Text>
        </View>

        <Text style={styles.countdown}>{secondsLeft}s</Text>
      </View>

      <Text style={styles.exerciseTitle}>{activeExercise.title}</Text>

      <View style={styles.buttonRow}>
        {!isRunning ? (
          <Pressable style={styles.primaryButton} onPress={handleStart}>
            <Text style={styles.primaryButtonText}>Start reset</Text>
          </Pressable>
        ) : (
          <Pressable style={styles.secondaryButton} onPress={handlePause}>
            <Text style={styles.secondaryButtonText}>Pause</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={styles.instructionsWrap}
        contentContainerStyle={styles.instructionsContent}
        showsVerticalScrollIndicator={false}
        bounces={true}
        scrollEnabled={true}
      >
        <Text style={styles.instructionsHeading}>Instructions</Text>
        {activeExercise.steps.map((step, index) => (
          <View key={`${activeExercise.id}-${index}`} style={styles.stepRow}>
            <Text style={styles.stepNumber}>{index + 1}</Text>
            <Text style={styles.stepTextLine}>{step}</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(14, 17, 20, 0.96)',
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
    borderWidth: 0,
    borderColor: 'transparent',
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 20,
    shadowColor: '#00E5FF',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  dragHandle: {
    width: 42,
    height: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginBottom: 12,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sheetCode: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  title: {
    color: '#F3F8FF',
    fontSize: 22,
    fontWeight: '800',
    marginTop: 6,
  },
  description: {
    color: '#A9B7C9',
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 14,
  },
  timerCard: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepLabel: {
    color: '#8A96A8',
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '700',
  },
  stepText: {
    color: '#F3F8FF',
    fontSize: 16,
    fontWeight: '700',
  },
  countdown: {
    color: '#5EE28D',
    fontSize: 28,
    fontWeight: '800',
  },
  exerciseTitle: {
    color: '#F3F8FF',
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 10,
  },
  buttonRow: {
    marginBottom: 12,
  },
  primaryButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: '#00E5FF',
  },
  primaryButtonText: {
    color: '#09131A',
    fontSize: 14,
    fontWeight: '800',
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.08)',
  },
  secondaryButtonText: {
    color: '#EAF3FF',
    fontSize: 14,
    fontWeight: '700',
  },
  instructionsWrap: {
    flex: 1,
    marginTop: 2,
    minHeight: 120,
  },
  instructionsContent: {
    flexGrow: 1,
    paddingBottom: 18,
  },
  instructionsHeading: {
    color: '#A9B7C9',
    fontSize: 10,
    letterSpacing: 1.5,
    fontWeight: '700',
    marginBottom: 8,
  },
  stepRow: {
    flexDirection: 'row',
    marginBottom: 8,
    alignItems: 'flex-start',
  },
  stepNumber: {
    color: '#00E5FF',
    width: 18,
    fontWeight: '800',
    marginRight: 8,
    marginTop: 2,
  },
  stepTextLine: {
    color: '#DDE9F7',
    fontSize: 12,
    lineHeight: 18,
    flex: 1,
  },
  closeButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
  },
  closeText: {
    color: '#EAF3FF',
    fontSize: 14,
    fontWeight: '700',
  },
});
