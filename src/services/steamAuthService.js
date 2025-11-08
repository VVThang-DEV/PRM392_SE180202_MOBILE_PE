/**
 * Steam Authentication Service
 * Handles Steam OpenID authentication flow
 */

import * as WebBrowser from "expo-web-browser";
import { STEAM_API_KEY } from "@env";

const STEAM_OPENID_URL = "https://steamcommunity.com/openid/login";
const STEAM_API_BASE = "https://api.steampowered.com";

// For development/testing - this should be your app's redirect URL
const REDIRECT_URI = "exp://localhost:8081/--/auth/steam";

/**
 * Parse Steam ID from OpenID response URL
 * @param {string} url - The callback URL
 * @returns {string|null} Steam ID or null
 */
function parseSteamIdFromUrl(url) {
  try {
    const match = url.match(/openid\.claimed_id=.*\/id\/(\d+)/);
    return match ? match[1] : null;
  } catch (error) {
    console.error("Error parsing Steam ID:", error);
    return null;
  }
}

/**
 * Initiate Steam OpenID authentication
 * @returns {Promise<Object>} User Steam data
 */
export async function loginWithSteam() {
  try {
    console.log("Starting Steam OpenID authentication...");

    // Build OpenID authentication URL
    const params = new URLSearchParams({
      "openid.ns": "http://specs.openid.net/auth/2.0",
      "openid.mode": "checkid_setup",
      "openid.return_to": REDIRECT_URI,
      "openid.realm": REDIRECT_URI.split("/--/")[0],
      "openid.identity": "http://specs.openid.net/auth/2.0/identifier_select",
      "openid.claimed_id": "http://specs.openid.net/auth/2.0/identifier_select",
    });

    const authUrl = `${STEAM_OPENID_URL}?${params.toString()}`;

    // Open Steam login in browser
    const result = await WebBrowser.openAuthSessionAsync(authUrl, REDIRECT_URI);

    if (result.type === "success" && result.url) {
      const steamId = parseSteamIdFromUrl(result.url);

      if (steamId) {
        console.log("✅ Steam authentication successful:", steamId);

        // Fetch user profile data
        const profileData = await fetchSteamProfile(steamId);

        return {
          success: true,
          steamId,
          profile: profileData,
        };
      } else {
        throw new Error("Failed to extract Steam ID from response");
      }
    } else {
      console.log("Steam login cancelled or failed");
      return {
        success: false,
        error: "Login cancelled",
      };
    }
  } catch (error) {
    console.error("Steam authentication error:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}

/**
 * Fetch Steam user profile data
 * @param {string} steamId - Steam ID
 * @returns {Promise<Object>} User profile data
 */
export async function fetchSteamProfile(steamId) {
  try {
    const url = `${STEAM_API_BASE}/ISteamUser/GetPlayerSummaries/v0002/?key=${STEAM_API_KEY}&steamids=${steamId}`;

    const response = await fetch(url);
    const data = await response.json();

    if (data.response && data.response.players.length > 0) {
      const player = data.response.players[0];

      return {
        steamId: player.steamid,
        personaName: player.personaname,
        profileUrl: player.profileurl,
        avatar: player.avatar,
        avatarMedium: player.avatarmedium,
        avatarFull: player.avatarfull,
        personaState: player.personastate,
        communityVisibilityState: player.communityvisibilitystate,
        profileState: player.profilestate,
        lastLogoff: player.lastlogoff,
        commentPermission: player.commentpermission,
        realName: player.realname,
        timeCreated: player.timecreated,
        countryCode: player.loccountrycode,
      };
    }

    throw new Error("No player data found");
  } catch (error) {
    console.error("Error fetching Steam profile:", error);
    throw error;
  }
}

/**
 * Logout user (clear local session)
 * @returns {Promise<boolean>}
 */
export async function logoutSteam() {
  try {
    console.log("Logging out from Steam...");
    // Session clearing will be handled by context/storage
    return true;
  } catch (error) {
    console.error("Error logging out:", error);
    return false;
  }
}
