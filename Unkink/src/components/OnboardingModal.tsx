import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface UserProfile {
  focusZones: string[];
  defaultDeskMode: boolean;
}

interface OnboardingProps {
  visible: boolean;
  onComplete: (userData: UserProfile) => void;
}

export const OnboardingModal: React.FC<OnboardingProps> = ({ visible, onComplete }) => {
  const [step, setStep] = useState<number>(1);
  const [focusZones, setFocusZones] = useState<string[]>([]);
  const [isDeskMode, setIsDeskMode] = useState<boolean>(true);

  const toggleZone = (zone: string) => {
    setFocusZones((prev) =>
      prev.includes(zone) ? prev.filter((z) => z !== zone) : [...prev, zone],
    );
  };

  const handleFinish = async () => {
    const profileData: UserProfile = {
      focusZones,
      defaultDeskMode: isDeskMode,
    };

    try {
      await AsyncStorage.setItem('@unkink_onboarded', 'true');
      await AsyncStorage.setItem('@unkink_user_profile', JSON.stringify(profileData));
    } catch (error) {
      console.error('Failed to save onboarding data', error);
    }

    onComplete(profileData);
  };

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.container}>
          {step === 1 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Welcome to Unkink 🧘‍♀️</Text>
              <Text style={styles.subtitle}>
                Quick, targeted micro-recoveries designed to reset your body right at your desk.
              </Text>

              <TouchableOpacity style={styles.button} onPress={() => setStep(2)}>
                <Text style={styles.buttonText}>Get Started</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 2 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Where do you feel tension?</Text>
              <Text style={styles.subtitle}>Select the areas you want to reset most often.</Text>

              <View style={styles.chipContainer}>
                {['Neck & Shoulders', 'Wrists & Forearms', 'Torso & Spine'].map((zone) => {
                  const selected = focusZones.includes(zone);
                  return (
                    <TouchableOpacity
                      key={zone}
                      style={[styles.chip, selected && styles.chipSelected]}
                      onPress={() => toggleZone(zone)}
                    >
                      <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{zone}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              <TouchableOpacity style={styles.button} onPress={() => setStep(3)}>
                <Text style={styles.buttonText}>Next</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === 3 && (
            <View style={styles.stepContainer}>
              <Text style={styles.title}>Your Primary Setup</Text>
              <Text style={styles.subtitle}>Do you usually stretch while seated at a desk?</Text>

              <View style={styles.optionRow}>
                <TouchableOpacity
                  style={[styles.card, isDeskMode && styles.cardSelected]}
                  onPress={() => setIsDeskMode(true)}
                >
                  <Text style={styles.cardTitle}>⚡ Desk Mode</Text>
                  <Text style={styles.cardSub}>Seated stretches requiring minimal space</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.card, !isDeskMode && styles.cardSelected]}
                  onPress={() => setIsDeskMode(false)}
                >
                  <Text style={styles.cardTitle}>🌳 Open Space</Text>
                  <Text style={styles.cardSub}>Standing stretches to step away</Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity style={styles.button} onPress={handleFinish}>
                <Text style={styles.buttonText}>Start Unkinking</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    padding: 24,
  },
  container: {
    backgroundColor: '#121212',
    borderRadius: 24,
    padding: 24,
  },
  stepContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#FFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#AAA',
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    backgroundColor: '#00E676',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 24,
    marginTop: 24,
  },
  buttonText: {
    color: '#000',
    fontWeight: 'bold',
    fontSize: 16,
  },
  chipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginBottom: 20,
  },
  chip: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#444',
  },
  chipSelected: {
    backgroundColor: '#00E676',
    borderColor: '#00E676',
  },
  chipText: {
    color: '#AAA',
  },
  chipTextSelected: {
    color: '#000',
    fontWeight: 'bold',
  },
  optionRow: {
    width: '100%',
    gap: 16,
    marginBottom: 20,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333',
    backgroundColor: '#1E1E1E',
  },
  cardSelected: {
    borderColor: '#00E676',
    backgroundColor: '#1A2E22',
  },
  cardTitle: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSub: {
    color: '#888',
    fontSize: 14,
  },
});

export default OnboardingModal;