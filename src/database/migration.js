import AsyncStorage from "@react-native-async-storage/async-storage";
import { insertItems } from "./operations";
import { setMetadata } from "./operations";

/**
 * Migrate data from AsyncStorage to SQLite
 * This is a one-time migration for existing users
 */
export const migrateFromAsyncStorage = async () => {
  try {
    console.log("🔄 Checking for AsyncStorage data to migrate...");

    // Check if migration already completed
    const migrationCompleted = await AsyncStorage.getItem(
      "@migration_completed"
    );
    if (migrationCompleted === "true") {
      console.log("✅ Migration already completed, skipping...");
      return { migrated: false, reason: "already_completed" };
    }

    // Get data from AsyncStorage
    const itemsJson = await AsyncStorage.getItem("@csgo_items");
    const favoritesJson = await AsyncStorage.getItem("@csgo_favorites");

    if (!itemsJson || itemsJson === "[]") {
      console.log("📭 No AsyncStorage data to migrate");
      // Mark migration as completed even if no data
      await AsyncStorage.setItem("@migration_completed", "true");
      return { migrated: false, reason: "no_data" };
    }

    console.log("📦 Found AsyncStorage data, migrating to SQLite...");

    const items = JSON.parse(itemsJson);
    const favorites = favoritesJson ? JSON.parse(favoritesJson) : {};

    // Mark items as favorites
    const itemsWithFavorites = items.map((item) => ({
      ...item,
      isFavorite: !!favorites[item._id || item.id],
    }));

    // Insert into SQLite
    await insertItems(itemsWithFavorites);
    await setMetadata("lastSync", Date.now());

    console.log(`✅ Successfully migrated ${items.length} items to SQLite`);

    // Mark migration as completed
    await AsyncStorage.setItem("@migration_completed", "true");

    // Optional: Clear old AsyncStorage data to free up space
    // Uncomment if you want to remove old data after migration
    // await AsyncStorage.multiRemove(['@csgo_items', '@csgo_favorites']);

    return {
      migrated: true,
      itemCount: items.length,
      favoriteCount: Object.keys(favorites).length,
    };
  } catch (error) {
    console.error("❌ Migration error:", error);
    return { migrated: false, error: error.message };
  }
};
