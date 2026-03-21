import {
    StyleSheet,
    View,
    Animated,
    Text,
    TouchableOpacity,
    TextInput,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Ionicons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';

import Toast from '../../Shared/SnackbarService';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import { usePromotions } from '../../Context/Store/PromotionContext';
import PromotionCountdown from '../../Shared/PromotionCountdown';
import { addToCart } from '../../Redux/Actions/cartActions';

const ProductCard = (props) => {
    const { name, price, image, countInStock, _id, description, richDescription, onPressDetail } = props;
    const colors = useTheme();
    const { ws, fs, cardWidth, spacing, ms } = useResponsive();
    const { getPromoForProduct } = usePromotions();
    const dispatch = useDispatch();

    const [quantity, setQuantity] = useState(1);
    const [quantityText, setQuantityText] = useState('1');
    const [imageIndex, setImageIndex] = useState(0);

    const promo = getPromoForProduct(_id || props.id);
    const effectivePrice = promo ? promo.discountedPrice : price;

    const cWidth = cardWidth(ws(8), {
        columns: { mobile: 2, tablet: 2, desktop: 3, wide: 4 },
        minWidth: ws(165),
        maxWidth: ws(255),
    });
    const cHeight = cWidth * 1.78;
    const imgHeight = cWidth - ws(26);
    const descriptionText = String(description || richDescription || '').trim();

    const fadeAnim = useRef(new Animated.Value(1)).current;
    const cleanUri = (value) => {
        const uri = String(value || '').trim();
        return uri ? uri : '';
    };
    const fallbackImage = 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';

    const imageUris = useMemo(() => {
        const primary = cleanUri(image);
        const gallery = Array.isArray(props.images) ? props.images.map((img) => cleanUri(img)) : [];
        const merged = [primary, ...gallery].filter(Boolean);
        return Array.from(new Set(merged));
    }, [image, props.images]);

    const goToImage = (nextIndex) => {
        if (imageUris.length <= 1) return;
        const safeIndex = (nextIndex + imageUris.length) % imageUris.length;
        Animated.sequence([
            Animated.timing(fadeAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
            Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
        ]).start();
        setImageIndex(safeIndex);
    };

    useEffect(() => {
        setImageIndex(0);
    }, [_id, imageUris.length]);

    useEffect(() => {
        if (imageUris.length <= 1) return undefined;
        const interval = setInterval(() => {
            goToImage(imageIndex + 1);
        }, 3400);

        return () => clearInterval(interval);
    }, [imageIndex, imageUris.length]);

    const increaseQty = () => {
        const stock = Number(countInStock || 0);
        if (quantity >= stock) return;
        const nextQty = quantity + 1;
        setQuantity(nextQty);
        setQuantityText(String(nextQty));
    };

    const decreaseQty = () => {
        if (quantity <= 1) return;
        const nextQty = quantity - 1;
        setQuantity(nextQty);
        setQuantityText(String(nextQty));
    };

    const handleQuantityInput = (inputText) => {
        const cleaned = String(inputText || '').replace(/[^0-9]/g, '');
        if (!cleaned) {
            setQuantityText('');
            return;
        }

        const parsed = parseInt(cleaned, 10);
        if (Number.isNaN(parsed)) return;

        const maxStock = Number(countInStock || 1);
        const nextQty = Math.max(1, Math.min(parsed, maxStock));
        setQuantity(nextQty);
        setQuantityText(String(nextQty));
    };

    const handleQuantityBlur = () => {
        if (quantityText !== '') return;
        setQuantity(1);
        setQuantityText('1');
    };

    const addItemToCart = () => {
        if (countInStock <= 0) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Out of stock',
                text2: `${name} is currently unavailable`,
            });
            return;
        }

        dispatch(addToCart({
            ...props,
            quantity,
            effectivePrice,
            originalPrice: price,
        }));

        Toast.show({
            topOffset: 60,
            type: 'success',
            text1: `${name} added to Cart`,
            text2: `Quantity: ${quantity}`,
        });
    };

    return (
        <View
            style={[
                styles.container,
                {
                    width: cWidth,
                    minHeight: cHeight,
                    padding: spacing.sm,
                    borderRadius: ws(12),
                    marginTop: ws(14),
                    marginBottom: ws(8),
                    marginLeft: ws(8),
                    backgroundColor: colors.cardBg,
                    borderColor: colors.border,
                },
            ]}
        >
            <TouchableOpacity activeOpacity={0.85} onPress={onPressDetail} style={{ width: '100%' }}>
                <Animated.Image
                    style={[
                        styles.image,
                        {
                            width: cWidth - spacing.sm * 2,
                            height: imgHeight,
                            opacity: fadeAnim,
                        },
                    ]}
                    resizeMode="contain"
                    source={{ uri: imageUris[imageIndex] || fallbackImage }}
                />
                {imageUris.length > 1 ? (
                    <>
                        <View style={[styles.imageCountPill, { backgroundColor: colors.overlay, borderColor: colors.border }]}>
                            <Text style={{ color: colors.textOnPrimary, fontSize: fs(9), fontWeight: '700' }}>
                                {imageIndex + 1}/{imageUris.length}
                            </Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.imageNavBtn, { left: 8, backgroundColor: colors.overlay, borderColor: colors.border }]}
                            onPress={() => goToImage(imageIndex - 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-back" size={ms(14, 0.2)} color={colors.textOnPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.imageNavBtn, { right: 8, backgroundColor: colors.overlay, borderColor: colors.border }]}
                            onPress={() => goToImage(imageIndex + 1)}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="chevron-forward" size={ms(14, 0.2)} color={colors.textOnPrimary} />
                        </TouchableOpacity>
                        <View style={styles.dotRow}>
                            {imageUris.map((img, idx) => (
                                <TouchableOpacity
                                    key={`${_id || name}-dot-${idx}-${img}`}
                                    onPress={() => goToImage(idx)}
                                    activeOpacity={0.8}
                                    style={[
                                        styles.dot,
                                        {
                                            backgroundColor: idx === imageIndex ? colors.primary : colors.textSecondary,
                                            opacity: idx === imageIndex ? 1 : 0.45,
                                            width: idx === imageIndex ? 14 : 6,
                                        },
                                    ]}
                                />
                            ))}
                        </View>
                    </>
                ) : null}
                <Text style={[styles.title, { color: colors.text, fontSize: fs(14) }]}>
                    {name.length > 20 ? `${name.substring(0, 17)}...` : name}
                </Text>
                <Text
                    style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: spacing.xs, minHeight: fs(30) }}
                    numberOfLines={2}
                >
                    {descriptionText || 'High quality hardware product for your next project.'}
                </Text>
            </TouchableOpacity>

            {promo ? (
                <View style={{ alignItems: 'center' }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text
                            style={{
                                color: colors.textSecondary,
                                textDecorationLine: 'line-through',
                                fontSize: fs(13),
                                marginRight: 4,
                            }}
                        >
                            ₱{price}
                        </Text>
                        <Text style={[styles.price, { color: colors.danger, fontSize: fs(20) }]}>₱{promo.discountedPrice}</Text>
                    </View>
                    <PromotionCountdown endTime={promo.endTime} style={{ marginTop: 2 }} />
                </View>
            ) : (
                <Text style={[styles.price, { color: colors.accent, fontSize: fs(20) }]}>₱{price}</Text>
            )}

            <View style={[styles.purchaseBlock, { marginTop: spacing.xs }]}> 
                <View style={styles.qtyRow}>
                    <TouchableOpacity
                        style={[styles.qtyBtn, { backgroundColor: colors.surfaceLight, opacity: quantity <= 1 ? 0.5 : 1 }]}
                        onPress={decreaseQty}
                        disabled={quantity <= 1}
                    >
                        <Ionicons name="remove" size={ms(15, 0.2)} color={colors.text} />
                    </TouchableOpacity>
                    <TextInput
                        style={[styles.qtyInput, { color: colors.text, backgroundColor: colors.inputBg, borderColor: colors.border }]}
                        keyboardType="numeric"
                        value={quantityText}
                        onChangeText={handleQuantityInput}
                        onBlur={handleQuantityBlur}
                    />
                    <TouchableOpacity
                        style={[
                            styles.qtyBtn,
                            {
                                backgroundColor: colors.surfaceLight,
                                opacity: quantity >= Number(countInStock || 0) ? 0.5 : 1,
                            },
                        ]}
                        onPress={increaseQty}
                        disabled={quantity >= Number(countInStock || 0)}
                    >
                        <Ionicons name="add" size={ms(15, 0.2)} color={colors.text} />
                    </TouchableOpacity>
                </View>

                <TouchableOpacity
                    style={[
                        styles.addBtn,
                        {
                            backgroundColor: countInStock <= 0 ? colors.border : colors.primary,
                            marginTop: spacing.sm,
                        },
                    ]}
                    onPress={addItemToCart}
                    disabled={countInStock <= 0}
                    activeOpacity={0.8}
                >
                    <View style={styles.addIconWrap}>
                        <Ionicons name="cart-outline" size={ms(15, 0.2)} color={colors.textOnPrimary} />
                        {quantity > 1 ? (
                            <View style={[styles.qtyBadge, { backgroundColor: colors.accent }]}>
                                <Text style={[styles.qtyBadgeText, { color: colors.background }]}>{quantity}</Text>
                            </View>
                        ) : null}
                    </View>
                    <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), fontWeight: '700', marginLeft: 4 }}>Add to Cart</Text>
                </TouchableOpacity>

                {countInStock <= 0 ? (
                    <Text style={{ marginTop: spacing.xs, color: colors.danger, fontSize: fs(12), textAlign: 'center' }}>Out of Stock</Text>
                ) : null}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'space-between',
        elevation: 4,
        borderWidth: 1,
    },
    image: {
        backgroundColor: 'transparent',
        borderRadius: 8,
    },
    imageNavBtn: {
        position: 'absolute',
        top: '38%',
        width: 26,
        height: 26,
        borderRadius: 13,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    imageCountPill: {
        position: 'absolute',
        top: 6,
        right: 8,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 6,
        paddingVertical: 2,
    },
    dotRow: {
        position: 'absolute',
        bottom: 4,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        marginHorizontal: 2,
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'left',
        marginTop: 8,
        minHeight: 34,
        width: '100%',
    },
    price: {
        fontWeight: 'bold',
        marginTop: 6,
    },
    purchaseBlock: {
        width: '100%',
        marginTop: 4,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    qtyBtn: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyInput: {
        width: 44,
        height: 28,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '700',
        paddingVertical: 0,
        marginHorizontal: 8,
    },
    addBtn: {
        width: '100%',
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    addIconWrap: {
        position: 'relative',
        width: 18,
        height: 18,
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

export default ProductCard;
