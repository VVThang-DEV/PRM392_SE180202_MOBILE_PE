import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";
import { useUser } from "../context/UserContext";
import { fetchCS2Inventory } from "../services/steamInventoryService";
import {
  saveInventoryItems,
  getUserInventory,
  createInventorySnapshot,
} from "../database/userOperations";
import { fetchPriceData, formatPrice } from "../services/priceService";
import { SearchBar } from "../components/SearchBar";

export const InventoryScreen = ({ navigation }) => {
  const { user, isAuthenticated } = useUser();
  const [inventory, setInventory] = useState([]);
  const [filteredInventory, setFilteredInventory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [priceData, setPriceData] = useState({});
  const [totalValue, setTotalValue] = useState(0);
  const [sortBy, setSortBy] = useState("name"); // name, price, rarity

  useEffect(() => {
    if (isAuthenticated && user) {
      loadInventory();
    }
  }, [isAuthenticated, user]);

  useEffect(() => {
    filterAndSortInventory();
  }, [inventory, searchQuery, sortBy, priceData]);

  const loadInventory = async (forceFetch = false) => {
    try {
      setLoading(true);

      let items = [];

      if (forceFetch) {
        // Fetch from Steam API
        console.log("Fetching inventory from Steam...");
        items = await fetchCS2Inventory(user.steamId);

        // Save to database
        await saveInventoryItems(user.steamId, items);
        console.log("✅ Inventory saved to database");
      } else {
        // Load from database first
        items = await getUserInventory(user.steamId);

        // If empty, fetch from Steam
        if (items.length === 0) {
          console.log("No local inventory, fetching from Steam...");
          items = await fetchCS2Inventory(user.steamId);
          await saveInventoryItems(user.steamId, items);
        }
      }

      setInventory(items);

      // Fetch current prices
      await loadPrices(items);
    } catch (error) {
      console.error("Error loading inventory:", error);
      Alert.alert("Error", "Failed to load inventory. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const loadPrices = async (items) => {
    try {
      console.log("Fetching current prices...");
      const prices = await fetchPriceData();
      setPriceData(prices);

      // Calculate total value
      let total = 0;
      items.forEach((item) => {
        const price = prices[item.marketHashName]?.price || 0;
        total += price * item.amount;
      });
      setTotalValue(total);

      console.log(`✅ Total inventory value: $${total.toFixed(2)}`);
    } catch (error) {
      console.error("Error loading prices:", error);
    }
  };

  const createSnapshot = async () => {
    try {
      if (inventory.length === 0) {
        Alert.alert("No Inventory", "Load your inventory first");
        return;
      }

      setLoading(true);
      await createInventorySnapshot(user.steamId, inventory, priceData);

      Alert.alert("Success", "Inventory snapshot created!");
      console.log("✅ Snapshot created");
    } catch (error) {
      console.error("Error creating snapshot:", error);
      Alert.alert("Error", "Failed to create snapshot");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadInventory(true); // Force fetch from Steam
  };

  const filterAndSortInventory = () => {
    let filtered = [...inventory];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) =>
        item.marketHashName.toLowerCase().includes(query)
      );
    }

    // Add prices
    filtered = filtered.map((item) => ({
      ...item,
      currentPrice: priceData[item.marketHashName]?.price || 0,
    }));

    // Sort
    switch (sortBy) {
      case "price":
        filtered.sort((a, b) => b.currentPrice - a.currentPrice);
        break;
      case "rarity":
        filtered.sort((a, b) => a.rarity.localeCompare(b.rarity));
        break;
      case "name":
      default:
        filtered.sort((a, b) =>
          a.marketHashName.localeCompare(b.marketHashName)
        );
        break;
    }

    setFilteredInventory(filtered);
  };

  const renderInventoryItem = ({ item }) => {
    const price = item.currentPrice || 0;
    const totalItemValue = price * item.amount;

    return (
      <TouchableOpacity
        style={[
          styles.inventoryItem,
          { backgroundColor: item.backgroundColor },
        ]}
        activeOpacity={0.8}
      >
        <View style={styles.itemImageContainer}>
          {item.iconUrl ? (
            <Image
              source={{ uri: item.iconUrl }}
              style={styles.itemImage}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="image-outline" size={32} color={COLORS.textMuted} />
          )}
        </View>

        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={2}>
            {item.marketHashName}
          </Text>

          <View style={styles.itemMeta}>
            {item.wearName && (
              <Text style={styles.itemWear}>{item.wearName}</Text>
            )}
            {item.isStatTrak && (
              <View style={styles.statTrakBadge}>
                <Ionicons name="stats-chart" size={10} color="#f59e0b" />
                <Text style={styles.statTrakText}>ST</Text>
              </View>
            )}
          </View>

          <View style={styles.itemFooter}>
            <View>
              <Text style={styles.itemRarity}>{item.rarity}</Text>
              {item.amount > 1 && (
                <Text style={styles.itemAmount}>x{item.amount}</Text>
              )}
            </View>
            <View style={styles.priceColumn}>
              <Text style={styles.itemPrice}>{formatPrice(price)}</Text>
              {item.amount > 1 && (
                <Text style={styles.totalPrice}>
                  Total: {formatPrice(totalItemValue)}
                </Text>
              )}
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      {/* Total Value Card */}
      <View style={styles.valueCard}>
        <View style={styles.valueRow}>
          <View>
            <Text style={styles.valueLabel}>Total Value</Text>
            <Text style={styles.totalValueText}>{formatPrice(totalValue)}</Text>
          </View>
          <TouchableOpacity
            style={styles.snapshotButton}
            onPress={createSnapshot}
            disabled={loading}
          >
            <Ionicons name="camera-outline" size={20} color="#fff" />
            <Text style={styles.snapshotButtonText}>Snapshot</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.itemCount}>{inventory.length} items</Text>
      </View>

      {/* Search Bar */}
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholder="Search inventory..."
      />

      {/* Sort Options */}
      <View style={styles.sortRow}>
        <Text style={styles.sortLabel}>Sort by:</Text>
        <View style={styles.sortButtons}>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "name" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("name")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "name" && styles.sortButtonTextActive,
              ]}
            >
              Name
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "price" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("price")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "price" && styles.sortButtonTextActive,
              ]}
            >
              Price
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.sortButton,
              sortBy === "rarity" && styles.sortButtonActive,
            ]}
            onPress={() => setSortBy("rarity")}
          >
            <Text
              style={[
                styles.sortButtonText,
                sortBy === "rarity" && styles.sortButtonTextActive,
              ]}
            >
              Rarity
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="cube-outline" size={80} color={COLORS.textMuted} />
      <Text style={styles.emptyText}>No items in inventory</Text>
      <TouchableOpacity
        style={styles.refreshButton}
        onPress={() => loadInventory(true)}
      >
        <Ionicons name="refresh-outline" size={20} color={COLORS.primary} />
        <Text style={styles.refreshButtonText}>Refresh from Steam</Text>
      </TouchableOpacity>
    </View>
  );

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.notAuthContainer}>
          <Ionicons
            name="lock-closed-outline"
            size={80}
            color={COLORS.textMuted}
          />
          <Text style={styles.notAuthText}>Please login to view inventory</Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => navigation.navigate("Profile")}
          >
            <Text style={styles.loginButtonText}>Go to Profile</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && !refreshing ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading inventory...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredInventory}
          renderItem={renderInventoryItem}
          keyExtractor={(item, index) => `${item.assetId}-${index}`}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  notAuthContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  notAuthText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textMuted,
    marginTop: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  loginButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
  },
  loginButtonText: {
    ...TYPOGRAPHY.body,
    color: "#fff",
    fontWeight: "700",
  },
  listContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  header: {
    marginBottom: SPACING.lg,
  },
  valueCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  valueRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SPACING.sm,
  },
  valueLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  totalValueText: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 32,
  },
  itemCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  snapshotButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  snapshotButtonText: {
    ...TYPOGRAPHY.caption,
    color: "#fff",
    fontWeight: "700",
  },
  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: SPACING.md,
  },
  sortLabel: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  sortButtons: {
    flexDirection: "row",
    gap: SPACING.sm,
  },
  sortButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  sortButtonActive: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
  },
  sortButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  sortButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  row: {
    justifyContent: "space-between",
    marginBottom: SPACING.md,
  },
  inventoryItem: {
    width: "48%",
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  itemImageContainer: {
    width: "100%",
    height: 100,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: SPACING.sm,
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  itemInfo: {
    gap: SPACING.xs,
  },
  itemName: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: "600",
    fontSize: 11,
    lineHeight: 14,
    height: 28,
  },
  itemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  itemWear: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  statTrakBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    backgroundColor: "#f59e0b" + "20",
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  statTrakText: {
    ...TYPOGRAPHY.caption,
    color: "#f59e0b",
    fontSize: 9,
    fontWeight: "700",
  },
  itemFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  itemRarity: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  itemAmount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 9,
    fontWeight: "700",
  },
  priceColumn: {
    alignItems: "flex-end",
  },
  itemPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 12,
  },
  totalPrice: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
    marginBottom: SPACING.lg,
  },
  refreshButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  refreshButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
