import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import { SafeAreaView } from "react-native-safe-area-context";
import { StatusBar } from "react-native";
import { AppColors } from "../../constants/appcolors";
import { AppFonts } from "../../constants/appFonts";
import { startVoiceRecognition, stopVoiceRecognition } from "../../utils/voiceInput";
import { useNavigation, useRoute } from "@react-navigation/native";
import { Icon } from "@rneui/base";
import { Formik } from "formik";
import * as Yup from "yup";
import { useDispatch, useSelector } from "react-redux";
import { addTaskAsync, updateTaskAsync } from "../../redux/slice/taskDetailsReducer";
import { NativeModules } from "react-native";

const TaskDetails = () => {
    const navigation = useNavigation();
    const route = useRoute();
    const dispatch = useDispatch();
    const darkMode = useSelector((state: any) => state.theme.darkMode);
    const [showPicker, setShowPicker] = useState(false);
    const [pickerField, setPickerField] = useState<string | null>(null);

    // If editing, get task from params
    const editingTask = (route as any)?.params?.task || null;

    // Validation schema
    const TaskSchema = Yup.object().shape({
        title: Yup.string().required("Title is required"),
        description: Yup.string().required("Description is required"),
        date: Yup.date().nullable().required("Date is required"),
    });

    return (
        <View style={{ flex: 1, backgroundColor: darkMode ? '#181818' : AppColors.primary }}>
            <View
                style={{
                    height: StatusBar.currentHeight,
                    backgroundColor: darkMode ? '#181818' : AppColors.primary,
                }}
            >
                <StatusBar backgroundColor={darkMode ? '#181818' : AppColors.primary} barStyle={"dark-content"} />
            </View>
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
                activeOpacity={0.7}
            >
                <Icon type="material" name="arrow-back" size={26} color={darkMode ? '#fff' : AppColors.textInverse} />
            </TouchableOpacity>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View style={[styles.card, { backgroundColor: darkMode ? '#232323' : AppColors.background }]}>
                    <Text style={[styles.header, { color: darkMode ? '#fff' : AppColors.textPrimary }]}>Task Details</Text>
                    <Formik
                        enableReinitialize
                        initialValues={{
                            title: editingTask ? editingTask.title : "",
                            description: editingTask ? editingTask.description : "",
                            date: editingTask && editingTask.date ? new Date(editingTask.date) : null,
                        }}
                        validationSchema={TaskSchema}
                        onSubmit={async (values, { resetForm, setSubmitting }) => {
                            setSubmitting(true);
                            if (editingTask) {
                                await (dispatch as any)(updateTaskAsync({
                                    id: editingTask.id,
                                    title: values.title,
                                    description: values.description,
                                    date: values.date ? (values.date as Date).toISOString() : "",
                                    status: editingTask.status,
                                }));
                            } else {
                                await (dispatch as any)(addTaskAsync({
                                    title: values.title,
                                    description: values.description,
                                    date: values.date ? (values.date as Date).toISOString() : "",
                                    status: "Pending",
                                }));
                            }
                            setTimeout(() => {
                                setSubmitting(false);
                                resetForm();
                                navigation.goBack();
                            }, 500);
                        }}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            setFieldValue,
                            values,
                            errors,
                            touched,
                            isSubmitting,
                        }) => (
                            <>
                                {/* Title with mic */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, backgroundColor: darkMode ? '#222' : '#f9f9f9', color: darkMode ? '#fff' : '#333', borderColor: darkMode ? '#444' : '#ddd' }]}
                                        placeholder="Title"
                                        placeholderTextColor={darkMode ? '#aaa' : '#888'}
                                        value={values.title}
                                        onChangeText={handleChange("title")}
                                        onBlur={handleBlur("title")}
                                    />
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await startVoiceRecognition((text) => setFieldValue('title', text));
                                        }}
                                        style={{ marginLeft: 8 }}
                                    >
                                        <Icon type="material" name="mic" size={24} color={darkMode ? '#fff' : AppColors.primary} />
                                    </TouchableOpacity>
                                </View>
                                {touched.title && typeof errors.title === 'string' && <Text style={[styles.error, { color: darkMode ? '#ff8888' : AppColors.error }]}>{errors.title}</Text>}

                                {/* Description with mic */}
                                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                    <TextInput
                                        style={[styles.input, { height: 80, flex: 1, backgroundColor: darkMode ? '#222' : '#f9f9f9', color: darkMode ? '#fff' : '#333', borderColor: darkMode ? '#444' : '#ddd' }]}
                                        placeholder="Description"
                                        placeholderTextColor={darkMode ? '#aaa' : '#888'}
                                        multiline
                                        value={values.description}
                                        onChangeText={handleChange("description")}
                                        onBlur={handleBlur("description")}
                                    />
                                    <TouchableOpacity
                                        onPress={async () => {
                                            await startVoiceRecognition((text) => setFieldValue('description', text));
                                        }}
                                        style={{ marginLeft: 8 }}
                                    >
                                        <Icon type="material" name="mic" size={24} color={darkMode ? '#fff' : AppColors.primary} />
                                    </TouchableOpacity>
                                </View>
                                {touched.description && typeof errors.description === 'string' && <Text style={[styles.error, { color: darkMode ? '#ff8888' : AppColors.error }]}>{errors.description}</Text>}

                                {/* Due Date */}
                                <TouchableOpacity
                                    style={[styles.dateBtn, { backgroundColor: darkMode ? '#222' : '#f9f9f9', borderColor: darkMode ? '#444' : '#ddd' }]}
                                    onPress={() => {
                                        setShowPicker(true);
                                        setPickerField("date");
                                    }}
                                    activeOpacity={0.8}
                                >
                                    <Text style={[styles.dateText, { color: darkMode ? '#fff' : '#333' }, !values.date && { color: '#aaa' }]}>
                                        {values.date && typeof values.date === 'object' && 'toDateString' in values.date
                                            ? (values.date as Date).toDateString()
                                            : 'Select the Due Date'}
                                    </Text>
                                </TouchableOpacity>
                                {touched.date && typeof errors.date === 'string' && (
                                    <Text style={[styles.error, { color: darkMode ? '#ff8888' : AppColors.error }]}>{errors.date}</Text>
                                )}

                                {showPicker && pickerField === "date" && (
                                    <DateTimePicker
                                        value={values.date || new Date()}
                                        mode="date"
                                        display={Platform.OS === "ios" ? "inline" : "default"}
                                        onChange={(_event, selectedDate) => {
                                            setShowPicker(false);
                                            if (selectedDate) setFieldValue("date", selectedDate);
                                        }}
                                    />
                                )}

                                {/* Save Button */}
                                <TouchableOpacity
                                    style={[styles.button, isSubmitting && { opacity: 0.7 }, { backgroundColor: darkMode ? '#333' : AppColors.primary }]}
                                    onPress={handleSubmit as any}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Save Task</Text>
                                    )}
                                </TouchableOpacity>
                            </>
                        )}
                    </Formik>
                </View>
            </KeyboardAvoidingView>
        </View>
    );
};

export default TaskDetails;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    card: {
        backgroundColor: AppColors.background,
        padding: 20,
        borderRadius: 10,
        elevation: 10,
        marginTop: 40, // added so back button is not overlapped
    },
    header: {
        fontSize: 28,
        marginBottom: 30,
        textAlign: "center",
        color: AppColors.textPrimary,
        fontFamily: AppFonts.bold,
    },
    input: {
        borderWidth: 1,
        borderColor: "#ddd",
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: "#f9f9f9",
        fontFamily: AppFonts.normal,
    },
    button: {
        backgroundColor: AppColors.primary,
        padding: 15,
        borderRadius: 10,
        alignItems: "center",
        marginTop: 10,
    },
    buttonText: {
        color: AppColors.textInverse,
        fontFamily: AppFonts.bold,
        textAlign: "center",
        fontSize: 16,
    },
    error: {
        color: AppColors.error,
        marginBottom: 8,
        fontFamily: AppFonts.normal,
        fontSize: 13,
    },
    dateBtn: {
        borderWidth: 1,
        borderColor: "#ddd",
        padding: 12,
        borderRadius: 10,
        backgroundColor: "#f9f9f9",
        marginBottom: 10,
    },
    dateText: {
        fontSize: 16,
        color: "#333",
        fontFamily: AppFonts.normal,
    },
    backBtn: {
        position: "absolute",
        top: 50,
        left: 15,
        zIndex: 20,
        padding: 8,
        borderRadius: 20,
        backgroundColor: "rgba(0,0,0,0.3)",
    },
});
