import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import io from 'socket.io-client';
import axios from 'axios';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import baseURL from '../../config/api';
import AuthGlobal from './AuthGlobal';
import { getToken } from '../../assets/common/tokenStorage';

const NotificationContext = createContext();

// Derive socket URL from baseURL (strip /api/v1/)
function getSocketURL() {
    const url = baseURL.replace(/\/api\/v1\/$/, '').replace(/\/api\/v1$/, '');
    return url;
}

function isExpoGoAndroid() {
    const isAndroid = Platform.OS === 'android';
    const isStoreClient = Constants?.executionEnvironment === 'storeClient';
    const isExpoOwnership = Constants?.appOwnership === 'expo';
    return isAndroid && (isStoreClient || isExpoOwnership);
}

async function registerForPushNotificationsAsync() {
    if (Platform.OS === 'web' || !Device.isDevice) {
        return null;
    }

    // Expo Go on Android no longer supports remote push notifications for expo-notifications (SDK 53+).
    // Use a development build or production build for push token registration.
    if (isExpoGoAndroid()) {
        console.log('Skipping Expo push token registration: Android Expo Go does not support remote push notifications.');
        return null;
    }

    try {
        const Notifications = await import('expo-notifications');

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        if (finalStatus !== 'granted') {
            return null;
        }

        const projectId = Constants?.expoConfig?.extra?.eas?.projectId || Constants?.easConfig?.projectId;
        const tokenResponse = projectId
            ? await Notifications.getExpoPushTokenAsync({ projectId })
            : await Notifications.getExpoPushTokenAsync();

        return tokenResponse?.data || null;
    } catch (error) {
        const errorMessage = String(error?.message || error);
        if (errorMessage.includes('Android push notifications functionality provided by expo-notifications was removed from Expo Go')) {
            console.log('Skipping Expo push token registration on Expo Go Android.');
            return null;
        }

        throw error;
    }
}

export const NotificationProvider = ({ children }) => {
    const authContext = useContext(AuthGlobal);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isNotificationsVisible, setIsNotificationsVisible] = useState(false);
    const socketRef = useRef(null);

    const userId = authContext?.stateUser?.user?.userId;
    const isAuthenticated = authContext?.stateUser?.isAuthenticated;

    // Connect to WebSocket
    useEffect(() => {
        if (!isAuthenticated || !userId) {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
            setNotifications([]);
            setUnreadCount(0);
            setIsNotificationsVisible(false);
            return;
        }

        const socketURL = getSocketURL();
        const socket = io(socketURL, {
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 5,
        });

        socket.on('connect', () => {
            console.log('Socket connected for notifications');
            socket.emit('join', userId);
        });

        socket.on('notification', (notification) => {
            setNotifications(prev => [notification, ...prev]);
            setUnreadCount(prev => prev + 1);
        });

        socket.on('disconnect', () => {
            console.log('Socket disconnected');
        });

        socketRef.current = socket;

        // Fetch existing notifications
        fetchNotifications();

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [isAuthenticated, userId]);

    // Register Expo push token and send it to backend for this user
    useEffect(() => {
        const savePushToken = async () => {
            if (!isAuthenticated || !userId) {
                return;
            }

            try {
                const pushToken = await registerForPushNotificationsAsync();
                if (!pushToken) {
                    return;
                }

                const jwtToken = await getToken();
                if (!jwtToken) {
                    return;
                }

                await axios.post(
                    `${baseURL}users/push-token`,
                    { token: pushToken },
                    { headers: { Authorization: `Bearer ${jwtToken}` } }
                );
            } catch (error) {
                console.log('Push token registration error:', error?.message || error);
            }
        };

        savePushToken();
    }, [isAuthenticated, userId]);

    const fetchNotifications = useCallback(async () => {
        if (!userId) return;
        try {
            const res = await axios.get(`${baseURL}notifications/${userId}`);
            setNotifications(res.data);
            const unread = res.data.filter(n => !n.read).length;
            setUnreadCount(unread);
        } catch (err) {
            console.log('Fetch notifications error:', err.message);
        }
    }, [userId]);

    const markAsRead = useCallback(async (notificationId) => {
        try {
            await axios.put(`${baseURL}notifications/read/${notificationId}`);
            setNotifications(prev =>
                prev.map(n => n._id === notificationId ? { ...n, read: true } : n)
            );
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.log('Mark read error:', err.message);
        }
    }, []);

    const markAllAsRead = useCallback(async () => {
        if (!userId) return;
        try {
            await axios.put(`${baseURL}notifications/read-all/${userId}`);
            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
            setUnreadCount(0);
        } catch (err) {
            console.log('Mark all read error:', err.message);
        }
    }, [userId]);

    const openNotifications = useCallback(() => {
        setIsNotificationsVisible(true);
    }, []);

    const closeNotifications = useCallback(() => {
        setIsNotificationsVisible(false);
    }, []);

    const isOrderNotification = useCallback((type) => {
        return ['order_placed', 'order_cancelled', 'order_status_update', 'order_delivered_confirmed'].includes(type);
    }, []);

    return (
        <NotificationContext.Provider value={{
            notifications,
            unreadCount,
            isNotificationsVisible,
            openNotifications,
            closeNotifications,
            fetchNotifications,
            markAsRead,
            markAllAsRead,
            isOrderNotification,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => useContext(NotificationContext);

export default NotificationContext;
