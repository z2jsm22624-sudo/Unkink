import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

interface AIInsightCardProps {
  isLoading: boolean;
  isDataAvailable?: boolean;
  weeklyTitle?: string;
  insightSummary?: string;
  workspaceTweak?: string;
  nextWeekFocus?: string;
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  isLoading,
  isDataAvailable = true,
  weeklyTitle,
  insightSummary,
  workspaceTweak,
  nextWeekFocus,
}) => {
  const pulse = useSharedValue(0.35);

  useEffect(() => {
    pulse.value = withRepeat(
      withTiming(1, { duration: 1200, easing: Easing.inOut(Easing.ease) }),
      -1,
      true,
    );
  }, [pulse]);

  const pulseStyle = useAnimatedStyle(() => ({
    opacity: pulse.value,
  }));

  return (
    <View style={[styles.card, !isDataAvailable && styles.cardEmpty]}>
      <View style={styles.headerRow}>
        <View style={[styles.badge, !isDataAvailable && styles.badgeEmpty]}>
          <Text style={[styles.badgeText, !isDataAvailable && styles.badgeTextEmpty]}>
            {isDataAvailable ? '[ 🤖 GEMINI DIAGNOSTIC ]' : '[ AI STANDBY ]'}
          </Text>
        </View>
        <Animated.View style={[styles.statusDot, pulseStyle, !isDataAvailable && styles.statusDotEmpty]} />
      </View>

      {isLoading ? (
        <View style={styles.skeletonWrap}>
          <View style={styles.skeletonLineShort} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLine} />
          <View style={styles.skeletonLineShort} />
        </View>
      ) : (
        <>
          {isDataAvailable ? (
            <>
              <Text style={styles.title}>{weeklyTitle ?? 'Weekly recovery is stable'}</Text>
              <Text style={styles.summary}>{insightSummary ?? 'No weekly insight available yet.'}</Text>

              <View style={styles.callout}>
                <Text style={styles.calloutLabel}>WORKSPACE TWEAK</Text>
                <Text style={styles.calloutText}>{workspaceTweak ?? 'Keep your monitor at eye level.'}</Text>
              </View>

              <View style={styles.nextFocusWrap}>
                <Text style={styles.nextFocusLabel}>Next week focus</Text>
                <Text style={styles.nextFocusText}>{nextWeekFocus ?? 'Stay consistent with your daily resets.'}</Text>
              </View>
            </>
          ) : (
            <Text style={styles.emptyStateText}>Awaiting this week’s activity data.</Text>
          )}
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.2)',
    padding: 16,
    marginBottom: 30,
  },
  cardEmpty: {
    backgroundColor: '#000000',
    borderColor: 'rgba(255,255,255,0.07)',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeEmpty: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderColor: 'rgba(255,255,255,0.08)',
  },
  badgeText: {
    color: '#EAFBFF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
  },
  badgeTextEmpty: {
    color: 'rgba(255,255,255,0.7)',
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    backgroundColor: '#5EE28D',
    shadowColor: '#5EE28D',
    shadowOpacity: 0.8,
    shadowRadius: 10,
    elevation: 6,
  },
  statusDotEmpty: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    shadowOpacity: 0,
  },
  skeletonWrap: {
    gap: 10,
  },
  skeletonLine: {
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  skeletonLineShort: {
    width: '60%',
    height: 12,
    borderRadius: 8,
    backgroundColor: 'rgba(255,255,255,0.08)',
  },
  title: {
    color: '#EAFBFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 10,
  },
  summary: {
    color: 'rgba(234,251,255,0.8)',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 14,
  },
  callout: {
    backgroundColor: 'rgba(94, 226, 141, 0.08)',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(94, 226, 141, 0.2)',
    padding: 12,
    marginBottom: 14,
  },
  calloutLabel: {
    color: '#5EE28D',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  calloutText: {
    color: '#EAFBFF',
    fontSize: 13,
    lineHeight: 20,
  },
  nextFocusWrap: {
    backgroundColor: 'rgba(0,229,255,0.05)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.14)',
    padding: 12,
  },
  nextFocusLabel: {
    color: '#00E5FF',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  nextFocusText: {
    color: '#EAFBFF',
    fontSize: 13,
    lineHeight: 20,
  },
  emptyStateText: {
    color: 'rgba(255,255,255,0.62)',
    fontSize: 13,
    lineHeight: 20,
  },
});

export default AIInsightCard;
