import React, { useState, useContext, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../assets/common/responsive';
import Toast from '../../Shared/SnackbarService';
import SweetAlert from '../../Shared/SweetAlert';
import { useDispatch, useSelector } from 'react-redux';
import { cancelOrder, confirmOrderDelivery, fetchMyOrders } from '../../Redux/Actions/orderActions';
import { getToken } from '../../assets/common/tokenStorage';
import { formatOrderNumber } from '../../assets/common/orderNumber';

const CANCEL_REASONS = [
    'Changed my mind',
    'Found a better price elsewhere',
    'Ordered by mistake',
    'Delivery taking too long',
    'Other',
];

const UserOrders = () => {
    const context = useContext(AuthGlobal);
    const colors = useTheme();
    const navigation = useNavigation();
    const { fs, spacing, ms, ws } = useResponsive();
    const [cancelModal, setCancelModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [cancelReason, setCancelReason] = useState('');
    const [customReason, setCustomReason] = useState('');
    const [cancelling, setCancelling] = useState(false);
    const [activeTab, setActiveTab] = useState('active');
    const [confirmModalVisible, setConfirmModalVisible] = useState(false);
    const [confirmingDelivery, setConfirmingDelivery] = useState(false);
    const dispatch = useDispatch();
    const orders = useSelector((state) => state.orders.myOrders);
    const loading = useSelector((state) => state.orders.loading);

    const userId = context.stateUser?.user?.userId;

    useFocusEffect(
        useCallback(() => {
            if (!userId) {
                const parentNavigation = navigation.getParent();
                if (parentNavigation) {
                    parentNavigation.navigate('User', { screen: 'Login' });
                } else {
                    navigation.navigate('User', { screen: 'Login' });
                }
                return;
            }
            fetchOrders();
        }, [userId, navigation])
    );

    const fetchOrders = async () => {
        dispatch(fetchMyOrders(userId));
    };

    const openCancelModal = (order) => {
        setSelectedOrder(order);
        setCancelReason('');
        setCustomReason('');
        setCancelModal(true);
    };

    const handleCancel = async () => {
        const reason = cancelReason === 'Other' ? customReason : cancelReason;
        if (!reason.trim()) {
            Toast.show({ topOffset: 60, type: 'error', text1: 'Please provide a reason' });
            return;
        }
        setCancelling(true);
        try {
            const token = await getToken();
            const result = await dispatch(cancelOrder(selectedOrder._id || selectedOrder.id, reason, token));
            if (!result.success) {
                throw new Error(result.message);
            }
            Toast.show({ topOffset: 60, type: 'success', text1: 'Order cancelled successfully' });
            setCancelModal(false);
            fetchOrders();
        } catch (err) {
            const msg = err.response?.data?.message || err.message || 'Failed to cancel order';
            Toast.show({ topOffset: 60, type: 'error', text1: msg });
        } finally {
            setCancelling(false);
        }
    };

    const openDeliveredConfirmation = (order) => {
        setSelectedOrder(order);
        setConfirmModalVisible(true);
    };

    const handleConfirmDelivered = async () => {
        if (!selectedOrder) return;
        setConfirmingDelivery(true);
        try {
            const token = await getToken();
            const result = await dispatch(confirmOrderDelivery(selectedOrder._id || selectedOrder.id, token));
            if (!result.success) {
                throw new Error(result.message);
            }

            Toast.show({ topOffset: 60, type: 'success', text1: 'Order marked as delivered' });
            setConfirmModalVisible(false);
            setSelectedOrder(null);
            fetchOrders();
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to confirm delivery';
            Toast.show({ topOffset: 60, type: 'error', text1: msg });
        } finally {
            setConfirmingDelivery(false);
        }
    };

    const handleReviewProduct = (order) => {
        const firstProduct = order?.orderItems?.find((oi) => oi?.product)?.product;
        if (!firstProduct) {
            Toast.show({ topOffset: 60, type: 'info', text1: 'No product found for review' });
            return;
        }

        const rootNavigation = navigation.getParent();
        if (rootNavigation) {
            rootNavigation.navigate('Home', {
                screen: 'Product Detail',
                params: { item: firstProduct },
            });
        } else {
            navigation.navigate('Home', {
                screen: 'Product Detail',
                params: { item: firstProduct },
            });
        }
    };

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

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Pending': return 'time-outline';
            case 'Processing': return 'sync-outline';
            case 'Shipped': return 'car-outline';
            case 'Delivered': return 'checkmark-circle-outline';
            case 'Cancelled': return 'close-circle-outline';
            default: return 'help-circle-outline';
        }
    };

    const renderOrder = ({ item }) => {
        const canCancel = ['Pending', 'Processing'].includes(item.status);
        const canConfirmDelivered = item.status === 'Shipped';
        return (
            <View style={[styles.orderCard, { backgroundColor: colors.cardBg, borderLeftColor: getStatusColor(item.status), padding: spacing.md, margin: spacing.sm }]}>
                <View style={styles.orderHeader}>
                    <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(14) }}>
                        Order #{formatOrderNumber(item)}
                    </Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Ionicons name={getStatusIcon(item.status)} size={16} color={getStatusColor(item.status)} />
                        <Text style={{ color: getStatusColor(item.status), fontWeight: '600', marginLeft: 4, fontSize: fs(13) }}>
                            {item.status}
                        </Text>
                    </View>
                </View>

                <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: spacing.xs }}>
                    {new Date(item.dateOrdered).toLocaleDateString()} at {new Date(item.dateOrdered).toLocaleTimeString()}
                </Text>

                {item.orderItems && item.orderItems.length > 0 && (
                    <View style={{ marginTop: spacing.sm }}>
                        {item.orderItems.slice(0, 3).map((oi, idx) => (
                            <Text key={idx} style={{ color: colors.text, fontSize: fs(12) }}>
                                {oi.product?.name || 'Product'} x{oi.quantity}
                                {oi.product?.price ? ` — P${(oi.product.price * oi.quantity).toFixed(2)}` : ''}
                            </Text>
                        ))}
                        {item.orderItems.length > 3 && (
                            <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>
                                +{item.orderItems.length - 3} more item(s)
                            </Text>
                        )}
                    </View>
                )}

                <View style={[styles.orderFooter, { marginTop: spacing.sm, borderTopColor: colors.border }]}>
                    <View>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>
                            {item.paymentMethod === 'Online' ? 'Online Payment' : 'Cash on Delivery'}
                        </Text>
                        <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: fs(16) }}>
                            P{(item.totalPrice || 0).toFixed(2)}
                        </Text>
                    </View>
                    {canCancel && (
                        <TouchableOpacity
                            style={[styles.cancelBtn, { backgroundColor: colors.danger }]}
                            onPress={() => openCancelModal(item)}
                        >
                            <Ionicons name="close-circle-outline" size={16} color={colors.textOnPrimary} />
                            <Text style={{ color: colors.textOnPrimary, fontWeight: '600', marginLeft: 4, fontSize: fs(12) }}>Cancel</Text>
                        </TouchableOpacity>
                    )}
                    {canConfirmDelivered && (
                        <TouchableOpacity
                            style={[styles.confirmBtn, { backgroundColor: colors.success }]}
                            onPress={() => openDeliveredConfirmation(item)}
                        >
                            <Ionicons name="checkmark-done-circle-outline" size={16} color={colors.textOnPrimary} />
                            <Text style={{ color: colors.textOnPrimary, fontWeight: '600', marginLeft: 4, fontSize: fs(12) }}>
                                Mark Delivered
                            </Text>
                        </TouchableOpacity>
                    )}
                    {item.status === 'Cancelled' && item.cancellationReason && (
                        <Text style={{ color: colors.danger, fontSize: fs(11), fontStyle: 'italic', maxWidth: '50%', textAlign: 'right' }}>
                            Reason: {item.cancellationReason}
                        </Text>
                    )}
                </View>

                {item.status === 'Delivered' && (
                    <TouchableOpacity
                        style={[styles.reviewBtn, { backgroundColor: colors.secondary, marginTop: spacing.sm }]}
                        onPress={() => handleReviewProduct(item)}
                    >
                        <Ionicons name="star-outline" size={16} color={colors.textOnPrimary} />
                        <Text style={{ color: colors.textOnPrimary, fontWeight: '700', marginLeft: 6, fontSize: fs(12) }}>
                            Review Product
                        </Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    const displayedOrders = orders.filter((order) => {
        if (activeTab === 'history') {
            return ['Delivered', 'Cancelled'].includes(order.status);
        }
        return ['Pending', 'Processing', 'Shipped'].includes(order.status);
    });

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SweetAlert
                visible={confirmModalVisible}
                title="Confirm Delivery"
                message="Only mark this as delivered after you have received the complete order. This will lock the order status."
                type="confirm"
                confirmText={confirmingDelivery ? 'Confirming...' : 'Yes, Mark Delivered'}
                cancelText="Back"
                onCancel={() => {
                    if (confirmingDelivery) return;
                    setConfirmModalVisible(false);
                }}
                onConfirm={handleConfirmDelivered}
                showCancel
            />

            {/* Cancel Modal */}
            <Modal visible={cancelModal} transparent animationType="fade" onRequestClose={() => setCancelModal(false)}>
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.modalContent, { backgroundColor: colors.surface, borderColor: colors.border }]}>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(18), marginBottom: spacing.md }}>
                            Cancel Order
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(13), marginBottom: spacing.sm }}>
                            Please select a reason for cancellation:
                        </Text>

                        {CANCEL_REASONS.map((reason) => (
                            <TouchableOpacity
                                key={reason}
                                style={[
                                    styles.reasonItem,
                                    {
                                        backgroundColor: cancelReason === reason ? colors.primaryDark : colors.surfaceLight,
                                        borderColor: cancelReason === reason ? colors.primary : colors.border,
                                    }
                                ]}
                                onPress={() => setCancelReason(reason)}
                            >
                                <Ionicons
                                    name={cancelReason === reason ? 'radio-button-on' : 'radio-button-off'}
                                    size={18}
                                    color={cancelReason === reason ? colors.primary : colors.textSecondary}
                                />
                                <Text style={{ color: colors.text, marginLeft: 8, fontSize: fs(13) }}>{reason}</Text>
                            </TouchableOpacity>
                        ))}

                        {cancelReason === 'Other' && (
                            <TextInput
                                style={[styles.reasonInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                                placeholder="Please specify your reason..."
                                placeholderTextColor={colors.textSecondary}
                                value={customReason}
                                onChangeText={setCustomReason}
                                multiline
                            />
                        )}

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { borderColor: colors.border, borderWidth: 1 }]}
                                onPress={() => setCancelModal(false)}
                            >
                                <Text style={{ color: colors.text, fontWeight: '600' }}>Back</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.danger }]}
                                onPress={handleCancel}
                                disabled={cancelling}
                            >
                                {cancelling ? (
                                    <ActivityIndicator color={colors.textOnPrimary} size="small" />
                                ) : (
                                    <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold' }}>Confirm Cancel</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={[styles.header, { backgroundColor: colors.surface, borderBottomColor: colors.border, padding: spacing.md }]}>
                <Ionicons name="receipt-outline" size={ms(22, 0.3)} color={colors.primary} />
                <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(18), marginLeft: spacing.sm }}>
                    My Orders
                </Text>
            </View>

            <View style={[styles.tabRow, { borderBottomColor: colors.border, backgroundColor: colors.surface }]}> 
                <TouchableOpacity
                    style={[styles.tabBtn, { borderBottomColor: activeTab === 'active' ? colors.primary : 'transparent' }]}
                    onPress={() => setActiveTab('active')}
                >
                    <Text style={{ color: activeTab === 'active' ? colors.primary : colors.textSecondary, fontWeight: '600' }}>Active</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, { borderBottomColor: activeTab === 'history' ? colors.primary : 'transparent' }]}
                    onPress={() => setActiveTab('history')}
                >
                    <Text style={{ color: activeTab === 'history' ? colors.primary : colors.textSecondary, fontWeight: '600' }}>Order History</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : displayedOrders.length === 0 ? (
                <View style={styles.centerContainer}>
                    <Ionicons name="receipt-outline" size={60} color={colors.surfaceLight} />
                    <Text style={{ color: colors.textSecondary, marginTop: spacing.md, fontSize: fs(16) }}>
                        {activeTab === 'history' ? 'No history yet' : 'No active orders'}
                    </Text>
                </View>
            ) : (
                <FlatList
                    data={displayedOrders}
                    renderItem={renderOrder}
                    keyExtractor={(item) => item._id || item.id}
                    contentContainerStyle={{ paddingBottom: 20 }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    tabRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
    },
    tabBtn: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        borderBottomWidth: 2,
    },
    centerContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    orderCard: {
        borderRadius: 12,
        borderLeftWidth: 4,
        elevation: 3,
    },
    orderHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    orderFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 8,
        borderTopWidth: 1,
    },
    cancelBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    confirmBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    reviewBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
    },
    reasonItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 6,
    },
    reasonInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        minHeight: 60,
        textAlignVertical: 'top',
        marginTop: 8,
        fontSize: 13,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        gap: 10,
    },
    modalBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
});

export default UserOrders;
