import React, { useEffect, useRef, useState } from "react";
import {
    Animated,
    Dimensions,
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    Easing,
    StatusBar,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppColors } from "../../constants/appcolors";
import { Icon } from "@rneui/base";
import { useNavigation } from "@react-navigation/native";
import { useSelector, useDispatch } from "react-redux";
import { loadTasks, deleteTaskAsync, completeTaskAsync } from "../../redux/slice/taskDetailsReducer";
import { AppFonts } from '../../constants/appFonts';

const screenWidth = Dimensions.get("window").width;
const ITEM_CARD_HORIZONTAL_MARGIN = 10; // match your styles marginHorizontal

const DashBoard = () => {
    const navigation = useNavigation();
    // Get tasks from Redux store
    const tasks = useSelector((state: any) => state.taskDetails.taskDetails);
    const darkMode = useSelector((state: any) => state.theme.darkMode);
    const dispatch = useDispatch();

    // Load tasks from AsyncStorage on mount
    useEffect(() => {
        (dispatch as any)(loadTasks());
    }, []);

    // store measured heights for each item's expanded content
    const contentHeights = useRef<Record<string, number>>({}).current;

    // animated value per item (height)
    const animatedValues = useRef<Record<string, Animated.Value>>({}).current;

    // track currently expanded id (optional; used to know toggled state)
    const [expandedId, setExpandedId] = useState<string | null>(null);

    // initialize Animated.Value for each item
    useEffect(() => {
        (tasks as { id: string }[]).forEach((t) => {
            if (!animatedValues[t.id]) {
                animatedValues[t.id] = new Animated.Value(0);
            }
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [tasks]);

    const toggleExpand = (itemId: string) => {
        const duration = 240;

        // If another item is already open, collapse it first
        if (expandedId && expandedId !== itemId) {
            const prevAnim = animatedValues[expandedId];
            if (prevAnim) {
                Animated.timing(prevAnim, {
                    toValue: 0,
                    duration,
                    easing: Easing.in(Easing.cubic),
                    useNativeDriver: false,
                }).start();
            }
        }

        const anim = animatedValues[itemId];
        const measured = contentHeights[itemId] ?? 0;
        const isOpen = expandedId === itemId;

        if (!isOpen) {
            // Expand new card
            Animated.timing(anim, {
                toValue: measured,
                duration,
                easing: Easing.out(Easing.cubic),
                useNativeDriver: false,
            }).start();
            setExpandedId(itemId);
        } else {
            // Collapse same card
            Animated.timing(anim, {
                toValue: 0,
                duration,
                easing: Easing.in(Easing.cubic),
                useNativeDriver: false,
            }).start(() => {
                setExpandedId(null);
            });
        }
    };


    const renderItem = ({ item }: { item: any }) => {
        const anim = animatedValues[item.id] ?? new Animated.Value(0);
        const maxH = contentHeights[item.id] ?? 1;
        const opacity = anim.interpolate({
            inputRange: [0, maxH],
            outputRange: [0, 1],
            extrapolate: "clamp",
        });

        return (
            <View style={{ marginHorizontal: ITEM_CARD_HORIZONTAL_MARGIN, marginBottom: 12 }}>
                <TouchableOpacity
                    style={styles.taskCard}
                    onPress={() => toggleExpand(item.id)}
                    activeOpacity={0.85}
                >
                    <View style={styles.taskHeader}>
                        <Text style={styles.taskTitle}>{item.title}</Text>
                        <Text
                            style={[
                                styles.taskStatus,
                                item.status === "Completed"
                                    ? { color: "green" }
                                    : item.status === "In Progress"
                                        ? { color: "orange" }
                                        : { color: "red" },
                            ]}
                        >
                            {item.status}
                        </Text>
                    </View>

                    {/* Animated container for expanded content */}
                    <Animated.View
                        style={[
                            {
                                height: anim, // animated height
                                overflow: "hidden",
                            },
                        ]}
                    >
                        <Animated.View style={{ opacity, paddingTop: 10 }}>
                            <Text style={styles.taskDescription}>{item.description}</Text>

                            <View style={styles.actions}>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: "#2196F3" }]}
                                    onPress={() => (navigation as any).navigate("TaskDetails", { task: item })}
                                >
                                    <Text style={styles.actionText}>Edit</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.actionBtn, { backgroundColor: "#f44336" }]}
                                    onPress={() => (dispatch as any)(deleteTaskAsync(item.id))}
                                >
                                    <Text style={styles.actionText}>Delete</Text>
                                </TouchableOpacity>
                                {item.status !== "Completed" && (
                                    <TouchableOpacity
                                        style={[styles.actionBtn, { backgroundColor: "green" }]}
                                        onPress={() => (dispatch as any)(completeTaskAsync(item.id))}
                                    >
                                        <Text style={styles.actionText}>Mark Complete</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </Animated.View>
                    </Animated.View>
                </TouchableOpacity>
            </View>
        );
    };

    // Measure hidden expanded content for each item (so we know natural height)
    // Render these off-screen (invisible) once; they won't block UI.
    const measurementWidth = screenWidth - ITEM_CARD_HORIZONTAL_MARGIN * 2;

    const HiddenMeasurements = () => (
        <View style={{ position: "absolute", left: -9999, top: 0, width: measurementWidth }}>
            {(tasks as any[]).map((item) => (
                <View
                    key={`measure-${item.id}`}
                    onLayout={(e) => {
                        const h = e.nativeEvent.layout.height;
                        if (!contentHeights[item.id]) {
                            contentHeights[item.id] = h;
                        }
                    }}
                >
                    <View style={{ paddingTop: 10 }}>
                        <Text style={styles.taskDescription}>{item.description}</Text>
                        <View style={styles.actions}>
                            <View style={[styles.actionBtn, { backgroundColor: "#2196F3" }]}>
                                <Text style={styles.actionText}>Edit</Text>
                            </View>
                            <View style={[styles.actionBtn, { backgroundColor: "#f44336" }]}>
                                <Text style={styles.actionText}>Delete</Text>
                            </View>
                            {item.status !== "Completed" && (
                                <View style={[styles.actionBtn, { backgroundColor: "green" }]}>
                                    <Text style={styles.actionText}>Mark Complete</Text>
                                </View>
                            )}
                        </View>
                    </View>
                </View>
            ))}
        </View>
    );

    const listHeader = () => {
        return (
            <View style={{ flexDirection: "row", justifyContent: "space-between", backgroundColor: darkMode ? '#181818' : AppColors.primary, alignItems: "center" }}>
                <Text style={[styles.header, { color: darkMode ? '#fff' : AppColors.textInverse, backgroundColor: 'transparent', fontFamily: AppFonts.bold }]}>Dashboard</Text>
                <TouchableOpacity
                    style={{ width: 50, height: 50, backgroundColor: darkMode ? '#222' : AppColors.primaryLight, borderRadius: 30, marginRight: 10, justifyContent: 'center', alignItems: 'center' }}
                    onPress={() => (navigation as any).navigate('Profile')}
                >
                    <Icon type="material" name="person" size={28} color={darkMode ? '#fff' : AppColors.textPrimary} />
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, backgroundColor: darkMode ? AppColors.backgroundDark : AppColors.background }}>
            <View
                style={{
                    backgroundColor: darkMode ? AppColors.backgroundDark : AppColors.primary,
                    height: StatusBar.currentHeight,
                }}
            >
                <StatusBar
                    backgroundColor={darkMode ? AppColors.backgroundDark : AppColors.primary}
                    barStyle={darkMode ? "light-content" : "light-content"}
                />
            </View>
            {/* Header rendered in list header */}
            <FlatList
                data={tasks}
                keyExtractor={(item: any) => item.id}
                renderItem={renderItem}
                contentContainerStyle={{ paddingBottom: 80 }}
                ListHeaderComponent={listHeader}
                ListHeaderComponentStyle={{ marginBottom: 15 }}
            />

            {/* Floating Action Button */}
            <TouchableOpacity style={styles.fab} onPress={() => (navigation as any).navigate("TaskDetails")}>
                <Icon type="material" name="add" size={28} color={AppColors?.textInverse} />
            </TouchableOpacity>

            {/* Hidden measurement nodes (off-screen) */}
            <HiddenMeasurements />
        </View>
    );
};

export default DashBoard;

const styles = StyleSheet.create({
    header: {
        fontSize: 22,
        fontWeight: "bold",
        color: AppColors.textInverse,
        backgroundColor: AppColors.primary,
        padding: 20,
    },
    fab: {
        position: "absolute",
        bottom: 20,
        right: 20,
        backgroundColor: AppColors.fab,
        width: 56,
        height: 56,
        borderRadius: 28,
        justifyContent: "center",
        alignItems: "center",
        elevation: 5,
    },
    taskCard: {
        backgroundColor: AppColors.card,
        padding: 16,
        borderRadius: 12,
        elevation: 2,
    },
    taskHeader: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    taskTitle: {
        fontSize: 16,
        fontWeight: "bold",
        color: AppColors.textDark,
    },
    taskStatus: {
        fontSize: 14,
        fontWeight: "600",
    },
    taskDescription: {
        fontSize: 14,
        color: AppColors.textMedium,
        marginBottom: 10,
    },
    actions: {
        flexDirection: "row",
        justifyContent: "space-between",
    },
    actionBtn: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 6,
    },
    actionText: {
        color: AppColors.textInverse,
        fontWeight: "600",
    }
});
