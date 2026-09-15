export interface MuscleGroupData {
  id: string;
  name: string;
  description: string;
  displayName: string;
  insight: string;
  deskExercises: ExerciseItem[];
  openSpaceExercises: ExerciseItem[];
}

export type BodyZoneId =
  | 'neck'
  | 'shoulders'
  | 'upperArms'
  | 'forearms'
  | 'wrists'
  | 'torso'
  | 'lowerBody';

export type BodyView = 'front' | 'back';

export interface ZoneDefinition {
  id: BodyZoneId;
  name: string;
  code: string;
  summary: string;
  accent: string;
}

export interface ExerciseItem {
  id: string;
  zoneId: BodyZoneId;
  category: string;
  title: string;
  description: string;
  isDeskMode: boolean;
  view: BodyView;
  duration: string;
  steps: string[];
}

export const ZONE_DEFINITIONS: ZoneDefinition[] = [
  {
    id: 'neck',
    name: 'Neck & Shoulders',
    code: 'SYS-01',
    summary: 'Front throat, side neck, and upper shoulder tension reset for desk posture.',
    accent: '#00E5FF',
  },
  {
    id: 'shoulders',
    name: 'Arms, Forearms & Wrists',
    code: 'SYS-02',
    summary: 'Mobility for the arms, elbows, wrists, and daily grip fatigue.',
    accent: '#5EE28D',
  },
  {
    id: 'torso',
    name: 'Core & Spine',
    code: 'SYS-03',
    summary: 'Restore rib-cage openness, torso rotation, and lower-back rhythm.',
    accent: '#A855F7',
  },
  {
    id: 'lowerBody',
    name: 'Lower Body & Glutes',
    code: 'SYS-04',
    summary: 'Reduce hip, hamstring, and calf lock-up from prolonged sitting.',
    accent: '#FF5E7E',
  },
];

export const EXERCISE_LIBRARY: ExerciseItem[] = [
  {
    id: 'neck_seated_chin_tucks',
    zoneId: 'neck',
    category: 'Front Neck',
    title: 'Chin Tucks',
    description: 'Reposition the head over the shoulders to relieve forward-head strain.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Sit tall with your shoulders relaxed and gaze straight ahead.',
      'Pull your chin straight back as if making a gentle double chin.',
      'Hold for 3 to 5 seconds and release without tilting your head.',
      'Repeat for the full round while keeping the ribs down and the neck long.',
    ],
  },
  {
    id: 'neck_standing_skyward',
    zoneId: 'neck',
    category: 'Front Neck',
    title: 'Skyward Neck Lift',
    description: 'Lengthen the front of the neck and help counter head-forward posture in open space.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Stand tall with the crown of the head reaching upward.',
      'Gently lengthen the front of the neck without throwing the chin forward.',
      'Breathe steadily and stay tall through the ribs.',
      'Release and repeat with a calm, even breath pattern.',
    ],
  },
  {
    id: 'side_neck_seated_stretch',
    zoneId: 'neck',
    category: 'Side Neck',
    title: 'Seated Side Neck Stretch',
    description: 'Open the side of the neck and upper traps without forcing the shoulder.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Sit upright and soften your shoulders away from your ears.',
      'Lower one ear toward the corresponding shoulder with a slow, easy glide.',
      'Keep the torso tall and avoid lifting the shoulder up toward the ear.',
      'Switch sides after the timer and repeat the same slow rhythm.',
    ],
  },
  {
    id: 'side_neck_standing_drop',
    zoneId: 'neck',
    category: 'Side Neck',
    title: 'Standing Side Neck Drop',
    description: 'Lengthen the side of the neck and ease strain from desk posture in open space.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Stand tall and soften the shoulders away from the ears.',
      'Gently lower one ear toward the corresponding shoulder.',
      'Keep the body vertical and the ribs down while you glide.',
      'Switch sides and repeat the same smooth cadence.',
    ],
  },
  {
    id: 'neck_head_drops',
    zoneId: 'neck',
    category: 'Back Neck',
    title: 'Head Drops',
    description: 'Ease the back of the neck and reduce tension from prolonged screen time.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Sit upright and keep your shoulders relaxed and low.',
      'Let the head drift gently forward and then back without forcing the movement.',
      'Keep the neck long and allow the chin to rest naturally.',
      'Return to center and repeat with a slow breath cycle.',
    ],
  },
  {
    id: 'neck_standing_doorway',
    zoneId: 'neck',
    category: 'Back Neck',
    title: 'Doorway Neck Reset',
    description: 'Open the back of the neck and upper chest in a standing position to restore posture.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Stand in a doorway and place the forearms on the frame.',
      'Lean gently forward while keeping the neck long and ribs down.',
      'Let the shoulders drop away from the ears and breathe steadily.',
      'Release and repeat without forcing the range.',
    ],
  },
  {
    id: 'chest_seated_opener',
    zoneId: 'shoulders',
    category: 'Chest',
    title: 'Seated Chest Opener',
    description: 'Wake up the chest and front shoulder muscles after a long screen position.',
    isDeskMode: true,
    view: 'front',
    duration: '45 sec',
    steps: [
      'Sit on the edge of your chair with your spine tall.',
      'Place your hands behind your back or on the chair frame and gently lift the chest.',
      'Roll the shoulders back and down without pinching the lower back.',
      'Hold the lift and breathe steadily for the full set.',
    ],
  },
  {
    id: 'shoulders_goalpost_expansion',
    zoneId: 'shoulders',
    category: 'Chest/Shoulders',
    title: 'Goalpost Expansion',
    description: 'Open the chest and shoulders to create space after prolonged reach-forward posture.',
    isDeskMode: false,
    view: 'front',
    duration: '45 sec',
    steps: [
      'Stand tall and bring both arms out to the sides in a goalpost shape.',
      'Open the chest and keep the elbows slightly bent.',
      'Move the arms back and down gently to increase shoulder mobility.',
      'Pause and reset before repeating with a smooth breath rhythm.',
    ],
  },
  {
    id: 'shoulders_seated_rolls',
    zoneId: 'shoulders',
    category: 'Upper Back/Shoulders',
    title: 'Seated Shoulder Rolls',
    description: 'Reduce scapular stiffness and restore better shoulder rhythm from desk work.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Sit tall with the arms relaxed at the sides.',
      'Roll the shoulders backward and down in a smooth circular motion.',
      'Keep the neck long and the chin neutral.',
      'Continue for a slow round before switching direction.',
    ],
  },
  {
    id: 'shoulders_standing_bear_hug',
    zoneId: 'shoulders',
    category: 'Upper Back',
    title: 'Standing Bear Hug',
    description: 'Release the upper back and shoulders with a broad, supportive hug pattern.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Stand tall and bring the arms around the rib cage in a wide hug.',
      'Pull the elbows gently back while keeping the chest open.',
      'Breathe and allow the upper back to decompress.',
      'Reset and repeat with the shoulders soft and low.',
    ],
  },
  {
    id: 'arms_biceps_desk_opener',
    zoneId: 'upperArms',
    category: 'Biceps',
    title: 'Desk Biceps Opener',
    description: 'Release the front of the upper arm and counter the forward reach posture.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Stand or sit tall with the shoulders soft and the elbows near the ribs.',
      'Extend the arms slightly behind the torso and open the chest without arching.',
      'Turn the palms inward and gently stretch the biceps and front shoulder line.',
      'Hold and then return with a slow breath cycle.',
    ],
  },
  {
    id: 'arms_biceps_standing_wall',
    zoneId: 'upperArms',
    category: 'Biceps',
    title: 'Wall Biceps Stretch',
    description: 'Open the front of the arms and reduce tension after repeated overhead or keyboard reach.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Stand facing a wall and place the palms on it at shoulder height.',
      'Step back gently to feel the stretch through the biceps and front shoulders.',
      'Keep the ribs down and the neck long while breathing slowly.',
      'Return to center and repeat with control.',
    ],
  },
  {
    id: 'arms_triceps_seated_overhead',
    zoneId: 'upperArms',
    category: 'Triceps',
    title: 'Seated Overhead Reach',
    description: 'Lengthen the triceps and chest wall after repeated reach and reach-forward posture.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec each arm',
    steps: [
      'Sit tall and bring one arm overhead with the elbow bent.',
      'Reach gently toward the opposite shoulder blade to widen the upper arm.',
      'Keep the ribs down and avoid leaning the torso to one side.',
      'Switch arms after the timer and repeat at the same pace.',
    ],
  },
  {
    id: 'arms_triceps_standing_lean',
    zoneId: 'upperArms',
    category: 'Triceps',
    title: 'Standing Triceps Lean',
    description: 'Unlock the back of the upper arm to support better shoulder freedom in open space.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Stand tall and raise one arm overhead with the elbow bent.',
      'Lean gently away from the arm to increase the stretch in the triceps.',
      'Keep the neck long and the chest open.',
      'Switch sides and continue at a smooth, controlled pace.',
    ],
  },
  {
    id: 'forearms_seated_inner_press',
    zoneId: 'forearms',
    category: 'Inner Forearms',
    title: 'Seated Inner Press',
    description: 'Open the inner forearm and reduce gripping tension from keyboard work.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Sit tall and extend both forearms forward with the palms facing each other.',
      'Press the palms gently together and widen the chest without shrugging.',
      'Feel the stretch through the inner forearms and wrists.',
      'Release and repeat for the full set while keeping the shoulders soft.',
    ],
  },
  {
    id: 'forearms_standing_wall_palm',
    zoneId: 'forearms',
    category: 'Inner Forearms',
    title: 'Wall Palm Stretch',
    description: 'Open the forearm flexors and release wrist compression in open space.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Stand facing a wall and place both palms on it at chest height.',
      'Walk the body backward gently while keeping the palms active.',
      'Let the forearms open without lifting the shoulders.',
      'Breathe and settle into the stretch before returning to neutral.',
    ],
  },
  {
    id: 'forearms_seated_outer_press',
    zoneId: 'forearms',
    category: 'Outer Forearms',
    title: 'Seated Outer Press',
    description: 'Ease the outer forearm and reduce the twist that develops from mouse usage.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Sit upright and place palms together in front of the chest.',
      'Spread the fingers and gently press the outer edges of the hands away from each other.',
      'Keep the elbows low and allow the wrist to open without pain.',
      'Hold the stretch and then reset with a slow exhale.',
    ],
  },
  {
    id: 'forearms_standing_wall_flex',
    zoneId: 'forearms',
    category: 'Outer Forearms',
    title: 'Wall Flex Stretch',
    description: 'Reset the outer forearm and wrist after repetitive gripping or lifting in open space.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Stand facing a wall and place the fingers against it with the palms facing down.',
      'Press gently and then peel the hands away to stretch the outer forearm.',
      'Keep the shoulders low and the chest open.',
      'Repeat gently without forcing the wrist into pain.',
    ],
  },
  {
    id: 'wrists_seated_prayer',
    zoneId: 'wrists',
    category: 'Inner Wrists',
    title: 'Prayer Stretch',
    description: 'Reduce the strain on the flexor side of the wrists after typing sessions.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Sit upright and bring the palms together in front of the chest.',
      'Lower the elbows gently while keeping the palms pressed together.',
      'Let the wrists soften and sink into the stretch without forcing the fingers.',
      'Hold and then slowly release to neutral.',
    ],
  },
  {
    id: 'wrists_standing_circles',
    zoneId: 'wrists',
    category: 'Inner Wrists',
    title: 'Standing Wrist Circles',
    description: 'Wake up the wrist joints and reduce stiffness in a standing recovery sequence.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Stand tall with the arms relaxed at the sides.',
      'Open the palms and gently circle the wrists in small, controlled motions.',
      'Keep the shoulders low and the motion slow and pain-free.',
      'Switch direction after the timer and continue with a smooth rhythm.',
    ],
  },
  {
    id: 'wrists_seated_reverse_prayer',
    zoneId: 'wrists',
    category: 'Outer Wrists',
    title: 'Reverse Prayer',
    description: 'Open the backside of the wrists and hands that overextend during mouse work.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Bring the palms together behind the back or in front of the body and open the fingers.',
      'Lengthen the wrist with a gentle backward bend while keeping the shoulders down.',
      'Move slowly so the stretch stays in the wrist instead of the forearm.',
      'Release and repeat with a calm breath.',
    ],
  },
  {
    id: 'wrists_standing_shakeout',
    zoneId: 'wrists',
    category: 'Outer Wrists',
    title: 'Standing Shakeout',
    description: 'Release the wrists and forearms after repetitive gripping or pinching motions.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec',
    steps: [
      'Stand tall and let the arms hang naturally.',
      'Gently shake the hands loose and open the fingers while keeping the shoulders soft.',
      'Let the motion be natural and light without forcing range.',
      'Reset and repeat with a relaxed, fluid rhythm.',
    ],
  },
  {
    id: 'torso_seated_side_lean',
    zoneId: 'torso',
    category: 'Side Body/Obliques',
    title: 'Seated Side Lean',
    description: 'Create space through the ribs and obliques after hours of seated compression.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec each side',
    steps: [
      'Sit tall and reach one arm overhead.',
      'Lean gently to the opposite side while keeping the hips square.',
      'Feel the stretch wrap around the rib cage instead of the low back.',
      'Switch sides and repeat with a slow exhale.',
    ],
  },
  {
    id: 'torso_standing_sky_stretch',
    zoneId: 'torso',
    category: 'Abdominals',
    title: 'Sky Stretch',
    description: 'Lengthen the torso and open the front body to combat compression and slouching.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec',
    steps: [
      'Stand tall and reach both arms overhead.',
      'Lift through the crown of the head and gently lengthen the torso.',
      'Keep the ribs down and avoid arching through the low back.',
      'Breathe deeply and return to neutral with control.',
    ],
  },
  {
    id: 'spine_seated_chair_twist',
    zoneId: 'torso',
    category: 'Mid/Lower Back',
    title: 'Chair Twist',
    description: 'Mobility the mid-back and reduce stiffness from long static sitting.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Sit tall and place one hand on the opposite thigh or chair back.',
      'Rotate the chest gently while keeping the hips grounded.',
      'Keep the movement slow and allow the low back to stay quiet.',
      'Switch sides and maintain an easy, controlled range.',
    ],
  },
  {
    id: 'spine_standing_cat_cow',
    zoneId: 'torso',
    category: 'Spine',
    title: 'Standing Cat-Cow',
    description: 'Mobilize the spine and restore a smoother spinal rhythm after static desk work.',
    isDeskMode: false,
    view: 'back',
    duration: '45 sec',
    steps: [
      'Stand with the feet hip-width apart and the knees soft.',
      'Move into a gentle round and then a gentle arch through the spine.',
      'Let the head float in line with the spine without bracing the neck.',
      'Repeat the wave slowly and keep the movement smooth and easy.',
    ],
  },
  {
    id: 'quads_seated_extension',
    zoneId: 'lowerBody',
    category: 'Quads',
    title: 'Seated Quad Stretch',
    description: 'Lengthen the front of the thigh and reduce compression from chair sitting.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec each leg',
    steps: [
      'Sit tall on the edge of the chair and straighten one leg forward.',
      'Keep the heel down and the toes up while lengthening through the knee.',
      'Hinge slightly forward from the hips without rounding the back.',
      'Switch legs and repeat the same controlled pattern.',
    ],
  },
  {
    id: 'quads_standing_stretch',
    zoneId: 'lowerBody',
    category: 'Quads',
    title: 'Standing Quad Stretch',
    description: 'Open the front of the thigh in an upright standing pattern to restore leg length.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec each leg',
    steps: [
      'Stand tall and hold a wall or chair for balance.',
      'Bend one knee and bring the heel back toward the glute.',
      'Keep the knees close together and the pelvis level.',
      'Switch sides and stay smooth and controlled.',
    ],
  },
  {
    id: 'glutes_seated_figure_four',
    zoneId: 'lowerBody',
    category: 'Glutes',
    title: 'Seated Figure-Four Stretch',
    description: 'Open the deep gluteal region and reduce low-back fatigue from prolonged sitting.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Sit upright and cross one ankle over the opposite knee.',
      'Keep the spine long and gently lean forward from the hips.',
      'Let the stretch settle in the glute and outer hip instead of the lower back.',
      'Switch sides after the round and repeat the same cadence.',
    ],
  },
  {
    id: 'glutes_standing_figure_four',
    zoneId: 'lowerBody',
    category: 'Glutes',
    title: 'Standing Figure-Four Stretch',
    description: 'Release the glutes and outer hips in a standing posture reset.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Stand tall and cross one ankle over the opposite knee.',
      'Hinge forward gently from the hips while keeping the spine long.',
      'Stay relaxed in the glute and outer hip without collapsing the lower back.',
      'Switch sides and repeat with control.',
    ],
  },
  {
    id: 'hamstrings_seated_heel_tap',
    zoneId: 'lowerBody',
    category: 'Hamstrings',
    title: 'Seated Heel Tap',
    description: 'Unload the back of the thighs and restore a more open lower-body posture from seated work.',
    isDeskMode: true,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Sit tall and straighten one leg forward with the heel on the floor.',
      'Hinge gently from the hips while keeping the spine long.',
      'Let the hamstrings lengthen without rounding the low back.',
      'Switch sides after the set and repeat at the same pace.',
    ],
  },
  {
    id: 'hamstrings_standing_forward_fold',
    zoneId: 'lowerBody',
    category: 'Hamstrings',
    title: 'Standing Forward Fold',
    description: 'Unload the back of the thighs and restore a more open lower-body posture.',
    isDeskMode: false,
    view: 'back',
    duration: '30 sec each side',
    steps: [
      'Stand tall with one foot slightly in front of the other.',
      'Hinge at the hips and let the chest fold forward while the knee stays soft.',
      'Keep the neck long and the lower back quiet as the hamstrings lengthen.',
      'Alternate sides and return to upright with control each time.',
    ],
  },
  {
    id: 'calves_seated_ankle_flex',
    zoneId: 'lowerBody',
    category: 'Calves',
    title: 'Seated Ankle Flex',
    description: 'Release the calves and ankles that tighten from a seated, low-movement day.',
    isDeskMode: true,
    view: 'front',
    duration: '30 sec each leg',
    steps: [
      'Sit tall and straighten one leg while keeping the heel on the floor.',
      'Gently pull the toes toward the body and then point them away.',
      'Keep the knee soft and the movement slow and controlled.',
      'Switch legs and repeat without forcing the ankle.',
    ],
  },
  {
    id: 'calves_standing_wall_stretch',
    zoneId: 'lowerBody',
    category: 'Calves',
    title: 'Wall Calf Stretch',
    description: 'Release the calves and ankles that tighten from a seated, low-movement day.',
    isDeskMode: false,
    view: 'front',
    duration: '30 sec each leg',
    steps: [
      'Stand facing a wall and place the front foot forward with the heel grounded.',
      'Step the back heel away and press it gently into the floor.',
      'Lean the body forward to feel the calf stretch without lifting the heel.',
      'Switch sides after the timed stretch and repeat at a smooth pace.',
    ],
  },
];

export function getExercisesForZone(
  zoneId: BodyZoneId,
  isDeskMode: boolean,
  view: BodyView,
): ExerciseItem[] {
  const exactMatch = EXERCISE_LIBRARY.filter(
    (exercise) =>
      exercise.zoneId === zoneId &&
      exercise.isDeskMode === isDeskMode &&
      exercise.view === view,
  );

  if (exactMatch.length > 0) {
    return exactMatch;
  }

  const modeFallback = EXERCISE_LIBRARY.filter(
    (exercise) => exercise.zoneId === zoneId && exercise.isDeskMode === isDeskMode,
  );

  if (modeFallback.length > 0) {
    return modeFallback;
  }

  return EXERCISE_LIBRARY.filter((exercise) => exercise.zoneId === zoneId);
}
