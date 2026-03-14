import React, { useState } from 'react'
import { View, StyleSheet, ScrollView, Text, TouchableOpacity, Linking, ActivityIndicator } from "react-native";
import { Avatar } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useDispatch } from 'react-redux'
import Toast from 'react-native-toast-message';
import { clearCart } from '../../Redux/Actions/cartActions';
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import SweetAlert from '../../Shared/SweetAlert';
import { useResponsive } from '../../assets/common/responsive';
import { getToken } from '../../assets/common/tokenStorage';
import { createOrder } from '../../Redux/Actions/orderActions';

const Confirm = (props) => {
    const routeParams = props?.route?.params || {};
    const dispatch = useDispatch()
    let navigation = useNavigation()
    const colors = useTheme();
    const [showSuccess, setShowSuccess] = useState(false);
    const [loading, setLoading] = useState(false);
    const { fs, ms, spacing, ws } = useResponsive();

    // Support both legacy nested payload and normalized payload.
    const order = routeParams?.order?.order || routeParams?.order || null;
    const paymentMethod = order?.paymentMethod || 'COD';

    const confirmOrder = async () => {
        if (!order || !Array.isArray(order.orderItems) || order.orderItems.length === 0) {
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "No order to confirm",
                text2: "Please complete Shipping and Payment first.",
            });
            navigation.navigate('Shipping');
            return;
        }

        setLoading(true);
        try {
            const token = await getToken();
            if (!token) {
                Toast.show({ topOffset: 60, type: "error", text1: "Please login again" });
                setLoading(false);
                return;
            }
            // Build order payload
            const orderPayload = {
                orderItems: order.orderItems.map(item => ({
                    quantity: item.quantity || 1,
                    product: item._id || item.id || item.product,
                })),
                shippingAddress1: order.shippingAddress1,
                shippingAddress2: order.shippingAddress2 || '',
                city: order.city || '',
                zip: order.zip || '',
                country: order.country || 'Philippines',
                phone: order.phone,
                region: order.region || '',
                province: order.province || '',
                cityMunicipality: order.cityMunicipality || '',
                barangay: order.barangay || '',
                paymentMethod: paymentMethod,
                user: order.user,
            };

            const result = await dispatch(createOrder(orderPayload, token));

            if (result.success && result.data) {
                // If online payment and checkout URL returned, open it
                if (paymentMethod === 'Online' && result.data.checkoutUrl) {
                    dispatch(clearCart());
                    await Linking.openURL(result.data.checkoutUrl);
                    Toast.show({
                        topOffset: 60,
                        type: "info",
                        text1: "Complete payment in browser",
                        text2: "Your order has been created. Complete payment via GCash/GrabPay.",
                    });
                    navigation.navigate('Cart Screen', { screen: 'Cart' });
                } else {
                    setShowSuccess(true);
                }
            } else {
                throw new Error(result.message || 'Please try again');
            }
        } catch (error) {
            const message = error.response?.data?.message || "Please try again";
            Toast.show({
                topOffset: 60,
                type: "error",
                text1: "Order Failed",
                text2: message,
            });
        } finally {
            setLoading(false);
        }
    }

    // Calculate total
    const total = (order?.orderItems || []).reduce((sum, item) => {
        const unitPrice = Number(item.effectivePrice ?? item.price ?? 0);
        return sum + unitPrice * (item.quantity || 1);
    }, 0);

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SweetAlert
                visible={showSuccess}
                type="success"
                title="Order Placed!"
                message="Your order has been placed successfully."
                confirmText="OK"
                onConfirm={() => {
                    setShowSuccess(false);
                    dispatch(clearCart());
                    navigation.navigate('Cart Screen', { screen: 'Cart' });
                }}
            />
            <ScrollView contentContainerStyle={[styles.scrollContent, { padding: spacing.lg, paddingBottom: spacing.xl }]}>
                <Ionicons name="receipt-outline" size={ms(40, 0.3)} color={colors.primary} style={{ marginBottom: spacing.md }} />
                <Text style={[styles.heading, { color: colors.text, fontSize: fs(24), marginBottom: spacing.lg }]}>Confirm Order</Text>
                {order ? (
                    <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: ws(12), marginBottom: spacing.lg }]}>
                        <Text style={[styles.sectionTitle, { color: colors.primary, fontSize: fs(16), marginBottom: spacing.sm + 2 }]}>Shipping To</Text>
                        <View style={styles.detailRow}>
                            <Ionicons name="location-outline" size={ms(16, 0.3)} color={colors.secondary} />
                            <Text style={[styles.detailText, { color: colors.text, fontSize: fs(14), marginLeft: spacing.sm }]}>{order.shippingAddress1}</Text>
                        </View>
                        {order.shippingAddress2 ? (
                            <View style={styles.detailRow}>
                                <Ionicons name="location" size={ms(16, 0.3)} color={colors.secondary} />
                                <Text style={[styles.detailText, { color: colors.text, fontSize: fs(14), marginLeft: spacing.sm }]}>{order.shippingAddress2}</Text>
                            </View>
                        ) : null}
                        <View style={styles.detailRow}>
                            <Ionicons name="call-outline" size={ms(16, 0.3)} color={colors.secondary} />
                            <Text style={[styles.detailText, { color: colors.text, fontSize: fs(14), marginLeft: spacing.sm }]}>{order.phone}</Text>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: spacing.md, fontSize: fs(16), marginBottom: spacing.sm + 2 }]}>Payment</Text>
                        <View style={styles.detailRow}>
                            <Ionicons name={paymentMethod === 'COD' ? 'cash-outline' : 'phone-portrait-outline'} size={ms(16, 0.3)} color={colors.secondary} />
                            <Text style={[styles.detailText, { color: colors.text, fontSize: fs(14), marginLeft: spacing.sm }]}>
                                {paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online Payment (GCash / GrabPay)'}
                            </Text>
                        </View>

                        <Text style={[styles.sectionTitle, { color: colors.primary, marginTop: spacing.md, fontSize: fs(16), marginBottom: spacing.sm + 2 }]}>Items</Text>
                        {order.orderItems.map((item, index) => (
                            <View key={item.id || item._id || index} style={[styles.itemRow, { borderBottomColor: colors.border, paddingVertical: spacing.sm }]}>
                                <Avatar.Image size={ms(40, 0.3)} source={{
                                    uri: item.image ? item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                                }} />
                                <View style={{ flex: 1, marginLeft: spacing.sm + 2 }}>
                                    <Text style={{ color: colors.text, fontSize: fs(14) }}>{item.name}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>Qty: {item.quantity || 1}</Text>
                                </View>
                                <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: fs(14) }}>
                                    P{((item.effectivePrice ?? item.price ?? 0) * (item.quantity || 1)).toFixed(2)}
                                </Text>
                            </View>
                        ))}

                        <View style={[styles.totalRow, { borderTopColor: colors.border, marginTop: spacing.sm, paddingTop: spacing.sm }]}>
                            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(16) }}>Total</Text>
                            <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: fs(18) }}>P{total.toFixed(2)}</Text>
                        </View>
                    </View>
                ) : (
                    <View style={[styles.orderCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: ws(12), marginBottom: spacing.lg }]}> 
                        <Text style={{ color: colors.textSecondary, fontSize: fs(14), textAlign: 'center' }}>
                            No pending checkout data.
                        </Text>
                        <TouchableOpacity
                            style={[styles.placeOrderBtn, {
                                backgroundColor: colors.primary,
                                paddingVertical: spacing.sm,
                                borderRadius: ws(10),
                                marginTop: spacing.md,
                            }]}
                            onPress={() => navigation.navigate('Shipping')}
                            activeOpacity={0.7}
                        >
                            <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', fontSize: fs(14) }}>
                                Go To Shipping
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}
                <TouchableOpacity
                    style={[styles.placeOrderBtn, {
                        backgroundColor: loading ? colors.border : colors.primary,
                        paddingVertical: spacing.sm + 6,
                        paddingHorizontal: spacing.xl,
                        borderRadius: ws(10),
                        marginTop: spacing.sm + 2,
                    }]}
                    onPress={confirmOrder}
                    activeOpacity={0.7}
                    disabled={loading || !order}
                >
                    {loading ? (
                        <ActivityIndicator color={colors.textOnPrimary} size="small" />
                    ) : (
                        <>
                            <Ionicons name="checkmark-circle" size={ms(22, 0.3)} color={colors.textOnPrimary} />
                            <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', fontSize: fs(16), marginLeft: spacing.sm }}>
                                {paymentMethod === 'Online' ? 'Place Order & Pay' : 'Place Order'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        alignItems: 'center',
    },
    heading: {
        fontWeight: 'bold',
    },
    orderCard: {
        width: '100%',
        borderWidth: 1,
    },
    sectionTitle: {
        fontWeight: 'bold',
    },
    detailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
    },
    detailText: {
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    itemName: {
        flex: 1,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
    },
    placeOrderBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
export default Confirm;