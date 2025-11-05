import React, { useState, useMemo } from "react";
import { View, FlatList, Text, StyleSheet } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Ionicons } from "@expo/vector-icons";
import { SearchBar } from "../components/SearchBar";
import { CategoryFilter } from "../components/CategoryFilter";
import { SkinCard } from "../components/SkinCard";
import { useData } from "../context/DataContext";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants/theme";

export const FavoritesScreen = ({ navigation }) => {
  const { getFavoriteItems } = useData();
  const favoriteItems = getFavoriteItems();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Extract unique categories from favorite items
  const categories = useMemo(() => {
    const categorySet = new Set();
    favoriteItems.forEach((item) => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [favoriteItems]);

  // Filter favorites based on search and category
  const filteredFavorites = useMemo(() => {
    let filtered = favoriteItems;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((item) => item.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(query) ||
          item.weapon?.toLowerCase().includes(query) ||
          item.category?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [favoriteItems, searchQuery, selectedCategory]);

  const handleItemPress = (item) => {
    navigation.navigate("Detail", { itemId: item._id });
  };

  const renderItem = ({ item, index }) => (
    <SkinCard item={item} onPress={() => handleItemPress(item)} index={index} />
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="star-outline" size={64} color={COLORS.textMuted} />
      <Text style={styles.emptyTitle}>
        {searchQuery || selectedCategory !== "All"
          ? "No favorites match your filters"
          : "No favorites yet"}
      </Text>
      <Text style={styles.emptySubtitle}>
        {searchQuery || selectedCategory !== "All"
          ? "Try adjusting your search or filters"
          : "Swipe left or right on any skin card to add it to your favorites"}
      </Text>
    </View>
  );

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        {favoriteItems.length > 0 && (
          <>
            <SearchBar
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder="Search favorites..."
            />

            {categories.length > 0 && (
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onSelectCategory={setSelectedCategory}
              />
            )}
          </>
        )}

        <FlatList
          data={filteredFavorites}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={[
            styles.listContent,
            filteredFavorites.length === 0 && styles.listContentEmpty,
          ]}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    paddingTop: SPACING.md,
  },
  listContent: {
    paddingBottom: SPACING.xl,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  emptyTitle: {
    ...TYPOGRAPHY.h3,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
    textAlign: "center",
  },
  emptySubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 280,
  },
});
