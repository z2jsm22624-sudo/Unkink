import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import Svg, { G, Rect, Text as SvgText } from 'react-native-svg';
import * as Haptics from 'expo-haptics';
import { Theme } from '../../constants/themes';

interface BodyCanvasProps {
  theme: Theme;
  view: 'front' | 'back';
  onToggleView: () => void;
  onSelectMuscle: (muscleId: string) => void;
  selectedMuscle: string | null;
}

export const BodyCanvas: React.FC<BodyCanvasProps> = ({
  theme,
  view,
  onToggleView,
  onSelectMuscle,
  selectedMuscle,
}) => {
  const handlePress = (id: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSelectMuscle(id);
  };

  const frontLabels = [
    { id: 'neck', label: 'Neck', x: 86, y: -12, width: 70, height: 28 },
    { id: 'shoulders', label: 'Shoulders & Upper Chest', x: 0, y: 62, width: 170, height: 30 },
    { id: 'upperArms', label: 'Upper Arms', x: 60, y: 110, width: 120, height: 28 },
    { id: 'forearms', label: 'Forearms', x: 50, y: 160, width: 120, height: 28 },
    { id: 'wrists', label: 'Wrist & Hands', x: 52, y: 184, width: 130, height: 28 },
    { id: 'lowerBody', label: 'Quads', x: 72, y: 350, width: 90, height: 28 },
    { id: 'calves', label: 'Calves', x: 72, y: 402, width: 90, height: 28 },
  ];

  const backLabels = [
    { id: 'neck', label: 'Neck', x: 86, y: -12, width: 70, height: 28 },
    { id: 'shoulders', label: 'Shoulders & Upper Back', x: 0, y: 62, width: 180, height: 30 },
    { id: 'upperArms', label: 'Upper Arms', x: 60, y: 110, width: 120, height: 28 },
    { id: 'forearms', label: 'Forearms', x: 50, y: 160, width: 120, height: 28 },
    { id: 'wrists', label: 'Wrist & Hands', x: 52, y: 184, width: 130, height: 28 },
    { id: 'back', label: 'Spine', x: 78, y: 300, width: 92, height: 30 },
    { id: 'lowerBody', label: 'Hamstrings', x: 56, y: 350, width: 120, height: 28 },
    { id: 'calves', label: 'Calves', x: 72, y: 402, width: 90, height: 28 },
  ];

  const muscleLabels = view === 'front' ? frontLabels : backLabels;

  const getLabelColor = (id: string) => {
    if (selectedMuscle === id) {
      return '#76E89C';
    }
    return theme.background === '#F5EDE1' ? '#3B3B3B' : '#D7D7D7';
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.flipButton, { backgroundColor: theme.cardBg + 'CC' }]}
        onPress={() => {
          Haptics.selectionAsync();
          onToggleView();
        }}
      >
        <Text style={[styles.flipText, { color: theme.textPrimary }]}>
          {view === 'front' ? 'Front' : 'Back'}
        </Text>
      </TouchableOpacity>

      <View style={styles.canvasContainer}>
        {/* LAYER 1: Dynamic Background Character Asset */}
        <Image
          source={
            view === 'front'
              ? require('../../../assets/FemaleFigureFront.jpg')
              : require('../../../assets/FemaleFigureRear.png')
          }
          style={styles.backgroundImage}
          resizeMode="contain"
        />

        {/* LAYER 2: Interactive Muscle Labels */}
        <Svg height="440" width="260" viewBox="0 0 260 440" style={styles.svgOverlay}>
          <G transform="translate(16 16)">
            {muscleLabels.map((muscle) => {
              const isSelected = selectedMuscle === muscle.id;
              const labelTextColor = getLabelColor(muscle.id);
              const hitPadding = 16;
              const hitAreaX = muscle.x - hitPadding / 2;
              const hitAreaY = muscle.y - hitPadding / 2;
              const hitAreaWidth = muscle.width + hitPadding;
              const hitAreaHeight = muscle.height + hitPadding;

              return (
                <G
                  key={`${muscle.id}-${muscle.x}-${muscle.y}`}
                  onPress={() => handlePress(muscle.id)}
                >
                  <Rect
                    x={hitAreaX}
                    y={hitAreaY}
                    width={hitAreaWidth}
                    height={hitAreaHeight}
                    fill="transparent"
                    stroke="transparent"
                    onPress={() => handlePress(muscle.id)}
                  />
                  <SvgText
                    x={muscle.x + muscle.width / 2}
                    y={muscle.y + muscle.height / 2 + 4}
                    textAnchor="middle"
                    fontSize={11}
                    fontWeight="700"
                    fill={labelTextColor}
                    stroke={isSelected ? '#5EE28D' : 'transparent'}
                    strokeWidth={isSelected ? 1.2 : 0}
                  >
                    {muscle.label}
                  </SvgText>
                </G>
              );
            })}
          </G>
        </Svg>
      </View>

      <Text style={[styles.instruction, { color: theme.textSecondary }]}>
        Tap a muscle label to focus it
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 10,
  },
  flipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  flipText: {
    fontSize: 13,
    fontWeight: '600',
  },
  canvasContainer: {
    width: 280,
    height: 460,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backgroundImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  svgOverlay: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
  },
  instruction: {
    fontSize: 12,
    marginTop: 8,
  },
});