/**
 * Supabase Inventory Sync Service
 * Syncs inventory data between local SQLite and Supabase cloud
 */

import { supabase } from "./supabaseService";

/**
 * Sync user profile to Supabase
 * @param {Object} profile - User profile data
 * @returns {Promise<boolean>}
 */
export async function syncUserProfileToSupabase(profile) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized, skipping profile sync");
      return false;
    }

    const { data, error } = await supabase.from("user_profiles").upsert(
      {
        steam_id: profile.steamId,
        persona_name: profile.personaName,
        profile_url: profile.profileUrl,
        avatar: profile.avatar,
        avatar_medium: profile.avatarMedium,
        avatar_full: profile.avatarFull,
        persona_state: profile.personaState,
        community_visibility_state: profile.communityVisibilityState,
        real_name: profile.realName || null,
        country_code: profile.countryCode || null,
        time_created: profile.timeCreated || null,
        last_logoff: profile.lastLogoff || null,
        is_active: true,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "steam_id" }
    );

    if (error) {
      console.error("Error syncing profile to Supabase:", error);
      return false;
    }

    console.log("✅ Profile synced to Supabase");
    return true;
  } catch (error) {
    console.error("Error in syncUserProfileToSupabase:", error);
    return false;
  }
}

/**
 * Sync inventory items to Supabase
 * @param {string} steamId - Steam ID
 * @param {Array} items - Inventory items
 * @returns {Promise<boolean>}
 */
export async function syncInventoryToSupabase(steamId, items) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized, skipping inventory sync");
      return false;
    }

    // Delete existing items for this user
    await supabase.from("inventory_items").delete().eq("steam_id", steamId);

    // Prepare items for Supabase
    const itemsToInsert = items.map((item) => ({
      steam_id: steamId,
      asset_id: item.assetId,
      class_id: item.classId,
      instance_id: item.instanceId,
      market_hash_name: item.marketHashName,
      name: item.name,
      type: item.type,
      rarity: item.rarity,
      weapon: item.weapon,
      wear_name: item.wearName,
      is_stattrak: item.isStatTrak || false,
      is_souvenir: item.isSouvenir || false,
      icon_url: item.iconUrl,
      background_color: item.backgroundColor,
      marketable: item.marketable !== false,
      tradable: item.tradable !== false,
      amount: item.amount || 1,
      synced_at: new Date().toISOString(),
    }));

    // Insert in batches of 100 to avoid payload size limits
    const batchSize = 100;
    for (let i = 0; i < itemsToInsert.length; i += batchSize) {
      const batch = itemsToInsert.slice(i, i + batchSize);

      const { error } = await supabase.from("inventory_items").insert(batch);

      if (error) {
        console.error(
          `Error syncing inventory batch ${i / batchSize + 1}:`,
          error
        );
        return false;
      }
    }

    console.log(`✅ Synced ${items.length} items to Supabase`);
    return true;
  } catch (error) {
    console.error("Error in syncInventoryToSupabase:", error);
    return false;
  }
}

/**
 * Sync inventory snapshot to Supabase
 * @param {Object} snapshot - Snapshot data
 * @param {Array} itemPrices - Item prices
 * @returns {Promise<number|null>} Supabase snapshot ID or null
 */
export async function syncSnapshotToSupabase(snapshot, itemPrices) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized, skipping snapshot sync");
      return null;
    }

    // Insert snapshot
    const { data: snapshotData, error: snapshotError } = await supabase
      .from("inventory_snapshots")
      .insert({
        steam_id: snapshot.steamId,
        total_items: snapshot.totalItems,
        total_value: snapshot.totalValue,
        snapshot_date: snapshot.snapshotDate,
        timestamp: snapshot.timestamp,
      })
      .select()
      .single();

    if (snapshotError) {
      console.error("Error syncing snapshot to Supabase:", snapshotError);
      return null;
    }

    const supabaseSnapshotId = snapshotData.id;

    // Insert item prices in batches
    const pricesToInsert = itemPrices.map((item) => ({
      snapshot_id: supabaseSnapshotId,
      asset_id: item.assetId,
      market_hash_name: item.marketHashName,
      price: item.price,
    }));

    const batchSize = 100;
    for (let i = 0; i < pricesToInsert.length; i += batchSize) {
      const batch = pricesToInsert.slice(i, i + batchSize);

      const { error } = await supabase
        .from("inventory_item_prices")
        .insert(batch);

      if (error) {
        console.error(
          `Error syncing item prices batch ${i / batchSize + 1}:`,
          error
        );
      }
    }

    console.log(
      `✅ Synced snapshot to Supabase (ID: ${supabaseSnapshotId}, ${itemPrices.length} items)`
    );
    return supabaseSnapshotId;
  } catch (error) {
    console.error("Error in syncSnapshotToSupabase:", error);
    return null;
  }
}

/**
 * Get inventory snapshots from Supabase
 * @param {string} steamId - Steam ID
 * @param {number} limit - Max number of snapshots
 * @returns {Promise<Array>}
 */
export async function getSnapshotsFromSupabase(steamId, limit = 30) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return [];
    }

    const { data, error } = await supabase
      .from("inventory_snapshots")
      .select("*")
      .eq("steam_id", steamId)
      .order("timestamp", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching snapshots from Supabase:", error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error("Error in getSnapshotsFromSupabase:", error);
    return [];
  }
}

/**
 * Get inventory from Supabase
 * @param {string} steamId - Steam ID
 * @returns {Promise<Array>}
 */
export async function getInventoryFromSupabase(steamId) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return [];
    }

    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("steam_id", steamId)
      .order("acquired_at", { ascending: false });

    if (error) {
      console.error("Error fetching inventory from Supabase:", error);
      return [];
    }

    // Convert Supabase format to app format
    return (
      data?.map((item) => ({
        assetId: item.asset_id,
        classId: item.class_id,
        instanceId: item.instance_id,
        marketHashName: item.market_hash_name,
        name: item.name,
        type: item.type,
        rarity: item.rarity,
        weapon: item.weapon,
        wearName: item.wear_name,
        isStatTrak: item.is_stattrak,
        isSouvenir: item.is_souvenir,
        iconUrl: item.icon_url,
        backgroundColor: item.background_color,
        marketable: item.marketable,
        tradable: item.tradable,
        amount: item.amount,
      })) || []
    );
  } catch (error) {
    console.error("Error in getInventoryFromSupabase:", error);
    return [];
  }
}

/**
 * Get latest inventory value from Supabase
 * @param {string} steamId - Steam ID
 * @returns {Promise<Object|null>}
 */
export async function getLatestValueFromSupabase(steamId) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return null;
    }

    const { data, error } = await supabase
      .from("inventory_snapshots")
      .select("total_value, total_items, snapshot_date, timestamp")
      .eq("steam_id", steamId)
      .order("timestamp", { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.error("Error fetching latest value from Supabase:", error);
      return null;
    }

    return data;
  } catch (error) {
    console.error("Error in getLatestValueFromSupabase:", error);
    return null;
  }
}

/**
 * Calculate inventory value change from Supabase
 * @param {string} steamId - Steam ID
 * @returns {Promise<Object>}
 */
export async function getValueChangeFromSupabase(steamId) {
  try {
    if (!supabase) {
      console.warn("Supabase not initialized");
      return null;
    }

    const { data, error } = await supabase
      .from("inventory_snapshots")
      .select("total_value, snapshot_date, timestamp")
      .eq("steam_id", steamId)
      .order("timestamp", { ascending: false })
      .limit(2);

    if (error || !data || data.length < 2) {
      return {
        currentValue: data?.[0]?.total_value || 0,
        previousValue: 0,
        change: 0,
        changePercent: 0,
      };
    }

    const current = data[0];
    const previous = data[1];
    const change =
      parseFloat(current.total_value) - parseFloat(previous.total_value);
    const changePercent =
      previous.total_value > 0
        ? (change / parseFloat(previous.total_value)) * 100
        : 0;

    return {
      currentValue: parseFloat(current.total_value),
      previousValue: parseFloat(previous.total_value),
      change,
      changePercent,
      currentDate: current.snapshot_date,
      previousDate: previous.snapshot_date,
    };
  } catch (error) {
    console.error("Error in getValueChangeFromSupabase:", error);
    return {
      currentValue: 0,
      previousValue: 0,
      change: 0,
      changePercent: 0,
    };
  }
}
