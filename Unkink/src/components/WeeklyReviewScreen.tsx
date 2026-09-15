import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AIInsightCard } from './AIInsightCard';
import { HistogramChart } from './HistogramChart';
import { WaterFillGauge } from './WaterFillGauge';
import {
  getWeeklyWaterData,
  getLocalWeeklyStats,
  type WeeklyWaterData,
} from '../services/waterStorageService';

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
  const [waterData, setWaterData] = useState<WeeklyWaterData>({
    currentWeeklyWater: 0,
    previousWeeklyWater: 0,
    lastWeeklyReset: 0,
    dailyGains: [0, 0, 0, 0, 0, 0, 0],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      try {
        setIsLoading(true);

        // 1. Fetch real water storage & local stats
        const [savedWater, localStats] = await Promise.all([
          getWeeklyWaterData(),
          getLocalWeeklyStats(),
        ]);

        if (isMounted) {
          setWaterData(savedWater);
        }

        // 2. Try fetching server insights if available
        let serverData: WeeklyInsightsResponse | null = null;
        try {
          const response = await fetch('/api/generate-weekly-insights', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId }),
          });

          if (response.ok) {
            serverData = (await response.json()) as WeeklyInsightsResponse;
          }
        } catch {
          // Offline / local fallback
        }

        if (!isMounted) {
          return;
        }

        if (serverData && !serverData.empty) {
          setData({
            ...serverData,
            weeklyRecoveryScore: savedWater.currentWeeklyWater || serverData.weeklyRecoveryScore,
            scoreDelta: savedWater.currentWeeklyWater - savedWater.previousWeeklyWater,
            histogramData: serverData.histogramData?.some((v) => v > 0)
              ? serverData.histogramData
              : localStats.histogramData,
          });
        } else {
          // Generate fallback local insights based on real user activity
          const topZone = Object.entries(localStats.topTargetedZones).sort(
            (a, b) => b[1] - a[1]
          )[0]?.[0];

          setData({
            weeklyRecoveryScore: savedWater.currentWeeklyWater,
            scoreDelta: savedWater.currentWeeklyWater - savedWater.previousWeeklyWater,
            histogramData: savedWater.dailyGains,
            topTargetedZones: localStats.topTargetedZones,
            deskModeRatio: localStats.deskModeRatio,
            weeklyTitle:
              savedWater.currentWeeklyWater >= 50
                ? 'Strong Ergonomic Rhythm ⚡'
                : 'Building Your Reset Routine 🌱',
            insightSummary: topZone
              ? `You focused most of your tension relief on your ${topZone} this week.`
              : 'Complete quick 30-second resets to fill your recovery gauge and relieve physical fatigue.',
            workspaceTweak:
              localStats.deskModeRatio.desk > 60
                ? 'Try alternating between seated and standing micro-stretches during long focus blocks.'
                : 'Keep your monitor at eye level to prevent recurring neck tension.',
            nextWeekFocus: topZone
              ? `Incorporate daily ${topZone} mobility resets at mid-day.`
              : 'Aim for at least one daily reset to maintain your streak.',
            empty: false,
          });
        }
      } catch (caughtError) {
        console.warn('Weekly review load failed:', caughtError);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, [userId]);

  const histogramData = data?.histogramData ?? [0, 0, 0, 0, 0, 0, 0];
  const score = Math.round(waterData.currentWeeklyWater);
  const delta = Math.round(waterData.currentWeeklyWater - waterData.previousWeeklyWater);
  const isDataAvailable = Boolean(
    waterData.currentWeeklyWater > 0 || histogramData.some((value) => value > 0)
  );

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
          <WaterFillGauge
            score={score}
            delta={delta}
            previousWeeklyWater={waterData.previousWeeklyWater}
          />
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
