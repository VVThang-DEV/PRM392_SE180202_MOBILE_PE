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

  // Load initial data
  useEffect(() => {
    loadData();
  }, []);

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
        setItems(storedItems);
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
      const processedItems = apiData.map((skin) => ({
        _id: skin.id,
        name: skin.name || "Unknown",
        description: skin.description || "",
        weapon: skin.weapon?.name || "",
        category: determineCategory(
          skin.weapon?.name || skin.category || "Other"
        ),
        pattern: skin.pattern?.name || "",
        min_float: skin.min_float || 0,
        max_float: skin.max_float || 1,
        rarity: skin.rarity?.name || "",
        rarity_color: skin.rarity?.color || "",
        image: skin.image || "",
        team: skin.team?.name || "",
      }));

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
    syncFromAPI,
    toggleFavorite,
    getFavoriteItems,
    isFavorite: (itemId) => !!favorites[itemId],
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
