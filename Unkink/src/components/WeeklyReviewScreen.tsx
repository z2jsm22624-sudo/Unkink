import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AIInsightCard } from './AIInsightCard';
import { HistogramChart } from './HistogramChart';
import { WaterFillGauge } from './WaterFillGauge';

interface WeeklyInsightsResponse {
  weeklyRecoveryScore: number;
  scoreDelta: number;
  histogramData: number[];
  topTargetedZones: Record<string, number>;
  deskModeRatio: { desk: number; open: number };
  weeklyTitle: string;
  insightSummary: string;
  workspaceTweak: string;
  nextWeekFocus: string;
  empty?: boolean;
  message?: string;
}

interface WeeklyReviewScreenProps {
  userId: string;
  onClose: () => void;
}

export const WeeklyReviewScreen: React.FC<WeeklyReviewScreenProps> = ({ userId, onClose }) => {
  const [data, setData] = useState<WeeklyInsightsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchWeeklyInsights = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch('/api/generate-weekly-insights', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId }),
        });

        if (!response.ok) {
          throw new Error(`Request failed with ${response.status}`);
        }

        const payload = (await response.json()) as WeeklyInsightsResponse;

        if (!isMounted) {
          return;
        }

        setData(payload);
      } catch (caughtError) {
        console.warn('Weekly review fetch failed:', caughtError);

        if (isMounted) {
          setData(null);
          setError(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchWeeklyInsights();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const histogramData = data?.histogramData ?? [0, 0, 0, 0, 0, 0, 0];
  const score = data?.weeklyRecoveryScore ?? 0;
  const delta = data?.scoreDelta ?? 0;
  const isDataAvailable = Boolean(data && !data.empty && (data.weeklyRecoveryScore > 0 || data.histogramData?.some((value) => value > 0)));

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        <View style={styles.headerRow}>
          <Text style={styles.headerTitle}>Weekly Review</Text>
          <Pressable onPress={onClose} style={styles.closeButton}>
            <Text style={styles.closeText}>✕</Text>
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
          <WaterFillGauge score={score} delta={delta} />
          <HistogramChart data={histogramData} />
          <AIInsightCard
            isLoading={isLoading}
            isDataAvailable={isDataAvailable}
            weeklyTitle={data?.weeklyTitle}
            insightSummary={data?.insightSummary}
            workspaceTweak={data?.workspaceTweak}
            nextWeekFocus={data?.nextWeekFocus}
          />
        </ScrollView>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(2, 4, 8, 0.72)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 20,
  },
  modal: {
    width: '92%',
    maxWidth: 420,
    height: '80%',
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
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
  },
  emptyTitle: {
    color: '#EAFBFF',
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 8,
  },
  emptyText: {
    color: 'rgba(234,251,255,0.75)',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 22,
  },
});
