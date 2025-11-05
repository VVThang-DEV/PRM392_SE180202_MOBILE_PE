import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  getItems,
  saveItems,
  getFavorites,
  saveFavorites,
} from "../database/storage";
import { fetchSkinsFromAPI, determineCategory } from "../services/apiService";
import { fetchPriceData } from "../services/priceService";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const [items, setItems] = useState([]);
  const [favorites, setFavorites] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [priceData, setPriceData] = useState(null);

  // Load initial data
  useEffect(() => {
    loadData();
    loadPrices();
  }, []);

  // Load prices from CSGOFloat
  const loadPrices = async () => {
    try {
      const prices = await fetchPriceData();
      if (prices) {
        setPriceData(prices);
        console.log("Price data loaded successfully");
      }
    } catch (err) {
      console.error("Failed to load price data:", err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Load from storage
      const [storedItems, storedFavorites] = await Promise.all([
        getItems(),
        getFavorites(),
      ]);

      setFavorites(storedFavorites);

      // If no items in storage, fetch from API
      if (storedItems.length === 0) {
        await syncFromAPI();
      } else {
        // Transform stored items to add convenience fields
        const transformedItems = storedItems.map((item) => ({
          ...item,
          id: item.id || item._id,
          weaponName: item.weaponName || item.weapon || "Unknown Weapon",
          categoryName: item.categoryName || item.category || "Other",
          rarityName: item.rarityName || item.rarity || "Common",
          rarityColor: item.rarityColor || item.rarity_color || "#666666",
          patternName: item.patternName || item.pattern || "",
          availableWears:
            item.availableWears || item.wears?.map((w) => w.name) || [],
          stattrak: item.stattrak || false,
          souvenir: item.souvenir || false,
          crateNames: item.crateNames || item.crates?.map((c) => c.name) || [],
          collectionNames:
            item.collectionNames || item.collections?.map((c) => c.name) || [],
        }));
        setItems(transformedItems);
        setIsLoading(false);
      }
    } catch (err) {
      setError(
        "Could not load data. Please check your connection and try again."
      );
      console.error("Load data error:", err);
      setIsLoading(false);
    }
  };

  const syncFromAPI = async () => {
    try {
      setError(null);
      const apiData = await fetchSkinsFromAPI();

      // Process and save items
      const processedItems = apiData.map((skin, index) => {
        // determineCategory needs the weapon name string, not category object
        const weaponName = skin.weapon?.name || "";
        const category = weaponName
          ? determineCategory(weaponName)
          : skin.category?.name || "Other";
        const rarityName = skin.rarity?.name || "";
        const rarityColor = skin.rarity?.color || "";

        // Debug first few items
        if (index < 3) {
          console.log(`Processing skin ${index}:`, {
            name: skin.name,
            weaponName,
            determinedCategory: category,
            rarityName,
          });
        }

        return {
          _id: skin.id,
          id: skin.id,
          name: skin.name || "Unknown",
          description: skin.description || "",
          weapon: weaponName,
          weaponName: weaponName,
          category: category,
          categoryName: category,
          pattern: skin.pattern?.name || "",
          patternName: skin.pattern?.name || "",
          min_float: skin.min_float || 0,
          max_float: skin.max_float || 1,
          rarity: rarityName,
          rarityName: rarityName,
          rarity_color: rarityColor,
          rarityColor: rarityColor,
          image: skin.image || "",
          team: skin.team?.name || "",
          // Add wears data
          wears: skin.wears || [],
          availableWears: skin.wears?.map((w) => w.name) || [],
          stattrak: skin.stattrak || false,
          souvenir: skin.souvenir || false,
          // Crates and collections
          crates: skin.crates || [],
          crateNames: skin.crates?.map((c) => c.name) || [],
          collections: skin.collections || [],
          collectionNames: skin.collections?.map((c) => c.name) || [],
        };
      });

      await saveItems(processedItems);
      setItems(processedItems);
      setIsLoading(false);

      return processedItems.length;
    } catch (err) {
      setError("Could not sync data from API.");
      console.error("Sync error:", err);
      setIsLoading(false);
      throw err;
    }
  };

  const toggleFavorite = useCallback(
    async (itemId) => {
      try {
        const newFavorites = { ...favorites };

        if (newFavorites[itemId]) {
          delete newFavorites[itemId];
        } else {
          newFavorites[itemId] = true;
        }

        await saveFavorites(newFavorites);
        setFavorites(newFavorites);
      } catch (err) {
        console.error("Toggle favorite error:", err);
      }
    },
    [favorites]
  );

  const getFavoriteItems = useCallback(() => {
    return items.filter((item) => favorites[item._id]);
  }, [items, favorites]);

  const value = {
    items,
    favorites,
    isLoading,
    error,
    priceData,
    syncFromAPI,
    toggleFavorite,
    getFavoriteItems,
    refreshPrices: loadPrices,
    isFavorite: (itemId) => !!favorites[itemId],
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
