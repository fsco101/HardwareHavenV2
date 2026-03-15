import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native'
import { useEffect, useContext, useCallback } from 'react';
import Constants from 'expo-constants';
import axios from 'axios';

import Header from './Shared/Header';
import { Provider as PaperProvider, MD3DarkTheme, MD3LightTheme } from 'react-native-paper';
import { Provider, useDispatch } from 'react-redux';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import store from './Redux/store';
import { SnackbarHost } from './Shared/SnackbarService';
import Auth from './Context/Store/Auth';
import DrawerNavigator from './Navigators/DrawerNavigator';
import { ThemeProvider, useTheme, useThemeMode } from './Theme/theme';
import { NotificationProvider } from './Context/Store/NotificationContext';
import { PromotionProvider } from './Context/Store/PromotionContext';
import { initializeCartFromSQLite } from './Redux/Actions/cartActions';
import { navigationRef } from './Navigators/navigationRef';
import AuthGlobal from './Context/Store/AuthGlobal';
import baseURL from './config/api';

const isExpoGoAndroid = () => {
  if (Platform.OS !== 'android') {
    return false;
  }
  const isStoreClient = Constants?.executionEnvironment === 'storeClient';
  const isExpoOwnership = Constants?.appOwnership === 'expo';
  return (isStoreClient || isExpoOwnership);
};

if (!isExpoGoAndroid()) {
  // Notification handler is configured lazily in useEffect to avoid loading
  // expo-notifications on Android Expo Go.
}

const AppInner = () => {
  const colors = useTheme();
  const mode = useThemeMode();
  const dispatch = useDispatch();
  const baseTheme = mode === 'dark' ? MD3DarkTheme : MD3LightTheme;

  useEffect(() => {
    dispatch(initializeCartFromSQLite());
  }, [dispatch]);

  const paperTheme = {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: colors.primary,
      secondary: colors.secondary,
      background: colors.background,
      surface: colors.surface,
      error: colors.danger,
      onPrimary: colors.textOnPrimary,
      onSurface: colors.text,
      onBackground: colors.text,
    },
  };

  return (
    <PaperProvider theme={paperTheme}>
      <View style={{ flex: 1, backgroundColor: colors.background }}>
        <StatusBar style={mode === 'dark' ? 'light' : 'dark'} />
        <Header />
        <DrawerNavigator />
      </View>
    </PaperProvider>
  );
};

const PROTECTED_ROUTES = new Set([
  'My Orders',
  'Order Detail',
  'User Profile',
  'Dashboard',
  'Products',
  'ProductForm',
  'Categories',
  'Promotions',
  'Orders',
  'Admin',
]);

const NavigationRoot = () => {
  const auth = useContext(AuthGlobal);
  const isAuthenticated = auth?.stateUser?.isAuthenticated === true;

  const guardProtectedRoutes = useCallback(() => {
    if (isAuthenticated || !navigationRef.isReady()) {
      return;
    }

    const currentRoute = navigationRef.getCurrentRoute();
    if (!currentRoute) {
      return;
    }

    if (PROTECTED_ROUTES.has(currentRoute.name)) {
      navigationRef.navigate('My app', {
        screen: 'User',
        params: { screen: 'Login' },
      });
    }
  }, [isAuthenticated]);

  useEffect(() => {
    guardProtectedRoutes();
  }, [guardProtectedRoutes]);

  return (
    <NavigationContainer
      ref={navigationRef}
      onReady={guardProtectedRoutes}
      onStateChange={guardProtectedRoutes}
    >
      <AppInner />
    </NavigationContainer>
  );
};

export default function App() {
  useEffect(() => {
    if (isExpoGoAndroid()) {
      return undefined;
    }

    let responseListener = null;
    let isMounted = true;

    const setupNotifications = async () => {
      try {
        const Notifications = await import('expo-notifications');

        if (!isMounted) {
          return;
        }

        Notifications.setNotificationHandler({
          handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
          }),
        });

        responseListener = Notifications.addNotificationResponseReceivedListener(async (response) => {
          const data = response?.notification?.request?.content?.data || {};
          const type = data?.type;
          const orderId = data?.orderId;
          const productId = data?.productId;

          if (navigationRef.isReady() && type?.startsWith('order_') && orderId) {
            navigationRef.navigate('Orders', {
              screen: 'Order Detail',
              params: { orderId },
            });
            return;
          }

          if (navigationRef.isReady() && type === 'promotion') {
            if (!productId) {
              console.log('Promotion notification missing productId');
              return;
            }

            try {
              const res = await axios.get(`${baseURL}products/${productId}`);
              if (!res?.data) {
                console.log('Promotion product not found');
                return;
              }

              navigationRef.navigate('Home', {
                screen: 'Product Detail',
                params: { item: res.data },
              });
            } catch (error) {
              console.log('Promotion deep-link error:', error?.message || error);
            }
          }
        });
      } catch (error) {
        console.log('Notification setup skipped:', error?.message || error);
      }
    };

    setupNotifications();

    return () => {
      isMounted = false;
      if (responseListener) {
        responseListener.remove();
      }
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <Auth>
          <Provider store={store}>
            <NotificationProvider>
              <PromotionProvider>
                <NavigationRoot />
              </PromotionProvider>
            </NotificationProvider>
            <SnackbarHost />
          </Provider>
        </Auth>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

