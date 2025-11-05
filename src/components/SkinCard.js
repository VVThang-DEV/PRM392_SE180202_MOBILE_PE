import React, { useEffect } from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Gesture, GestureDetector } from "react-native-gesture-handler";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
  interpolate,
} from "react-native-reanimated";
import * as Haptics from "expo-haptics";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../constants/theme";
import { useData } from "../context/DataContext";

export const SkinCard = ({ item, onPress, index = 0 }) => {
  const { isFavorite, toggleFavorite } = useData();
  const isItemFavorite = isFavorite(item._id);

  // Animation values
  const translateX = useSharedValue(0);
  const scale = useSharedValue(0);
  const opacity = useSharedValue(0);

  // Entrance animation
  useEffect(() => {
    opacity.value = withTiming(1, { duration: 300 + index * 50 });
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  }, []);

  // Swipe gesture handling
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      // Limit swipe distance
      translateX.value = Math.max(-120, Math.min(120, event.translationX));
    })
    .onEnd((event) => {
      const threshold = 80;

      if (Math.abs(event.translationX) > threshold) {
        // Trigger favorite toggle with haptic feedback
        runOnJS(Haptics.impactAsync)(Haptics.ImpactFeedbackStyle.Medium);
        runOnJS(toggleFavorite)(item._id);
      }

      // Return to original position
      translateX.value = withSpring(0, { damping: 15 });
    });

  // Tap gesture for opening details
  const tapGesture = Gesture.Tap().onEnd(() => {
    runOnJS(Haptics.selectionAsync)();
    runOnJS(onPress)();
  });

  const composedGesture = Gesture.Simultaneous(panGesture, tapGesture);

  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }, { scale: scale.value }],
    opacity: opacity.value,
  }));

  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [0, 80], [0, 1], "clamp");
    return { opacity };
  });

  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(translateX.value, [-80, 0], [1, 0], "clamp");
    return { opacity };
  });

  const getRarityColor = (color) => {
    if (!color) return COLORS.textMuted;
    return color.startsWith("#") ? color : `#${color}`;
  };

  return (
    <View style={styles.container}>
      {/* Swipe Actions Background */}
      <Animated.View style={[styles.actionLeft, leftActionStyle]}>
        <Ionicons
          name={isItemFavorite ? "star" : "star-outline"}
          size={32}
          color={COLORS.favorite}
        />
        <Text style={styles.actionText}>
          {isItemFavorite ? "Unfavorite" : "Favorite"}
        </Text>
      </Animated.View>

      <Animated.View style={[styles.actionRight, rightActionStyle]}>
        <Ionicons
          name={isItemFavorite ? "star" : "star-outline"}
          size={32}
          color={COLORS.favorite}
        />
        <Text style={styles.actionText}>
          {isItemFavorite ? "Unfavorite" : "Favorite"}
        </Text>
      </Animated.View>

      {/* Card */}
      <GestureDetector gesture={composedGesture}>
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image }}
              style={styles.image}
              resizeMode="contain"
            />
            {isItemFavorite && (
              <View style={styles.favoriteBadge}>
                <Ionicons name="star" size={16} color={COLORS.favorite} />
              </View>
            )}
          </View>

          <View style={styles.content}>
            <Text style={styles.weapon} numberOfLines={1}>
              {item.weapon || item.category}
            </Text>
            <Text style={styles.name} numberOfLines={2}>
              {item.name}
            </Text>

            <View style={styles.footer}>
              {item.rarity && (
                <View style={styles.rarityContainer}>
                  <View
                    style={[
                      styles.rarityDot,
                      { backgroundColor: getRarityColor(item.rarity_color) },
                    ]}
                  />
                  <Text style={styles.rarity} numberOfLines={1}>
                    {item.rarity}
                  </Text>
                </View>
              )}

              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            </View>
          </View>
        </Animated.View>
      </GestureDetector>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: SPACING.md,
    position: "relative",
  },
  actionLeft: {
    position: "absolute",
    left: SPACING.md,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  actionRight: {
    position: "absolute",
    right: SPACING.md,
    top: 0,
    bottom: 0,
    width: 100,
    backgroundColor: COLORS.success,
    borderRadius: BORDER_RADIUS.lg,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 0,
  },
  actionText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: "600",
    marginTop: SPACING.xs,
  },
  card: {
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    marginHorizontal: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...SHADOWS.medium,
    zIndex: 1,
  },
  imageContainer: {
    backgroundColor: COLORS.surface,
    height: 180,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  image: {
    width: "100%",
    height: "100%",
  },
  favoriteBadge: {
    position: "absolute",
    top: SPACING.sm,
    right: SPACING.sm,
    backgroundColor: COLORS.overlay,
    borderRadius: BORDER_RADIUS.full,
    padding: SPACING.sm,
  },
  content: {
    padding: SPACING.md,
  },
  weapon: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  name: {
    ...TYPOGRAPHY.body,
    fontWeight: "600",
    marginBottom: SPACING.sm,
    minHeight: 40,
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: SPACING.xs,
  },
  rarityContainer: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: SPACING.sm,
  },
  rarityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: SPACING.xs,
  },
  rarity: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textSecondary,
    flex: 1,
  },
  categoryBadge: {
    backgroundColor: COLORS.surface,
    paddingHorizontal: SPACING.sm,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  categoryText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.accent,
    fontWeight: "600",
  },
});
