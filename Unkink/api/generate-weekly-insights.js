const userActivityStore = {
  'demo-user': [
    { userId: 'demo-user', completedAt: '2026-09-08T09:15:00.000Z', isDeskMode: true, zone: 'neck', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-08T18:10:00.000Z', isDeskMode: true, zone: 'wrists', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-09T08:45:00.000Z', isDeskMode: true, zone: 'shoulders', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-10T09:00:00.000Z', isDeskMode: false, zone: 'lowerBody', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-11T12:00:00.000Z', isDeskMode: true, zone: 'torso', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-12T08:30:00.000Z', isDeskMode: true, zone: 'neck', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-13T17:40:00.000Z', isDeskMode: false, zone: 'wrists', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-14T09:00:00.000Z', isDeskMode: true, zone: 'shoulders', duration: 30 },
    { userId: 'demo-user', completedAt: '2026-09-14T17:15:00.000Z', isDeskMode: true, zone: 'neck', duration: 30 },
  ],
};

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getLast7Days = () => {
  const days = [];
  const now = new Date();

  for (let offset = 6; offset >= 0; offset -= 1) {
    const date = new Date(now);
    date.setDate(now.getDate() - offset);
    date.setHours(0, 0, 0, 0);
    days.push(date);
  }

  return days;
};

const toDayIndex = (date) => {
  const day = new Date(date).getDay();
  return day === 0 ? 6 : day - 1;
};

const computeHistogram = (logs) => {
  const days = getLast7Days();
  const histogram = Array(7).fill(0);

  for (const log of logs) {
    const logDate = new Date(log.completedAt);
    const match = days.findIndex((day) => day.toDateString() === logDate.toDateString());

    if (match >= 0) {
      histogram[match] += 1;
    }
  }

  return histogram;
};

const computeTargetedZones = (logs) => {
  const counts = {};

  for (const log of logs) {
    const zone = (log.zone ?? 'general').toLowerCase();
    counts[zone] = (counts[zone] ?? 0) + 1;
  }

  const total = Object.values(counts).reduce((sum, value) => sum + value, 0) || 1;

  const mapped = {};
  for (const [zone, count] of Object.entries(counts)) {
    mapped[zone] = Math.round((count / total) * 100);
  }

  return mapped;
};

const computeDeskModeRatio = (logs) => {
  const total = logs.length || 1;
  const deskCount = logs.filter((log) => log.isDeskMode).length;
  const openCount = total - deskCount;

  return {
    desk: Math.round((deskCount / total) * 100),
    open: Math.round((openCount / total) * 100),
  };
};

const getPreviousWeekAverage = (userId) => {
  const logs = userActivityStore[userId] ?? [];
  const lastWeek = logs.filter((log) => {
    const date = new Date(log.completedAt);
    const now = new Date();
    const msAgo = now.getTime() - date.getTime();
    const days = msAgo / (1000 * 60 * 60 * 24);
    return days > 7 && days <= 14;
  });

  const previousScore = lastWeek.length === 0 ? 0 : Math.min(100, Math.round((lastWeek.length / 14) * 100));
  return previousScore;
};

const calculateRecoveryScore = (logs) => {
  const sessionCount = logs.length;
  const score = Math.min(100, Math.round((sessionCount / 14) * 100));
  return score;
};

const buildGeminiRequestBody = (metrics) => ({
  system_instruction: {
    parts: [
      {
        text:
          "You are DeskReset AI, an ergonomic diagnostic coach. Review this user's calculated weekly activity data: {weeklyRecoveryScore, topTargetedZones, deskModeRatio, histogramData}. Generate a personalized diagnostic review analyzing their real strain habits and providing ONE specific desk adjustment advice based on their most strained body zone. Output strict JSON matching schema: { 'weeklyTitle': string, 'insightSummary': string, 'workspaceTweak': string, 'nextWeekFocus': string }",
      },
    ],
  },
  generationConfig: {
    responseMimeType: 'application/json',
    temperature: 0.7,
  },
  contents: [
    {
      role: 'user',
      parts: [{ text: JSON.stringify(metrics) }],
    },
  ],
});

const callGemini = async (metrics) => {
  const apiKey = process.env.GEMINI_API_KEY || process.env.EXPO_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return {
      weeklyTitle: 'Recovery is on track',
      insightSummary: 'Consistency is improving. Keep your resets focused on the most-used zones this week.',
      workspaceTweak: 'Keep your keyboard at elbow height and lower the monitor by one inch to reduce forward-head posture.',
      nextWeekFocus: 'Focus on your highest-strain zone and keep one daily reset at the same time each day.',
    };
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildGeminiRequestBody(metrics)),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.map((part) => part?.text ?? '').join('') ?? '';

    if (!text) {
      throw new Error('Gemini returned no content.');
    }

    const parsed = JSON.parse(text);

    return {
      weeklyTitle: String(parsed.weeklyTitle ?? 'Recovery summary'),
      insightSummary: String(parsed.insightSummary ?? 'Your weekly habits are trending in the right direction.'),
      workspaceTweak: String(parsed.workspaceTweak ?? 'Adjust your work surface to keep your elbows near 90 degrees.'),
      nextWeekFocus: String(parsed.nextWeekFocus ?? 'Stay consistent with your top daily reset routine.'),
    };
  } catch (error) {
    console.warn('Gemini weekly insight failed; using local fallback.', error);
    return {
      weeklyTitle: 'Recovery is on track',
      insightSummary: 'Your weekly consistency is improving, and your posture pattern suggests more recovery is still helpful in your highest-strain areas.',
      workspaceTweak: 'Raise the keyboard and lower the monitor slightly to reduce shoulder and neck strain during long typing sessions.',
      nextWeekFocus: 'Prioritise the same time window each day so your resets become consistent instead of reactive.',
    };
  } finally {
    clearTimeout(timeout);
  }
};

const buildWeeklyInsightPayload = async (userId) => {
  const userIdValue = String(userId || 'demo-user');
  const logs = userActivityStore[userIdValue] ?? [];

  const sevenDayLogs = logs.filter((log) => {
    const logDate = new Date(log.completedAt);
    const now = new Date();
    const diffMs = now.getTime() - logDate.getTime();
    const diffDays = diffMs / (1000 * 60 * 60 * 24);
    return diffDays >= 0 && diffDays <= 6;
  });

  if (sevenDayLogs.length === 0) {
    return {
      empty: true,
      message: 'Start your first reset to unlock weekly insights',
      weeklyRecoveryScore: 0,
      scoreDelta: 0,
      histogramData: Array(7).fill(0),
      topTargetedZones: {},
      deskModeRatio: { desk: 0, open: 0 },
    };
  }

  const weeklyRecoveryScore = calculateRecoveryScore(sevenDayLogs);
  const previousWeekScore = getPreviousWeekAverage(userIdValue);
  const scoreDelta = previousWeekScore === 0 ? 0 : Math.round(((weeklyRecoveryScore - previousWeekScore) / previousWeekScore) * 100);

  const histogramData = computeHistogram(sevenDayLogs);
  const topTargetedZones = computeTargetedZones(sevenDayLogs);
  const deskModeRatio = computeDeskModeRatio(sevenDayLogs);

  const metrics = {
    weeklyRecoveryScore,
    scoreDelta,
    histogramData,
    topTargetedZones,
    deskModeRatio,
  };

  const aiSummary = await callGemini(metrics);

  return {
    ...metrics,
    ...aiSummary,
  };
};

module.exports = {
  buildWeeklyInsightPayload,
  userActivityStore,
};
