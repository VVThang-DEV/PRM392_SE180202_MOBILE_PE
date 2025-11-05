import React from "react";
import {
  View,
  Text,
  Image,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  runOnJS,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import { useData } from "../context/DataContext";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../constants/theme";

const { width } = Dimensions.get("window");

export const DetailScreen = ({ route, navigation }) => {
  const { itemId } = route.params;
  const { items, isFavorite, toggleFavorite } = useData();

  const item = items.find((i) => i._id === itemId);
  const isItemFavorite = isFavorite(itemId);

  // Animation for favorite button
  const scale = useSharedValue(1);

  if (!item) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>Item not found</Text>
      </View>
    );
  }

  const handleToggleFavorite = () => {
    // Animate button
    scale.value = withSpring(0.8, {}, () => {
      scale.value = withSpring(1);
    });

    // Haptic feedback
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    // Toggle favorite
    toggleFavorite(itemId);
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const getRarityColor = (color) => {
    if (!color) return COLORS.textMuted;
    return color.startsWith("#") ? color : `#${color}`;
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
    >
      {/* Header Image */}
      <View style={styles.imageContainer}>
        <Image
          source={{ uri: item.image }}
          style={styles.image}
          resizeMode="contain"
        />

        {/* Favorite Button */}
        <Animated.View style={[animatedButtonStyle]}>
          <TouchableOpacity
            style={styles.favoriteButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isItemFavorite ? "star" : "star-outline"}
              size={28}
              color={isItemFavorite ? COLORS.favorite : COLORS.text}
            />
          </TouchableOpacity>
        </Animated.View>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Category Badge */}
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryText}>{item.category}</Text>
        </View>

        {/* Weapon Name */}
        {item.weapon && <Text style={styles.weapon}>{item.weapon}</Text>}

        {/* Skin Name */}
        <Text style={styles.name}>{item.name}</Text>

        {/* Description */}
        {item.description && (
          <Text style={styles.description}>{item.description}</Text>
        )}

        {/* Info Cards */}
        <View style={styles.infoSection}>
          {/* Rarity Card */}
          {item.rarity && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Rarity</Text>
              <View style={styles.rarityContainer}>
                <View
                  style={[
                    styles.rarityDot,
                    { backgroundColor: getRarityColor(item.rarity_color) },
                  ]}
                />
                <Text style={styles.infoValue}>{item.rarity}</Text>
              </View>
            </View>
          )}

          {/* Pattern Card */}
          {item.pattern && (
            <View style={styles.infoCard}>
              <Text style={styles.infoLabel}>Pattern</Text>
              <Text style={styles.infoValue}>{item.pattern}</Text>
            </View>
          )}
        </View>

        {/* Float Values */}
        {(item.min_float !== 0 || item.max_float !== 1) && (
          <View style={styles.floatSection}>
            <Text style={styles.sectionTitle}>Float Range</Text>
            <View style={styles.floatContainer}>
              <View style={styles.floatItem}>
                <Text style={styles.floatLabel}>Min</Text>
                <Text style={styles.floatValue}>
                  {item.min_float.toFixed(4)}
                </Text>
              </View>
              <View style={styles.floatDivider} />
              <View style={styles.floatItem}>
                <Text style={styles.floatLabel}>Max</Text>
                <Text style={styles.floatValue}>
                  {item.max_float.toFixed(4)}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Team */}
        {item.team && (
          <View style={styles.teamSection}>
            <Text style={styles.infoLabel}>Team</Text>
            <Text style={styles.infoValue}>{item.team}</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    paddingBottom: SPACING.xl,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
  },
  imageContainer: {
    backgroundColor: COLORS.surface,
    height: 300,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: width,
    height: 300,
  },
  favoriteButton: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    backgroundColor: COLORS.overlay,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.md,
    ...SHADOWS.medium,
  },
  content: {
    padding: SPACING.lg,
  },
  categoryBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    alignSelf: "flex-start",
    marginBottom: SPACING.md,
  },
  categoryText: {
    ...TYPOGRAPHY.bodySecondary,
    color: COLORS.text,
    fontWeight: "600",
  },
  weapon: {
    ...TYPOGRAPHY.bodySecondary,
    color: COLORS.textSecondary,
    textTransform: "uppercase",
    letterSpacing: 1,
    marginBottom: SPACING.xs,
  },
  name: {
    ...TYPOGRAPHY.h2,
    marginBottom: SPACING.md,
  },
  description: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    lineHeight: 24,
    marginBottom: SPACING.lg,
  },
  infoSection: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  infoCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
  },
  rarityContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rarityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: SPACING.sm,
  },
  floatSection: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SPACING.lg,
  },
  sectionTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.md,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  floatContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  floatItem: {
    flex: 1,
    alignItems: "center",
  },
  floatDivider: {
    width: 1,
    height: 40,
    backgroundColor: COLORS.border,
    marginHorizontal: SPACING.md,
  },
  floatLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  floatValue: {
    ...TYPOGRAPHY.h3,
    color: COLORS.accent,
  },
  teamSection: {
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
});
