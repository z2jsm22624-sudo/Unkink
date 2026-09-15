import AsyncStorage from '@react-native-async-storage/async-storage';
import * as BackgroundFetch from 'expo-background-fetch';
import * as TaskManager from 'expo-task-manager';

export const GEMINI_BACKGROUND_TASK = 'deskreset-gemini-analysis';
export const GEMINI_QUEUE_KEY = '@deskreset_gemini_queue';
export const GEMINI_LAST_RESULT_KEY = '@deskreset_gemini_last_result';

export type GeminiPayload = Record<string, unknown>;

const MASTER_EXERCISE_DATABASE = `
- neck_seated_chin_tucks (Front Neck, Desk Mode)
- neck_standing_skyward (Front Neck, Open Space)
- side_neck_seated_stretch (Side Neck, Desk Mode)
- side_neck_standing_drop (Side Neck, Open Space)
- neck_head_drops (Back Neck, Desk Mode)
- neck_standing_doorway (Back Neck, Open Space)

- chest_seated_opener (Chest, Desk Mode)
- shoulders_goalpost_expansion (Chest/Shoulders, Open Space)
- shoulders_seated_rolls (Upper Back/Shoulders, Desk Mode)
- shoulders_standing_bear_hug (Upper Back, Open Space)

- arms_biceps_desk_opener (Biceps, Desk Mode)
- arms_biceps_standing_wall (Biceps, Open Space)
- arms_triceps_seated_overhead (Triceps, Desk Mode)
- arms_triceps_standing_lean (Triceps, Open Space)

- forearms_seated_inner_press (Inner Forearms, Desk Mode)
- forearms_standing_wall_palm (Inner Forearms, Open Space)
- forearms_seated_outer_press (Outer Forearms, Desk Mode)
- forearms_standing_wall_flex (Outer Forearms, Open Space)

- wrists_seated_prayer (Inner Wrists, Desk Mode)
- wrists_standing_circles (Inner Wrists, Open Space)
- wrists_seated_reverse_prayer (Outer Wrists, Desk Mode)
- wrists_standing_shakeout (Outer Wrists, Open Space)

- torso_seated_side_lean (Side Body/Obliques, Desk Mode)
- torso_standing_sky_stretch (Abdominals, Open Space)
- spine_seated_chair_twist (Mid/Lower Back, Desk Mode)
- spine_standing_cat_cow (Spine, Open Space)

- quads_seated_extension (Quads, Desk Mode)
- quads_standing_stretch (Quads, Open Space)
- glutes_seated_figure_four (Glutes, Desk Mode)
- glutes_standing_figure_four (Glutes, Open Space)
- hamstrings_seated_heel_tap (Hamstrings, Desk Mode)
- hamstrings_standing_forward_fold (Hamstrings, Open Space)
- calves_seated_ankle_flex (Calves, Desk Mode)
- calves_standing_wall_stretch (Calves, Open Space)
`;

const EXERCISE_GUIDE_PROMPT = `
You are the DeskReset exercise recommendation engine.

STRICT RULES:
1. STRICT DATABASE MATCHING:
   - You MUST ONLY select exercise IDs present in the provided Master Exercise Database.
   - Never invent new exercise names or IDs.

2. ENVIRONMENT CONSTRAINTS (DESK MODE FILTER):
   - The system will inject an isDeskMode boolean flag with every request.
   - If isDeskMode is TRUE: You MUST ONLY select exercises marked as "Desk Mode".
   - If isDeskMode is FALSE: You may select exercises marked as "Open Space" or "Desk Mode".

3. ACCURACY & INTENT ANALYSIS:
   - Analyze user complaints, pain points, or quick-chip selections to identify affected body zones.
   - Select 2 to 3 exercises that best target the user's reported discomfort.

4. STRICT JSON OUTPUT FORMAT:
   - Return ONLY a valid JSON object matching the schema below.
   - No conversational fluff, markdown intro, or explanations outside the JSON structure.

MASTER EXERCISE DATABASE:
${MASTER_EXERCISE_DATABASE}

JSON RESPONSE SCHEMA:
{
  "routineTitle": "Short, empowering title for the routine",
  "summary": "1-sentence summary of why these stretches were selected",
  "detectedZones": ["Array of detected body zone tags"],
  "exerciseIds": ["Array of 2 to 3 valid exercise IDs from the master list"],
  "userAnalyticsLog": {
    "primaryDiscomfort": "Extracted primary pain point",
    "severityEstimate": "Low | Medium | High",
    "recommendedFocusArea": "Suggestion for future prevention"
  }
}

Important:
- Return only valid JSON.
- Ensure every exerciseId is from the master list.
- Respect the isDeskMode filter exactly.
- Do not include markdown fences or explanation text.
`;

export type ErgonomicDiagnosticResult = {
  topProblemAreas: string[];
  ergonomicDiagnostic: string;
  workspaceRecommendation: string;
  recoveryScore: number;
};

const ERGONOMIC_DIAGNOSTIC_PROMPT = `
You are an ergonomic physical therapy diagnostic engine.
You will be provided with an array of historical check-in logs from a DeskReset app user over the past 30 days.

Each log contains raw user text, detected body zones, timestamp, and environment mode status.

YOUR GOAL:
Analyze the data array to identify recurring postural issues, pain patterns, and progress metrics.

STRICT JSON OUTPUT SCHEMA:
{
  "topProblemAreas": ["Array of most frequently mentioned body zones"],
  "ergonomicDiagnostic": "2-sentence summary of overall physical strain patterns",
  "workspaceRecommendation": "1 practical desk setup tweak based on their specific pain trends",
  "recoveryScore": 85 // Number from 1 to 100 based on consistency and relief tracking
}

Do NOT include any commentary outside the JSON response.
`;

export function getGeminiApiKey(): string {
  return process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? '';
}

export function isGeminiConfigured(): boolean {
  return getGeminiApiKey().trim().length > 0;
}

export function getFallbackSuggestionCards(): string[] {
  return [
    'Hunching over laptop',
    'Heavy eyes & tension',
    'Stiff lower back',
  ];
}

export async function fetchDynamicSuggestionCards(): Promise<string[]> {
  const apiKey = getGeminiApiKey();
  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          system_instruction: {
            parts: [
              {
                text:
                  'You are the UI Suggestion Engine for DeskReset. Generate 3 short, realistic user complaint cards for workplace ergonomic fatigue. Keep each card text between 2 to 4 words without emojis. Examples: "Hunching over laptop", "Heavy eyes & tension", "Stiff lower back". Return ONLY a valid JSON object matching this schema: { "suggestions": ["String 1", "String 2", "String 3"] }',
              },
            ],
          },
          generationConfig: {
            responseMimeType: 'application/json',
            temperature: 0.8,
          },
          contents: [
            {
              role: 'user',
              parts: [{ text: 'Generate three realistic workplace ergonomic complaints for a desk worker right now.' }],
            },
          ],
        }),
        signal: controller.signal,
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini suggestion request failed: ${response.status}`);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts
      ?.map((part: { text?: string }) => part?.text ?? '')
      .join('\n') ?? '';

    if (!text) {
      throw new Error('Gemini returned no suggestion payload.');
    }

    const parsed = JSON.parse(text) as { suggestions?: unknown[] };
    const suggestions = Array.isArray(parsed.suggestions)
      ? parsed.suggestions
          .filter((value): value is string => typeof value === 'string')
          .map((value) => value.trim())
          .filter((value) => value.length > 0)
          .slice(0, 3)
      : [];

    if (suggestions.length !== 3) {
      throw new Error('Gemini returned an invalid suggestion set.');
    }

    return suggestions;
  } catch (error) {
    console.warn('Dynamic suggestion cards failed; using fallback suggestions.', error);
    return getFallbackSuggestionCards();
  } finally {
    clearTimeout(timeout);
  }
}

export async function queueGeminiAnalysis(label: string, payload: GeminiPayload): Promise<void> {
  const item = {
    label,
    payload,
    createdAt: new Date().toISOString(),
  };

  const existing = await AsyncStorage.getItem(GEMINI_QUEUE_KEY);
  const queue = existing ? (JSON.parse(existing) as Array<Record<string, unknown>>) : [];

  queue.push(item);
  await AsyncStorage.setItem(GEMINI_QUEUE_KEY, JSON.stringify(queue));
}

export async function clearGeminiQueue(): Promise<void> {
  await AsyncStorage.removeItem(GEMINI_QUEUE_KEY);
}

export async function getLatestGeminiResult(): Promise<string | null> {
  return AsyncStorage.getItem(GEMINI_LAST_RESULT_KEY);
}

export async function analyzeErgonomicHistory(logs: unknown[]): Promise<ErgonomicDiagnosticResult> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const diagnosticPrompt = `Historical check-in logs over the past 30 days:\n\n${JSON.stringify(logs, null, 2)}`;
  const rawText = await callGeminiForAnalysis(diagnosticPrompt, ERGONOMIC_DIAGNOSTIC_PROMPT);

  const parsed = JSON.parse(rawText) as Partial<ErgonomicDiagnosticResult>;

  if (!Array.isArray(parsed.topProblemAreas) || typeof parsed.ergonomicDiagnostic !== 'string' || typeof parsed.workspaceRecommendation !== 'string' || typeof parsed.recoveryScore !== 'number') {
    throw new Error('Gemini returned an invalid ergonomic diagnosis payload.');
  }

  return {
    topProblemAreas: parsed.topProblemAreas,
    ergonomicDiagnostic: parsed.ergonomicDiagnostic,
    workspaceRecommendation: parsed.workspaceRecommendation,
    recoveryScore: parsed.recoveryScore,
  };
}

async function callGeminiForAnalysis(prompt: string, systemPrompt = EXERCISE_GUIDE_PROMPT): Promise<string> {
  const apiKey = getGeminiApiKey();

  if (!apiKey) {
    throw new Error('Gemini API key is not configured.');
  }

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }],
        },
        generationConfig: {
          responseMimeType: 'application/json',
        },
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      }),
    },
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Gemini request failed: ${response.status} ${errorText}`);
  }

  const data = await response.json();
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((part: { text?: string }) => part?.text ?? '').join('\n') ?? '';

  return text.trim();
}

TaskManager.defineTask(GEMINI_BACKGROUND_TASK, async () => {
  try {
    const queueRaw = await AsyncStorage.getItem(GEMINI_QUEUE_KEY);

    if (!queueRaw) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const queue = JSON.parse(queueRaw) as Array<{ label: string; payload: GeminiPayload; createdAt: string }>;

    if (!queue.length) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }

    const next = queue[0];
    const context = JSON.stringify(next.payload, null, 2);
    const analysis = await callGeminiForAnalysis(
      `User complaint / selection context:\n\nLabel: ${next.label}\n\nPayload:\n${context}\n\nApply the rules above exactly and output the JSON object only.`,
      EXERCISE_GUIDE_PROMPT,
    );

    await AsyncStorage.setItem(GEMINI_LAST_RESULT_KEY, JSON.stringify({
      label: next.label,
      analysis,
      createdAt: next.createdAt,
      completedAt: new Date().toISOString(),
    }));

    const remaining = queue.slice(1);
    await AsyncStorage.setItem(GEMINI_QUEUE_KEY, JSON.stringify(remaining));

    return BackgroundFetch.BackgroundFetchResult.NewData;
  } catch (error) {
    console.error('Gemini background analysis failed:', error);
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export async function registerGeminiBackgroundTask(): Promise<boolean> {
  if (!isGeminiConfigured()) {
    return false;
  }

  const isRegistered = await TaskManager.isTaskRegisteredAsync(GEMINI_BACKGROUND_TASK);
  if (isRegistered) {
    return true;
  }

  await BackgroundFetch.registerTaskAsync(GEMINI_BACKGROUND_TASK, {
    minimumInterval: 60 * 15,
    stopOnTerminate: false,
    startOnBoot: true,
  });

  return true;
}

export async function unregisterGeminiBackgroundTask(): Promise<void> {
  await BackgroundFetch.unregisterTaskAsync(GEMINI_BACKGROUND_TASK);
}
