import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, ActivityIndicator } from 'react-native';
import DashBoard from './src/screens/dashboard/dashBoard';
import TopTab from './src/screens/topTab/topTab';
import { getCurrentUser } from './src/services/authService';
import Toast from 'react-native-toast-message';
import { Provider, useDispatch } from 'react-redux';
import { Store } from './src/redux/store';
import { setUserSDetails } from './src/redux/slice/userReducer';
import TaskDetails from './src/screens/taskDetails/taskDetails';
import Profile from './src/screens/profile/profile';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { asyncKey } from './src/constants/asyncKeys';

const Stack = createNativeStackNavigator();

// ✅ Create a RootNavigator to handle auth logic
function RootNavigator() {
  const dispatch = useDispatch();
  const [initialRoute, setInitialRoute] = React.useState<string | null>(null);

  React.useEffect(() => {
    const checkUser = async () => {
      const netState = await NetInfo.fetch();
      if (netState.isConnected) {
        // Online: use getCurrentUser
        try {
          const res = await getCurrentUser();
          if (res) {
            dispatch(setUserSDetails(res));
            setInitialRoute("DashBoard");
          } else {
            setInitialRoute("TopTab");
          }
        } catch {
          setInitialRoute("TopTab");
        }
      } else {
        // Offline: get userDetails from AsyncStorage
        try {
          const userStr = await AsyncStorage.getItem(asyncKey.userDetails);
          if (userStr) {
            const user = JSON.parse(userStr);
            dispatch(setUserSDetails(user));
            setInitialRoute("DashBoard");
          } else {
            setInitialRoute("TopTab");
          }
        } catch {
          setInitialRoute("TopTab");
        }
      }
    };
    checkUser();
  }, [dispatch]);

  if (!initialRoute) {
    // ⏳ Show loader until we know where to go
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
      <Stack.Screen name="TopTab" component={TopTab} />
      <Stack.Screen name="DashBoard" component={DashBoard} />
      <Stack.Screen name="TaskDetails" component={TaskDetails} />
      <Stack.Screen name='Profile' component={Profile} />
    </Stack.Navigator>
  );
}

async function requestUserPermission() {
  const authStatus = await messaging().requestPermission();
  const enabled =
    authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
    authStatus === messaging.AuthorizationStatus.PROVISIONAL;

  if (enabled) {
    console.log('Notification permission enabled');
  }
}

export default function App() {
  React.useEffect(() => {
    // Request user permission for notifications
    requestUserPermission();

    // Get FCM token and log/store it
    messaging()
      .getToken()
      .then(token => {
        console.log('FCM Token:', token);
        // TODO: Send this token to your backend to associate with the user
      });

    // Listen for foreground messages
    const unsubscribeOnMessage = messaging().onMessage(async remoteMessage => {
      // You can show a local notification here if you want
      console.log('FCM Message Data:', remoteMessage.data);
    });


    // Listen for notification when app is in background/quit
    const unsubscribeOnNotificationOpened = messaging().onNotificationOpenedApp(remoteMessage => {
      console.log('Notification caused app to open from background state:', remoteMessage.notification);
    });

    // Check if app was opened by a notification
    messaging()
      .getInitialNotification()
      .then(remoteMessage => {
        if (remoteMessage) {
          console.log('Notification caused app to open from quit state:', remoteMessage.notification);
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpened();
    };
  }, []);

  return (
    <Provider store={Store}>
      <NavigationContainer>
        <RootNavigator />
        <Toast />
      </NavigationContainer>
    </Provider>
  );
}
