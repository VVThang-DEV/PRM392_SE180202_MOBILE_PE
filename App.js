import React from "react";
import { StatusBar } from "expo-status-bar";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { AppNavigator } from "./src/navigation/AppNavigator";
import { DataProvider } from "./src/context/DataContext";

export default function App() {
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
