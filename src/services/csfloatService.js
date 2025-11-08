/**
 * CSFloat Service - Fetch trending listings and market data
 */

import { CSFLOAT_API_KEY } from "@env";

const CSFLOAT_PRICE_API = "https://csfloat.com/api/v1/listings/price-list";
const SKINS_API = "https://bymykel.github.io/CSGO-API/api/en/skins.json";

/**
 * Fetch all skins data from GitHub API
 * @returns {Promise<Object>} Map of market_hash_name to skin data
 */
async function fetchAllSkinsData() {
  try {
    console.log("Fetching skins data from GitHub API...");
    const response = await fetch(SKINS_API);

    if (!response.ok) {
      throw new Error(`Skins API error: ${response.status}`);
    }

    const skins = await response.json();
    console.log(`✅ Loaded ${skins.length} skins from GitHub API`);

    // Create a lookup map by market_hash_name
    const skinsMap = {};
    skins.forEach((skin) => {
      // Build market hash name for each wear
      if (skin.wears && skin.wears.length > 0) {
        skin.wears.forEach((wear) => {
          const wearName = wear.name;
          const marketHashName = `${skin.name} (${wearName})`;
          skinsMap[marketHashName] = {
            ...skin,
            wearName: wearName,
            image: skin.image,
          };

          // Also add StatTrak version if available
          if (skin.stattrak) {
            const statTrakName = `StatTrak™ ${marketHashName}`;
            skinsMap[statTrakName] = {
              ...skin,
              wearName: wearName,
              image: skin.image,
              isStatTrak: true,
            };
          }
        });
      } else {
        // Items without wears
        skinsMap[skin.name] = {
          ...skin,
          image: skin.image,
        };
      }
    });

    return skinsMap;
  } catch (error) {
    console.error("Error fetching skins data:", error);
    return {};
  }
}

/**
 * Fetch trending items from CSFloat price list
 * Uses the same endpoint as priceService but processes it for trending analysis
 * @param {number} limit - Number of trending items to return
 * @returns {Promise<Array>} Array of trending items
 */
export async function fetchTrendingListings(limit = 100) {
  try {
    console.log("Fetching price data from CSFloat for trending analysis...");

    // Fetch both price data and skins data in parallel
    const [priceResponse, skinsMap] = await Promise.all([
      fetch(CSFLOAT_PRICE_API, {
        headers: {
          Authorization: `Bearer ${CSFLOAT_API_KEY}`,
        },
      }),
      fetchAllSkinsData(),
    ]);

    if (!priceResponse.ok) {
      console.error(
        `CSFloat API error: ${priceResponse.status} ${priceResponse.statusText}`
      );
      throw new Error(`CSFloat API error: ${priceResponse.status}`);
    }

    const dataArray = await priceResponse.json();
    console.log(`✅ Loaded ${dataArray.length} items from price list`);

    // Merge price data with skins data
    const merged = dataArray.map((priceItem) => ({
      ...priceItem,
      skinData: skinsMap[priceItem.market_hash_name] || null,
    }));

    // Sort by quantity (volume) to find most traded/trending items
    const sorted = merged
      .filter((item) => item.qty > 0 && item.min_price > 0)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, limit);

    console.log(`✅ Processed ${sorted.length} trending items with skin data`);
    return sorted;
  } catch (error) {
    console.error("Error fetching trending listings:", error);
    return [];
  }
}

/**
 * Calculate price change percentage
 * For price-list data, we estimate trend based on volume and price volatility
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price (if available)
 * @param {number} qty - Trading volume
 * @returns {number} Estimated percentage change
 */
export function calculatePriceChangePercent(minPrice, maxPrice, qty) {
  // Since price-list doesn't have historical data, we estimate based on volume
  // High volume items are considered "trending"
  // We'll use a random variation to simulate market movement for demo
  const baseChange = (Math.random() - 0.5) * 20; // -10% to +10%
  const volumeBoost = Math.min(qty / 1000, 5); // More volume = bigger potential moves
  return baseChange * (1 + volumeBoost / 5);
}

/**
 * Generate mock price history for sparkline
 * @param {number} currentPrice - Current price
 * @param {number} priceChange - Percentage change
 * @param {number} points - Number of data points
 * @returns {Array} Array of price points
 */
function generatePriceHistory(currentPrice, priceChange, points = 7) {
  const history = [];
  const trend = priceChange > 0 ? 1 : -1;

  // Generate realistic-looking price movement
  for (let i = 0; i < points; i++) {
    const progress = i / (points - 1);
    const trendEffect = trend * progress * (Math.abs(priceChange) / 100);
    const randomNoise = (Math.random() - 0.5) * 0.05; // 5% random variation
    const priceMultiplier = 1 - trendEffect + randomNoise;
    history.push(currentPrice * priceMultiplier);
  }

  return history;
}

/**
 * Process price list into trending items with price analysis
 * @param {Array} priceListData - Raw CSFloat price list data
 * @returns {Array} Processed trending items
 */
export function processTrendingListings(priceListData) {
  if (!priceListData || priceListData.length === 0) return [];

  return priceListData
    .map((item) => {
      const currentPrice = item.min_price / 100; // Convert cents to dollars
      const maxPrice = item.max_price ? item.max_price / 100 : currentPrice;
      const avgPrice = (currentPrice + maxPrice) / 2;

      // Estimate price change based on volume and price spread
      const priceSpread = ((maxPrice - currentPrice) / currentPrice) * 100;
      const priceChange = calculatePriceChangePercent(
        currentPrice,
        maxPrice,
        item.qty
      );

      // Generate price history for sparkline
      const priceHistory = generatePriceHistory(avgPrice, priceChange, 7);

      // Extract item details from market_hash_name
      const marketHashName = item.market_hash_name || "";
      const isStatTrak = marketHashName.includes("StatTrak™");
      const isSouvenir = marketHashName.includes("Souvenir");

      // Extract wear condition
      const wearMatch = marketHashName.match(/\((.*?)\)$/);
      const wearName = wearMatch ? wearMatch[1] : "";

      // Get item name without wear
      const itemName = marketHashName.replace(/\s*\(.*?\)$/, "");

      return {
        id: `${item.market_hash_name}-${item.qty}`,
        name: marketHashName,
        itemName: itemName,
        wearName: wearName,
        currentPrice: avgPrice,
        referencePrice: currentPrice, // Use min as reference
        priceChange: priceChange,
        priceChangeAbs: Math.abs(priceChange),
        image: item.skinData?.image || null, // Get image from skin data
        watchers: Math.floor(item.qty / 10), // Estimate watchers from quantity
        volume: item.qty,
        rarity:
          item.skinData?.rarity?.name ||
          (marketHashName.includes("★") ? "Extraordinary" : "Classified"),
        rarityColor: item.skinData?.rarity?.color || "#eb4b4b",
        description: item.skinData?.description || "",
        type: "listing",
        isStatTrak: isStatTrak,
        isSouvenir: isSouvenir,
        minPrice: currentPrice,
        maxPrice: maxPrice,
        priceSpread: priceSpread,
        category: item.skinData?.category?.name || "Unknown",
        weapon: item.skinData?.weapon?.name || "",
        priceHistory: priceHistory, // Add price history for sparkline
      };
    })
    .filter((item) => item.currentPrice > 0)
    .sort((a, b) => {
      // Sort by combination of price change and volume
      const scoreA = a.priceChangeAbs * Math.log(a.volume + 1);
      const scoreB = b.priceChangeAbs * Math.log(b.volume + 1);
      return scoreB - scoreA;
    });
}
/**
 * Get top movers (biggest price changes)
 * @param {Array} processedListings - Processed trending items
 * @param {number} count - Number of top movers to return
 * @returns {Array} Top movers
 */
export function getTopMovers(processedListings, count = 3) {
  return processedListings.slice(0, count);
}

/**
 * Filter listings by category
 * @param {Array} listings - Processed listings
 * @param {string} category - Category to filter by
 * @returns {Array} Filtered listings
 */
export function filterByCategory(listings, category) {
  if (category === "All" || !category) return listings;

  return listings.filter((item) => {
    const name = item.name.toLowerCase();

    switch (category) {
      case "Knife":
        return name.includes("★") || name.includes("knife");
      case "Gloves":
        return name.includes("gloves") || name.includes("wraps");
      case "Rifle":
        return (
          name.includes("ak-47") ||
          name.includes("m4a4") ||
          name.includes("m4a1") ||
          name.includes("awp") ||
          name.includes("aug") ||
          name.includes("sg 553") ||
          name.includes("famas") ||
          name.includes("galil")
        );
      case "Pistol":
        return (
          name.includes("glock") ||
          name.includes("usp") ||
          name.includes("p2000") ||
          name.includes("p250") ||
          name.includes("desert eagle") ||
          name.includes("deagle")
        );
      case "SMG":
        return (
          name.includes("mp9") ||
          name.includes("mac-10") ||
          name.includes("p90") ||
          name.includes("ump")
        );
      default:
        return true;
    }
  });
}
