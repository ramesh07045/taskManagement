// SignInScreen.tsx
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
import { SafeAreaView } from "react-native-safe-area-context";
import { Formik } from "formik";
import * as Yup from "yup";
import { AppColors } from "../../constants/appcolors";
import { AppFonts } from "../../constants/appFonts";
import { signIn } from "../../services/authService";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "react-native-vector-icons/Ionicons"; // 👈 add this
import Toast from "react-native-toast-message";
import { useDispatch } from "react-redux";
import { setUserSDetails } from "../../redux/slice/userReducer";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { asyncKey } from "../../constants/asyncKeys";

const SignInSchema = Yup.object().shape({
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
});

const SignInScreen = () => {
    const navigation = useNavigation();
    const dispatch = useDispatch()
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [passwordVisible, setPasswordVisible] = useState(false); // 👈 state for eye icon

    const handleLogin = (values: { email: string; password: string }) => {
        setIsSubmitting(true);
        signIn(values?.email, values?.password)
            .then(async (signRes) => {
                if (signRes) {
                    Toast.show({
                        type: "success",
                        text1: "Success",
                        text2: "Logged in successfully!",
                        position: "bottom",
                        visibilityTime: 3000,
                    });
                    dispatch(setUserSDetails(signRes))
                    // Store userDetails in AsyncStorage
                    await AsyncStorage.setItem(asyncKey.userDetails, JSON.stringify(signRes));
                    navigation.replace("DashBoard");
                }
                else {
                    Toast.show({
                        type: "error",
                        text1: "Error",
                        text2: signRes?.message || "Invalid credentials",
                        position: "bottom",
                        visibilityTime: 3000,
                    });
                }
            })
            .catch((err) => {
                console.log(err);
                Toast.show({
                    type: "error",
                    text1: "Error",
                    text2: err?.message || "An error occurred during sign in",
                    position: "bottom",
                    visibilityTime: 3000,
                });
            }).finally(() => {
                setIsSubmitting(false);
            })
    };

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: AppColors.primary }}>
            <KeyboardAvoidingView
                style={styles.container}
                behavior={Platform.OS === "ios" ? "padding" : undefined}
            >
                <View
                    style={{
                        backgroundColor: AppColors.background,
                        padding: 20,
                        borderRadius: 10,
                        elevation: 10,
                        top: -30,
                    }}
                >
                    <Text style={styles.title}>Sign In</Text>

                    <Formik
                        initialValues={{ email: "", password: "" }}
                        validationSchema={SignInSchema}
                        onSubmit={(values) => handleLogin(values)}
                    >
                        {({
                            handleChange,
                            handleBlur,
                            handleSubmit,
                            values,
                            errors,
                            touched,
                        }) => (
                            <>
                                {/* Email */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Email"
                                    keyboardType="email-address"
                                    value={values.email}
                                    onChangeText={handleChange("email")}
                                    onBlur={handleBlur("email")}
                                    autoCapitalize="none"
                                />
                                {errors.email && touched.email && (
                                    <Text style={styles.error}>{errors.email}</Text>
                                )}

                                {/* Password with Eye Icon */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Password"
                                        secureTextEntry={!passwordVisible}
                                        value={values.password}
                                        onChangeText={handleChange("password")}
                                        onBlur={handleBlur("password")}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setPasswordVisible(!passwordVisible)}
                                        style={styles.eyeIcon}
                                    >
                                        <Ionicons
                                            name={passwordVisible ? "eye" : "eye-off"}
                                            size={22}
                                            color={AppColors.grey}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {errors.password && touched.password && (
                                    <Text style={styles.error}>{errors.password}</Text>
                                )}

                                {/* Sign In button */}
                                <TouchableOpacity
                                    style={styles.button}
                                    onPress={handleSubmit as any}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Sign In</Text>
                                    )}
                                </TouchableOpacity>

                                {/* Navigate to Sign Up */}
                                <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
                                    <Text style={styles.signupLink}>
                                        Don’t have an account?{" "}
                                        <Text style={{ fontFamily: AppFonts.bold }}>Sign Up</Text>
                                    </Text>
                                </TouchableOpacity>
                            </>
                        )}
                    </Formik>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        marginBottom: 30,
        textAlign: "center",
        color: AppColors.darkBackground,
        fontFamily: AppFonts.bold,
    },
    input: {
        borderWidth: 1,
        borderColor: AppColors.borderInput,
        borderRadius: 10,
        padding: 12,
        marginBottom: 10,
        fontSize: 16,
        backgroundColor: AppColors.inputBackground,
        fontFamily: AppFonts.normal,
    },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: AppColors.borderInput,
        borderRadius: 10,
        backgroundColor: AppColors.inputBackground,
        marginBottom: 10,
        paddingRight: 10,
    },
    eyeIcon: {
        padding: 5,
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
        fontSize: 16,
    },
    error: {
        color: AppColors.error,
        marginBottom: 10,
        textAlign: "center",
        fontFamily: AppFonts.normal,
    },
    signupLink: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 15,
        color: AppColors.grey,
        fontFamily: AppFonts.normal,
    },
});

export default SignInScreen;
