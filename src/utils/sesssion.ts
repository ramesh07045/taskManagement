import * as Keychain from "react-native-keychain";

export const setSession = async (uId: string) => {
    try {
        await Keychain.setGenericPassword("user", uId);
    } catch (error) {
        console.error("Error setting session:", error);
    }
}

export const getSession = async () => {
    try {
        const credentials = await Keychain.getGenericPassword();
        if (credentials) {
            return credentials.password;
        }
        return null;
    } catch (error) {
        console.error("Error getting session:", error);
        return null;
    }
}

export const clearSession = async () => {
    try {
        await Keychain.resetGenericPassword();
    } catch (error) {
        console.error("Error clearing session:", error);
    }
}