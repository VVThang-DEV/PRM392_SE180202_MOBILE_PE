import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Modal,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  TYPOGRAPHY,
  SHADOWS,
} from "../constants/theme";

export const FilterPanel = ({ items, onFiltersChange }) => {
  const [visible, setVisible] = useState(false);
  const [filters, setFilters] = useState({
    categories: [],
    rarities: [],
    wears: [],
    stattrak: null, // null = all, true = only stattrak, false = non-stattrak
  });

  // Extract unique values from items
  const getUniqueCategories = () => {
    const categories = new Set();
    items.forEach((item) => {
      if (item.categoryName || item.category?.name) {
        categories.add(item.categoryName || item.category?.name);
      }
    });
    return Array.from(categories).sort();
  };

  const getUniqueRarities = () => {
    const rarities = new Set();
    items.forEach((item) => {
      if (item.rarityName || item.rarity?.name) {
        rarities.add(item.rarityName || item.rarity?.name);
      }
    });
    return Array.from(rarities).sort();
  };

  const getUniqueWears = () => {
    const wears = new Set();
    items.forEach((item) => {
      const itemWears =
        item.availableWears || item.wears?.map((w) => w.name) || [];
      itemWears.forEach((wear) => wears.add(wear));
    });
    return Array.from(wears).sort();
  };

  const toggleArrayFilter = (filterKey, value) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters((prev) => {
      const newArray = prev[filterKey].includes(value)
        ? prev[filterKey].filter((v) => v !== value)
        : [...prev[filterKey], value];
      return { ...prev, [filterKey]: newArray };
    });
  };

  const toggleStattrakFilter = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setFilters((prev) => ({
      ...prev,
      stattrak:
        prev.stattrak === null ? true : prev.stattrak === true ? false : null,
    }));
  };

  const applyFilters = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    onFiltersChange(filters);
    setVisible(false);
  };

  const clearFilters = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const emptyFilters = {
      categories: [],
      rarities: [],
      wears: [],
      stattrak: null,
    };
    setFilters(emptyFilters);
    onFiltersChange(emptyFilters);
  };

  const openModal = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setVisible(true);
  };

  const activeFilterCount =
    filters.categories.length +
    filters.rarities.length +
    filters.wears.length +
    (filters.stattrak !== null ? 1 : 0);

  return (
    <>
      {/* Filter Button */}
      <Pressable
        style={({ pressed }) => [
          styles.filterButton,
          pressed && styles.filterButtonPressed,
        ]}
        onPress={openModal}
      >
        <LinearGradient
          colors={
            activeFilterCount > 0
              ? [COLORS.primary, COLORS.accent]
              : [COLORS.surface, COLORS.surface]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.filterButtonGradient}
        >
          <Ionicons name="filter" size={20} color={COLORS.text} />
          <Text style={styles.filterButtonText}>Filters</Text>
          {activeFilterCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{activeFilterCount}</Text>
            </View>
          )}
        </LinearGradient>
      </Pressable>

      {/* Filter Modal */}
      <Modal
        visible={visible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Filters</Text>
              <Pressable onPress={() => setVisible(false)}>
                <Ionicons name="close" size={24} color={COLORS.text} />
              </Pressable>
            </View>

            {/* Filters Content */}
            <ScrollView
              style={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {/* Category Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Category</Text>
                <View style={styles.chipContainer}>
                  {getUniqueCategories().map((category) => (
                    <Pressable
                      key={category}
                      style={({ pressed }) => [
                        styles.chip,
                        filters.categories.includes(category) &&
                          styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                      onPress={() => toggleArrayFilter("categories", category)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.categories.includes(category) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {category}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Rarity Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Rarity</Text>
                <View style={styles.chipContainer}>
                  {getUniqueRarities().map((rarity) => (
                    <Pressable
                      key={rarity}
                      style={({ pressed }) => [
                        styles.chip,
                        filters.rarities.includes(rarity) && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                      onPress={() => toggleArrayFilter("rarities", rarity)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.rarities.includes(rarity) &&
                            styles.chipTextActive,
                        ]}
                      >
                        {rarity}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* Wear Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>Wear</Text>
                <View style={styles.chipContainer}>
                  {getUniqueWears().map((wear) => (
                    <Pressable
                      key={wear}
                      style={({ pressed }) => [
                        styles.chip,
                        filters.wears.includes(wear) && styles.chipActive,
                        pressed && styles.chipPressed,
                      ]}
                      onPress={() => toggleArrayFilter("wears", wear)}
                      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                      <Text
                        style={[
                          styles.chipText,
                          filters.wears.includes(wear) && styles.chipTextActive,
                        ]}
                      >
                        {wear}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              {/* StatTrak Filter */}
              <View style={styles.filterSection}>
                <Text style={styles.sectionTitle}>StatTrak™</Text>
                <Pressable
                  style={[
                    styles.toggleButton,
                    filters.stattrak !== null && styles.toggleButtonActive,
                  ]}
                  onPress={toggleStattrakFilter}
                >
                  <Text
                    style={[
                      styles.toggleText,
                      filters.stattrak !== null && styles.toggleTextActive,
                    ]}
                  >
                    {filters.stattrak === null
                      ? "All"
                      : filters.stattrak
                      ? "StatTrak™ Only"
                      : "Non-StatTrak™"}
                  </Text>
                </Pressable>
              </View>
            </ScrollView>

            {/* Footer Actions */}
            <View style={styles.footer}>
              <Pressable
                style={[styles.button, styles.buttonSecondary]}
                onPress={clearFilters}
              >
                <Text style={styles.buttonTextSecondary}>Clear All</Text>
              </Pressable>
              <Pressable
                style={[styles.button, styles.buttonPrimary]}
                onPress={applyFilters}
              >
                <Text style={styles.buttonTextPrimary}>Apply Filters</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  filterButton: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  filterButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.98 }],
  },
  filterButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    gap: SPACING.sm,
  },
  filterButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  badge: {
    backgroundColor: COLORS.background,
    borderRadius: BORDER_RADIUS.full,
    minWidth: 22,
    height: 22,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  badgeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontSize: 11,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.85)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: COLORS.surface,
    borderTopLeftRadius: BORDER_RADIUS.xl,
    borderTopRightRadius: BORDER_RADIUS.xl,
    maxHeight: "85%",
    ...SHADOWS.large,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.lg,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  headerTitle: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: "700",
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  filterSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    marginBottom: SPACING.md,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  chipContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: SPACING.sm,
  },
  chip: {
    backgroundColor: COLORS.background,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    ...SHADOWS.small,
  },
  chipPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.96 }],
  },
  chipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  chipText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontSize: 13,
    fontWeight: "500",
  },
  chipTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  toggleButton: {
    backgroundColor: COLORS.background,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: "center",
    ...SHADOWS.small,
  },
  toggleButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
    ...SHADOWS.medium,
  },
  toggleText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontWeight: "500",
  },
  toggleTextActive: {
    color: COLORS.text,
    fontWeight: "700",
  },
  footer: {
    flexDirection: "row",
    padding: SPACING.lg,
    gap: SPACING.md,
    borderTopWidth: 2,
    borderTopColor: COLORS.border,
    backgroundColor: COLORS.background,
  },
  button: {
    flex: 1,
    padding: SPACING.md + 2,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: "center",
    ...SHADOWS.medium,
  },
  buttonSecondary: {
    backgroundColor: COLORS.surface,
    borderWidth: 1.5,
    borderColor: COLORS.border,
  },
  buttonPrimary: {
    backgroundColor: COLORS.primary,
  },
  buttonTextSecondary: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
  },
  buttonTextPrimary: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
  },
});
