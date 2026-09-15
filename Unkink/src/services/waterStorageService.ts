import AsyncStorage from '@react-native-async-storage/async-storage';

export const WATER_STORAGE_KEYS = {
  CURRENT_WEEKLY_WATER: '@unkink_current_weekly_water',
  PREVIOUS_WEEKLY_WATER: '@unkink_previous_weekly_water',
  LAST_WEEKLY_RESET: '@unkink_last_weekly_reset',
  DAILY_WATER_GAINS: '@unkink_daily_water_gains',
  ACTIVITY_LOGS: '@deskreset_activity_logs',
} as const;

export interface ActivityLog {
  completedAt: string;
  zone: string;
  isDeskMode: boolean;
  duration: number;
}

export interface WeeklyWaterData {
  currentWeeklyWater: number;
  previousWeeklyWater: number;
  lastWeeklyReset: number;
  dailyGains: number[]; // Index 0: Mon, 1: Tue, ..., 6: Sun
}

export const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] as const;

/**
 * Returns 0 for Mon, 1 for Tue, ..., 6 for Sun
 */
export const getDayOfWeekIndex = (date: Date = new Date()): number => {
  const day = date.getDay(); // 0 is Sunday, 1 is Monday...
  return (day + 6) % 7;
};

/**
 * Returns the Unix timestamp (ms) for 00:00:00 of the most recent Monday.
 */
export const getMostRecentMondayTimestamp = (date: Date = new Date()): number => {
  const d = new Date(date);
  const daysToSubtract = getDayOfWeekIndex(d);
  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Checks if a Monday 00:00:00 reset has occurred since the last reset timestamp.
 * If true:
 *   previousWeeklyWater = currentWeeklyWater
 *   currentWeeklyWater = 0
 *   dailyGains = [0, 0, 0, 0, 0, 0, 0]
 *   lastWeeklyReset = currentMondayTimestamp
 */
export const checkAndApplyWeeklyReset = async (
  now: Date = new Date()
): Promise<WeeklyWaterData> => {
  const currentMonday = getMostRecentMondayTimestamp(now);

  const [currentRaw, previousRaw, lastResetRaw, dailyGainsRaw] = await Promise.all([
    AsyncStorage.getItem(WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER),
    AsyncStorage.getItem(WATER_STORAGE_KEYS.PREVIOUS_WEEKLY_WATER),
    AsyncStorage.getItem(WATER_STORAGE_KEYS.LAST_WEEKLY_RESET),
    AsyncStorage.getItem(WATER_STORAGE_KEYS.DAILY_WATER_GAINS),
  ]);

  let currentWeeklyWater = currentRaw !== null ? parseFloat(currentRaw) : 0;
  let previousWeeklyWater = previousRaw !== null ? parseFloat(previousRaw) : 0;
  let lastWeeklyReset = lastResetRaw !== null ? parseInt(lastResetRaw, 10) : 0;
  let dailyGains: number[] = dailyGainsRaw ? JSON.parse(dailyGainsRaw) : [0, 0, 0, 0, 0, 0, 0];

  if (dailyGains.length !== 7) {
    dailyGains = [0, 0, 0, 0, 0, 0, 0];
  }

  if (lastResetRaw === null) {
    // First time setup - mark initial reset baseline
    lastWeeklyReset = currentMonday;
    await Promise.all([
      AsyncStorage.setItem(WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER, currentWeeklyWater.toString()),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.PREVIOUS_WEEKLY_WATER, previousWeeklyWater.toString()),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.LAST_WEEKLY_RESET, lastWeeklyReset.toString()),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.DAILY_WATER_GAINS, JSON.stringify(dailyGains)),
    ]);
  } else if (now.getTime() >= currentMonday && lastWeeklyReset < currentMonday) {
    // Reset condition met: current time >= Monday 00:00:00 AND last reset < that Monday timestamp
    previousWeeklyWater = currentWeeklyWater;
    currentWeeklyWater = 0;
    dailyGains = [0, 0, 0, 0, 0, 0, 0];
    lastWeeklyReset = currentMonday;

    await Promise.all([
      AsyncStorage.setItem(WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER, '0'),
      AsyncStorage.setItem(
        WATER_STORAGE_KEYS.PREVIOUS_WEEKLY_WATER,
        previousWeeklyWater.toString()
      ),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.LAST_WEEKLY_RESET, lastWeeklyReset.toString()),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.DAILY_WATER_GAINS, JSON.stringify(dailyGains)),
    ]);
  }

  return {
    currentWeeklyWater,
    previousWeeklyWater,
    lastWeeklyReset,
    dailyGains,
  };
};

/**
 * Calculates exercise session water gain and accumulates under the current day of the week:
 * Session Gain = 3% (base) + (seconds * 0.02%) + (isTargetZone ? 1% : 0%)
 * Capped at 100% for weekly water.
 */
export const addExerciseWater = async (
  seconds: number,
  isTargetZone: boolean = false
): Promise<WeeklyWaterData> => {
  const currentData = await checkAndApplyWeeklyReset();

  const baseGain = 3;
  const timeGain = seconds * 0.02;
  const targetZoneGain = isTargetZone ? 1 : 0;
  const sessionGain = Math.round((baseGain + timeGain + targetZoneGain) * 100) / 100;

  const newWaterLevel = Math.min(100, Math.max(0, currentData.currentWeeklyWater + sessionGain));
  const roundedWater = Math.round(newWaterLevel * 100) / 100;

  const dayIndex = getDayOfWeekIndex();
  const updatedDailyGains = [...currentData.dailyGains];
  updatedDailyGains[dayIndex] = Math.round(((updatedDailyGains[dayIndex] || 0) + sessionGain) * 100) / 100;

  await Promise.all([
    AsyncStorage.setItem(
      WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER,
      roundedWater.toString()
    ),
    AsyncStorage.setItem(
      WATER_STORAGE_KEYS.DAILY_WATER_GAINS,
      JSON.stringify(updatedDailyGains)
    ),
  ]);

  return {
    ...currentData,
    currentWeeklyWater: roundedWater,
    dailyGains: updatedDailyGains,
  };
};

/**
 * Retrieves the current water tracking state without modifying it,
 * running the reset check first.
 */
export const getWeeklyWaterData = async (): Promise<WeeklyWaterData> => {
  return checkAndApplyWeeklyReset();
};

/**
 * Logs a completed exercise session to AsyncStorage.
 */
export const logCompletedExercise = async (log: Omit<ActivityLog, 'completedAt'>): Promise<void> => {
  try {
    const raw = await AsyncStorage.getItem(WATER_STORAGE_KEYS.ACTIVITY_LOGS);
    const existingLogs: ActivityLog[] = raw ? JSON.parse(raw) : [];
    
    const newEntry: ActivityLog = {
      ...log,
      completedAt: new Date().toISOString(),
    };

    // Keep last 60 days of logs
    const updatedLogs = [newEntry, ...existingLogs].slice(0, 500);
    await AsyncStorage.setItem(WATER_STORAGE_KEYS.ACTIVITY_LOGS, JSON.stringify(updatedLogs));
  } catch (error) {
    console.error('Failed to save activity log:', error);
  }
};

/**
 * Computes local weekly statistics from activity logs.
 */
export const getLocalWeeklyStats = async () => {
  try {
    const raw = await AsyncStorage.getItem(WATER_STORAGE_KEYS.ACTIVITY_LOGS);
    const logs: ActivityLog[] = raw ? JSON.parse(raw) : [];

    const now = new Date();
    const days: Date[] = [];
    for (let offset = 6; offset >= 0; offset -= 1) {
      const d = new Date(now);
      d.setDate(now.getDate() - offset);
      d.setHours(0, 0, 0, 0);
      days.push(d);
    }

    const histogram = [0, 0, 0, 0, 0, 0, 0];
    const topTargetedZones: Record<string, number> = {};
    let deskCount = 0;
    let openCount = 0;

    for (const log of logs) {
      const logDate = new Date(log.completedAt);
      const matchIndex = days.findIndex(
        (day) => day.toDateString() === logDate.toDateString()
      );

      if (matchIndex >= 0) {
        histogram[matchIndex] += 1;
        const zone = log.zone || 'general';
        topTargetedZones[zone] = (topTargetedZones[zone] || 0) + 1;
        if (log.isDeskMode) {
          deskCount += 1;
        } else {
          openCount += 1;
        }
      }
    }

    const totalSessions = deskCount + openCount || 1;
    const deskModeRatio = {
      desk: Math.round((deskCount / totalSessions) * 100),
      open: Math.round((openCount / totalSessions) * 100),
    };

    return {
      histogramData: histogram,
      topTargetedZones,
      deskModeRatio,
      totalSessions: deskCount + openCount,
    };
  } catch (error) {
    console.error('Failed to compute local weekly stats:', error);
    return {
      histogramData: [0, 0, 0, 0, 0, 0, 0],
      topTargetedZones: {},
      deskModeRatio: { desk: 50, open: 50 },
      totalSessions: 0,
    };
  }
};
