import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";
import { useUser } from "../context/UserContext";
import {
  getInventoryStats,
  calculateInventoryChange,
  getInventorySnapshots,
} from "../database/userOperations";
import { formatPrice } from "../services/priceService";

export const ProfileScreen = ({ navigation }) => {
  const {
    user,
    isAuthenticated,
    login,
    logout,
    loading: authLoading,
  } = useUser();
  const [stats, setStats] = useState(null);
  const [valueChange, setValueChange] = useState(null);
  const [snapshots, setSnapshots] = useState([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      loadProfileData();
    }
  }, [isAuthenticated, user]);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Load inventory stats
      const inventoryStats = await getInventoryStats(user.steamId);
      setStats(inventoryStats);

      // Load value change
      const change = await calculateInventoryChange(user.steamId);
      setValueChange(change);

      // Load snapshots
      const snapshotData = await getInventorySnapshots(user.steamId, 7);
      setSnapshots(snapshotData);

      console.log("✅ Profile data loaded");
    } catch (error) {
      console.error("Error loading profile data:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadProfileData();
  };

  const handleLogin = async () => {
    const result = await login();
    if (!result.success) {
      Alert.alert("Login Failed", result.error || "Could not login with Steam");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Logout",
        style: "destructive",
        onPress: async () => {
          await logout();
        },
      },
    ]);
  };

  const navigateToInventory = () => {
    navigation.navigate("Inventory");
  };

  if (authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScrollView
          contentContainerStyle={styles.loginContainer}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          <Ionicons
            name="person-circle-outline"
            size={120}
            color={COLORS.textMuted}
          />
          <Text style={styles.loginTitle}>Sign in with Steam</Text>
          <Text style={styles.loginSubtitle}>
            Track your CS2 inventory value and price changes
          </Text>

          <TouchableOpacity
            style={styles.steamButton}
            onPress={handleLogin}
            activeOpacity={0.8}
          >
            <Ionicons name="logo-steam" size={24} color="#fff" />
            <Text style={styles.steamButtonText}>Login with Steam</Text>
          </TouchableOpacity>

          <View style={styles.featuresList}>
            <View style={styles.featureItem}>
              <Ionicons
                name="wallet-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.featureText}>Track inventory value</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="trending-up-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.featureText}>Monitor price changes</Text>
            </View>
            <View style={styles.featureItem}>
              <Ionicons
                name="stats-chart-outline"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.featureText}>View detailed statistics</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <Image
            source={{ uri: user.avatarFull || user.avatarMedium }}
            style={styles.avatar}
          />
          <View style={styles.profileInfo}>
            <Text style={styles.personaName}>{user.personaName}</Text>
            {user.realName && (
              <Text style={styles.realName}>{user.realName}</Text>
            )}
            <View style={styles.statusRow}>
              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor:
                      user.personaState === 1 ? "#10b981" : "#6b7280",
                  },
                ]}
              />
              <Text style={styles.statusText}>
                {user.personaState === 1 ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color={COLORS.text} />
          </TouchableOpacity>
        </View>

        {loading && !stats ? (
          <ActivityIndicator
            size="large"
            color={COLORS.primary}
            style={{ marginTop: SPACING.xl }}
          />
        ) : (
          <>
            {/* Inventory Value Card */}
            <View style={styles.valueCard}>
              <Text style={styles.cardLabel}>Total Inventory Value</Text>
              <Text style={styles.totalValue}>
                {formatPrice(stats?.totalValue || 0)}
              </Text>

              {valueChange && valueChange.change !== 0 && (
                <View style={styles.changeRow}>
                  <Ionicons
                    name={
                      valueChange.change >= 0 ? "trending-up" : "trending-down"
                    }
                    size={20}
                    color={valueChange.change >= 0 ? "#10b981" : "#ef4444"}
                  />
                  <Text
                    style={[
                      styles.changeText,
                      {
                        color: valueChange.change >= 0 ? "#10b981" : "#ef4444",
                      },
                    ]}
                  >
                    {valueChange.change >= 0 ? "+" : ""}
                    {formatPrice(Math.abs(valueChange.change))} (
                    {valueChange.changePercent.toFixed(2)}%)
                  </Text>
                </View>
              )}

              <Text style={styles.lastUpdated}>
                Last updated: {stats?.lastUpdated || "Never"}
              </Text>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Ionicons
                  name="cube-outline"
                  size={32}
                  color={COLORS.primary}
                />
                <Text style={styles.statValue}>{stats?.totalItems || 0}</Text>
                <Text style={styles.statLabel}>Total Items</Text>
              </View>

              <View style={styles.statCard}>
                <Ionicons
                  name="stats-chart-outline"
                  size={32}
                  color="#f59e0b"
                />
                <Text style={styles.statValue}>
                  {stats?.statTrakItems || 0}
                </Text>
                <Text style={styles.statLabel}>StatTrak™</Text>
              </View>
            </View>

            {/* Quick Actions */}
            <TouchableOpacity
              style={styles.inventoryButton}
              onPress={navigateToInventory}
              activeOpacity={0.8}
            >
              <View style={styles.inventoryButtonContent}>
                <Ionicons name="grid-outline" size={24} color="#fff" />
                <Text style={styles.inventoryButtonText}>View Inventory</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#fff" />
            </TouchableOpacity>

            {/* Price History Chart Preview */}
            {snapshots.length > 0 && (
              <View style={styles.historyCard}>
                <Text style={styles.cardTitle}>Value History (7 days)</Text>
                <View style={styles.snapshotList}>
                  {snapshots.slice(0, 5).map((snapshot, index) => (
                    <View key={snapshot.id} style={styles.snapshotItem}>
                      <Text style={styles.snapshotDate}>
                        {snapshot.snapshotDate}
                      </Text>
                      <Text style={styles.snapshotValue}>
                        {formatPrice(snapshot.totalValue)}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {/* Rarity Breakdown */}
            {stats?.rarityBreakdown && stats.rarityBreakdown.length > 0 && (
              <View style={styles.rarityCard}>
                <Text style={styles.cardTitle}>Items by Rarity</Text>
                {stats.rarityBreakdown.map((item, index) => (
                  <View key={index} style={styles.rarityItem}>
                    <Text style={styles.rarityName}>{item.rarity}</Text>
                    <Text style={styles.rarityCount}>{item.count}</Text>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>
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
    backgroundColor: COLORS.background,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  loginContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.xl,
  },
  loginTitle: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    marginTop: SPACING.xl,
    marginBottom: SPACING.sm,
  },
  loginSubtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.xl * 2,
    paddingHorizontal: SPACING.lg,
  },
  steamButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
    backgroundColor: "#171a21",
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  steamButtonText: {
    ...TYPOGRAPHY.h3,
    color: "#fff",
    fontWeight: "700",
  },
  featuresList: {
    marginTop: SPACING.xl * 2,
    gap: SPACING.lg,
  },
  featureItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  featureText: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "600",
  },
  scrollContent: {
    padding: SPACING.lg,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  personaName: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: SPACING.xs,
  },
  realName: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  statusText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  logoutButton: {
    padding: SPACING.sm,
  },
  valueCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.xl,
    borderRadius: BORDER_RADIUS.xl,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  cardLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    marginBottom: SPACING.xs,
  },
  totalValue: {
    ...TYPOGRAPHY.h1,
    color: COLORS.text,
    fontWeight: "900",
    fontSize: 36,
    marginBottom: SPACING.sm,
  },
  changeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: SPACING.sm,
  },
  changeText: {
    ...TYPOGRAPHY.body,
    fontWeight: "700",
  },
  lastUpdated: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    fontSize: 11,
  },
  statsGrid: {
    flexDirection: "row",
    gap: SPACING.md,
    marginBottom: SPACING.lg,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    color: COLORS.text,
    fontWeight: "800",
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
  },
  inventoryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.primary,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  inventoryButtonContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: SPACING.md,
  },
  inventoryButtonText: {
    ...TYPOGRAPHY.h3,
    color: "#fff",
    fontWeight: "700",
  },
  historyCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    ...TYPOGRAPHY.h3,
    color: COLORS.text,
    fontWeight: "700",
    marginBottom: SPACING.md,
  },
  snapshotList: {
    gap: SPACING.sm,
  },
  snapshotItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "40",
  },
  snapshotDate: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
  },
  snapshotValue: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
    fontWeight: "700",
  },
  rarityCard: {
    backgroundColor: COLORS.card,
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  rarityItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border + "40",
  },
  rarityName: {
    ...TYPOGRAPHY.body,
    color: COLORS.text,
  },
  rarityCount: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontWeight: "700",
  },
});
