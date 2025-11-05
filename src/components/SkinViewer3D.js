import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { WebView } from "react-native-webview";
import { Ionicons } from "@expo/vector-icons";
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS } from "../constants/theme";

export const SkinViewer3D = ({ url, onError }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  console.log(
    "SkinViewer3D received URL:",
    url ? url.substring(0, 100) + "..." : "null"
  );

  const handleError = () => {
    console.log("WebView error occurred");
    setLoading(false);
    setError(true);
    onError && onError();
  };

  const handleLoadEnd = () => {
    console.log("WebView load ended successfully");
    setLoading(false);
  };

  const handleOpenExternally = async () => {
    try {
      // Extract CSGOFloat URL from the data URL if possible
      if (url.includes("csfloat.com")) {
        const csfloatMatch = url.match(/https:\/\/csfloat\.com[^"']*/);
        if (csfloatMatch) {
          await Linking.openURL(csfloatMatch[0]);
          return;
        }
      }
      // Fallback to general CSGOFloat search
      await Linking.openURL("https://csfloat.com");
    } catch (error) {
      Alert.alert("Error", "Unable to open external link");
    }
  };

  // Extract HTML content from data URL or return HTML directly
  const getHtmlContent = () => {
    console.log("=== SkinViewer3D getHtmlContent ===");
    console.log("URL exists:", !!url);
    console.log("URL type:", typeof url);
    console.log("URL length:", url?.length || 0);
    console.log("First 100 chars:", url?.substring(0, 100));

    // Return HTML directly if it's not a data URL
    if (url && !url.startsWith("data:text/html")) {
      console.log("✓ Returning direct HTML (length:", url.length, ")");
      return url;
    }

    // Handle data URLs
    if (url && url.startsWith("data:text/html")) {
      try {
        const base64Content = url.split(",")[1];
        if (base64Content) {
          const decoded = decodeURIComponent(escape(atob(base64Content)));
          console.log("✓ Decoded HTML from base64");
          return decoded;
        }
      } catch (error) {
        console.warn("✗ Error decoding base64:", error);
      }
    }

    // Fallback with debugging
    console.warn("✗ Using fallback HTML");
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              background: #1a2332;
              color: #e5e7eb;
              font-family: Arial, sans-serif;
              text-align: center;
              padding: 20px;
              display: flex;
              flex-direction: column;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
            }
            h1 { color: #f44336; }
            .debug { 
              background: rgba(255,255,255,0.1); 
              padding: 15px; 
              border-radius: 8px; 
              margin-top: 20px;
              font-family: monospace;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>⚠️ Viewer Error</h1>
          <p>Unable to load skin viewer</p>
          <div class="debug">
            <div>URL provided: ${!!url ? "Yes" : "No"}</div>
            <div>URL length: ${url?.length || 0}</div>
          </div>
        </body>
      </html>
    `;
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="eye-off" size={48} color={COLORS.textMuted} />
        <Text style={styles.errorText}>3D viewer unavailable</Text>
        <Text style={styles.errorSubtext}>
          Interactive 3D viewing requires Steam inspect links from actual game
          items
        </Text>
        <TouchableOpacity
          style={styles.externalButton}
          onPress={handleOpenExternally}
        >
          <Ionicons name="open-outline" size={20} color={COLORS.primary} />
          <Text style={styles.externalButtonText}>View on CSFloat</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading in-game view...</Text>
        </View>
      )}
      <WebView
        source={{
          html: getHtmlContent(),
          baseUrl: "",
        }}
        style={styles.webview}
        onLoadEnd={handleLoadEnd}
        onLoadStart={() => console.log("WebView load started")}
        onError={(syntheticEvent) => {
          console.error("WebView error:", syntheticEvent.nativeEvent);
          handleError();
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView HTTP error:", nativeEvent);
        }}
        onMessage={(event) => {
          console.log("WebView message:", event.nativeEvent.data);
        }}
        startInLoadingState={false}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mixedContentMode="always"
        allowsInlineMediaPlayback={true}
        originWhitelist={["*"]}
        scalesPageToFit={true}
        scrollEnabled={false}
      />
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.externalButtonSmall}
          onPress={handleOpenExternally}
        >
          <Ionicons name="open-outline" size={16} color={COLORS.primary} />
          <Text style={styles.externalButtonTextSmall}>Open in Browser</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    overflow: "hidden",
    backgroundColor: "#0a0e14",
    minHeight: 400,
  },
  webview: {
    flex: 1,
    backgroundColor: "transparent",
    opacity: 1,
  },
  loadingContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: COLORS.card,
    zIndex: 1,
  },
  loadingText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: SPACING.lg,
    backgroundColor: COLORS.card,
    borderRadius: BORDER_RADIUS.lg,
  },
  errorText: {
    ...TYPOGRAPHY.body,
    color: COLORS.textMuted,
    fontWeight: "600",
    marginBottom: SPACING.xs,
  },
  errorSubtext: {
    ...TYPOGRAPHY.caption,
    color: COLORS.textMuted,
    textAlign: "center",
    marginBottom: SPACING.md,
  },
  externalButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.primary + "20",
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    gap: SPACING.sm,
  },
  externalButtonText: {
    ...TYPOGRAPHY.body,
    color: COLORS.primary,
    fontWeight: "600",
  },
  overlay: {
    position: "absolute",
    top: SPACING.md,
    right: SPACING.md,
    zIndex: 2,
  },
  externalButtonSmall: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.card + "E0",
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    gap: SPACING.xs,
  },
  externalButtonTextSmall: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontWeight: "600",
  },
});
