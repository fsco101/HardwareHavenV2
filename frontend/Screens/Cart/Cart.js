import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Text, View, TouchableHighlight, StyleSheet, TouchableOpacity, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import { SwipeListView } from 'react-native-swipe-list-view';
import { removeFromCart, clearCart, updateCartQuantity } from '../../Redux/Actions/cartActions'
import { Avatar, Divider } from 'react-native-paper';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../../Theme/theme';
import SweetAlert from '../../Shared/SweetAlert';
import { useResponsive } from '../../assets/common/responsive';
import Toast from '../../Shared/SnackbarService';

const Cart = () => {
    const navigation = useNavigation()
    const dispatch = useDispatch()
    const cartItems = useSelector(state => state.cartItems)
    const colors = useTheme();
    const [showClearAlert, setShowClearAlert] = useState(false);
    const [quantityDrafts, setQuantityDrafts] = useState({});
    const { fs, spacing, ms, ws } = useResponsive();
    const cleanUri = (value) => {
        const uri = String(value || '').trim();
        return uri ? uri : '';
    };
    const fallbackImage = 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';

    var total = 0;
    cartItems.forEach(cart => {
        const unitPrice = Number(cart.effectivePrice ?? cart.price ?? 0);
        return (total += unitPrice * (cart.quantity || 1))
    });

    const incrementQty = (item) => {
        const currentQty = item.quantity || 1;
        if (currentQty >= (item.countInStock || 0)) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Stock limit reached',
                text2: `Only ${item.countInStock} available for "${item.name}"`,
            });
            return;
        }
        dispatch(updateCartQuantity({ ...(item), quantity: currentQty + 1 }));
    };

    const decrementQty = (item) => {
        const currentQty = item.quantity || 1;
        if (currentQty <= 1) {
            dispatch(removeFromCart(item));
            return;
        }
        dispatch(updateCartQuantity({ ...(item), quantity: currentQty - 1 }));
    };

    const handleQuantityInput = (item, inputText) => {
        const itemKey = item._id || item.id;
        const cleaned = String(inputText || '').replace(/[^0-9]/g, '');
        if (!cleaned) {
            setQuantityDrafts((prev) => ({ ...prev, [itemKey]: '' }));
            return;
        }

        const parsed = parseInt(cleaned, 10);
        if (Number.isNaN(parsed)) return;

        const maxStock = Number(item.countInStock || 1);
        const nextQty = Math.max(1, Math.min(parsed, maxStock));
        setQuantityDrafts((prev) => ({ ...prev, [itemKey]: String(nextQty) }));

        dispatch(updateCartQuantity({ ...(item), quantity: nextQty }));
    };

    const handleQuantityBlur = (item) => {
        const itemKey = item._id || item.id;
        const draft = quantityDrafts[itemKey];

        if (draft !== '') return;

        setQuantityDrafts((prev) => ({ ...prev, [itemKey]: '1' }));
        dispatch(updateCartQuantity({ ...(item), quantity: 1 }));
    };

    const renderItem = ({ item, index }) =>
        <TouchableHighlight underlayColor={colors.surfaceLight}>
            <View style={[styles.cartItem, { backgroundColor: colors.surface, borderBottomColor: colors.border, padding: spacing.sm + 4 }]}>
                <Avatar.Image size={ms(48, 0.3)} source={{
                    uri: cleanUri(item?.image) || cleanUri(Array.isArray(item?.images) ? item.images[0] : '') || fallbackImage
                }} />
                <View style={{ flex: 1, marginLeft: spacing.sm + 4 }}>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: fs(15) }}>
                        {item.name}
                    </Text>
                    {(item.effectivePrice ?? item.price) !== (item.originalPrice ?? item.price) ? (
                        <Text style={{ color: colors.textSecondary, textDecorationLine: 'line-through', fontSize: fs(12), marginTop: spacing.xs }}>
                            P {((item.originalPrice || item.price || 0) * (item.quantity || 1)).toFixed(2)}
                        </Text>
                    ) : null}
                    <Text style={{ color: colors.accent, fontWeight: 'bold', marginTop: spacing.xs, fontSize: fs(16) }}>
                        P {((item.effectivePrice ?? item.price ?? 0) * (item.quantity || 1)).toFixed(2)}
                    </Text>
                    {(item.quantity || 1) > (item.countInStock || 0) && (
                        <Text style={{ color: colors.danger, fontSize: fs(11) }}>
                            Exceeds stock! Only {item.countInStock} available
                        </Text>
                    )}
                </View>
                <View style={[styles.cartIconWrap, { marginRight: spacing.xs }]}> 
                    <Ionicons name="cart-outline" size={ms(16, 0.2)} color={colors.primary} />
                    {(item.quantity || 1) > 1 ? (
                        <View style={[styles.qtyBadge, { backgroundColor: colors.accent }]}> 
                            <Text style={[styles.qtyBadgeText, { color: colors.background }]}>{item.quantity || 1}</Text>
                        </View>
                    ) : null}
                </View>
                <View style={styles.qtyContainer}>
                    <TouchableOpacity
                        style={[styles.qtyBtn, { backgroundColor: colors.surfaceLight }]}
                        onPress={() => decrementQty(item)}
                    >
                        <Ionicons name="remove" size={16} color={colors.text} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.qtyInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, fontSize: fs(14) }]}
                        keyboardType="numeric"
                        value={quantityDrafts[item._id || item.id] ?? String(item.quantity || 1)}
                        onChangeText={(text) => handleQuantityInput(item, text)}
                        onBlur={() => handleQuantityBlur(item)}
                    />
                    <TouchableOpacity
                        style={[styles.qtyBtn, { backgroundColor: (item.quantity || 1) >= (item.countInStock || 0) ? colors.border : colors.primary }]}
                        onPress={() => incrementQty(item)}
                        disabled={(item.quantity || 1) >= (item.countInStock || 0)}
                    >
                        <Ionicons name="add" size={16} color={colors.textOnPrimary} />
                    </TouchableOpacity>
                </View>
            </View>
        </TouchableHighlight>;

    const renderHiddenItem = (cartItems) =>
        <TouchableOpacity
            onPress={() => dispatch(removeFromCart(cartItems.item))}
            style={[styles.hiddenButton, { backgroundColor: colors.danger, width: ws(80) }]}
        >
            <Ionicons name="trash" color={colors.textOnPrimary} size={ms(24, 0.3)} />
            <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), marginTop: 2 }}>Delete</Text>
        </TouchableOpacity>;

    const handleCheckout = () => {
        if (!cartItems || cartItems.length === 0) {
            Toast.show({
                topOffset: 60,
                type: 'info',
                text1: 'Your cart is empty',
                text2: 'Add products before checking out.',
            });
            return;
        }

        // Check stock before checkout
        const stockIssues = cartItems.filter(item => (item.quantity || 1) > (item.countInStock || 0));
        if (stockIssues.length > 0) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Stock Issue',
                text2: `${stockIssues[0].name} exceeds available stock. Please adjust quantities.`,
            });
            return;
        }
        navigation.navigate('Checkout');
    };

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SweetAlert
                visible={showClearAlert}
                type="confirm"
                title="Clear Cart"
                message="Are you sure you want to remove all items from your cart?"
                confirmText="Clear All"
                cancelText="Cancel"
                showCancel={true}
                onConfirm={() => { setShowClearAlert(false); dispatch(clearCart()); }}
                onCancel={() => setShowClearAlert(false)}
            />
            {cartItems.length > 0 ? (
                <SwipeListView
                    data={cartItems}
                    renderItem={renderItem}
                    renderHiddenItem={renderHiddenItem}
                    disableRightSwipe={true}
                    leftOpenValue={75}
                    rightOpenValue={-150}
                    previewOpenValue={-100}
                    previewOpenDelay={3000}
                    keyExtractor={(item, index) => item._id ? item._id.toString() : (item.id ? item.id.toString() : index.toString())}
                    contentContainerStyle={{ paddingBottom: 80 }}
                />
            ) : (
                <View style={styles.emptyContainer}>
                    <Ionicons name="cart-outline" size={ms(80, 0.3)} color={colors.surfaceLight} />
                    <Text style={{ color: colors.textSecondary, fontSize: fs(18), marginTop: spacing.md }}>Your cart is empty</Text>
                </View>
            )}
            <View style={[styles.bottomContainer, { backgroundColor: colors.surface, borderTopColor: colors.border, padding: spacing.md }]}>
                <View style={{ flex: 1 }}>
                    <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>Total</Text>
                    <Text style={[styles.price, { color: colors.accent, fontSize: fs(20) }]}>P {total.toFixed(2)}</Text>
                </View>
                <TouchableOpacity
                    style={[styles.bottomBtn, { backgroundColor: colors.danger, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md }]}
                    onPress={() => setShowClearAlert(true)}
                >
                    <Ionicons name="trash-outline" size={ms(18, 0.3)} color={colors.textOnPrimary} />
                    <Text style={{ color: colors.textOnPrimary, fontWeight: '600', marginLeft: spacing.xs, fontSize: fs(14) }}>Clear</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.bottomBtn, { backgroundColor: colors.primary, marginLeft: spacing.sm, paddingVertical: spacing.sm + 2, paddingHorizontal: spacing.md }]}
                    onPress={handleCheckout}
                >
                    <Ionicons name="checkmark-circle-outline" size={ms(18, 0.3)} color={colors.textOnPrimary} />
                    <Text style={{ color: colors.textOnPrimary, fontWeight: '600', marginLeft: spacing.xs, fontSize: fs(14) }}>Check Out</Text>
                </TouchableOpacity>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    emptyContainer: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
    },
    cartItem: {
        flexDirection: 'row',
        alignItems: 'center',
        borderBottomWidth: 1,
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        borderTopWidth: 1,
        elevation: 10,
    },
    bottomBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
    },
    price: {
        fontWeight: 'bold',
    },
    hiddenButton: {
        justifyContent: 'center',
        alignItems: 'center',
        height: '100%',
        position: 'absolute',
        right: 0,
    },
    qtyContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        justifyContent: 'center',
        alignItems: 'center',
    },
    qtyInput: {
        width: 46,
        height: 30,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '700',
        marginHorizontal: 8,
        paddingVertical: 0,
    },
    cartIconWrap: {
        position: 'relative',
        width: 22,
        height: 22,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyBadge: {
        position: 'absolute',
        top: -6,
        right: -8,
        minWidth: 14,
        height: 14,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 3,
    },
    qtyBadgeText: {
        fontSize: 9,
        fontWeight: '700',
    },
});
export default Cart