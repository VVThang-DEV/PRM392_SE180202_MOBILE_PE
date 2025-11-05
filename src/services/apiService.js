const API_BASE_URL = "https://bymykel.com/CSGO-API/api/en";

/**
 * Fetches CS:GO skins data from the public API
 * @returns {Promise<Array>} Array of skin objects
 */
export const fetchSkinsFromAPI = async () => {
  try {
    console.log("Fetching skins from API...");
    const response = await fetch(`${API_BASE_URL}/skins.json`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Fetched ${data.length} skins from API`);
    return data;
  } catch (error) {
    console.error("Error fetching skins from API:", error);
    throw error;
  }
};

/**
 * Syncs API data to RealmDB
 * @param {Realm} realm - Realm database instance
 * @returns {Promise<number>} Number of items synced
 */
export const syncDataToRealm = async (realm) => {
  try {
    const apiData = await fetchSkinsFromAPI();

    realm.write(() => {
      // Get existing items to preserve favorite status
      const existingItems = realm.objects("Item");
      const favoriteMap = new Map();

      existingItems.forEach((item) => {
        if (item.isFavorite) {
          favoriteMap.set(item._id, true);
        }
      });

      // Clear existing data
      realm.delete(existingItems);

      // Insert new data
      apiData.forEach((skin) => {
        // Determine category from weapon type
        const category = determineCategory(
          skin.weapon?.name || skin.category || "Other"
        );

        const itemData = {
          _id: skin.id,
          name: skin.name || "Unknown",
          description: skin.description || "",
          weapon: skin.weapon?.name || "",
          category: category,
          pattern: skin.pattern?.name || "",
          min_float: skin.min_float || 0,
          max_float: skin.max_float || 1,
          rarity: skin.rarity?.name || "",
          rarity_color: skin.rarity?.color || "",
          image: skin.image || "",
          team: skin.team?.name || "",
          isFavorite: favoriteMap.has(skin.id) || false,
          createdAt: new Date(),
        };

        realm.create("Item", itemData);
      });
    });

    console.log(`Synced ${apiData.length} items to RealmDB`);
    return apiData.length;
  } catch (error) {
    console.error("Error syncing data to Realm:", error);
    throw error;
  }
};

/**
 * Determines the category based on weapon name
 */
export const determineCategory = (weaponName) => {
  const name = weaponName.toLowerCase();

  if (
    name.includes("knife") ||
    name.includes("bayonet") ||
    name.includes("karambit")
  ) {
    return "Knife";
  } else if (
    name.includes("ak-47") ||
    name.includes("m4a4") ||
    name.includes("m4a1") ||
    name.includes("aug") ||
    name.includes("sg 553") ||
    name.includes("famas") ||
    name.includes("galil") ||
    name.includes("awp") ||
    name.includes("ssg 08") ||
    name.includes("scar-20") ||
    name.includes("g3sg1")
  ) {
    return "Rifle";
  } else if (
    name.includes("glock") ||
    name.includes("usp") ||
    name.includes("p2000") ||
    name.includes("p250") ||
    name.includes("five-seven") ||
    name.includes("tec-9") ||
    name.includes("cz75") ||
    name.includes("desert eagle") ||
    name.includes("dual berettas") ||
    name.includes("r8 revolver")
  ) {
    return "Pistol";
  } else if (
    name.includes("mac-10") ||
    name.includes("mp9") ||
    name.includes("mp7") ||
    name.includes("mp5") ||
    name.includes("ump-45") ||
    name.includes("p90") ||
    name.includes("pp-bizon")
  ) {
    return "SMG";
  } else if (
    name.includes("nova") ||
    name.includes("xm1014") ||
    name.includes("mag-7") ||
    name.includes("sawed-off")
  ) {
    return "Shotgun";
  } else if (name.includes("m249") || name.includes("negev")) {
    return "Machine Gun";
  } else if (name.includes("gloves") || name.includes("glove")) {
    return "Gloves";
  } else {
    return "Other";
  }
};

/**
 * Checks if data needs to be synced (database is empty)
 * @param {Realm} realm - Realm database instance
 * @returns {boolean} True if sync is needed
 */
export const needsInitialSync = (realm) => {
  const items = realm.objects("Item");
  return items.length === 0;
};
