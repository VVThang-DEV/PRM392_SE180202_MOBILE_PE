import React, { useEffect } from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { Text, TextInput } from "react-native";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { DataProvider } from "./src/context/DataContext";
import { initSupabase } from "./src/services/supabaseService";

// Fix for "Cannot read property 'regular' of undefined" error
if (Text.defaultProps == null) Text.defaultProps = {};
Text.defaultProps.allowFontScaling = false;
if (TextInput.defaultProps == null) TextInput.defaultProps = {};
TextInput.defaultProps.allowFontScaling = false;

export default function App() {
  useEffect(() => {
    // Initialize Supabase on app startup
    console.log("Initializing Supabase...");
    initSupabase();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <DataProvider>
          <StatusBar style="light" />
          <AppNavigator />
        </DataProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
