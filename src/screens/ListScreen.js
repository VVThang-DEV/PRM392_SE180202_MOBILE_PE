import React, { useState, useMemo } from "react";
import {
  View,
  FlatList,
  ActivityIndicator,
  Text,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SearchBar } from "../components/SearchBar";
import { CategoryFilter } from "../components/CategoryFilter";
import { SkinCard } from "../components/SkinCard";
import { useData } from "../context/DataContext";
import { COLORS, SPACING, TYPOGRAPHY } from "../constants/theme";

export const ListScreen = ({ navigation }) => {
  const { items, isLoading, error, syncFromAPI } = useData();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Extract unique categories from items
  const categories = useMemo(() => {
    const categorySet = new Set();
    items.forEach((item) => {
      if (item.category) {
        categorySet.add(item.category);
      }
    });
    return Array.from(categorySet).sort();
  }, [items]);

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    let filtered = items;

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
  }, [items, searchQuery, selectedCategory]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      await syncFromAPI();
    } catch (err) {
      console.error("Refresh error:", err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleItemPress = (item) => {
    navigation.navigate("Detail", { itemId: item._id });
  };

  const renderItem = ({ item, index }) => (
    <SkinCard item={item} onPress={() => handleItemPress(item)} index={index} />
  );

  const renderEmpty = () => {
    if (isLoading) return null;

    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>
          {searchQuery || selectedCategory !== "All"
            ? "No skins found matching your filters"
            : "No skins available"}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading CS:GO Skins...</Text>
        <Text style={styles.loadingSubtext}>
          Swipe left or right on cards to favorite!
        </Text>
      </View>
    );
  }

  if (error && items.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <View style={styles.container}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search skins, weapons..."
        />

        {categories.length > 0 && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />
        )}

        <FlatList
          data={filteredItems}
          renderItem={renderItem}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.primary}
              colors={[COLORS.primary]}
            />
          }
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
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
  },
  loadingSubtext: {
    ...TYPOGRAPHY.caption,
    marginTop: SPACING.sm,
    color: COLORS.textMuted,
    textAlign: "center",
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.error,
    textAlign: "center",
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: "center",
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    textAlign: "center",
  },
});
