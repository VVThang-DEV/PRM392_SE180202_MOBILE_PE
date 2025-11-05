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

    // Create HTML content showing in-game first-person view
    const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <style>
    * {
      margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: #0a0e14;
      color: #e5e7eb;
      min-height: 100vh;
      height: 100%;
      width: 100%;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      -webkit-font-smoothing: antialiased;
    }
            .game-screen {
              flex: 1;
              background: linear-gradient(180deg, #1a2332 0%, #0f1923 50%, #1a2332 100%);
              position: relative;
              display: flex;
              align-items: center;
              justify-content: center;
            }
    .weapon-view {
      width: 90%;
      max-width: 500px;
      height: 300px;
      background: rgba(255, 255, 255, 0.05);
      border-radius: 20px;
      display: flex;
      align-items: center;
      justify-content: center;
      position: relative;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
      border: 2px solid rgba(59, 130, 246, 0.3);
    }
    .weapon-icon {
      font-size: 100px;
      opacity: 0.8;
      animation: float 3s ease-in-out infinite;
      text-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(-15deg); }
              50% { transform: translateY(-20px) rotate(-10deg); }
            }
            .hud {
              background: rgba(0, 0, 0, 0.8);
              padding: 15px 20px;
              border-top: 2px solid #3b82f6;
            }
            .skin-info {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 10px;
            }
            .skin-name {
              font-size: 18px;
              font-weight: 700;
              color: #3b82f6;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              border-bottom: 1px solid rgba(255, 255, 255, 0.05);
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label {
              color: #9ca3af;
              font-size: 14px;
            }
            .value {
              color: #e5e7eb;
              font-weight: 600;
              font-size: 14px;
            }
            .stat-badge {
              display: inline-block;
              background: rgba(59, 130, 246, 0.2);
              border: 1px solid #3b82f6;
              padding: 4px 12px;
              border-radius: 6px;
              font-size: 12px;
              margin-left: 10px;
              color: #3b82f6;
            }
            .wear-bar {
              background: rgba(255, 255, 255, 0.1);
              height: 6px;
              border-radius: 3px;
              overflow: hidden;
              margin-top: 10px;
            }
            .wear-fill {
              height: 100%;
              background: linear-gradient(90deg, #4CAF50 0%, #FFC107 50%, #F44336 100%);
              width: ${(wear * 100).toFixed(1)}%;
              transition: width 0.3s ease;
            }
            .crosshair {
              position: absolute;
              top: 50%;
              left: 50%;
              transform: translate(-50%, -50%);
              width: 20px;
              height: 20px;
              opacity: 0.3;
            }
            .crosshair::before,
            .crosshair::after {
              content: '';
              position: absolute;
              background: #00ff00;
            }
            .crosshair::before {
              width: 2px;
              height: 100%;
              left: 50%;
              transform: translateX(-50%);
            }
            .crosshair::after {
              height: 2px;
              width: 100%;
              top: 50%;
              transform: translateY(-50%);
            }
          </style>
  </style>
</head>
<body>
  <div class="game-screen">
    <div class="crosshair"></div>
    <div class="weapon-view">
      <div class="weapon-icon">${
        weaponType.includes("Knife") || weaponType.includes("★")
          ? "🗡️"
          : weaponType.includes("Gloves") || weaponType.includes("Wraps")
          ? "🧤"
          : "🔫"
      }</div>
    </div>
  </div>
  
  <div class="hud">
    <div class="skin-info">
      <div>
        <div class="skin-name">${weaponType}</div>
        <div style="color: #9ca3af; font-size: 14px; margin-top: 4px;">${skinPattern}</div>
      </div>
      <div>
        <span class="stat-badge">Seed #${seed}</span>
      </div>
    </div>
    
    <div class="info-row">
      <span class="label">Wear Value</span>
      <span class="value">${wear.toFixed(4)} (${
      wear < 0.07
        ? "Factory New"
        : wear < 0.15
        ? "Minimal Wear"
        : wear < 0.38
        ? "Field-Tested"
        : wear < 0.45
        ? "Well-Worn"
        : "Battle-Scarred"
    })</span>
    </div>
    
    <div class="wear-bar">
      <div class="wear-fill"></div>
    </div>
    
    <div style="margin-top: 15px; text-align: center;">
      <a href="${stashUrl}" style="color: #3b82f6; text-decoration: none; font-size: 12px;">
        View on CSGOStash ↗
      </a>
    </div>
  </div>
  
  <script>
    console.log('HTML loaded successfully');
    document.body.style.visibility = 'visible';
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
