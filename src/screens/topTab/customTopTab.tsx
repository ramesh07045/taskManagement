import { View, TouchableOpacity, Text, StyleSheet, Dimensions, Animated } from "react-native";
import { useEffect, useRef } from "react";
import { AppColors } from "../../constants/appcolors";
import { AppFonts } from "../../constants/appFonts";

const CustomTopTabBar = ({ state, descriptors, navigation }) => {
    const { width } = Dimensions.get("window");
    const tabWidth = width * 0.8 / state.routes.length; // equally divide space
    const translateX = useRef(new Animated.Value(0)).current;

    // Animate when tab changes
    useEffect(() => {
        Animated.spring(translateX, {
            toValue: state.index * tabWidth,
            useNativeDriver: true,
        }).start();
    }, [state.index]);

    return (
        <View style={styles.tabContainer}>
            <View
                style={{
                    width: "80%",
                    height: 50,
                    flexDirection: "row",
                    backgroundColor: AppColors.background,
                    borderRadius: 10,
                    padding: 5,
                    overflow: "hidden",
                }}
            >
                {/* Moving Highlight */}
                <Animated.View
                    style={{
                        position: "absolute",
                        backgroundColor: AppColors.secondary,
                        width: tabWidth - 10,
                        height: "100%",
                        borderRadius: 10,
                        transform: [{ translateX }],
                        margin: 5,
                    }}
                />

                {/* Tab Labels */}
                {state.routes.map((route, index) => {
                    const { options } = descriptors[route.key];
                    const label =
                        options.tabBarLabel !== undefined
                            ? options.tabBarLabel
                            : options.title !== undefined
                                ? options.title
                                : route.name;

                    const isFocused = state.index === index;

                    const onPress = () => {
                        const event = navigation.emit({
                            type: "tabPress",
                            target: route.key,
                            canPreventDefault: true,
                        });

                        if (!isFocused && !event.defaultPrevented) {
                            navigation.navigate(route.name);
                        }
                    };

                    return (
                        <TouchableOpacity
                            key={index}
                            onPress={onPress}
                            style={styles.tabItem}
                        >
                            <Text
                                style={{
                                    color: isFocused ? AppColors?.textInverse : "gray",
                                    fontFamily: isFocused ? AppFonts.bold : AppFonts.normal,
                                    textAlign: "center",
                                    fontSize: 16,
                                }}
                            >
                                {label}
                            </Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    tabContainer: {
        backgroundColor: AppColors.primary,
        paddingBottom: 20,
        alignItems: "center",
        borderRadius: 100,
    },
    tabItem: {
        flex: 1,
        paddingVertical: 6,
        borderRadius: 20,
        alignItems: "center",
        justifyContent: "center",
    },
});

export default CustomTopTabBar;
