import React from "react";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { StatusBar, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context"; // 👈 import
import CustomTopTabBar from "./customTopTab";
import { AppColors } from "../../constants/appcolors";
import { AppFonts } from "../../constants/appFonts";
import SignUpScreen from "../auth/signUp";
import SignInScreen from "../auth/signIn";

const TopTab = () => {
    const TopTabBar = createMaterialTopTabNavigator();

    return (
        <View style={{ flex: 1 }}>
            <StatusBar backgroundColor={AppColors.primary} barStyle={"dark-content"} />
            <View
                style={{
                    backgroundColor: AppColors.primary,
                    paddingTop: 70,
                    alignItems: "center",
                    zIndex: 0,
                    paddingBottom: 10
                }}
            >
                <Text
                    style={{
                        color: AppColors.textInverse,
                        fontSize: 18,
                        fontFamily: AppFonts.bold
                    }}
                >Welcome to To Do List</Text>
            </View>
            <View style={{
                flex: 1,
                backgroundColor: AppColors.primary,
            }}>
                <TopTabBar.Navigator
                    screenOptions={{
                        tabBarIndicatorStyle: { backgroundColor: "tomato", height: 3 },
                        tabBarLabelStyle: { fontWeight: "bold" },
                        tabBarStyle: { zIndex: 10 },
                        swipeEnabled: true,
                        animationEnabled: true,
                    }}
                    tabBar={(props) => <CustomTopTabBar {...props} />}
                >
                    <TopTabBar.Screen name="SignIn" component={SignInScreen} options={{ tabBarLabel: "Sign In" }} />
                    <TopTabBar.Screen name="SignUp" component={SignUpScreen} options={{ tabBarLabel: "Sign Up" }} />
                </TopTabBar.Navigator>
            </View>

        </View>
    );
};

export default TopTab;
