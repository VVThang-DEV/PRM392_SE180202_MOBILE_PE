import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEYS = {
  ITEMS: "@csgo_items",
  FAVORITES: "@csgo_favorites",
};

/**
 * Save items to AsyncStorage
 */
export const saveItems = async (items) => {
  try {
    await AsyncStorage.setItem(STORAGE_KEYS.ITEMS, JSON.stringify(items));
  } catch (error) {
    console.error("Error saving items:", error);
    throw error;
  }
};

/**
 * Get all items from AsyncStorage
 */
export const getItems = async () => {
  try {
    const itemsJson = await AsyncStorage.getItem(STORAGE_KEYS.ITEMS);
    return itemsJson ? JSON.parse(itemsJson) : [];
  } catch (error) {
    console.error("Error getting items:", error);
    return [];
  }
};

/**
 * Save favorites to AsyncStorage
 */
export const saveFavorites = async (favorites) => {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.FAVORITES,
      JSON.stringify(favorites)
    );
  } catch (error) {
    console.error("Error saving favorites:", error);
    throw error;
  }
};

/**
 * Get favorites from AsyncStorage
 */
export const getFavorites = async () => {
  try {
    const favoritesJson = await AsyncStorage.getItem(STORAGE_KEYS.FAVORITES);
    return favoritesJson ? JSON.parse(favoritesJson) : {};
  } catch (error) {
    console.error("Error getting favorites:", error);
    return {};
  }
};

/**
 * Toggle favorite status for an item
 */
export const toggleFavorite = async (itemId) => {
  try {
    const favorites = await getFavorites();
    const newFavorites = { ...favorites };

    if (newFavorites[itemId]) {
      delete newFavorites[itemId];
    } else {
      newFavorites[itemId] = true;
    }

    await saveFavorites(newFavorites);
    return newFavorites;
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
};

/**
 * Check if item is favorited
 */
export const isFavorite = async (itemId) => {
  try {
    const favorites = await getFavorites();
    return !!favorites[itemId];
  } catch (error) {
    console.error("Error checking favorite:", error);
    return false;
  }
};

/**
 * Clear all data
 */
export const clearAllData = async () => {
  try {
    await AsyncStorage.multiRemove([
      STORAGE_KEYS.ITEMS,
      STORAGE_KEYS.FAVORITES,
    ]);
  } catch (error) {
    console.error("Error clearing data:", error);
    throw error;
  }
};
