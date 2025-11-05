/**
 * Price Service - Fetch live CS:GO skin prices from CSGOFloat API
 */

const CSFLOAT_API_KEY = "ibj-zt1c2f7gSB5lLLtZqyuWdRW7c1kt";
const CSFLOAT_PRICE_API = "https://csfloat.com/api/v1/listings/price-list";

/**
 * Fetch price data for all skins from CSGOFloat
 * @returns {Promise<Object>} Price data keyed by market_hash_name
 */
export async function fetchPriceData() {
  try {
    console.log("Fetching live prices from CSGOFloat...");
    const response = await fetch(CSFLOAT_PRICE_API, {
      headers: {
        Authorization: `Bearer ${CSFLOAT_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error(`CSGOFloat API error: ${response.status}`);
    }

    const dataArray = await response.json();

    // Convert array to object keyed by market_hash_name
    const priceMap = {};
    dataArray.forEach((item) => {
      priceMap[item.market_hash_name] = {
        price: item.min_price / 100, // Convert cents to dollars
        min: item.min_price / 100,
        avg: item.min_price / 100,
        max: item.min_price / 100,
        qty: item.qty,
      };
    });

    console.log(`Loaded prices for ${Object.keys(priceMap).length} items`);
    return priceMap;
  } catch (error) {
    console.error("Error fetching price data:", error);
    return null;
  }
}
/**
 * Get price for a specific skin
 * @param {Object} priceData - Full price data from fetchPriceData
 * @param {string} skinName - Full skin name (e.g., "AK-47 | Case Hardened")
 * @param {string} wear - Wear condition (e.g., "Factory New", "Minimal Wear")
 * @param {boolean} stattrak - Whether it's StatTrak™
 * @param {boolean} souvenir - Whether it's Souvenir
 * @returns {Object|null} Price info { avg, min, max, currency }
 */
export function getSkinPrice(
  priceData,
  skinName,
  wear = null,
  stattrak = false,
  souvenir = false
) {
  if (!priceData || !skinName) return null;

  // Build market hash name (Steam format)
  let marketHashName = skinName;

  if (stattrak) {
    marketHashName = `StatTrak™ ${marketHashName}`;
  } else if (souvenir) {
    marketHashName = `Souvenir ${marketHashName}`;
  }

  // Add wear condition if specified
  if (wear) {
    marketHashName = `${marketHashName} (${wear})`;
  }

  const priceInfo = priceData[marketHashName];

  if (priceInfo) {
    return {
      avg: priceInfo.avg || priceInfo.price || 0,
      min: priceInfo.min || priceInfo.price || 0,
      max: priceInfo.max || priceInfo.price || 0,
      currency: "USD",
      marketHashName,
    };
  }

  // If no exact match and no wear was specified, try common wear conditions
  if (!wear) {
    const commonWears = [
      "Field-Tested",
      "Minimal Wear",
      "Factory New",
      "Well-Worn",
      "Battle-Scarred",
    ];
    for (const wearCondition of commonWears) {
      const result = getSkinPrice(
        priceData,
        skinName,
        wearCondition,
        stattrak,
        souvenir
      );
      if (result) {
        console.log(`Found price with ${wearCondition} wear`);
        return result;
      }
    }
  }

  console.log(`No price data for: ${marketHashName}`);
  console.log(
    `Available keys sample:`,
    Object.keys(priceData)
      .filter((k) => k.includes(skinName.split("|")[0]?.trim() || ""))
      .slice(0, 3)
  );
  return null;
}

/**
 * Format price for display
 * @param {number} price - Price in USD
 * @returns {string} Formatted price string
 */
export function formatPrice(price) {
  if (price === null || price === undefined) return "N/A";
  if (price === 0) return "Free";
  if (price < 0.01) return "<$0.01";
  if (price < 1) return `$${price.toFixed(2)}`;
  if (price < 100) return `$${price.toFixed(2)}`;
  if (price < 1000) return `$${Math.round(price)}`;
  return `$${(price / 1000).toFixed(1)}k`;
}

/**
 * Get price range string
 * @param {Object} priceInfo - Price info from getSkinPrice
 * @returns {string} Formatted range
 */
export function getPriceRange(priceInfo) {
  if (!priceInfo) return "N/A";

  const { min, max, avg } = priceInfo;

  if (min === max || !max) {
    return formatPrice(avg || min);
  }

  return `${formatPrice(min)} - ${formatPrice(max)}`;
}

/**
 * Get all prices for a skin across all wear conditions
 * @param {Object} priceData - Full price data
 * @param {string} skinName - Skin name without wear
 * @param {boolean} stattrak - StatTrak™ version
 * @param {boolean} souvenir - Souvenir version
 * @returns {Array} Array of {wear, price} objects
 */
export function getAllWearPrices(
  priceData,
  skinName,
  stattrak = false,
  souvenir = false
) {
  const wears = [
    "Factory New",
    "Minimal Wear",
    "Field-Tested",
    "Well-Worn",
    "Battle-Scarred",
  ];

  return wears
    .map((wear) => {
      const priceInfo = getSkinPrice(
        priceData,
        skinName,
        wear,
        stattrak,
        souvenir
      );
      return {
        wear,
        priceInfo,
        price: priceInfo?.avg || 0,
      };
    })
    .filter((item) => item.price > 0);
}
