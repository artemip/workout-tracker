import { View, Text, TouchableOpacity } from "react-native";
import Modal from "./Modal";
import { useState } from "react";

interface PlateConfig {
  weight: number;
  count: number;
  color: string;
}

const BARBELL_WEIGHT = 45; // lbs

// Standard plate weights in order of preference (heaviest first)
const PLATE_WEIGHTS = [45, 35, 25, 10, 5, 2.5];

// Plate colors for visual distinction
const PLATE_COLORS: Record<number, string> = {
  45: "#DC2626", // red
  35: "#FBBF24", // yellow
  25: "#22C55E", // green
  10: "#3B82F6", // blue
  5: "#8B5CF6", // purple
  2.5: "#6B7280", // gray
};

function calculatePlates(totalWeight: number): PlateConfig[] {
  // Weight per side (subtract barbell, divide by 2)
  let weightPerSide = (totalWeight - BARBELL_WEIGHT) / 2;

  if (weightPerSide <= 0) {
    return [];
  }

  const plates: PlateConfig[] = [];

  for (const plateWeight of PLATE_WEIGHTS) {
    if (weightPerSide >= plateWeight) {
      const count = Math.floor(weightPerSide / plateWeight);
      plates.push({
        weight: plateWeight,
        count,
        color: PLATE_COLORS[plateWeight],
      });
      weightPerSide -= count * plateWeight;
    }
  }

  // Handle remaining weight that can't be achieved with standard plates
  if (weightPerSide > 0.1) {
    // Using 0.1 to account for floating point errors
    return []; // Can't achieve this weight with standard plates
  }

  return plates;
}

interface PlateVisualProps {
  plate: PlateConfig;
}

function PlateVisual({ plate }: PlateVisualProps) {
  // Height based on plate weight (heavier = taller)
  const heights: Record<number, number> = {
    45: 100,
    35: 85,
    25: 70,
    10: 50,
    5: 40,
    2.5: 30,
  };

  const height = heights[plate.weight] || 40;

  return (
    <View className="items-center mx-1">
      <View
        style={{
          backgroundColor: plate.color,
          height,
          width: 24,
          borderRadius: 4,
        }}
        className="items-center justify-center"
      >
        <Text className="text-white text-xs font-bold" style={{ fontSize: 9 }}>
          {plate.weight}
        </Text>
      </View>
      {plate.count > 1 && (
        <Text className="text-gray-500 text-xs mt-1">×{plate.count}</Text>
      )}
    </View>
  );
}

interface PlateMathContentProps {
  weight: number;
}

function PlateMathContent({ weight }: PlateMathContentProps) {
  const plates = calculatePlates(weight);
  const isValidWeight = weight >= BARBELL_WEIGHT && plates.length > 0;
  const isJustBarbell = weight === BARBELL_WEIGHT;

  if (weight < BARBELL_WEIGHT) {
    return (
      <View className="items-center py-6">
        <Text className="text-gray-500 text-center">
          Weight is less than the barbell ({BARBELL_WEIGHT} lbs)
        </Text>
      </View>
    );
  }

  if (isJustBarbell) {
    return (
      <View className="items-center py-6">
        <View className="flex-row items-center justify-center mb-4">
          <View className="bg-gray-400 h-2 w-32 rounded-full" />
        </View>
        <Text className="text-lg font-semibold text-gray-900">
          Empty Barbell
        </Text>
        <Text className="text-gray-500">{BARBELL_WEIGHT} lbs</Text>
      </View>
    );
  }

  if (!isValidWeight) {
    return (
      <View className="items-center py-6">
        <Text className="text-gray-500 text-center">
          Cannot achieve {weight} lbs with standard plates
        </Text>
        <Text className="text-gray-400 text-sm mt-2">
          Standard plates: 45, 35, 25, 10, 5, 2.5 lbs
        </Text>
      </View>
    );
  }

  return (
    <View className="py-4">
      {/* Barbell visualization */}
      <View className="items-center mb-6">
        <View className="flex-row items-center">
          {/* Left plates (reversed order for visual) */}
          <View className="flex-row items-center">
            {[...plates].reverse().map((plate, index) => (
              <View key={`left-${index}`} className="flex-row items-center">
                {Array.from({ length: plate.count }).map((_, i) => (
                  <PlateVisual
                    key={`left-${index}-${i}`}
                    plate={{ ...plate, count: 1 }}
                  />
                ))}
              </View>
            ))}
          </View>

          {/* Barbell */}
          <View className="bg-gray-400 h-3 w-16 rounded-full mx-1" />

          {/* Right plates */}
          <View className="flex-row items-center">
            {plates.map((plate, index) => (
              <View key={`right-${index}`} className="flex-row items-center">
                {Array.from({ length: plate.count }).map((_, i) => (
                  <PlateVisual
                    key={`right-${index}-${i}`}
                    plate={{ ...plate, count: 1 }}
                  />
                ))}
              </View>
            ))}
          </View>
        </View>
      </View>

      {/* Plate summary */}
      <View className="bg-gray-50 rounded-lg p-4">
        <Text className="text-sm font-semibold text-gray-700 mb-3">
          Per Side
        </Text>
        {plates.map((plate, index) => (
          <View
            key={index}
            className="flex-row items-center justify-between py-2"
          >
            <View className="flex-row items-center">
              <View
                style={{ backgroundColor: plate.color }}
                className="w-4 h-4 rounded mr-2"
              />
              <Text className="text-gray-900">{plate.weight} lb plate</Text>
            </View>
            <Text className="text-gray-600 font-medium">× {plate.count}</Text>
          </View>
        ))}
        <View className="border-t border-gray-200 mt-3 pt-3 flex-row justify-between">
          <Text className="text-gray-500">Barbell</Text>
          <Text className="text-gray-600 font-medium">
            {BARBELL_WEIGHT} lbs
          </Text>
        </View>
        <View className="flex-row justify-between mt-2">
          <Text className="font-semibold text-gray-900">Total</Text>
          <Text className="font-semibold text-gray-900">{weight} lbs</Text>
        </View>
      </View>
    </View>
  );
}

interface PlateMathButtonProps {
  weight: number;
}

export default function PlateMathButton({ weight }: PlateMathButtonProps) {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <TouchableOpacity
        onPress={() => setIsVisible(true)}
        className="py-3"
        activeOpacity={0.6}
      >
        <Text className="text-base text-gray-500">Plate Math</Text>
      </TouchableOpacity>

      <Modal
        title={`Plate Math: ${weight} lbs`}
        buttonText="Done"
        isVisible={isVisible}
        onClose={() => setIsVisible(false)}
      >
        <PlateMathContent weight={weight} />
      </Modal>
    </>
  );
}
