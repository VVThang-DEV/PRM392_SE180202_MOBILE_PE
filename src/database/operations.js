import { getDatabase } from "./schema";

/**
 * Get all items from the database
 */
export const getAllItems = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync("SELECT * FROM items ORDER BY name");
  return result.map((row) => ({
    ...row,
    isFavorite: Boolean(row.isFavorite),
  }));
};

/**
 * Get item by ID
 */
export const getItemById = async (id) => {
  const db = getDatabase();
  const result = await db.getFirstAsync("SELECT * FROM items WHERE id = ?", [
    id,
  ]);
  if (result) {
    return {
      ...result,
      isFavorite: Boolean(result.isFavorite),
    };
  }
  return null;
};

/**
 * Get all favorite items
 */
export const getFavoriteItems = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    "SELECT * FROM items WHERE isFavorite = 1 ORDER BY name"
  );
  return result.map((row) => ({
    ...row,
    isFavorite: Boolean(row.isFavorite),
  }));
};

/**
 * Get unique categories
 */
export const getCategories = async () => {
  const db = getDatabase();
  const result = await db.getAllAsync(
    "SELECT DISTINCT category FROM items ORDER BY category"
  );
  return result.map((row) => row.category);
};

/**
 * Toggle favorite status
 */
export const toggleFavorite = async (id, isFavorite) => {
  const db = getDatabase();
  await db.runAsync("UPDATE items SET isFavorite = ? WHERE id = ?", [
    isFavorite ? 1 : 0,
    id,
  ]);
};

/**
 * Insert items into database
 */
export const insertItems = async (items) => {
  const db = getDatabase();

  // Clear existing items
  await db.runAsync("DELETE FROM items");

  // Insert new items
  for (const item of items) {
    await db.runAsync(
      `INSERT INTO items (
        id, name, description, weapon, category, pattern,
        min_float, max_float, rarity, rarity_color, image,
        team, isFavorite, createdAt
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        item.id,
        item.name,
        item.description || "",
        item.weapon || "",
        item.category,
        item.pattern || "",
        item.min_float || 0,
        item.max_float || 1,
        item.rarity || "",
        item.rarity_color || "",
        item.image,
        item.team || "",
        item.isFavorite ? 1 : 0,
        item.createdAt || new Date().toISOString(),
      ]
    );
  }
};

/**
 * Check if database is empty
 */
export const isDatabaseEmpty = async () => {
  const db = getDatabase();
  const result = await db.getFirstAsync("SELECT COUNT(*) as count FROM items");
  return result.count === 0;
};

/**
 * Search items
 */
export const searchItems = async (query, category = "All") => {
  const db = getDatabase();
  let sql = "SELECT * FROM items WHERE 1=1";
  const params = [];

  if (category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (query && query.trim()) {
    sql += " AND (name LIKE ? OR weapon LIKE ? OR category LIKE ?)";
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += " ORDER BY name";

  const result = await db.getAllAsync(sql, params);
  return result.map((row) => ({
    ...row,
    isFavorite: Boolean(row.isFavorite),
  }));
};

/**
 * Search favorite items
 */
export const searchFavorites = async (query, category = "All") => {
  const db = getDatabase();
  let sql = "SELECT * FROM items WHERE isFavorite = 1";
  const params = [];

  if (category !== "All") {
    sql += " AND category = ?";
    params.push(category);
  }

  if (query && query.trim()) {
    sql += " AND (name LIKE ? OR weapon LIKE ? OR category LIKE ?)";
    const searchTerm = `%${query}%`;
    params.push(searchTerm, searchTerm, searchTerm);
  }

  sql += " ORDER BY name";

  const result = await db.getAllAsync(sql, params);
  return result.map((row) => ({
    ...row,
    isFavorite: Boolean(row.isFavorite),
  }));
};
