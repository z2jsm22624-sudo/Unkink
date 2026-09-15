import AsyncStorage from '@react-native-async-storage/async-storage';

export const WATER_STORAGE_KEYS = {
  CURRENT_WEEKLY_WATER: '@unkink_current_weekly_water',
  PREVIOUS_WEEKLY_WATER: '@unkink_previous_weekly_water',
  LAST_WEEKLY_RESET: '@unkink_last_weekly_reset',
} as const;

export interface WeeklyWaterData {
  currentWeeklyWater: number;
  previousWeeklyWater: number;
  lastWeeklyReset: number;
}

/**
 * Returns the Unix timestamp (ms) for 00:00:00 of the most recent Monday.
 */
export const getMostRecentMondayTimestamp = (date: Date = new Date()): number => {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday, 1 is Monday, ..., 6 is Saturday
  const daysToSubtract = (day + 6) % 7; // Sunday -> 6, Monday -> 0, Tuesday -> 1, etc.
  d.setDate(d.getDate() - daysToSubtract);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
};

/**
 * Checks if a Monday 00:00:00 reset has occurred since the last reset timestamp.
 * If triggered:
 *   previousWeeklyWater = currentWeeklyWater
 *   currentWeeklyWater = 0
 *   lastWeeklyReset = currentMondayTimestamp
 */
export const checkAndApplyWeeklyReset = async (
  now: Date = new Date()
): Promise<WeeklyWaterData> => {
  const currentMonday = getMostRecentMondayTimestamp(now);

  const [currentRaw, previousRaw, lastResetRaw] = await Promise.all([
    AsyncStorage.getItem(WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER),
    AsyncStorage.getItem(WATER_STORAGE_KEYS.PREVIOUS_WEEKLY_WATER),
    AsyncStorage.getItem(WATER_STORAGE_KEYS.LAST_WEEKLY_RESET),
  ]);

  let currentWeeklyWater = currentRaw !== null ? parseFloat(currentRaw) : 0;
  let previousWeeklyWater = previousRaw !== null ? parseFloat(previousRaw) : 0;
  let lastWeeklyReset = lastResetRaw !== null ? parseInt(lastResetRaw, 10) : 0;

  if (lastResetRaw === null) {
    // First time setup - mark initial reset baseline
    lastWeeklyReset = currentMonday;
    await Promise.all([
      AsyncStorage.setItem(WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER, currentWeeklyWater.toString()),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.PREVIOUS_WEEKLY_WATER, previousWeeklyWater.toString()),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.LAST_WEEKLY_RESET, lastWeeklyReset.toString()),
    ]);
  } else if (now.getTime() >= currentMonday && lastWeeklyReset < currentMonday) {
    // Reset condition met: current time >= Monday 00:00:00 AND last reset < that Monday timestamp
    previousWeeklyWater = currentWeeklyWater;
    currentWeeklyWater = 0;
    lastWeeklyReset = currentMonday;

    await Promise.all([
      AsyncStorage.setItem(WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER, '0'),
      AsyncStorage.setItem(
        WATER_STORAGE_KEYS.PREVIOUS_WEEKLY_WATER,
        previousWeeklyWater.toString()
      ),
      AsyncStorage.setItem(WATER_STORAGE_KEYS.LAST_WEEKLY_RESET, lastWeeklyReset.toString()),
    ]);
  }

  return {
    currentWeeklyWater,
    previousWeeklyWater,
    lastWeeklyReset,
  };
};

/**
 * Calculates exercise water gain and adds to current weekly water:
 * New Gain = 3% (base) + (seconds * 0.02%) + (isTargetZone ? 1% : 0%)
 * Capped at 100%.
 */
export const addExerciseWater = async (
  seconds: number,
  isTargetZone: boolean = false
): Promise<WeeklyWaterData> => {
  const currentData = await checkAndApplyWeeklyReset();

  const baseGain = 3;
  const timeGain = seconds * 0.02;
  const targetZoneGain = isTargetZone ? 1 : 0;
  const totalGain = baseGain + timeGain + targetZoneGain;

  const newWaterLevel = Math.min(100, Math.max(0, currentData.currentWeeklyWater + totalGain));
  const roundedWater = Math.round(newWaterLevel * 100) / 100;

  await AsyncStorage.setItem(
    WATER_STORAGE_KEYS.CURRENT_WEEKLY_WATER,
    roundedWater.toString()
  );

  return {
    ...currentData,
    currentWeeklyWater: roundedWater,
  };
};

/**
 * Retrieves the current water tracking state without modifying it,
 * running the reset check first.
 */
export const getWeeklyWaterData = async (): Promise<WeeklyWaterData> => {
  return checkAndApplyWeeklyReset();
};
