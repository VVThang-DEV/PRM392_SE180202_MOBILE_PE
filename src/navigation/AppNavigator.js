import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import { ListScreen } from "../screens/ListScreen";
import { DetailScreen } from "../screens/DetailScreen";
import { FavoritesScreen } from "../screens/FavoritesScreen";
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
          title: "CS:GO Armory",
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
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "600",
        },
        headerShown: false,
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
  return (
    <NavigationContainer
      theme={{
        dark: true,
        colors: {
          primary: COLORS.primary,
          background: COLORS.background,
          card: COLORS.surface,
          text: COLORS.text,
          border: COLORS.border,
          notification: COLORS.accent,
        },
      }}
    >
      <TabNavigator />
    </NavigationContainer>
  );
};
