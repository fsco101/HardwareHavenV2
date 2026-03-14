import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import baseURL from '../../config/api';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const OrderDetail = () => {
    const route = useRoute();
    const colors = useTheme();
    const { fs, spacing, ms } = useResponsive();

    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);

    const orderId = route?.params?.orderId || route?.params?.order?._id || route?.params?.order?.id;

    useFocusEffect(
        useCallback(() => {
            const fetchOrder = async () => {
                if (!orderId) {
                    setLoading(false);
                    return;
                }

                setLoading(true);
                try {
                    const res = await axios.get(`${baseURL}orders/${orderId}`);
                    setOrder(res.data);
                } catch (error) {
                    console.log('Fetch order detail error:', error?.message || error);
                } finally {
                    setLoading(false);
                }
            };

            fetchOrder();
        }, [orderId])
    );

    const getStatusColor = (status) => {
        switch (status) {
            case 'Pending': return colors.warning;
            case 'Processing': return colors.secondary;
            case 'Shipped': return colors.primary;
            case 'Delivered': return colors.success;
            case 'Cancelled': return colors.danger;
            default: return colors.textSecondary;
        }
    };

    if (loading) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}> 
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: spacing.sm }}>Loading order details...</Text>
            </View>
        );
    }

    if (!order) {
        return (
            <View style={[styles.centered, { backgroundColor: colors.background }]}> 
                <Ionicons name="alert-circle-outline" size={ms(42, 0.3)} color={colors.warning} />
                <Text style={{ color: colors.text, marginTop: spacing.sm, fontSize: fs(15) }}>Order not found.</Text>
            </View>
        );
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: colors.background }} contentContainerStyle={{ padding: spacing.md }}>
            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}> 
                <Text style={{ color: colors.text, fontSize: fs(17), fontWeight: 'bold' }}>
                    Order #{(order._id || order.id || '').slice(-8)}
                </Text>
                <Text style={{ color: getStatusColor(order.status), fontWeight: '700', marginTop: spacing.xs }}>
                    Status: {order.status}
                </Text>
                <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
                    Date: {new Date(order.dateOrdered).toLocaleString()}
                </Text>
                <Text style={{ color: colors.accent, fontWeight: 'bold', marginTop: spacing.sm, fontSize: fs(16) }}>
                    Total: P{(order.totalPrice || 0).toFixed(2)}
                </Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}> 
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Shipping Address</Text>
                <Text style={{ color: colors.text }}>{order.shippingAddress1}</Text>
                {!!order.shippingAddress2 && <Text style={{ color: colors.text }}>{order.shippingAddress2}</Text>}
                <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>
                    {order.cityMunicipality || order.city}, {order.province || ''}
                </Text>
                <Text style={{ color: colors.textSecondary }}>{order.region || ''} {order.zip || ''}</Text>
                <Text style={{ color: colors.textSecondary }}>{order.country || ''}</Text>
                <Text style={{ color: colors.textSecondary, marginTop: spacing.xs }}>Phone: {order.phone}</Text>
            </View>

            <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}> 
                <Text style={[styles.sectionTitle, { color: colors.primary }]}>Items</Text>
                {Array.isArray(order.orderItems) && order.orderItems.length > 0 ? (
                    order.orderItems.map((orderItem, index) => {
                        const product = orderItem?.product || {};
                        const lineTotal = (product?.price || 0) * (orderItem?.quantity || 1);
                        return (
                            <View key={orderItem?._id || index} style={[styles.itemRow, { borderBottomColor: colors.border }]}> 
                                <View style={{ flex: 1 }}>
                                    <Text style={{ color: colors.text, fontWeight: '600' }}>{product?.name || 'Product'}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>Qty: {orderItem?.quantity || 1}</Text>
                                </View>
                                <Text style={{ color: colors.accent, fontWeight: 'bold' }}>P{lineTotal.toFixed(2)}</Text>
                            </View>
                        );
                    })
                ) : (
                    <Text style={{ color: colors.textSecondary }}>No order items available.</Text>
                )}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 14,
        marginBottom: 12,
    },
    sectionTitle: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
        paddingVertical: 10,
    },
});

export default OrderDetail;
