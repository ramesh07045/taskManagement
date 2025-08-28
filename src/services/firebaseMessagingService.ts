import messaging from '@react-native-firebase/messaging';

// Request notification permissions from the user
export const requestUserPermission = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
        authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
        authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    return enabled;
};

// Get the FCM token for this device
export const getFcmToken = async () => {
    const token = await messaging().getToken();
    return token;
};

// Listen for foreground messages
export const onMessageListener = (callback: (message: any) => void) => {
    return messaging().onMessage(async remoteMessage => {
        callback(remoteMessage);
    });
};
