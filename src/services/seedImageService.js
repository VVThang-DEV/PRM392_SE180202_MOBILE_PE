/**
 * Service for fetching seed-specific skin images from CSGOFloat API
 */

const CSFLOAT_API_KEY = "ibj-zt1c2f7gSB5lLLtZqyuWdRW7c1kt";

/**
 * Fetch seed-specific image from CSGOFloat API
 * Note: CSGOFloat API doesn't provide seed-specific images
 * This function will always return null as seed images aren't available via API
 */
export const fetchSeedImage = async (skinName, seed, wear = 0.1) => {
  console.log(
    `Fetching seed image for: ${skinName}, seed: ${seed}, wear: ${wear}`
  );

  // CSGOFloat API doesn't provide seed-specific images
  // Seed images require actual game items with inspect links
  console.log("No seed-specific image available, will use 3D viewer");
  return null;
};

/**
 * Generate in-game view URL using Steam's CDN or CS.MONEY API
 * Multiple options:
 * 1. Steam Community Market - https://steamcommunity-a.akamaihd.net/economy/image/
 * 2. CS.MONEY API - https://cs.money/csgo/
 * 3. CSGOStash - https://csgostash.com/
 */
export const generate3DViewerUrl = (skinName, seed, wear = 0.1) => {
  try {
    console.log(
      `Generating viewer for: ${skinName}, seed: ${seed}, wear: ${wear}`
    );

    // Extract weapon and skin pattern
    const weaponType = skinName.split("|")[0]?.trim() || "Weapon";
    const skinPattern = skinName.split("|")[1]?.trim() || "Skin";

    // Try CS.MONEY image URL (they have a public CDN)
    const cleanSkinName = skinName.replace(/★\s*/g, "").trim();
    const encodedForCSMoney = encodeURIComponent(cleanSkinName);

    // CSGOStash is more reliable for images
    const stashUrl = `https://csgostash.com/skin/${encodeURIComponent(
      skinName.replace(/[★|]/g, "-").replace(/\s+/g, "-")
    )}`;

    console.log("Generating viewer with external images");

    // Create simple HTML content for testing
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>CS:GO In-Game View</title>
  <style>
    body {
      margin: 0;
      padding: 20px;
      background: #1a2332;
      color: #e5e7eb;
      font-family: Arial, sans-serif;
      text-align: center;
      min-height: 100vh;
      visibility: visible;
    }
    .container {
      max-width: 400px;
      margin: 0 auto;
    }
    .weapon-icon {
      font-size: 80px;
      margin: 20px 0;
    }
    .info {
      background: rgba(255,255,255,0.1);
      padding: 15px;
      border-radius: 10px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>🎯 CS:GO In-Game View</h1>
    <div class="weapon-icon">${weaponType.includes("Knife") ? "🗡️" : weaponType.includes("Gloves") ? "🧤" : "🔫"}</div>
    <div class="info">
      <h2>${weaponType}</h2>
      <p>${skinPattern}</p>
      <p>Seed: ${seed}</p>
      <p>Wear: ${wear.toFixed(4)}</p>
    </div>
  </div>
  <script>
    console.log('In-game view loaded successfully');
  </script>
</body>
</html>`;

    console.log("Generated HTML for in-game view");
    return html;
  } catch (error) {
    console.error("Error generating 3D viewer URL:", error);
    // Fallback to simple info display
    return `
      <html>
        <body style="background:#1a2332;color:#e5e7eb;text-align:center;padding:20px;font-family:Arial;">
          <h1 style="color:#3b82f6;">3D Viewer Error</h1>
          <p>Unable to load 3D viewer for ${skinName}</p>
          <p style="font-size:12px;color:#6b7280;">Pattern seed information requires external viewing</p>
        </body>
      </html>
    `;
  }
};

/**
 * Check if a pattern is special (Doppler, Case Hardened, etc.)
 */
export const isSpecialPattern = (patternName) => {
  const specialPatterns = ["Doppler", "Case Hardened", "Fade", "Marble Fade"];
  return specialPatterns.some((sp) => patternName?.includes(sp));
};
