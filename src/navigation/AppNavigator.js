import React from "react";
import { Platform } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ListScreen } from "../screens/ListScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
import { WearConditionScreen } from "../screens/WearConditionScreen";
import { PatternSeedScreen } from "../screens/PatternSeedScreen";
import { COLORS } from "../constants/theme";

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Stack navigator for the List flow (List + Detail)
const ListStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="ListHome"
        component={ListScreen}
        options={{
          title: "SE1720 - Vo Viet Thang - SE180202",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: "Skin Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="WearCondition"
        component={WearConditionScreen}
        options={{
          title: "Wear Conditions",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="PatternSeed"
        component={PatternSeedScreen}
        options={{
          title: "Pattern Seeds",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
};

// Stack navigator for the Favorites flow (Favorites + Detail)
const FavoritesStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: COLORS.surface,
        },
        headerTintColor: COLORS.text,
        headerTitleStyle: {
          fontWeight: "600",
        },
        headerShadowVisible: false,
        contentStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Stack.Screen
        name="FavoritesHome"
        component={FavoritesScreen}
        options={{
          title: "Favorites",
          headerLargeTitle: false,
        }}
      />
      <Stack.Screen
        name="Detail"
        component={DetailScreen}
        options={{
          title: "Skin Details",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="WearCondition"
        component={WearConditionScreen}
        options={{
          title: "Wear Conditions",
          headerBackTitle: "Back",
        }}
      />
      <Stack.Screen
        name="PatternSeed"
        component={PatternSeedScreen}
        options={{
          title: "Pattern Seeds",
          headerBackTitle: "Back",
        }}
      />
    </Stack.Navigator>
  );
};

// Bottom tab navigator
const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "List") {
            iconName = focused ? "grid" : "grid-outline";
          } else if (route.name === "Favorites") {
            iconName = focused ? "star" : "star-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.textMuted,
        tabBarStyle: {
          backgroundColor: COLORS.surface,
          borderTopColor: COLORS.border,
          borderTopWidth: 1,
          paddingBottom: Platform.OS === "ios" ? 20 : 5, // Extra padding for iPhone notch/home indicator
          paddingTop: 5,
          height: Platform.OS === "ios" ? 85 : 60, // Taller on iOS to accommodate safe area
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
          marginBottom: Platform.OS === "ios" ? 0 : 5,
        },
        headerShown: false,
        tabBarHideOnKeyboard: true, // Hide tab bar when keyboard is visible
      })}
    >
      <Tab.Screen
        name="List"
        component={ListStack}
        options={{
          title: "Armory",
        }}
      />
      <Tab.Screen
        name="Favorites"
        component={FavoritesStack}
        options={{
          title: "Favorites",
        }}
      />
    </Tab.Navigator>
  );
};

// Main navigation component
export const AppNavigator = () => {
  const navigationTheme = {
    dark: true,
    colors: {
      primary: COLORS.primary,
      background: COLORS.background,
      card: COLORS.surface,
      text: COLORS.text,
      border: COLORS.border,
      notification: COLORS.accent,
    },
    fonts: {
      regular: {
        fontFamily: "System",
        fontWeight: "400",
      },
      medium: {
        fontFamily: "System",
        fontWeight: "500",
      },
      bold: {
        fontFamily: "System",
        fontWeight: "700",
      },
      heavy: {
        fontFamily: "System",
        fontWeight: "900",
      },
    },
  };

  return (
    <NavigationContainer theme={navigationTheme}>
      <TabNavigator />
    </NavigationContainer>
  );
};
