import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Clear all AsyncStorage data
 * This will remove all cached items, favorites, and price history
 */
export const clearAllStorage = async () => {
  try {
    console.log("Clearing all AsyncStorage data...");
    await AsyncStorage.clear();
    console.log("✅ All storage data cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing storage:", error);
    return false;
  }
};

/**
 * Clear specific storage keys
 */
export const clearStorageKeys = async (keys) => {
  try {
    console.log("Clearing specific storage keys:", keys);
    await AsyncStorage.multiRemove(keys);
    console.log("✅ Storage keys cleared successfully");
    return true;
  } catch (error) {
    console.error("❌ Error clearing storage keys:", error);
    return false;
  }
};

/**
 * Get storage usage information
 */
export const getStorageInfo = async () => {
  try {
    const keys = await AsyncStorage.getAllKeys();
    console.log("Storage keys:", keys.length);

    let totalSize = 0;
    const keySizes = {};

    for (const key of keys) {
      try {
        const value = await AsyncStorage.getItem(key);
        const size = value ? value.length : 0;
        keySizes[key] = size;
        totalSize += size;
      } catch (error) {
        console.warn(`Error getting size for key ${key}:`, error);
      }
    }

    console.log("Storage usage:", {
      totalKeys: keys.length,
      totalSizeBytes: totalSize,
      totalSizeKB: (totalSize / 1024).toFixed(2),
      totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
      keySizes,
    });

    return {
      totalKeys: keys.length,
      totalSize,
      keySizes,
    };
  } catch (error) {
    console.error("Error getting storage info:", error);
    return null;
  }
};
