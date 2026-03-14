import React from 'react';
import { View, Text, TouchableOpacity, FlatList, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Theme/theme';
import { useNotifications } from '../Context/Store/NotificationContext';
import { useResponsive } from '../assets/common/responsive';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import baseURL from '../config/api';
import { formatPHDate } from '../assets/common/phTime';

const NotificationBell = () => {
    const colors = useTheme();
    const {
        notifications,
        unreadCount,
        markAsRead,
        markAllAsRead,
        isNotificationsVisible,
        openNotifications,
        closeNotifications,
        isOrderNotification,
    } = useNotifications();
    const { fs, spacing, ms } = useResponsive();
    const navigation = useNavigation();

    const getIcon = (type) => {
        switch (type) {
            case 'order_placed': return 'checkmark-circle';
            case 'order_cancelled': return 'close-circle';
            case 'order_status_update': return 'reload-circle';
            case 'order_delivered_confirmed': return 'checkmark-done-circle';
            case 'promotion': return 'pricetag';
            default: return 'notifications';
        }
    };

    const getColor = (type) => {
        switch (type) {
            case 'order_placed': return colors.success;
            case 'order_cancelled': return colors.danger;
            case 'order_status_update': return colors.warning;
            case 'order_delivered_confirmed': return colors.success;
            case 'promotion': return colors.accent;
            default: return colors.primary;
        }
    };

    const handleNotificationPress = async (item) => {
        if (!item.read) markAsRead(item._id);

        if (isOrderNotification && isOrderNotification(item.type)) {
            closeNotifications();
            const parentNavigation = navigation.getParent();
            const orderParams = item.orderId ? { screen: 'Order Detail', params: { orderId: item.orderId } } : { screen: 'My Orders' };

            if (parentNavigation) {
                parentNavigation.navigate('Orders', orderParams);
            } else {
                navigation.navigate('Orders', orderParams);
            }
            return;
        }

        if (item.type === 'promotion' && item.productId) {
            closeNotifications();
            try {
                const res = await axios.get(`${baseURL}products/${item.productId}`);
                if (res.data) {
                    const parentNavigation = navigation.getParent();
                    if (parentNavigation) {
                        parentNavigation.navigate('Home', {
                            screen: 'Product Detail',
                            params: { item: res.data },
                        });
                    } else {
                        navigation.navigate('Home', {
                            screen: 'Product Detail',
                            params: { item: res.data },
                        });
                    }
                }
            } catch (err) {
                console.log('Navigate to product error:', err.message);
            }
        }
    };

    const formatTime = (date) => {
        const d = new Date(date);
        const now = new Date();
        const diff = Math.floor((now - d) / 1000);
        if (diff < 60) return 'Just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return formatPHDate(date);
    };

    return (
        <>
            <TouchableOpacity onPress={openNotifications} style={styles.bellContainer}>
                <Ionicons name="notifications-outline" size={ms(24, 0.3)} color={colors.text} />
                {unreadCount > 0 && (
                    <View style={[styles.badge, { backgroundColor: colors.danger }]}>
                        <Text style={styles.badgeText}>
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </Text>
                    </View>
                )}
            </TouchableOpacity>

            <Modal
                visible={isNotificationsVisible}
                animationType="slide"
                transparent={false}
                onRequestClose={closeNotifications}
            >
                <View style={[styles.fullScreen, { backgroundColor: colors.background }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.title, { color: colors.text, fontSize: fs(18) }]}>Notifications</Text>
                            <View style={{ flexDirection: 'row', gap: 12 }}>
                                {unreadCount > 0 && (
                                    <TouchableOpacity onPress={markAllAsRead}>
                                        <Text style={{ color: colors.secondary, fontSize: fs(12) }}>Mark all read</Text>
                                    </TouchableOpacity>
                                )}
                                <TouchableOpacity onPress={closeNotifications}>
                                    <Ionicons name="close" size={24} color={colors.text} />
                                </TouchableOpacity>
                            </View>
                        </View>

                        {notifications.length === 0 ? (
                            <View style={styles.emptyContainer}>
                                <Ionicons name="notifications-off-outline" size={50} color={colors.surfaceLight} />
                                <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>No notifications</Text>
                            </View>
                        ) : (
                            <FlatList
                                data={notifications}
                                keyExtractor={(item) => item._id}
                                renderItem={({ item }) => (
                                    <TouchableOpacity
                                        style={[
                                            styles.notifItem,
                                            {
                                                backgroundColor: item.read ? 'transparent' : colors.surfaceLight,
                                                borderBottomColor: colors.border,
                                            }
                                        ]}
                                        onPress={() => {
                                            handleNotificationPress(item);
                                        }}
                                    >
                                        <Ionicons
                                            name={getIcon(item.type)}
                                            size={24}
                                            color={getColor(item.type)}
                                            style={{ marginRight: 10 }}
                                        />
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: colors.text, fontWeight: item.read ? 'normal' : 'bold', fontSize: fs(13) }}>
                                                {item.title}
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: 2 }}>
                                                {item.message}
                                            </Text>
                                            <Text style={{ color: colors.textSecondary, fontSize: fs(10), marginTop: 2 }}>
                                                {formatTime(item.dateCreated)}
                                            </Text>
                                        </View>
                                        {!item.read && (
                                            <View style={[styles.unreadDot, { backgroundColor: colors.primary }]} />
                                        )}
                                    </TouchableOpacity>
                                )}
                            />
                        )}
                    </View>
                </View>
            </Modal>
        </>
    );
};

const styles = StyleSheet.create({
    bellContainer: {
        padding: 4,
        position: 'relative',
    },
    badge: {
        position: 'absolute',
        top: -2,
        right: -4,
        minWidth: 18,
        height: 18,
        borderRadius: 9,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    badgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: 'bold',
    },
    fullScreen: {
        flex: 1,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modalContent: {
        flex: 1,
        borderWidth: 1,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    title: {
        fontWeight: 'bold',
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 40,
    },
    notifItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderBottomWidth: 1,
    },
    unreadDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginLeft: 8,
    },
});

export default NotificationBell;
