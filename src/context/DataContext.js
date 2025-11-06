import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { AppState, Platform } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import {
  getItems,
  saveItems,
  getFavorites,
  saveFavorites,
} from "../database/storage";
import { fetchSkinsFromAPI, determineCategory } from "../services/apiService";
import { fetchPriceData } from "../services/priceService";
import { savePriceSnapshot } from "../services/priceHistoryService";
import {
  savePriceSnapshotToSupabase,
  isSupabaseConfigured,
} from "../services/supabaseService";

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
  const [lastPriceUpdate, setLastPriceUpdate] = useState(null);
  const [isConnected, setIsConnected] = useState(true);
  const priceUpdateInterval = useRef(null);
  const appState = useRef(AppState.currentState);

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      console.log(
        "Network state:",
        state.isConnected ? "Connected" : "Disconnected"
      );
      setIsConnected(state.isConnected);

      if (state.isConnected && error && error.includes("Network")) {
        console.log("Network reconnected, retrying data load...");
        loadData();
      }
    });

    return () => unsubscribe();
  }, [error]);

  // Load initial data
  useEffect(() => {
    loadData();
    loadPrices();
  }, []);

  // Set up real-time price updates with polling
  // NOTE: Price tracking only works while app is open/active
  // When app is closed or backgrounded for long periods, tracking pauses
  // This is normal React Native behavior - background tasks require special setup
  useEffect(() => {
    // Initial price load
    loadPrices();

    // Set up polling interval for price updates (every 30 minutes)
    priceUpdateInterval.current = setInterval(() => {
      console.log("Auto-refreshing prices (app is active)...");
      loadPrices();
    }, 30 * 60 * 1000); // 30 minutes

    // Handle app state changes
    const subscription = AppState.addEventListener("change", (nextAppState) => {
      console.log(`App state changed: ${appState.current} -> ${nextAppState}`);

      if (
        appState.current.match(/inactive|background/) &&
        nextAppState === "active"
      ) {
        // App came to foreground, refresh prices to catch up
        console.log("App became active, refreshing prices to catch up");
        loadPrices();
      } else if (nextAppState.match(/inactive|background/)) {
        // App going to background
        console.log("App going to background, price tracking will pause");
      }

      appState.current = nextAppState;
    });

    // Cleanup on unmount
    return () => {
      console.log("Cleaning up price update interval");
      if (priceUpdateInterval.current) {
        clearInterval(priceUpdateInterval.current);
      }
      subscription?.remove();
    };
  }, []);

  // Load prices from CSGOFloat with history tracking (local + Supabase cloud)
  const loadPrices = async () => {
    try {
      const prices = await fetchPriceData();
      if (prices) {
        setPriceData(prices);
        setLastPriceUpdate(Date.now());

        // Save snapshot to LOCAL storage (fast, always works)
        await savePriceSnapshot(prices);

        // Save to Supabase (centralized cloud storage)
        if (isSupabaseConfigured()) {
          try {
            await savePriceSnapshotToSupabase(prices);
            console.log("✅ Price snapshot saved to Supabase successfully!");
          } catch (supabaseError) {
            console.error("❌ Supabase error:", supabaseError.message);
            console.warn("⚠️ Using local storage as fallback");
          }
        } else {
          console.warn(
            "⚠️ Supabase not configured - add your anon key to supabaseService.js"
          );
        }

        console.log("Price data loaded and saved");
      }
    } catch (err) {
      console.error("Failed to load price data:", err);
    }
  };

  const loadData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Loading data from storage...");

      // Load from storage
      const [storedItems, storedFavorites] = await Promise.all([
        getItems(),
        getFavorites(),
      ]);

      console.log(`Loaded ${storedItems.length} items from storage`);
      setFavorites(storedFavorites);

      // If no items in storage, fetch from API
      if (storedItems.length === 0) {
        console.log("No cached data, fetching from API...");
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
        console.log("Data loaded successfully!");
      }
    } catch (err) {
      console.error("Load data error:", err);
      const errorMessage =
        err.message ||
        "Could not load data. Please check your connection and try again.";
      setError(errorMessage);
      setIsLoading(false);
    }
  };

  const syncFromAPI = async () => {
    try {
      setError(null);

      // Check network connectivity first
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        throw new Error(
          "No internet connection. Please check your network and try again."
        );
      }

      console.log("Syncing data from API...");
      const apiData = await fetchSkinsFromAPI();

      if (!apiData || apiData.length === 0) {
        throw new Error("No data received from API");
      }

      console.log(`Processing ${apiData.length} items from API...`);

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

      console.log(`Successfully synced ${processedItems.length} items`);
      return processedItems.length;
    } catch (err) {
      console.error("Sync error:", err);
      const errorMessage =
        err.message && err.message.includes("Failed to fetch")
          ? "Network error. Please check your internet connection and try again."
          : err.message || "Could not sync data from API.";
      setError(errorMessage);
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

  const retryLoadData = useCallback(async () => {
    console.log("Retrying data load...");
    await loadData();
  }, []);

  const value = {
    items,
    favorites,
    isLoading,
    error,
    priceData,
    lastPriceUpdate,
    isConnected,
    syncFromAPI,
    toggleFavorite,
    getFavoriteItems,
    refreshPrices: loadPrices,
    retryLoadData,
    isFavorite: (itemId) => !!favorites[itemId],
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
