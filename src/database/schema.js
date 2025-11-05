import * as SQLite from "expo-sqlite";

// Initialize SQLite database
let db = null;

export const initDatabase = async () => {
  try {
    db = await SQLite.openDatabaseAsync("csgo_armory.db");

    // Create items table
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT NOT NULL,
        description TEXT,
        weapon TEXT,
        category TEXT NOT NULL,
        pattern TEXT,
        min_float REAL DEFAULT 0,
        max_float REAL DEFAULT 1,
        rarity TEXT,
        rarity_color TEXT,
        image TEXT NOT NULL,
        team TEXT,
        isFavorite INTEGER DEFAULT 0,
        createdAt TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_category ON items(category);
      CREATE INDEX IF NOT EXISTS idx_favorite ON items(isFavorite);
    `);

    console.log("Database initialized successfully");
    return db;
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
};
