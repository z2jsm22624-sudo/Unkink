import React, { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';
import {
  deleteUser,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';

import { auth } from '../config/firebase';
import type { StoredUser } from './AuthScreen';

interface AccountSettingsScreenProps {
  user: StoredUser;
  onClose: () => void;
  onSignOut: () => void;
  onUserUpdated: (user: StoredUser) => void;
}

const AccountSettingsScreen: React.FC<AccountSettingsScreenProps> = ({
  user,
  onClose,
  onSignOut,
  onUserUpdated,
}) => {
  const [displayName, setDisplayName] = useState(user.displayName);
  const [isSavingName, setIsSavingName] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [confirmSignOut, setConfirmSignOut] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const resetMessages = () => {
    setStatusMessage(null);
    setErrorMessage(null);
  };

  const handleSaveName = async () => {
    const nextName = displayName.trim();
    if (!nextName || nextName === user.displayName) {
      return;
    }

    resetMessages();
    setIsSavingName(true);
    try {
      if (!auth.currentUser) {
        throw new Error('Your session has expired. Please log out and log in again.');
      }

      await updateProfile(auth.currentUser, { displayName: nextName });
      const updatedUser: StoredUser = { ...user, displayName: nextName };
      await AsyncStorage.setItem('@unkink_user', JSON.stringify(updatedUser));
      onUserUpdated(updatedUser);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatusMessage('Display name updated.');
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Could not update your display name.');
    } finally {
      setIsSavingName(false);
    }
  };

  const handlePasswordReset = async () => {
    resetMessages();
    setIsSendingReset(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      setStatusMessage(`Password reset email sent to ${user.email}.`);
    } catch (error: any) {
      setErrorMessage(error?.message ?? 'Could not send the password reset email.');
    } finally {
      setIsSendingReset(false);
    }
  };

  const handleSignOut = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSignOut();
  };

  const handleDeleteAccount = async () => {
    resetMessages();
    setIsDeleting = true;
    try {
      if (!auth.currentUser) {
        throw new Error('Your session has expired. Please log out and log in again.');
      }

      // Clear the stored session first so the auth listener can't route back home.
      await AsyncStorage.removeItem('@unkink_user');
      await deleteUser(auth.currentUser);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      onSignOut();
    } catch (error: any) {
      // Restore the stored user if deletion failed so the session stays consistent.
      await AsyncStorage.setItem('@unkink_user', JSON.stringify(user));
      if (error?.code === 'auth/requires-recent-login') {
        setErrorMessage('For security, please log out, log back in, and then delete your account.');
      } else {
        setErrorMessage(error?.message ?? 'Could not delete your account.');
      }
      setConfirmDelete(false);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Account Settings</Text>
          <Pressable onPress={onClose} style={styles.closeButton} accessibilityLabel="Close settings">
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <View style={styles.profileCard}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {(user.displayName || user.email || 'U').charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>{user.displayName}</Text>
              <Text style={styles.profileEmail}>{user.email}</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Profile</Text>
          <View style={styles.sectionCard}>
            <Text style={styles.fieldLabel}>Display name</Text>
            <View style={styles.nameRow}>
              <TextInput
                value={displayName}
                onChangeText={setDisplayName}
                placeholder="Your name"
                placeholderTextColor="#9AA7BA"
                style={styles.nameInput}
                autoCapitalize="words"
                returnKeyType="done"
                onSubmitEditing={handleSaveName}
              />
              <Pressable
                onPress={handleSaveName}
                disabled={isSavingName || !displayName.trim() || displayName.trim() === user.displayName}
                style={[
                  styles.saveButton,
                  (isSavingName || !displayName.trim() || displayName.trim() === user.displayName) &&
                    styles.buttonDisabled,
                ]}
              >
                {isSavingName ? (
                  <ActivityIndicator size="small" color="#090A0F" />
                ) : (
                  <Text style={styles.saveButtonText}>Save</Text>
                )}
              </Pressable>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Login &amp; Security</Text>
          <View style={styles.sectionCard}>
            <Pressable
              onPress={handlePasswordReset}
              disabled={isSendingReset}
              style={[styles.actionRow, isSendingReset && styles.buttonDisabled]}
            >
              <View style={styles.actionTextGroup}>
                <Text style={styles.actionTitle}>Reset password</Text>
                <Text style={styles.actionSubtitle}>Email a reset link to {user.email}</Text>
              </View>
              {isSendingReset ? (
                <ActivityIndicator size="small" color="#00E5FF" />
              ) : (
                <Text style={styles.actionChevron}>›</Text>
              )}
            </Pressable>

            <View style={styles.divider} />

            {confirmSignOut ? (
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmText}>Log out of Unkink on this device?</Text>
                <View style={styles.confirmRow}>
                  <Pressable onPress={() => setConfirmSignOut(false)} style={styles.cancelButton}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable onPress={handleSignOut} style={styles.confirmButton}>
                    <Text style={styles.confirmButtonText}>Log out</Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  resetMessages();
                  setConfirmDelete(false);
                  setConfirmSignOut(true);
                }}
                style={styles.actionRow}
              >
                <View style={styles.actionTextGroup}>
                  <Text style={styles.actionTitle}>Log out</Text>
                  <Text style={styles.actionSubtitle}>You can log back in anytime</Text>
                </View>
                <Text style={styles.actionChevron}>›</Text>
              </Pressable>
            )}
          </View>

          <Text style={styles.sectionTitle}>Danger Zone</Text>
          <View style={[styles.sectionCard, styles.dangerCard]}>
            {confirmDelete ? (
              <View style={styles.confirmBlock}>
                <Text style={styles.confirmText}>
                  Permanently delete your account? This cannot be undone.
                </Text>
                <View style={styles.confirmRow}>
                  <Pressable
                    onPress={() => setConfirmDelete(false)}
                    style={styles.cancelButton}
                    disabled={isDeleting}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </Pressable>
                  <Pressable
                    onPress={handleDeleteAccount}
                    style={styles.deleteButton}
                    disabled={isDeleting}
                  >
                    {isDeleting ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={styles.deleteButtonText}>Delete</Text>
                    )}
                  </Pressable>
                </View>
              </View>
            ) : (
              <Pressable
                onPress={() => {
                  resetMessages();
                  setConfirmSignOut(false);
                  setConfirmDelete(true);
                }}
                style={styles.actionRow}
              >
                <View style={styles.actionTextGroup}>
                  <Text style={[styles.actionTitle, styles.dangerTitle]}>Delete account</Text>
                  <Text style={styles.actionSubtitle}>Remove your account and sign-in details</Text>
                </View>
                <Text style={[styles.actionChevron, styles.dangerTitle]}>›</Text>
              </Pressable>
            )}
          </View>

          {statusMessage ? <Text style={styles.statusText}>{statusMessage}</Text> : null}
          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}
        </ScrollView>
      </View>
    </View>
  );
};

export default AccountSettingsScreen;

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 4, 8, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 30,
  },
  modal: {
    width: '92%',
    maxWidth: 420,
    maxHeight: '84%',
    backgroundColor: '#090A0F',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.22)',
    shadowColor: '#00E5FF',
    shadowOpacity: 0.15,
    shadowRadius: 18,
    elevation: 18,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
  },
  headerTitle: {
    color: '#EAFBFF',
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderColor: 'rgba(255,255,255,0.08)',
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeText: {
    color: '#EAFBFF',
    fontSize: 18,
    fontWeight: '700',
  },
  content: {
    paddingBottom: 24,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    padding: 14,
    gap: 12,
    marginBottom: 20,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0,229,255,0.18)',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#00E5FF',
    fontSize: 20,
    fontWeight: '800',
  },
  profileInfo: {
    flex: 1,
  },
  profileName: {
    color: '#F3F7FF',
    fontSize: 16,
    fontWeight: '700',
  },
  profileEmail: {
    color: '#9AA7BA',
    fontSize: 13,
    marginTop: 2,
  },
  sectionTitle: {
    color: '#9AA7BA',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  sectionCard: {
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 20,
  },
  fieldLabel: {
    color: '#9AA7BA',
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 8,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nameInput: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.12)',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: '#EAF8FF',
    fontSize: 15,
  },
  saveButton: {
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 10,
    minWidth: 68,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#090A0F',
    fontSize: 14,
    fontWeight: '800',
  },
  buttonDisabled: {
    opacity: 0.45,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 10,
  },
  actionTextGroup: {
    flex: 1,
  },
  actionTitle: {
    color: '#F3F7FF',
    fontSize: 15,
    fontWeight: '700',
  },
  actionSubtitle: {
    color: '#9AA7BA',
    fontSize: 12,
    marginTop: 2,
  },
  actionChevron: {
    color: '#00E5FF',
    fontSize: 22,
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.08)',
    marginVertical: 4,
  },
  confirmBlock: {
    paddingVertical: 8,
    gap: 12,
  },
  confirmText: {
    color: '#F3F7FF',
    fontSize: 14,
    fontWeight: '600',
    lineHeight: 20,
  },
  confirmRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  cancelButtonText: {
    color: '#F3F7FF',
    fontSize: 14,
    fontWeight: '700',
  },
  confirmButton: {
    flex: 1,
    backgroundColor: '#00E5FF',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  confirmButtonText: {
    color: '#090A0F',
    fontSize: 14,
    fontWeight: '800',
  },
  dangerCard: {
    borderColor: 'rgba(255,107,122,0.35)',
  },
  dangerTitle: {
    color: '#FF6B7A',
  },
  deleteButton: {
    flex: 1,
    backgroundColor: '#FF6B7A',
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  statusText: {
    color: '#5EE28D',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
  errorText: {
    color: '#FF6B7A',
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 8,
  },
});
