/**
 * Steam Inventory Service
 * Fetches and processes CS2 inventory from Steam API
 */

import { STEAM_API_KEY } from "@env";

const STEAM_API_BASE = "https://api.steampowered.com";
const CS2_APP_ID = "730"; // Counter-Strike 2 App ID

/**
 * Fetch user's CS2 inventory
 * @param {string} steamId - Steam ID
 * @returns {Promise<Array>} Array of inventory items
 */
export async function fetchCS2Inventory(steamId) {
  try {
    console.log(`Fetching CS2 inventory for Steam ID: ${steamId}`);

    // Steam Community API for inventory
    const url = `https://steamcommunity.com/inventory/${steamId}/${CS2_APP_ID}/2?l=english&count=5000`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(
        `Steam API error: ${response.status} - ${response.statusText}`
      );
    }

    const data = await response.json();

    if (!data.success) {
      throw new Error("Failed to fetch inventory");
    }

    // Process inventory items
    const items = processInventoryItems(
      data.assets || [],
      data.descriptions || []
    );

    console.log(`✅ Loaded ${items.length} items from CS2 inventory`);
    return items;
  } catch (error) {
    console.error("Error fetching CS2 inventory:", error);
    throw error;
  }
}

/**
 * Process raw inventory data into structured items
 * @param {Array} assets - Asset data
 * @param {Array} descriptions - Description data
 * @returns {Array} Processed items
 */
function processInventoryItems(assets, descriptions) {
  // Create a map of descriptions for quick lookup
  const descMap = {};
  descriptions.forEach((desc) => {
    const key = `${desc.classid}_${desc.instanceid}`;
    descMap[key] = desc;
  });

  // Process each asset
  return assets
    .map((asset) => {
      const key = `${asset.classid}_${asset.instanceid}`;
      const desc = descMap[key];

      if (!desc) return null;

      // Extract item details
      const marketHashName = desc.market_hash_name || desc.name;
      const isStatTrak = marketHashName.includes("StatTrak™");
      const isSouvenir = marketHashName.includes("Souvenir");

      // Extract wear condition
      const wearMatch = marketHashName.match(/\((.*?)\)$/);
      const wearName = wearMatch ? wearMatch[1] : "";

      // Extract rarity
      const rarityTag = desc.tags?.find((tag) => tag.category === "Rarity");
      const rarity = rarityTag?.localized_tag_name || "Unknown";

      // Extract type
      const typeTag = desc.tags?.find((tag) => tag.category === "Type");
      const type = typeTag?.localized_tag_name || "Unknown";

      // Extract weapon
      const weaponTag = desc.tags?.find((tag) => tag.category === "Weapon");
      const weapon = weaponTag?.localized_tag_name || "";

      // Get icon URL
      const iconUrl = desc.icon_url
        ? `https://community.cloudflare.steamstatic.com/economy/image/${desc.icon_url}`
        : null;

      return {
        assetId: asset.assetid,
        classId: asset.classid,
        instanceId: asset.instanceid,
        amount: parseInt(asset.amount) || 1,
        marketHashName,
        name: desc.name,
        type,
        rarity,
        weapon,
        wearName,
        isStatTrak,
        isSouvenir,
        iconUrl,
        backgroundColor: desc.background_color
          ? `#${desc.background_color}`
          : "#3C352E",
        marketable: desc.marketable === 1,
        tradable: desc.tradable === 1,
        commodity: desc.commodity === 1,
        descriptions: desc.descriptions || [],
        tags: desc.tags || [],
      };
    })
    .filter((item) => item !== null);
}

/**
 * Get inventory item count
 * @param {string} steamId - Steam ID
 * @returns {Promise<number>} Item count
 */
export async function getInventoryItemCount(steamId) {
  try {
    const items = await fetchCS2Inventory(steamId);
    return items.length;
  } catch (error) {
    console.error("Error getting inventory count:", error);
    return 0;
  }
}

/**
 * Filter inventory by criteria
 * @param {Array} items - Inventory items
 * @param {Object} filters - Filter criteria
 * @returns {Array} Filtered items
 */
export function filterInventory(items, filters = {}) {
  let filtered = [...items];

  if (filters.type) {
    filtered = filtered.filter((item) =>
      item.type.toLowerCase().includes(filters.type.toLowerCase())
    );
  }

  if (filters.rarity) {
    filtered = filtered.filter((item) =>
      item.rarity.toLowerCase().includes(filters.rarity.toLowerCase())
    );
  }

  if (filters.statTrak !== undefined) {
    filtered = filtered.filter((item) => item.isStatTrak === filters.statTrak);
  }

  if (filters.weapon) {
    filtered = filtered.filter((item) =>
      item.weapon.toLowerCase().includes(filters.weapon.toLowerCase())
    );
  }

  if (filters.searchTerm) {
    const term = filters.searchTerm.toLowerCase();
    filtered = filtered.filter((item) =>
      item.marketHashName.toLowerCase().includes(term)
    );
  }

  return filtered;
}

/**
 * Sort inventory items
 * @param {Array} items - Inventory items
 * @param {string} sortBy - Sort criteria
 * @returns {Array} Sorted items
 */
export function sortInventory(items, sortBy = "name") {
  const sorted = [...items];

  switch (sortBy) {
    case "name":
      return sorted.sort((a, b) =>
        a.marketHashName.localeCompare(b.marketHashName)
      );
    case "rarity":
      return sorted.sort((a, b) => a.rarity.localeCompare(b.rarity));
    case "type":
      return sorted.sort((a, b) => a.type.localeCompare(b.type));
    default:
      return sorted;
  }
}
