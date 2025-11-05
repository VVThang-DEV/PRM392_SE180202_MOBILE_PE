import React from "react";
import { View, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { COLORS, SPACING, BORDER_RADIUS, SHADOWS } from "../constants/theme";

export const SearchBar = ({
  value,
  onChangeText,
  placeholder = "Search skins, weapons, patterns...",
}) => {
  const handleClear = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onChangeText("");
  };

  return (
    <View style={styles.wrapper}>
      <LinearGradient
        colors={[COLORS.surface, COLORS.card]}
        style={styles.gradient}
      >
        <View style={styles.container}>
          <Ionicons
            name="search"
            size={22}
            color={value ? COLORS.primary : COLORS.textMuted}
            style={styles.icon}
          />
          <TextInput
            style={styles.input}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={COLORS.textMuted}
            selectionColor={COLORS.primary}
          />
          {value.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Ionicons
                name="close-circle"
                size={20}
                color={COLORS.textMuted}
              />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    borderRadius: BORDER_RADIUS.xl,
    overflow: "hidden",
    ...SHADOWS.medium,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  gradient: {
    borderRadius: BORDER_RADIUS.xl,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
  },
  icon: {
    marginRight: SPACING.md,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "500",
  },
  clearButton: {
    padding: SPACING.xs,
    marginLeft: SPACING.sm,
  },
});
