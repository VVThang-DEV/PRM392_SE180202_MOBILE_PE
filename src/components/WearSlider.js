import React, { useState, useEffect } from "react";
import { View, Text, Image, StyleSheet, ActivityIndicator } from "react-native";
import Slider from "@react-native-community/slider";
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from "../constants/theme";

const WEAR_CONDITIONS = [
  { id: 0, name: "Factory New", shortName: "FN", range: [0, 0.07] },
  { id: 1, name: "Minimal Wear", shortName: "MW", range: [0.07, 0.15] },
  { id: 2, name: "Field-Tested", shortName: "FT", range: [0.15, 0.38] },
  { id: 3, name: "Well-Worn", shortName: "WW", range: [0.38, 0.45] },
  { id: 4, name: "Battle-Scarred", shortName: "BS", range: [0.45, 1.0] },
];

export const WearSlider = ({ skinId }) => {
  const [wearValue, setWearValue] = useState(0); // 0-1 float value
  const [wearVariants, setWearVariants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentWear, setCurrentWear] = useState(WEAR_CONDITIONS[0]);

  useEffect(() => {
    fetchWearVariants();
  }, [skinId]);

  useEffect(() => {
    // Determine which wear condition based on float value
    const wear =
      WEAR_CONDITIONS.find(
        (w) => wearValue >= w.range[0] && wearValue < w.range[1]
      ) || WEAR_CONDITIONS[4];
    setCurrentWear(wear);
  }, [wearValue]);

  const fetchWearVariants = async () => {
    try {
      setLoading(true);
      const endpoints = [
        "https://bymykel.github.io/CSGO-API/api/en/skins_not_grouped.json",
        "https://raw.githubusercontent.com/ByMykel/CSGO-API/main/public/api/en/skins_not_grouped.json",
      ];

      let data = [];
      for (const endpoint of endpoints) {
        try {
          const response = await fetch(endpoint);
          if (response.ok) {
            const allSkins = await response.json();
            // Find all wear variants of this skin
            data = allSkins.filter((skin) => skin.skin_id === skinId);
            break;
          }
        } catch (error) {
          console.log(`Failed to fetch from ${endpoint}`);
        }
      }

      setWearVariants(data);
    } catch (error) {
      console.error("Error fetching wear variants:", error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentVariant = () => {
    if (wearVariants.length === 0) return null;

    // Find the variant matching current wear condition
    const variant = wearVariants.find((v) => v.wear?.name === currentWear.name);

    return variant || wearVariants[0];
  };

  const currentVariant = getCurrentVariant();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="small" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading wear conditions...</Text>
      </View>
    );
  }

  if (!currentVariant) {
    return null;
  }

  return (
    <View style={styles.container}>
      {/* Wear Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: currentVariant.image }}
          style={styles.image}
          resizeMode="contain"
        />
      </View>

      {/* Wear Info */}
      <View style={styles.infoContainer}>
        <Text style={styles.wearName}>{currentWear.name}</Text>
        <Text style={styles.floatValue}>Float: {wearValue.toFixed(4)}</Text>
      </View>

      {/* Wear Slider */}
      <View style={styles.sliderContainer}>
        <View style={styles.sliderTrack}>
          <Slider
            style={styles.slider}
            minimumValue={0}
            maximumValue={1}
            value={wearValue}
            onValueChange={setWearValue}
            minimumTrackTintColor={COLORS.primary}
            maximumTrackTintColor={COLORS.border}
            thumbTintColor={COLORS.primary}
          />
        </View>

        {/* Wear Markers */}
        <View style={styles.markersContainer}>
          {WEAR_CONDITIONS.map((wear, index) => (
            <View
              key={wear.id}
              style={[styles.marker, { left: `${wear.range[0] * 100}%` }]}
            >
              <View
                style={[
                  styles.markerDot,
                  currentWear.id === wear.id && styles.markerDotActive,
                ]}
              />
              <Text
                style={[
                  styles.markerText,
                  currentWear.id === wear.id && styles.markerTextActive,
                ]}
              >
                {wear.shortName}
              </Text>
            </View>
          ))}
        </View>
      </View>

      {/* Available Wears Info */}
      {wearVariants.length > 0 && (
        <View style={styles.availableWearsContainer}>
          <Text style={styles.availableWearsLabel}>Available Wears:</Text>
          <View style={styles.wearChips}>
            {wearVariants.map((variant) => (
              <View
                key={variant.id}
                style={[
                  styles.wearChip,
                  variant.wear?.name === currentWear.name &&
                    styles.wearChipActive,
                ]}
              >
                <Text
                  style={[
                    styles.wearChipText,
                    variant.wear?.name === currentWear.name &&
                      styles.wearChipTextActive,
                  ]}
                >
                  {WEAR_CONDITIONS.find((w) => w.name === variant.wear?.name)
                    ?.shortName || "?"}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.medium,
    padding: SPACING.medium,
    marginVertical: SPACING.small,
  },
  loadingContainer: {
    padding: SPACING.large,
    alignItems: "center",
  },
  loadingText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginTop: SPACING.small,
  },
  imageContainer: {
    width: "100%",
    height: 200,
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.small,
    marginBottom: SPACING.medium,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  infoContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SPACING.medium,
  },
  wearName: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
  },
  floatValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontFamily: "monospace",
  },
  sliderContainer: {
    marginBottom: SPACING.large,
  },
  sliderTrack: {
    paddingHorizontal: SPACING.small,
  },
  slider: {
    width: "100%",
    height: 40,
  },
  markersContainer: {
    flexDirection: "row",
    position: "relative",
    height: 40,
    marginTop: SPACING.tiny,
  },
  marker: {
    position: "absolute",
    alignItems: "center",
    transform: [{ translateX: -10 }],
  },
  markerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.border,
    marginBottom: SPACING.tiny,
  },
  markerDotActive: {
    backgroundColor: COLORS.primary,
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  markerText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
  },
  markerTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  availableWearsContainer: {
    paddingTop: SPACING.medium,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  availableWearsLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.small,
  },
  wearChips: {
    flexDirection: "row",
    gap: SPACING.small,
    flexWrap: "wrap",
  },
  wearChip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.small,
    paddingVertical: SPACING.tiny,
    borderRadius: BORDER_RADIUS.small,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  wearChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  wearChipText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
    fontWeight: "600",
  },
  wearChipTextActive: {
    color: COLORS.text,
  },
});
