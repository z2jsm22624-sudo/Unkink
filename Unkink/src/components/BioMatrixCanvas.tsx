import React, { useEffect, useState } from 'react';
import {
  PanResponder,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import { deskTheme, openSpaceTheme } from '../constants/themes';
import {
  EXERCISE_LIBRARY,
  type BodyZoneId,
  type BodyView,
} from '../constants/data';
interface BioMatrixCanvasProps {
  isDeskMode: boolean;
  view: BodyView;
  selectedZone: BodyZoneId | null;
  streakCount: number;
  onSelectZone: (zoneId: BodyZoneId, exerciseIds?: string[]) => void;
  onToggleMode: (value: boolean) => void;
  onToggleView: (nextView: BodyView) => void;
  onOpenWeeklyReview: () => void;
}

type SuggestionCard = { text: string; zoneId: BodyZoneId };

const COMPLAINT_SUFFIXES = ['tension', 'tightness', 'strain', 'fatigue', 'stiffness'];

// Builds one candidate card per exercise category so suggestions reflect the real exercise database.
const buildSuggestionPool = (isDeskMode: boolean): SuggestionCard[] => {
  const seen = new Set<string>();
  const pool: SuggestionCard[] = [];

  EXERCISE_LIBRARY.filter((exercise) => exercise.isDeskMode === isDeskMode).forEach((exercise) => {
    const key = `${exercise.zoneId}-${exercise.category}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);

    const suffix = COMPLAINT_SUFFIXES[Math.floor(Math.random() * COMPLAINT_SUFFIXES.length)];
    pool.push({ text: `${exercise.category} ${suffix}`, zoneId: exercise.zoneId });
  });

  return pool;
};

const ZONE_KEYWORD_MAP: Array<{ zoneId: BodyZoneId; keywords: string[] }> = [
  { zoneId: 'wrists', keywords: ['wrist', 'forearm', 'mouse', 'keyboard', 'grip', 'carpal'] },
  { zoneId: 'lowerBody', keywords: ['hip', 'hips', 'leg', 'legs', 'glute', 'calf', 'hamstring', 'quad', 'lower body'] },
  { zoneId: 'torso', keywords: ['lower back', 'mid back', 'spine', 'core', 'back pain', 'hunching', 'twist', 'rotation'] },
  { zoneId: 'shoulders', keywords: ['shoulder', 'shoulders', 'upper back', 'arm', 'arms', 'elbow', 'chest', 'rounded', 'reach', 'eye', 'eyes', 'vision'] },
  { zoneId: 'neck', keywords: ['neck', 'cervical', 'chin', 'headache', 'head', 'throat', 'stiff neck', 'tight neck'] },
];

const getModeSpecificSuggestions = (isDeskMode: boolean): SuggestionCard[] => {
  const pool = buildSuggestionPool(isDeskMode);
  const shuffled = [...pool].sort(() => Math.random() - 0.5);

  const picked: SuggestionCard[] = [];
  const usedZones = new Set<BodyZoneId>();
  for (const card of shuffled) {
    if (usedZones.has(card.zoneId)) {
      continue;
    }
    usedZones.add(card.zoneId);
    picked.push(card);
    if (picked.length === 3) {
      break;
    }
  }

  return picked.length > 0 ? picked : shuffled.slice(0, 3);
};

const getZoneForSuggestion = (text: string, isDeskMode: boolean): BodyZoneId | null => {
  const normalized = text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const trimmed = normalized.trim();

  const explicitMatch = getModeSpecificSuggestions(isDeskMode).find((item) => {
    return trimmed.includes(item.text.toLowerCase()) || item.text.toLowerCase().includes(trimmed);
  });

  if (explicitMatch) {
    return explicitMatch.zoneId;
  }

  for (const rule of ZONE_KEYWORD_MAP) {
    if (rule.keywords.some((keyword) => trimmed.includes(keyword))) {
      return rule.zoneId;
    }
  }

  return null;
};

const getRandomExerciseIdsForZone = (zoneId: BodyZoneId, isDeskMode: boolean): string[] => {
  const pool = EXERCISE_LIBRARY.filter(
    (exercise) => exercise.zoneId === zoneId && exercise.isDeskMode === isDeskMode,
  );

  if (pool.length === 0) {
    return [];
  }

  const randomIndex = Math.floor(Math.random() * pool.length);
  return [pool[randomIndex].id];
};

const getExerciseIdsForSuggestion = (text: string, isDeskMode: boolean): string[] => {
  const zoneId = getZoneForSuggestion(text, isDeskMode);
  if (!zoneId) {
    return [];
  }

  return getRandomExerciseIdsForZone(zoneId, isDeskMode);
};

export const BioMatrixCanvas: React.FC<BioMatrixCanvasProps> = ({
  isDeskMode,
  view,
  selectedZone,
  streakCount,
  onSelectZone,
  onToggleMode,
  onToggleView,
  onOpenWeeklyReview,
}) => {
  const [prompt, setPrompt] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [typedIntro, setTypedIntro] = useState('');
  const [suggestions, setSuggestions] = useState<SuggestionCard[]>(() => getModeSpecificSuggestions(true));
  const activeTheme = isDeskMode ? deskTheme : openSpaceTheme;
  const introText = 'This is your Unkink manager. How are you feeling?';
  const introPauseMs = 500;
  const typingDelayMs = 42;
  const firstSentence = 'This is your Unkink manager.';
  const secondSentence = 'How are you feeling?';
  const toggleFlip = useSharedValue(isDeskMode ? 0 : 180);
  const palette = {
    background: activeTheme.background,
    panel: isDeskMode ? 'rgba(255,255,255,0.03)' : 'rgba(255,255,255,0.48)',
    border: isDeskMode ? 'rgba(255,255,255,0.08)' : 'rgba(34, 96, 162, 0.18)',
    primary: activeTheme.textPrimary,
    secondary: activeTheme.textSecondary,
    accent: activeTheme.accent,
    highlight: activeTheme.highlight,
    toggleBg: activeTheme.toggleBg,
    selectedBg: isDeskMode ? 'rgba(0,229,255,0.14)' : 'rgba(93,184,255,0.20)',
    selectedBorder: isDeskMode ? 'rgba(0,229,255,0.45)' : 'rgba(58, 136, 212, 0.42)',
    inputBg: isDeskMode ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.66)',
    inputBorder: isDeskMode ? 'rgba(255,255,255,0.08)' : 'rgba(28, 92, 153, 0.18)',
    inputText: isDeskMode ? '#EAFBFF' : '#163F66',
    chipText: isDeskMode ? '#D9F6FF' : '#1D4D73',
    glow: isDeskMode ? 'rgba(0,229,255,0.31)' : 'rgba(93,184,255,0.30)',
  };

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let firstIndex = 0;
    let secondIndex = 0;

    const typeFirstSentence = () => {
      firstIndex += 1;
      setTypedIntro(firstSentence.slice(0, firstIndex));

      if (firstIndex < firstSentence.length) {
        timer = setTimeout(typeFirstSentence, typingDelayMs);
        return;
      }

      timer = setTimeout(() => {
        setTypedIntro(`${firstSentence} `);
        const typeSecondSentence = () => {
          secondIndex += 1;
          setTypedIntro(`${firstSentence} ${secondSentence.slice(0, secondIndex)}`);

          if (secondIndex < secondSentence.length) {
            timer = setTimeout(typeSecondSentence, typingDelayMs);
          }
        };

        timer = setTimeout(typeSecondSentence, introPauseMs);
      }, introPauseMs);
    };

    timer = setTimeout(typeFirstSentence, 120);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [introText]);

  useEffect(() => {
    toggleFlip.value = withTiming(isDeskMode ? 0 : 180, {
      duration: 420,
      easing: Easing.inOut(Easing.cubic),
    });
  }, [isDeskMode, toggleFlip]);

  useEffect(() => {
    setSuggestions(getModeSpecificSuggestions(isDeskMode));
  }, [isDeskMode]);

  const handleModeFlip = (nextValue?: boolean) => {
    const nextMode = typeof nextValue === 'boolean' ? nextValue : !isDeskMode;
    if (nextMode === isDeskMode) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onToggleMode(nextMode);
  };

  const toggleCardStyle = useAnimatedStyle(() => ({
    transform: [{ perspective: 1200 }, { rotateY: `${toggleFlip.value}deg` }],
    transformStyle: 'preserve-3d',
  }));

  const modeSwipeResponder = PanResponder.create({
    onMoveShouldSetPanResponder: (_, gestureState) =>
      Math.abs(gestureState.dx) > 18 && Math.abs(gestureState.dx) > Math.abs(gestureState.dy),
    onPanResponderRelease: (_, gestureState) => {
      if (Math.abs(gestureState.dx) < 40) return;
      handleModeFlip(gestureState.dx > 0 ? true : false);
    },
  });

  const handleRecommend = async (value?: string) => {
    const nextPrompt = (value ?? prompt).trim();
    if (!nextPrompt) return;

    const selectedSuggestion = suggestions.find((item) => item.text === nextPrompt);
    const zoneId = selectedSuggestion?.zoneId ?? getZoneForSuggestion(nextPrompt, isDeskMode) ?? selectedZone ?? 'neck';
    const selectedExerciseIds = getRandomExerciseIdsForZone(zoneId, isDeskMode);
    setPrompt(nextPrompt);
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const response = await fetch('/api/recommend-routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: nextPrompt,
          mode: isDeskMode ? 'desk' : 'open',
          view,
          selectedZone: zoneId,
          mappedExerciseIds: selectedExerciseIds,
        }),
      });

      if (!response.ok) {
        throw new Error(`Recommend API failed: ${response.status}`);
      }

      const payload = await response.json();
      const exerciseIds = Array.isArray(payload?.exerciseIds)
        ? payload.exerciseIds.filter((id: unknown): id is string => typeof id === 'string')
        : [];

      if (exerciseIds.length > 0) {
        const firstExercise = EXERCISE_LIBRARY.find((exercise) => exercise.id === exerciseIds[0]);
        if (firstExercise) {
          onSelectZone(firstExercise.zoneId, [exerciseIds[0]]);
          return;
        }
      }

      if (selectedExerciseIds.length > 0) {
        const mappedExercise = EXERCISE_LIBRARY.find((exercise) => exercise.id === selectedExerciseIds[0]);
        if (mappedExercise) {
          onSelectZone(mappedExercise.zoneId, selectedExerciseIds);
          return;
        }
      }

      const fallbackExercise =
        EXERCISE_LIBRARY.find((exercise) => exercise.id === selectedExerciseIds[0]) ??
        EXERCISE_LIBRARY.find((exercise) => exercise.zoneId === zoneId && exercise.isDeskMode === isDeskMode) ??
        EXERCISE_LIBRARY.find((exercise) => exercise.zoneId === zoneId) ??
        EXERCISE_LIBRARY[0];

      if (fallbackExercise) {
        onSelectZone(fallbackExercise.zoneId, [fallbackExercise.id]);
      }
    } catch (error) {
      console.warn('Recommendation fallback used:', error);
      const fallbackExercise =
        EXERCISE_LIBRARY.find((exercise) => exercise.id === selectedExerciseIds[0]) ??
        EXERCISE_LIBRARY.find((exercise) => exercise.zoneId === zoneId && exercise.isDeskMode === isDeskMode) ??
        EXERCISE_LIBRARY.find((exercise) => exercise.zoneId === zoneId) ??
        EXERCISE_LIBRARY[0];

      if (fallbackExercise) {
        onSelectZone(fallbackExercise.zoneId, [fallbackExercise.id]);
      }
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: palette.primary }]}>UNKINK AI</Text>

          <Pressable onPress={onOpenWeeklyReview} style={styles.streakButton}>
            <Text style={styles.streakIcon}>🔥</Text>
            <Text style={styles.streakCount}>{streakCount}</Text>
          </Pressable>
        </View>

        <View style={styles.headerControls}>
          <Pressable
            onPress={() => handleModeFlip()}
            style={[
              styles.toggleCard,
              {
                backgroundColor: palette.toggleBg,
                borderColor: palette.selectedBorder,
                shadowColor: palette.accent,
              },
            ]}
            accessibilityRole="button"
            accessibilityLabel={`Toggle mode. Current mode is ${isDeskMode ? 'Desk Mode' : 'Open Space'}`}
            {...modeSwipeResponder.panHandlers}
          >
            <Animated.View style={[styles.toggleCardInner, toggleCardStyle]}>
              <View
                style={[
                  styles.toggleFace,
                  styles.toggleFaceFront,
                  { zIndex: isDeskMode ? 2 : 1 },
                ]}
              >
                <Text style={[styles.toggleLabel, { color: palette.secondary }]}>MODE</Text>
                <Text style={[styles.toggleValue, { color: palette.primary }]}>DESK</Text>
              </View>

              <View
                style={[
                  styles.toggleFace,
                  styles.toggleFaceBack,
                  { zIndex: isDeskMode ? 1 : 2 },
                ]}
              >
                <Text style={[styles.toggleLabel, { color: palette.secondary }]}>MODE</Text>
                <Text style={[styles.toggleValue, { color: palette.primary }]}>OPEN</Text>
              </View>
            </Animated.View>
          </Pressable>
        </View>
      </View>

      <View
        style={[
          styles.heroPanel,
          {
            backgroundColor: palette.panel,
            borderColor: palette.border,
            shadowColor: palette.accent,
          },
        ]}
      >
        <Text style={[styles.promptTitle, { color: palette.primary }]}>{typedIntro}</Text>

        <View style={styles.inputRow}>
          <TextInput
            value={prompt}
            onChangeText={setPrompt}
            placeholder="How is your body feeling?"
            placeholderTextColor={palette.secondary}
            style={[
              styles.input,
              {
                backgroundColor: palette.inputBg,
                borderColor: palette.inputBorder,
                color: palette.inputText,
              },
            ]}
            autoCapitalize="sentences"
            autoCorrect={false}
            returnKeyType="done"
            onSubmitEditing={() => handleRecommend()}
          />

          <Pressable
            onPress={() => handleRecommend()}
            disabled={isScanning}
            style={[
              styles.submitButton,
              {
                backgroundColor: isDeskMode ? '#0F172A' : '#A8D8FF',
              },
              isScanning && styles.submitButtonDisabled,
            ]}
          >
            <Text style={[styles.submitText, { color: isDeskMode ? '#EAFBFF' : '#0B1F33' }]}>
              {isScanning ? 'Scanning' : 'Send'}
            </Text>
          </Pressable>
        </View>

        {suggestions.length > 0 ? (
          <View style={styles.cardRow}>
            {suggestions.map((item) => (
              <Pressable
                key={item.text}
                onPress={() => handleRecommend(item.text)}
                style={[
                  styles.card,
                  {
                    backgroundColor: palette.inputBg,
                    borderColor: palette.inputBorder,
                  },
                ]}
              >
                <Text style={[styles.cardText, { color: palette.chipText }]}>{item.text}</Text>
              </Pressable>
            ))}
          </View>
        ) : (
          <View style={styles.cardRow}>
            {Array.from({ length: 3 }).map((_, index) => (
              <View
                key={`skeleton-${index}`}
                style={[
                  styles.card,
                  styles.skeletonCard,
                  { backgroundColor: palette.inputBg, borderColor: palette.inputBorder },
                ]}
              />
            ))}
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 24,
  },
  header: {
    marginTop: 4,
    marginBottom: 18,
    gap: 14,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  streakButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.2)',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 6,
  },
  streakIcon: {
    fontSize: 14,
  },
  streakCount: {
    color: '#EAFBFF',
    fontSize: 12,
    fontWeight: '700',
  },
  headerControls: {
    width: '100%',
    alignItems: 'stretch',
  },
  toggleCard: {
    width: '100%',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  toggleCardInner: {
    width: '100%',
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  toggleFace: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backfaceVisibility: 'hidden',
    borderRadius: 14,
    backgroundColor: 'transparent',
  },
  toggleFaceFront: {
    transform: [{ rotateY: '0deg' }, { scaleX: 1 }],
  },
  toggleFaceBack: {
    transform: [{ rotateY: '180deg' }, { scaleX: -1 }],
  },
  toggleLabel: {
    fontSize: 9,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 6,
  },
  toggleValue: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  heroPanel: {
    flex: 1,
    borderRadius: 24,
    borderWidth: 1,
    padding: 18,
    justifyContent: 'center',
    overflow: 'hidden',
    shadowOpacity: 0.16,
    shadowRadius: 18,
    elevation: 6,
  },
  promptTitle: {
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 28,
    marginBottom: 16,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    zIndex: 2,
  },
  input: {
    flex: 1,
    minHeight: 54,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 1,
    fontSize: 16,
  },
  submitButton: {
    width: 88,
    height: 54,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontSize: 15,
    fontWeight: '800',
  },
  cardRow: {
    marginTop: 22,
    gap: 10,
    zIndex: 2,
  },
  card: {
    borderRadius: 18,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 52,
    justifyContent: 'center',
  },
  cardText: {
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  skeletonCard: {
    opacity: 0.45,
    minHeight: 52,
  },
  inlineError: {
    marginTop: 10,
    fontSize: 10,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
});
