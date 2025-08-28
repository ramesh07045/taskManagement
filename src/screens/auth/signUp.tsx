// SignUpScreen.tsx
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
import { signUp } from "../../services/authService";   // ✅ Import service
import Icon from "react-native-vector-icons/MaterialCommunityIcons"; // ✅ For eye icon
import Toast from "react-native-toast-message";
import { useNavigation } from "@react-navigation/native";

// ✅ Validation Schema using Yup
const SignUpSchema = Yup.object().shape({
    fullName: Yup.string().required("Full name is required"),
    email: Yup.string().email("Enter a valid email").required("Email is required"),
    password: Yup.string()
        .min(8, "Password must be at least 8 characters")
        .required("Password is required"),
    confirmPassword: Yup.string()
        .oneOf([Yup.ref("password"), ""], "Passwords do not match")
        .required("Confirm password is required"),
});

const SignUpScreen = () => {
    const navigation = useNavigation()
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false)




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
                    <Text style={styles.title}>Create Account</Text>

                    {/* ✅ Formik Wrapper */}
                    <Formik
                        initialValues={{
                            fullName: "",
                            email: "",
                            password: "",
                            confirmPassword: "",
                        }}
                        validationSchema={SignUpSchema}
                        onSubmit={async (values, { resetForm }) => {
                            setIsSubmitting(true);
                            signUp(values?.fullName, values.email, values.password).then((signUpRes) => {
                                console.log('signUpRessignUpRes', signUpRes)
                                resetForm();
                                navigation.jumpTo("SignIn")

                            }).catch((err) => {
                                console.log(err);
                                Toast.show({
                                    type: 'error',
                                    text1: 'Error',
                                    text2: err?.message || 'An error occurred during sign up',
                                    position: "bottom",
                                });
                            }).finally(() => {
                                setIsSubmitting(false);
                            })

                        }}
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
                                {/* Full Name */}
                                <TextInput
                                    style={styles.input}
                                    placeholder="Full Name"
                                    value={values.fullName}
                                    onChangeText={handleChange("fullName")}
                                    onBlur={handleBlur("fullName")}
                                />
                                {touched.fullName && errors.fullName && (
                                    <Text style={styles.error}>{errors.fullName}</Text>
                                )}

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
                                {touched.email && errors.email && (
                                    <Text style={styles.error}>{errors.email}</Text>
                                )}

                                {/* Password with eye */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Password"
                                        secureTextEntry={!showPassword}
                                        value={values.password}
                                        onChangeText={handleChange("password")}
                                        onBlur={handleBlur("password")}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Icon
                                            name={showPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#555"
                                            style={{ marginRight: 10 }}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {touched.password && errors.password && (
                                    <Text style={styles.error}>{errors.password}</Text>
                                )}

                                {/* Confirm Password with eye */}
                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                                        placeholder="Confirm Password"
                                        secureTextEntry={!showConfirmPassword}
                                        value={values.confirmPassword}
                                        onChangeText={handleChange("confirmPassword")}
                                        onBlur={handleBlur("confirmPassword")}
                                    />
                                    <TouchableOpacity
                                        onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                                    >
                                        <Icon
                                            name={showConfirmPassword ? "eye-off" : "eye"}
                                            size={22}
                                            color="#555"
                                            style={{ marginRight: 10 }}
                                        />
                                    </TouchableOpacity>
                                </View>
                                {touched.confirmPassword && errors.confirmPassword && (
                                    <Text style={styles.error}>{errors.confirmPassword}</Text>
                                )}

                                {/* Sign Up button */}
                                <TouchableOpacity
                                    style={[styles.button, isSubmitting && { opacity: 0.7 }]}
                                    onPress={handleSubmit as any}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text style={styles.buttonText}>Sign Up</Text>
                                    )}
                                </TouchableOpacity>

                                {/* Already have an account */}
                                <TouchableOpacity
                                    onPress={() => navigation.navigate("SignIn")}
                                >
                                    <Text style={styles.loginLink}>
                                        Already have an account?{" "}
                                        <Text style={{ fontFamily: AppFonts.bold }}>
                                            Log in
                                        </Text>
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
        color: AppColors.textPrimary,
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
        marginBottom: 10,
        backgroundColor: AppColors.inputBackground,
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
    loginLink: {
        textAlign: "center",
        marginTop: 20,
        fontSize: 15,
        color: AppColors.grey,
        fontFamily: AppFonts.normal,
    },
});

export default SignUpScreen;
