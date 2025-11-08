import React, { useState, useEffect, useMemo } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  Image,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useData } from "../context/DataContext";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";
import { formatPrice } from "../services/priceService";
import {
  fetchTrendingListings,
  processTrendingListings,
  getTopMovers,
  filterByCategory,
} from "../services/csfloatService";
import { MiniSparkline } from "../components/MiniSparkline";

export const TrendsScreen = ({ navigation }) => {
  const { items } = useData();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [trendingItems, setTrendingItems] = useState([]);
  const [topMovers, setTopMovers] = useState([]);
  const [loadingTrends, setLoadingTrends] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Categories for CS:GO items
  const categories = ["All", "Knife", "Gloves", "Rifle", "Pistol", "SMG"];

  useEffect(() => {
    loadTrendingData();
  }, []);

  const loadTrendingData = async () => {
    try {
      setLoadingTrends(true);

      // Fetch trending listings from CSFloat
      const listings = await fetchTrendingListings(100);

      // Process listings into trend data
      const processed = processTrendingListings(listings);

      // Get top 3 movers
      const top3 = getTopMovers(processed, 3);

      setTrendingItems(processed);
      setTopMovers(top3);

      console.log(`Loaded ${processed.length} trending items`);
    } catch (error) {
      console.error("Error loading trending data:", error);
    } finally {
      setLoadingTrends(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadTrendingData();
  };

  // Filter by category
  const filteredItems = useMemo(() => {
    return filterByCategory(trendingItems, selectedCategory);
  }, [trendingItems, selectedCategory]);

  const renderTopMover = ({ item, index }) => {
    const isPositive = item.priceChange >= 0;
    const rankColors = ["#FFD700", "#C0C0C0", "#CD7F32"]; // Gold, Silver, Bronze
    const rankGradients = [
      ["#FFD700", "#FFA500"], // Gold gradient
      ["#E8E8E8", "#A0A0A0"], // Silver gradient
      ["#CD7F32", "#8B4513"], // Bronze gradient
    ];

    return (
      <TouchableOpacity
        style={[styles.topMoverContainer, index === 0 && styles.topMoverFirst]}
        activeOpacity={0.8}
      >
        {/* Rank Badge with Glow Effect */}
        <View
          style={[
            styles.rankBadge,
            {
              backgroundColor: rankColors[index],
              shadowColor: rankColors[index],
            },
          ]}
        >
          <Text style={styles.rankText}>#{index + 1}</Text>
        </View>

        {/* Massive Percentage Display */}
        <View
          style={[
            styles.percentageDisplay,
            {
              backgroundColor: isPositive ? "#10b981" : "#ef4444",
            },
          ]}
        >
          <Ionicons
            name={isPositive ? "trending-up" : "trending-down"}
            size={24}
            color="#fff"
          />
          <Text style={styles.percentageText}>
            {isPositive ? "+" : ""}
            {item.priceChange.toFixed(1)}%
          </Text>
        </View>

        {/* Item Image with Shadow */}
        <View style={styles.imageContainer}>
          {item.image ? (
            <Image
              source={{ uri: item.image }}
              style={styles.topMoverImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Ionicons
                name="image-outline"
                size={40}
                color={COLORS.textMuted}
              />
            </View>
          )}
        </View>

        {/* Item Info */}
        <View style={styles.topMoverInfo}>
          <Text style={styles.topMoverName} numberOfLines={2}>
            {item.itemName || item.name}
          </Text>
          <Text style={styles.topMoverWear}>{item.wearName}</Text>

          {/* Price with Sparkline */}
          <View style={styles.priceSparklineRow}>
            <View style={styles.priceColumn}>
              <Text style={styles.priceValue}>
                {formatPrice(item.currentPrice)}
              </Text>
              <Text style={styles.volumeLabel}>{item.volume} vol</Text>
            </View>
            <MiniSparkline
              data={item.priceHistory || []}
              width={60}
              height={30}
              color={isPositive ? "#10b981" : "#ef4444"}
              strokeWidth={2.5}
            />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderTrendItem = ({ item }) => {
    const isPositive = item.priceChange >= 0;
    const sparklineColor = isPositive ? "#10b981" : "#ef4444";

    return (
      <View style={styles.trendItem}>
        {item.image ? (
          <Image
            source={{ uri: item.image }}
            style={styles.trendItemImage}
            resizeMode="contain"
          />
        ) : (
          <View style={[styles.trendItemImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={24} color={COLORS.textMuted} />
          </View>
        )}
        <View style={styles.trendItemLeft}>
          <Text style={styles.trendItemName} numberOfLines={1}>
            {item.itemName || item.name}
          </Text>
          <View style={styles.trendItemMeta}>
            <Text style={styles.trendItemWear}>{item.wearName}</Text>
            {item.isStatTrak && (
              <>
                <Text style={styles.metaDivider}>•</Text>
                <Ionicons name="stats-chart" size={12} color={COLORS.primary} />
                <Text style={styles.statTrakText}>ST</Text>
              </>
            )}
          </View>
          <View style={styles.volumeRow}>
            <Ionicons
              name="layers-outline"
              size={12}
              color={COLORS.textMuted}
            />
            <Text style={styles.volumeText}>{item.volume} vol</Text>
          </View>
        </View>

        {/* Mini Price Chart */}
        <View style={styles.sparklineContainer}>
          <MiniSparkline
            data={item.priceHistory || []}
            width={70}
            height={35}
            color={sparklineColor}
            strokeWidth={2}
          />
        </View>

        <View style={styles.trendItemRight}>
          <Text style={styles.trendItemPrice}>
            {formatPrice(item.currentPrice)}
          </Text>
          <View
            style={[
              styles.changeIndicator,
              {
                backgroundColor: isPositive
                  ? "#10b981" + "20"
                  : "#ef4444" + "20",
              },
            ]}
          >
            <Ionicons
              name={isPositive ? "arrow-up" : "arrow-down"}
              size={14}
              color={isPositive ? "#10b981" : "#ef4444"}
            />
            <Text
              style={[
                styles.changeText,
                { color: isPositive ? "#10b981" : "#ef4444" },
              ]}
            >
              {isPositive ? "+" : ""}
              {item.priceChange.toFixed(1)}%
            </Text>
          </View>
        </View>
      </View>
    );
  };
  if (loadingTrends && !refreshing) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Fetching trending market data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <>
            {/* Top Movers Header */}
            <View style={styles.topMoversSection}>
              <View style={styles.sectionHeader}>
                <Ionicons name="flame" size={24} color="#ff6b35" />
                <Text style={styles.sectionTitle}>Top 3 Movers</Text>
                <View style={styles.liveIndicator}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>Live</Text>
                </View>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.topMoversScroll}
              >
                {topMovers.map((item, index) => (
                  <View key={item.id}>{renderTopMover({ item, index })}</View>
                ))}
              </ScrollView>
            </View>

            {/* Category Filter */}
            <View style={styles.categorySection}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryScroll}
              >
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category}
                    style={[
                      styles.categoryButton,
                      selectedCategory === category &&
                        styles.categoryButtonActive,
                    ]}
                    onPress={() => setSelectedCategory(category)}
                  >
                    <Text
                      style={[
                        styles.categoryButtonText,
                        selectedCategory === category &&
                          styles.categoryButtonTextActive,
                      ]}
                    >
                      {category}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* List Header */}
            <View style={styles.listHeader}>
              <Text style={styles.listTitle}>
                Trending in {selectedCategory}
              </Text>
              <Text style={styles.listCount}>{filteredItems.length} items</Text>
            </View>
          </>
        }
        data={filteredItems}
        renderItem={renderTrendItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="analytics-outline"
              size={64}
              color={COLORS.textMuted}
            />
            <Text style={styles.emptyText}>No trending data available</Text>
            <Text style={styles.emptySubtext}>
              Pull to refresh and fetch latest market trends
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  topMoversSection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.sm,
    paddingHorizontal: SPACING.md,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: "700",
    flex: 1,
  },
  liveIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#10b981" + "20",
    borderRadius: BORDER_RADIUS.full,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#10b981",
  },
  liveText: {
    ...TYPOGRAPHY.caption,
    color: "#10b981",
    fontWeight: "700",
    fontSize: 11,
  },
  topMoversScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.md,
  },
  topMoverContainer: {
    width: 180,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.xl,
    padding: SPACING.md,
    position: "relative",
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },
  topMoverFirst: {
    width: 200,
    borderWidth: 2,
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  rankBadge: {
    position: "absolute",
    top: -8,
    left: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    zIndex: 10,
  },
  rankText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  percentageDisplay: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.md,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  percentageText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0.5,
    textShadowColor: "rgba(0, 0, 0, 0.2)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  imageContainer: {
    width: "100%",
    height: 90,
    marginBottom: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  topMoverImage: {
    width: "100%",
    height: "100%",
  },
  topMoverInfo: {
    gap: SPACING.xs,
  },
  topMoverName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 13,
    lineHeight: 16,
    height: 32,
  },
  topMoverWear: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
    marginBottom: 2,
  },
  priceSparklineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: SPACING.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.border + "40",
  },
  priceColumn: {
    gap: 2,
  },
  priceValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "800",
    fontSize: 16,
  },
  volumeLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 9,
  },
  categorySection: {
    backgroundColor: COLORS.surface,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  categoryScroll: {
    paddingHorizontal: SPACING.md,
    gap: SPACING.sm,
  },
  categoryButton: {
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary + "20",
    borderColor: COLORS.primary,
  },
  categoryButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontWeight: "600",
  },
  categoryButtonTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  listHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: SPACING.md,
  },
  listTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: "700",
  },
  listCount: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  listContent: {
    padding: SPACING.md,
  },
  trendItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  trendItemImage: {
    width: 60,
    height: 60,
    marginRight: SPACING.md,
  },
  placeholderImage: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.md,
    alignItems: "center",
    justifyContent: "center",
  },
  trendItemLeft: {
    flex: 1,
    marginRight: SPACING.md,
  },
  trendItemName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
    marginBottom: 4,
  },
  trendItemMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  trendItemWear: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  volumeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  volumeText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 10,
  },
  sparklineContainer: {
    width: 70,
    height: 35,
    marginRight: SPACING.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metaDivider: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  statTrakText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: "700",
  },
  trendItemRight: {
    alignItems: "flex-end",
  },
  trendItemPrice: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  changeIndicator: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.md,
  },
  changeText: {
    ...TYPOGRAPHY.caption,
    fontWeight: "700",
    fontSize: 11,
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: SPACING.xl * 2,
  },
  emptyText: {
    ...TYPOGRAPHY.h3,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginTop: SPACING.sm,
  },
});
