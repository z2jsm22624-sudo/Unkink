import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

interface WaterFillGaugeProps {
  score: number;
  delta: number;
}

export const WaterFillGauge: React.FC<WaterFillGaugeProps> = ({ score, delta }) => {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score / 100, {
      duration: 800,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress, score]);

  const fillStyle = useAnimatedStyle(() => ({
    height: `${progress.value * 100}%`,
  }));

  const deltaText = delta >= 0 ? `▲ +${delta}% vs last week` : `▼ ${delta}% vs last week`;

  return (
    <View style={styles.card}>
      <View style={styles.gaugeWrap}>
        <View style={styles.gaugeTrack}>
          <Animated.View style={[styles.gaugeFill, fillStyle]} />
        </View>

        <View style={styles.centerText} pointerEvents="none">
          <Text style={styles.scoreText}>{score}</Text>
          <Text style={styles.scoreLabel}>Recovery</Text>
        </View>
      </View>

      <View style={styles.deltaWrap}>
        <Text style={[styles.deltaText, delta >= 0 ? styles.deltaPositive : styles.deltaNegative]}>
          {deltaText}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.04)',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.22)',
    paddingVertical: 20,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  gaugeWrap: {
    width: 200,
    height: 200,
    alignSelf: 'center',
    justifyContent: 'center',
    alignItems: 'center',
  },
  gaugeTrack: {
    position: 'absolute',
    width: 170,
    height: 170,
    borderRadius: 85,
    backgroundColor: 'rgba(255,255,255,0.05)',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,229,255,0.18)',
    justifyContent: 'flex-end',
  },
  gaugeFill: {
    width: '100%',
    backgroundColor: 'rgba(0, 229, 255, 0.26)',
    borderBottomLeftRadius: 85,
    borderBottomRightRadius: 85,
    shadowColor: '#00E5FF',
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 8,
  },
  centerText: {
    position: 'absolute',
    alignItems: 'center',
  },
  scoreText: {
    color: '#EAFBFF',
    fontSize: 40,
    fontWeight: '800',
  },
  scoreLabel: {
    color: 'rgba(234,251,255,0.7)',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.4,
    textTransform: 'uppercase',
  },
  deltaWrap: {
    marginTop: 12,
    alignItems: 'center',
  },
  deltaText: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    fontSize: 12,
    fontWeight: '700',
    overflow: 'hidden',
  },
  deltaPositive: {
    backgroundColor: 'rgba(94, 226, 141, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(94, 226, 141, 0.26)',
    color: '#5EE28D',
  },
  deltaNegative: {
    backgroundColor: 'rgba(255, 99, 132, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(255, 99, 132, 0.24)',
    color: '#FF6B8A',
  },
});

export default WaterFillGauge;
