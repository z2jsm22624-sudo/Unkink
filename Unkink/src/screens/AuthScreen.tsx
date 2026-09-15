import React, { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import { initializeApp, getApps } from 'firebase/app';
import {
  createUserWithEmailAndPassword,
  getAuth,
  GoogleAuthProvider,
  signInWithCredential,
  signInWithEmailAndPassword,
} from 'firebase/auth';

WebBrowser.maybeCompleteAuthSession();

const THEME = {
  background: '#090A0F',
  panel: 'rgba(255,255,255,0.06)',
  panelStrong: 'rgba(255,255,255,0.1)',
  border: 'rgba(255,255,255,0.12)',
  textPrimary: '#F3F7FF',
  textSecondary: '#9AA7BA',
  accentCyan: '#00E5FF',
  accentMint: '#5EE28D',
  accentRed: '#FF6B7A',
  inputBg: 'rgba(255,255,255,0.04)',
  inputText: '#EAF8FF',
};

const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID ?? '',
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
};

const googleConfig = {
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ?? '',
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID ?? '',
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID ?? '',
};

export type StoredUser = {
  uid: string;
  email: string;
  displayName: string;
};

export type AuthScreenProps = {
  onAuthSuccess?: (user: StoredUser, isNewUser: boolean) => void;
  onGoToOnboarding?: () => void;
  onGoToHome?: () => void;
};

const ensureFirebaseAuth = () => {
  const hasRequiredConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

  if (!hasRequiredConfig) {
    return null;
  }

  if (!getApps().length) {
    initializeApp(firebaseConfig);
  }

  return getAuth();
};

const normalizeEmail = (value: string) => value.trim();

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const AuthScreen: React.FC<AuthScreenProps> = ({
  onAuthSuccess,
  onGoToOnboarding,
  onGoToHome,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: googleConfig.webClientId || 'YOUR_GOOGLE_WEB_CLIENT_ID',
    iosClientId: googleConfig.iosClientId || googleConfig.webClientId || 'YOUR_GOOGLE_IOS_CLIENT_ID',
    androidClientId: googleConfig.androidClientId || googleConfig.webClientId || 'YOUR_GOOGLE_ANDROID_CLIENT_ID',
    webClientId: googleConfig.webClientId || 'YOUR_GOOGLE_WEB_CLIENT_ID',
  });

  useEffect(() => {
    if (response?.type !== 'success') {
      return;
    }

    const { id_token } = response.params;

    if (!id_token) {
      setError('Google sign-in could not complete. Please try again.');
      return;
    }

    const runGoogleAuth = async () => {
      try {
        const auth = ensureFirebaseAuth();

        if (!auth) {
          setError('Add Firebase credentials to your Expo environment to enable Google sign-in.');
          return;
        }

        const credential = GoogleAuthProvider.credential(id_token);
        const result = await signInWithCredential(auth, credential);
        const user = result.user;

        const storedUser: StoredUser = {
          uid: user.uid,
          email: user.email ?? email,
          displayName: user.displayName ?? (user.email ? user.email.split('@')[0] : 'Unkink user'),
        };

        await AsyncStorage.setItem('@unkink_user', JSON.stringify(storedUser));
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        setError(null);
        handleAuthSuccess(storedUser, false);
      } catch (googleError: any) {
        const message = googleError?.message ?? 'Google sign-in failed.';
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    setLoading(true);
    runGoogleAuth();
  }, [response, email]);

  const isSubmitDisabled = loading || !email || !password;

  const submitLabel = useMemo(
    () => (mode === 'signin' ? 'Sign In' : 'Create Account'),
    [mode],
  );

  const handleAuthSuccess = (user: StoredUser, isNewUser: boolean) => {
    if (typeof onAuthSuccess === 'function') {
      onAuthSuccess(user, isNewUser);
      return;
    }

    if (isNewUser) {
      onGoToOnboarding?.();
      console.log('Route to OnboardingScreen');
      return;
    }

    onGoToHome?.();
    console.log('Route to HomeScreen');
  };

  const authenticateWithEmail = async () => {
    const cleanEmail = normalizeEmail(email);

    if (!cleanEmail || !isValidEmail(cleanEmail)) {
      setError('Invalid email format');
      return;
    }

    if (!password || password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    const auth = ensureFirebaseAuth();

    if (!auth) {
      setError('Authentication is not configured yet. Add your Firebase keys to Expo env.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result =
        mode === 'signin'
          ? await signInWithEmailAndPassword(auth, cleanEmail, password)
          : await createUserWithEmailAndPassword(auth, cleanEmail, password);

      const user = result.user;
      const storedUser: StoredUser = {
        uid: user.uid,
        email: user.email ?? cleanEmail,
        displayName: user.displayName ?? cleanEmail.split('@')[0],
      };

      await AsyncStorage.setItem('@unkink_user', JSON.stringify(storedUser));
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      handleAuthSuccess(storedUser, mode === 'signup');
    } catch (authError: any) {
      const message = authError?.message ?? 'Authentication failed.';

      if (message.toLowerCase().includes('invalid-email')) {
        setError('Invalid email format');
      } else if (message.toLowerCase().includes('wrong-password') || message.toLowerCase().includes('password')) {
        setError('Wrong password');
      } else if (message.toLowerCase().includes('email-already-in-use')) {
        setError('An account already exists for this email');
      } else if (message.toLowerCase().includes('user-not-found')) {
        setError('No account found for this email');
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGooglePress = async () => {
    try {
      setError(null);
      setLoading(true);

      if (!request) {
        setError('Google auth is not configured. Add EXPO_PUBLIC_GOOGLE_* values.');
        setLoading(false);
        return;
      }

      await promptAsync();
    } catch (googleError: any) {
      const message = googleError?.message ?? 'Google sign-in failed.';
      setError(message);
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.safeArea}
    >
      <StatusBar barStyle="light-content" backgroundColor={THEME.background} />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.headerWrap}>
          <Text style={styles.appTitle}>Unkink</Text>
          <Text style={styles.subtitle}>Micro-recovery tailored to your workflow.</Text>
        </View>

        <View style={styles.card}>
          <Pressable
            onPress={handleGooglePress}
            style={({ pressed }) => [
              styles.googleButton,
              pressed && styles.pressed,
            ]}
            disabled={loading}
          >
            <View style={styles.googleMarkWrap}>
              <Text style={styles.googleMark}>G</Text>
            </View>
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </Pressable>

          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.dividerLine} />
          </View>

          <View style={styles.modeToggleWrap}>
            <Pressable
              onPress={() => setMode('signin')}
              style={({ pressed }) => [
                styles.modePill,
                mode === 'signin' && styles.modePillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modeText, mode === 'signin' && styles.modeTextActive]}>Sign In</Text>
            </Pressable>

            <Pressable
              onPress={() => setMode('signup')}
              style={({ pressed }) => [
                styles.modePill,
                mode === 'signup' && styles.modePillActive,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.modeText, mode === 'signup' && styles.modeTextActive]}>
                Create Account
              </Text>
            </Pressable>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Email</Text>
            <TextInput
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              placeholder="you@example.com"
              placeholderTextColor={THEME.textSecondary}
              style={styles.input}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.fieldLabel}>Password</Text>
            <TextInput
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              placeholder="Enter your password"
              placeholderTextColor={THEME.textSecondary}
              style={styles.input}
            />
          </View>

          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            onPress={authenticateWithEmail}
            style={({ pressed }) => [
              styles.primaryButton,
              (loading || isSubmitDisabled) && styles.primaryButtonDisabled,
              pressed && styles.pressed,
            ]}
            disabled={loading || isSubmitDisabled}
          >
            {loading ? (
              <ActivityIndicator color="#03141B" />
            ) : (
              <Text style={styles.primaryButtonText}>{submitLabel}</Text>
            )}
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
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
    paddingHorizontal: 22,
    paddingVertical: 48,
  },
  headerWrap: {
    marginBottom: 28,
    alignItems: 'center',
  },
  appTitle: {
    fontSize: 42,
    fontWeight: '800',
    letterSpacing: -1.2,
    color: THEME.textPrimary,
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: THEME.textSecondary,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderColor: THEME.border,
    borderWidth: 1,
    borderRadius: 28,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.22,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  googleButton: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.14)',
    height: 56,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMarkWrap: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  googleMark: {
    color: '#1F2937',
    fontSize: 14,
    fontWeight: '800',
  },
  googleButtonText: {
    color: THEME.textPrimary,
    fontSize: 16,
    fontWeight: '700',
  },
  dividerRow: {
    marginTop: 24,
    marginBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  dividerText: {
    marginHorizontal: 12,
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
  },
  modeToggleWrap: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 14,
    padding: 4,
    marginBottom: 18,
  },
  modePill: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modePillActive: {
    backgroundColor: 'rgba(0, 229, 255, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.28)',
  },
  modeText: {
    color: THEME.textSecondary,
    fontSize: 14,
    fontWeight: '700',
  },
  modeTextActive: {
    color: THEME.accentCyan,
  },
  inputGroup: {
    marginTop: 12,
  },
  fieldLabel: {
    color: THEME.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
    letterSpacing: 0.4,
  },
  input: {
    backgroundColor: THEME.inputBg,
    borderColor: 'rgba(255,255,255,0.12)',
    borderWidth: 1,
    borderRadius: 14,
    height: 52,
    paddingHorizontal: 14,
    color: THEME.inputText,
    fontSize: 15,
  },
  errorBanner: {
    marginTop: 16,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 107, 122, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 122, 0.28)',
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  errorText: {
    color: THEME.accentRed,
    fontSize: 13,
    fontWeight: '600',
  },
  primaryButton: {
    marginTop: 20,
    height: 56,
    borderRadius: 16,
    backgroundColor: THEME.accentCyan,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryButtonDisabled: {
    opacity: 0.7,
  },
  primaryButtonText: {
    color: '#071317',
    fontSize: 16,
    fontWeight: '800',
  },
  pressed: {
    opacity: 0.9,
  },
});

export default AuthScreen;
