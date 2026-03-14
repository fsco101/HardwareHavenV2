import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';

const JWT_KEY = 'jwt';

const isWeb = Platform.OS === 'web';

export const saveToken = async (token) => {
    if (!token) return;

    if (isWeb) {
        await AsyncStorage.setItem(JWT_KEY, token);
        return;
    }

    await SecureStore.setItemAsync(JWT_KEY, token, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED,
    });
};

export const getToken = async () => {
    if (isWeb) {
        return AsyncStorage.getItem(JWT_KEY);
    }

    return SecureStore.getItemAsync(JWT_KEY);
};

export const removeToken = async () => {
    if (isWeb) {
        await AsyncStorage.removeItem(JWT_KEY);
        return;
    }

    await SecureStore.deleteItemAsync(JWT_KEY);
};
