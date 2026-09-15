import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  StatusBar,
  Alert,
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';

import { deskTheme, openSpaceTheme } from './src/constants/themes';
import { type BodyView, type BodyZoneId } from './src/constants/data';

import { BioMatrixCanvas } from './src/components/BioMatrixCanvas';
import { ExercisePlayerSheet } from './src/components/ExercisePlayerSheet';
import { WeeklyReviewScreen } from './src/components/WeeklyReviewScreen';
import { registerGeminiBackgroundTask } from './src/services/geminiService';
import AuthScreen, { type StoredUser } from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function App() {
  const [authRoute, setAuthRoute] = useState<'checking' | 'auth' | 'onboarding' | 'home'>('checking');
  const [currentUser, setCurrentUser] = useState<StoredUser | null>(null);
  const [isDeskMode, setIsDeskMode] = useState<boolean>(true);
  const [bodyView, setBodyView] = useState<BodyView>('front');
  const [selectedZone, setSelectedZone] = useState<BodyZoneId | null>(null);
  const [recommendedExerciseIds, setRecommendedExerciseIds] = useState<string[] | null>(null);
  const [streakCount, setStreakCount] = useState<number>(0);
  const [isIntroModalVisible, setIsIntroModalVisible] = useState(false);
  const [isOnboardingVisible, setIsOnboardingVisible] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState<'gender' | 'style'>('gender');
  const [selectedGender, setSelectedGender] = useState<'female' | 'male' | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<'seated' | 'open-space' | null>(null);
  const [isWeeklyReviewVisible, setIsWeeklyReviewVisible] = useState(false);

  const activeTheme = isDeskMode ? deskTheme : openSpaceTheme;

  const loadStoredUser = async () => {
    try {
      const savedUser = await AsyncStorage.getItem('@unkink_user');
      if (!savedUser) {
        setAuthRoute('auth');
        return;
      }

      const parsedUser = JSON.parse(savedUser) as StoredUser;
      setCurrentUser(parsedUser);

      const onboardingCompleted = await AsyncStorage.getItem('@deskreset_onboarding_completed');
      const shouldShowOnboarding = onboardingCompleted !== 'true';
      setAuthRoute(shouldShowOnboarding ? 'onboarding' : 'home');
    } catch (error) {
      console.error('Failed to load stored user:', error);
      setAuthRoute('auth');
    }
  };

  useEffect(() => {
    loadStoredUser();
  }, []);

  useEffect(() => {
    if (authRoute !== 'home') {
      return;
    }

    loadStreak();
    loadPreferences();
    requestNotificationPermissions();
    registerGeminiBackgroundTask().catch((error) => {
      console.error('Failed to register Gemini background task:', error);
    });
  }, [authRoute]);

  const loadStreak = async () => {
    try {
      const savedStreak = await AsyncStorage.getItem('@deskreset_streak');
      if (savedStreak !== null) {
        setStreakCount(parseInt(savedStreak, 10));
      }
    } catch (e) {
      console.error('Failed to load streak', e);
    }
  };

  const loadPreferences = async () => {
    try {
      const onboardingCompleted = await AsyncStorage.getItem('@deskreset_onboarding_completed');
      const savedGender = await AsyncStorage.getItem('@deskreset_gender');
      const savedStyle = await AsyncStorage.getItem('@deskreset_style');

      if (savedGender === 'female' || savedGender === 'male') {
        setSelectedGender(savedGender);
      }

      if (savedStyle === 'seated' || savedStyle === 'open-space') {
        setSelectedStyle(savedStyle);
        setIsDeskMode(savedStyle === 'seated');
      }

      if (onboardingCompleted === 'true') {
        setIsOnboardingVisible(false);
      } else {
        setIsOnboardingVisible(false);
      }
    } catch (e) {
      console.error('Failed to load preferences', e);
      setIsOnboardingVisible(false);
    }
  };

  const requestNotificationPermissions = async () => {
    const permission = await Notifications.requestPermissionsAsync();
    if (permission.granted) {
      scheduleWorkplaceReminder();
    }
  };

  const scheduleWorkplaceReminder = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Time to Unkink! ⚡',
        body: 'Take 2 minutes to stretch your neck and relieve screen tension.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 5400,
        repeats: false,
      },
    });
  };

  const handleSelectZone = (zoneId: BodyZoneId, exerciseIds?: string[]) => {
    setSelectedZone(zoneId);
    setRecommendedExerciseIds(exerciseIds ?? null);
  };

  const handleCompleteReset = async () => {
    const newStreak = streakCount + 1;
    setStreakCount(newStreak);
    try {
      await AsyncStorage.setItem('@deskreset_streak', newStreak.toString());
    } catch (e) {
      console.error('Failed to save streak', e);
    }
    setSelectedZone(null);
    Alert.alert('Reset Complete! 🎉', 'Your daily streak has been updated.');
  };

  const handleOnboardingSubmit = async () => {
    if (onboardingStep === 'gender') {
      if (!selectedGender) {
        Alert.alert('Please choose an option to continue.');
        return;
      }
      setOnboardingStep('style');
      return;
    }

    if (!selectedStyle) {
      Alert.alert('Please choose an option to continue.');
      return;
    }

    try {
      await AsyncStorage.setItem('@deskreset_gender', selectedGender ?? 'female');
      await AsyncStorage.setItem('@deskreset_style', selectedStyle);
      await AsyncStorage.setItem('@deskreset_onboarding_completed', 'true');
      setIsDeskMode(selectedStyle === 'seated');
      setIsOnboardingVisible(false);
    } catch (e) {
      console.error('Failed to save onboarding preferences', e);
    }
  };

  const handleGenderPress = (value: 'female' | 'male') => {
    setSelectedGender(value);
    setOnboardingStep('style');
  };

  const handleStylePress = async (value: 'seated' | 'open-space') => {
    setSelectedStyle(value);
    try {
      await AsyncStorage.setItem('@deskreset_gender', selectedGender ?? 'female');
      await AsyncStorage.setItem('@deskreset_style', value);
      await AsyncStorage.setItem('@deskreset_onboarding_completed', 'true');
      setIsDeskMode(value === 'seated');
      setIsOnboardingVisible(false);
    } catch (e) {
      console.error('Failed to save onboarding preferences', e);
    }
  };

  const handleOnboardingBack = () => {
    if (onboardingStep === 'style') {
      setOnboardingStep('gender');
    }
  };

  const handleAuthSuccess = async (user: StoredUser, isNewUser: boolean) => {
    setCurrentUser(user);
    await AsyncStorage.setItem('@unkink_user', JSON.stringify(user));

    const onboardingCompleted = await AsyncStorage.getItem('@deskreset_onboarding_completed');
    if (isNewUser) {
      await AsyncStorage.setItem('@deskreset_onboarding_completed', 'false');
    }

    setAuthRoute(isNewUser || onboardingCompleted !== 'true' ? 'onboarding' : 'home');
  };

  const handleOnboardingComplete = async () => {
    await AsyncStorage.setItem('@deskreset_onboarding_completed', 'true');
    setAuthRoute('home');
  };

  if (authRoute === 'checking') {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={styles.loadingContainer} edges={['top', 'bottom']}>
          <ActivityIndicator size="large" color="#00E5FF" />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (authRoute === 'auth') {
    return (
      <SafeAreaProvider>
        <AuthScreen
          onAuthSuccess={handleAuthSuccess}
          onGoToOnboarding={() => setAuthRoute('onboarding')}
          onGoToHome={() => setAuthRoute('home')}
        />
      </SafeAreaProvider>
    );
  }

  if (authRoute === 'onboarding') {
    return (
      <SafeAreaProvider>
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView
        style={[styles.container, { backgroundColor: activeTheme.background }]}
        edges={['top', 'bottom']}
      >
        <StatusBar barStyle={isDeskMode ? 'light-content' : 'dark-content'} />

        <BioMatrixCanvas
          isDeskMode={isDeskMode}
          view={bodyView}
          selectedZone={selectedZone}
          streakCount={streakCount}
          onSelectZone={handleSelectZone}
          onToggleMode={setIsDeskMode}
          onToggleView={setBodyView}
          onOpenWeeklyReview={() => setIsWeeklyReviewVisible(true)}
        />

        {selectedZone ? (
          <ExercisePlayerSheet
            zoneId={selectedZone}
            view={bodyView}
            isDeskMode={isDeskMode}
            exerciseIds={recommendedExerciseIds ?? undefined}
            onClose={() => {
              setSelectedZone(null);
              setRecommendedExerciseIds(null);
            }}
            onComplete={handleCompleteReset}
          />
        ) : null}

        {isWeeklyReviewVisible ? (
          <WeeklyReviewScreen
            userId={currentUser?.uid ?? 'demo-user'}
            onClose={() => setIsWeeklyReviewVisible(false)}
          />
        ) : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0C10',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#090A0F',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  modalCard: {
    width: '100%',
    borderRadius: 22,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 8,
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 4,
  },
  closeText: {
    fontSize: 18,
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  modalBody: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 12,
  },
  modalHint: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    marginBottom: 18,
  },
  questionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 12,
  },
  optionRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 6,
  },
  optionButton: {
    flex: 1,
    borderRadius: 12,
    minHeight: 116,
    paddingVertical: 16,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionText: {
    fontSize: 15,
    fontWeight: '700',
  },
  buttonRow: {
    marginTop: 20,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: 12,
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 0.4,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '700',
  },
  okButton: {
    borderRadius: 12,
    minHeight: 50,
    paddingVertical: 12,
    paddingHorizontal: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  okButtonText: {
    color: '#0F172A',
    fontSize: 15,
    fontWeight: '800',
  },
  exerciseList: {
    gap: 10,
    marginTop: 12,
  },
  exerciseButton: {
    borderRadius: 12,
    minHeight: 48,
    paddingVertical: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  exerciseButtonText: {
    color: '#0F172A',
    fontSize: 14,
    fontWeight: '700',
  },
});