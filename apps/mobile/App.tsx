import "react-native-gesture-handler";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { enableScreens } from "react-native-screens";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ConvexProvider } from "convex/react";
import { useFonts } from "expo-font";
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from "@expo-google-fonts/inter";
import {
  SourceSerif4_400Regular,
  SourceSerif4_600SemiBold,
} from "@expo-google-fonts/source-serif-4";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { TasksScreen } from "./src/screens/TasksScreen";
import { AgentsScreen } from "./src/screens/AgentsScreen";
import { colors } from "./src/theme";
import { convex } from "./src/convex";
import type { RootTabParamList } from "./src/types";

enableScreens();

const Tab = createBottomTabNavigator<RootTabParamList>();

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    SourceSerif4_400Regular,
    SourceSerif4_600SemiBold,
  });

  if (!fontsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator color={colors.accentCoral} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <ConvexProvider client={convex}>
        <NavigationContainer>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: colors.bgPrimary,
                borderTopColor: colors.bgMuted,
              },
              tabBarActiveTintColor: colors.accentCoral,
              tabBarInactiveTintColor: colors.inkMuted,
              tabBarLabelStyle: {
                fontSize: 11,
                fontFamily: "Inter_500Medium",
              },
              tabBarIcon: ({ color, size }) => {
                const iconMap: Record<string, keyof typeof Ionicons.glyphMap> =
                  {
                    Dashboard: "home",
                    Tasks: "list",
                    Agents: "people",
                  };
                const iconName = iconMap[route.name] || "ellipse";
                return <Ionicons name={iconName} size={size} color={color} />;
              },
            })}
          >
            <Tab.Screen name="Dashboard" component={DashboardScreen} />
            <Tab.Screen name="Tasks" component={TasksScreen} />
            <Tab.Screen name="Agents" component={AgentsScreen} />
          </Tab.Navigator>
        </NavigationContainer>
      </ConvexProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: colors.bgPrimary,
    alignItems: "center",
    justifyContent: "center",
  },
});
