import React from 'react';
import { Pressable, SafeAreaView, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';

const THEME = {
  background: '#090A0F',
  card: 'rgba(255,255,255,0.05)',
  border: 'rgba(255,255,255,0.12)',
  textPrimary: '#F3F7FF',
  textSecondary: '#9AA7BA',
  accentCyan: '#00E5FF',
  accentMint: '#5EE28D',
};

export type OnboardingScreenProps = {
  onComplete?: () => void;
};

const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.kicker}>Welcome to Unkink</Text>
        <Text style={styles.title}>Set up your micro-recovery routine.</Text>
        <Text style={styles.subtitle}>
          Choose your setup, protect your posture, and keep your workflow flowing.
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your workspace</Text>
          <Text style={styles.cardBody}>Desk mode is ideal for seated work. Open-space mode fits standing or mobile sessions.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your rhythm</Text>
          <Text style={styles.cardBody}>We’ll nudge you with short, targeted recovery moments when your posture needs a reset.</Text>
        </View>

        <Pressable style={styles.primaryButton} onPress={onComplete}>
          <Text style={styles.primaryButtonText}>Continue</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: THEME.background,
  },
  content: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 32,
  },
  kicker: {
    color: THEME.accentMint,
    fontSize: 12,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    fontWeight: '700',
    marginBottom: 12,
  },
  title: {
    color: THEME.textPrimary,
    fontSize: 32,
    lineHeight: 38,
    fontWeight: '800',
    marginBottom: 10,
  },
  subtitle: {
    color: THEME.textSecondary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 24,
  },
  card: {
    backgroundColor: THEME.card,
    borderWidth: 1,
    borderColor: THEME.border,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
  },
  cardTitle: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardBody: {
    color: THEME.textSecondary,
    fontSize: 14,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: THEME.accentCyan,
    borderRadius: 16,
    height: 56,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  primaryButtonText: {
    color: '#071317',
    fontWeight: '800',
    fontSize: 16,
  },
});

export default OnboardingScreen;
