import React, { useState, useEffect, useContext } from "react";
import { Animated, Image, View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { addToCart } from '../../Redux/Actions/cartActions'
import { fetchReviews, createReview, updateReview } from '../../Redux/Actions/reviewActions'
import { useDispatch, useSelector } from 'react-redux'
import Toast from '../../Shared/SnackbarService';
import { useResponsive } from '../../assets/common/responsive';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import { usePromotions } from '../../Context/Store/PromotionContext';
import PromotionCountdown from '../../Shared/PromotionCountdown';

const StarRating = ({ rating, size = 18, color = '#ffd60a', onPress }) => {
    const stars = [1, 2, 3, 4, 5];
    return (
        <View style={{ flexDirection: 'row' }}>
            {stars.map((s) => (
                <TouchableOpacity key={s} onPress={() => onPress && onPress(s)} disabled={!onPress} activeOpacity={0.6}>
                    <Ionicons
                        name={rating >= s ? "star" : rating >= s - 0.5 ? "star-half" : "star-outline"}
                        size={size}
                        color={color}
                        style={{ marginRight: 2 }}
                    />
                </TouchableOpacity>
            ))}
        </View>
    );
};

const SingleProduct = ({ route }) => {
    const [item] = useState(route.params.item);
    const colors = useTheme();
    const dispatch = useDispatch();
    const { ws, fs, ms, spacing, hp } = useResponsive();
    const context = useContext(AuthGlobal);
    const userId = context.stateUser?.user?.userId;
    const cartItems = useSelector((state) => state.cartItems);
    const { getPromoForProduct } = usePromotions();

    const [quantity, setQuantity] = useState(1);
    const [quantityText, setQuantityText] = useState('1');

    const promo = getPromoForProduct(item._id || item.id);
    const displayPrice = promo ? promo.discountedPrice : item.price;
    const unitPrice = Number(displayPrice || 0);
    const totalPrice = Math.max(0, unitPrice * quantity);
    const formatMoney = (value) => Number(value || 0).toLocaleString('en-PH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
    });
    const cleanUri = (value) => {
        const uri = String(value || '').trim();
        return uri ? uri : '';
    };
    const imageUris = Array.from(new Set([
        cleanUri(item?.image),
        ...(Array.isArray(item?.images) ? item.images.map((img) => cleanUri(img)) : []),
    ].filter(Boolean)));
    const fallbackImage = 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
    const [imageIndex, setImageIndex] = useState(0);
    const imageFade = useState(new Animated.Value(1))[0];

    const switchImage = (nextIndex) => {
        if (imageUris.length <= 1) return;
        const safeIndex = (nextIndex + imageUris.length) % imageUris.length;
        Animated.sequence([
            Animated.timing(imageFade, { toValue: 0, duration: 220, useNativeDriver: true }),
            Animated.timing(imageFade, { toValue: 1, duration: 320, useNativeDriver: true }),
        ]).start();
        setImageIndex(safeIndex);
    };

    // Reviews state
    const { reviews, error: reviewError } = useSelector((state) => state.reviews);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (item && item._id) {
            dispatch(fetchReviews(item._id));
        }
    }, [item]);

    useEffect(() => {
        setImageIndex(0);
    }, [item?._id]);

    useEffect(() => {
        if (imageUris.length <= 1) return undefined;
        const interval = setInterval(() => {
            switchImage(imageIndex + 1);
        }, 4200);
        return () => clearInterval(interval);
    }, [imageIndex, imageUris.length]);

    // Check if user already has a review
    const myExistingReview = reviews.find((r) => r.user && r.user._id === userId);

    useEffect(() => {
        if (myExistingReview && !editingReview) {
            setMyRating(myExistingReview.rating);
            setMyComment(myExistingReview.comment || '');
        }
    }, [myExistingReview]);

    const handleSubmitReview = async () => {
        if (myRating === 0) {
            Toast.show({ topOffset: 60, type: "error", text1: "Please select a rating" });
            return;
        }
        setSubmitting(true);
        let result;
        if (editingReview) {
            result = await dispatch(updateReview(editingReview._id, { user: userId, rating: myRating, comment: myComment }));
        } else {
            result = await dispatch(createReview({ user: userId, product: item._id, rating: myRating, comment: myComment }));
        }
        setSubmitting(false);

        if (result.success) {
            Toast.show({ topOffset: 60, type: "success", text1: editingReview ? "Review updated" : "Review submitted" });
            setEditingReview(null);
            dispatch(fetchReviews(item._id));
        } else {
            Toast.show({ topOffset: 60, type: "error", text1: result.message || "Failed to submit review" });
        }
    };

    const startEditReview = (review) => {
        setEditingReview(review);
        setMyRating(review.rating);
        setMyComment(review.comment || '');
    };

    const avgRating = reviews.length > 0
        ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
        : 0;

    const increaseQty = () => {
        const maxStock = Number(item.countInStock || 1);
        if (quantity >= maxStock) return;
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

        const maxStock = Number(item.countInStock || 1);
        const nextQty = Math.max(1, Math.min(parsed, maxStock));
        setQuantity(nextQty);
        setQuantityText(String(nextQty));
    };

    const handleQuantityBlur = () => {
        if (quantityText !== '') return;
        setQuantity(1);
        setQuantityText('1');
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <ScrollView style={{ padding: spacing.xs }} contentContainerStyle={{ paddingBottom: spacing.xl }}>
                <View style={[styles.imageContainer, {
                    backgroundColor: colors.surface,
                    borderRadius: ws(14),
                    padding: spacing.sm,
                    margin: spacing.sm,
                    borderColor: colors.border,
                }]}> 
                    <Animated.Image
                        source={{
                            uri: imageUris[imageIndex] || fallbackImage
                        }}
                        resizeMode="contain"
                        style={[styles.image, { height: hp(30), opacity: imageFade }]}
                    />
                    {imageUris.length > 1 ? (
                        <>
                            <View style={[styles.imageCountPill, { backgroundColor: colors.overlay, borderColor: colors.border }]}> 
                                <Text style={{ color: colors.textOnPrimary, fontSize: fs(11), fontWeight: '700' }}>
                                    {imageIndex + 1}/{imageUris.length}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={[styles.sliderNav, { left: spacing.sm, backgroundColor: colors.overlay, borderColor: colors.border }]}
                                onPress={() => switchImage(imageIndex - 1)}
                                activeOpacity={0.75}
                            >
                                <Ionicons name="chevron-back" size={ms(18, 0.2)} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.sliderNav, { right: spacing.sm, backgroundColor: colors.overlay, borderColor: colors.border }]}
                                onPress={() => switchImage(imageIndex + 1)}
                                activeOpacity={0.75}
                            >
                                <Ionicons name="chevron-forward" size={ms(18, 0.2)} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                            <View style={styles.sliderDots}>
                                {imageUris.map((img, idx) => (
                                    <TouchableOpacity
                                        key={`${item._id || item.id}-image-${idx}-${img}`}
                                        onPress={() => switchImage(idx)}
                                        activeOpacity={0.8}
                                        style={[
                                            styles.sliderDot,
                                            {
                                                backgroundColor: idx === imageIndex ? colors.primary : colors.textSecondary,
                                                opacity: idx === imageIndex ? 1 : 0.45,
                                                width: idx === imageIndex ? 18 : 8,
                                            },
                                        ]}
                                    />
                                ))}
                            </View>
                        </>
                    ) : null}
                </View>
                <View style={[styles.heroInfoCard, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.md }]}> 
                    <View style={styles.heroTopRow}>
                        <View style={[styles.brandPill, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}> 
                            <Ionicons name="pricetag-outline" size={12} color={colors.secondary} />
                            <Text style={{ color: colors.secondary, fontSize: fs(11), marginLeft: 5, fontWeight: '700' }}>{item.brand || 'HardwareHaven'}</Text>
                        </View>
                        <View style={[styles.stockPill, { backgroundColor: item.countInStock > 0 ? colors.success : colors.danger }]}> 
                            <Text style={{ color: colors.textOnPrimary, fontSize: fs(10), fontWeight: '700' }}>
                                {item.countInStock > 0 ? 'In stock' : 'Out of stock'}
                            </Text>
                        </View>
                    </View>
                    <Text style={[styles.contentHeader, { color: colors.text, fontSize: fs(23), marginBottom: spacing.xs + 2 }]}>{item.name}</Text>
                    <View style={styles.ratingInlineRow}>
                        <StarRating rating={Number(item.rating || 0)} size={14} />
                        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginLeft: 6 }}>
                            {Number(item.rating || 0).toFixed(1)} ({item.numReviews || reviews.length || 0} reviews)
                        </Text>
                    </View>
                </View>
                {imageUris.length > 1 ? (
                    <View style={[styles.thumbRow, { paddingHorizontal: spacing.md }]}> 
                        {imageUris.map((img, idx) => (
                            <TouchableOpacity
                                key={`${item._id || item.id}-thumb-${idx}-${img}`}
                                style={[
                                    styles.thumb,
                                    {
                                        borderColor: idx === imageIndex ? colors.primary : colors.border,
                                        backgroundColor: colors.surface,
                                    },
                                ]}
                                onPress={() => switchImage(idx)}
                                activeOpacity={0.8}
                            >
                                <Image source={{ uri: img }} style={styles.thumbImage} resizeMode="cover" />
                            </TouchableOpacity>
                        ))}
                    </View>
                ) : null}
                <View style={[styles.contentContainer, { paddingHorizontal: spacing.md }]}>
                    {promo ? (
                        <View style={{ alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                <Text style={{ color: colors.textSecondary, textDecorationLine: 'line-through', fontSize: fs(18), marginRight: 8 }}>₱{item.price}</Text>
                                <Text style={[styles.priceText, { color: colors.danger, fontSize: fs(26) }]}>₱{promo.discountedPrice}</Text>
                            </View>
                            <PromotionCountdown endTime={promo.endTime} style={{ marginTop: 4 }} />
                        </View>
                    ) : (
                        <Text style={[styles.priceText, { color: colors.accent, fontSize: fs(26) }]}>₱{item.price}</Text>
                    )}
                </View>
                <View style={[styles.descriptionContainer, { backgroundColor: colors.surface, borderColor: colors.border, margin: spacing.md, padding: spacing.md, borderRadius: ws(12) }]}>
                    <View style={styles.sectionTitleRow}>
                        <Ionicons name="document-text-outline" size={16} color={colors.primary} />
                        <Text style={{ color: colors.textSecondary, fontWeight: '700', marginLeft: 6, fontSize: fs(13) }}>Description</Text>
                    </View>
                    <Text style={{ color: colors.text, lineHeight: fs(22), fontSize: fs(14) }}>{item.description}</Text>
                </View>
                <View style={[styles.stockRow, { marginHorizontal: spacing.md, marginBottom: spacing.md }]}>
                    <Ionicons
                        name={item.countInStock > 0 ? "checkmark-circle" : "close-circle"}
                        size={ms(20, 0.3)}
                        color={item.countInStock > 0 ? colors.success : colors.danger}
                    />
                    <Text style={{ color: item.countInStock > 0 ? colors.success : colors.danger, marginLeft: spacing.xs, fontSize: fs(14) }}>
                        {item.countInStock > 0 ? `${item.countInStock} In Stock` : 'Out of Stock'}
                    </Text>
                </View>

                <View style={[styles.purchaseCard, { backgroundColor: colors.surface, borderColor: colors.border, margin: spacing.md }]}> 
                    <Text style={{ color: colors.textSecondary, fontSize: fs(12), fontWeight: '700' }}>Purchase</Text>
                    <View style={[styles.purchaseRow, { marginTop: spacing.sm }]}> 
                        <View>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginBottom: 4 }}>Unit price: ₱{formatMoney(unitPrice)}</Text>
                            <Text style={[styles.price, { color: colors.accent, fontSize: fs(24) }]}>₱{formatMoney(totalPrice)}</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: 2 }}>Total for {quantity} item{quantity > 1 ? 's' : ''}</Text>
                        </View>
                        {item.countInStock > 0 ? (
                            <View style={styles.bottomRightWrap}>
                                <View style={[styles.qtyRow, { marginBottom: spacing.xs }]}> 
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, { backgroundColor: colors.surfaceLight, opacity: quantity <= 1 ? 0.5 : 1 }]}
                                        onPress={decreaseQty}
                                        disabled={quantity <= 1}
                                    >
                                        <Ionicons name="remove" size={ms(16, 0.2)} color={colors.text} />
                                    </TouchableOpacity>
                                    <TextInput
                                        style={[styles.qtyInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                                        keyboardType="numeric"
                                        value={quantityText}
                                        onChangeText={handleQuantityInput}
                                        onBlur={handleQuantityBlur}
                                    />
                                    <TouchableOpacity
                                        style={[styles.qtyBtn, {
                                            backgroundColor: colors.surfaceLight,
                                            opacity: quantity >= Number(item.countInStock || 0) ? 0.5 : 1,
                                        }]}
                                        onPress={increaseQty}
                                        disabled={quantity >= Number(item.countInStock || 0)}
                                    >
                                        <Ionicons name="add" size={ms(16, 0.2)} color={colors.text} />
                                    </TouchableOpacity>
                                </View>

                                <TouchableOpacity
                                    style={[styles.addToCartBtn, {
                                        backgroundColor: colors.primary,
                                        paddingVertical: spacing.sm + 4,
                                        paddingHorizontal: spacing.lg,
                                        borderRadius: ws(10),
                                        borderColor: colors.primaryDark,
                                    }]}
                                    onPress={() => {
                                        const existingCartItem = cartItems.find(ci => (ci._id || ci.id) === (item._id || item.id));
                                        const currentQtyInCart = existingCartItem ? (existingCartItem.quantity || 1) : 0;
                                        if ((currentQtyInCart + quantity) > item.countInStock) {
                                            Toast.show({
                                                topOffset: 60,
                                                type: "error",
                                                text1: "Stock limit reached",
                                                text2: `Only ${item.countInStock} available for "${item.name}"`
                                            });
                                            return;
                                        }
                                        dispatch(addToCart({
                                            ...item,
                                            quantity,
                                            effectivePrice: displayPrice,
                                            originalPrice: item.price,
                                        }));
                                        Toast.show({
                                            topOffset: 60,
                                            type: "success",
                                            text1: `${item.name} added to Cart`,
                                            text2: `Quantity: ${quantity}`
                                        });
                                    }}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="cart" size={ms(20, 0.3)} color={colors.textOnPrimary} />
                                    <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', marginLeft: spacing.sm, fontSize: fs(15) }}>Add ₱{formatMoney(totalPrice)}</Text>
                                </TouchableOpacity>
                            </View>
                        ) : (
                            <Text style={{ color: colors.danger, fontSize: fs(13), fontWeight: '700' }}>Currently unavailable</Text>
                        )}
                    </View>
                </View>

                {/* Reviews Section */}
                <View style={[styles.reviewsSection, { backgroundColor: colors.surface, borderColor: colors.border, margin: spacing.md, padding: spacing.md, borderRadius: ws(12) }]}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm }}>
                        <Ionicons name="chatbubbles-outline" size={18} color={colors.primary} />
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(16), marginLeft: 6 }}>
                            Reviews ({reviews.length})
                        </Text>
                        {reviews.length > 0 && (
                            <View style={{ flexDirection: 'row', alignItems: 'center', marginLeft: 10 }}>
                                <StarRating rating={Number(avgRating)} size={14} />
                                <Text style={{ color: colors.accent, fontSize: fs(13), marginLeft: 4 }}>{avgRating}</Text>
                            </View>
                        )}
                    </View>

                    {/* Write/Edit Review Form */}
                    {userId ? (
                        <View style={[styles.reviewForm, { backgroundColor: colors.surfaceLight, borderColor: colors.border, padding: spacing.sm + 4, borderRadius: 10, marginBottom: spacing.sm }]}>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginBottom: 4 }}>
                                {editingReview ? 'Update your review' : myExistingReview ? 'You already reviewed this product' : 'Write a review'}
                            </Text>
                            {(!myExistingReview || editingReview) && (
                                <>
                                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                                        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginRight: 6 }}>Rating:</Text>
                                        <StarRating rating={myRating} size={22} color={colors.accent} onPress={(r) => setMyRating(r)} />
                                    </View>
                                    <TextInput
                                        style={[styles.reviewInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                                        placeholder="Write your comment..."
                                        placeholderTextColor={colors.textSecondary}
                                        multiline
                                        value={myComment}
                                        onChangeText={setMyComment}
                                    />
                                    <TouchableOpacity
                                        style={[styles.submitReviewBtn, { backgroundColor: colors.primary }]}
                                        onPress={handleSubmitReview}
                                        disabled={submitting}
                                    >
                                        {submitting ? (
                                            <ActivityIndicator color={colors.textOnPrimary} size="small" />
                                        ) : (
                                            <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', fontSize: fs(13) }}>
                                                {editingReview ? 'Update Review' : 'Submit Review'}
                                            </Text>
                                        )}
                                    </TouchableOpacity>
                                    {editingReview && (
                                        <TouchableOpacity onPress={() => { setEditingReview(null); setMyRating(myExistingReview?.rating || 0); setMyComment(myExistingReview?.comment || ''); }} style={{ marginTop: 4 }}>
                                            <Text style={{ color: colors.textSecondary, fontSize: fs(12), textAlign: 'center' }}>Cancel</Text>
                                        </TouchableOpacity>
                                    )}
                                </>
                            )}
                        </View>
                    ) : null}

                    {/* Review List */}
                    {reviews.length === 0 ? (
                        <Text style={{ color: colors.textSecondary, fontSize: fs(13), textAlign: 'center', paddingVertical: 10 }}>No reviews yet.</Text>
                    ) : (
                        reviews.map((review) => (
                            <View key={review._id} style={[styles.reviewItem, { borderBottomColor: colors.border }]}>
                                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                                    {review.user?.image ? (
                                        <Image source={{ uri: review.user.image }} style={[styles.reviewAvatar, { borderColor: colors.border }]} />
                                    ) : (
                                        <View style={[styles.reviewAvatar, { backgroundColor: colors.surfaceLight, borderColor: colors.border, justifyContent: 'center', alignItems: 'center' }]}>
                                            <Ionicons name="person" size={14} color={colors.textSecondary} />
                                        </View>
                                    )}
                                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: fs(13), marginLeft: 6, flex: 1 }}>
                                        {review.user?.name || 'User'}
                                    </Text>
                                    <StarRating rating={review.rating} size={13} />
                                </View>
                                {review.comment ? (
                                    <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginLeft: 34 }}>{review.comment}</Text>
                                ) : null}
                                {userId && review.user?._id === userId && !editingReview && (
                                    <TouchableOpacity onPress={() => startEditReview(review)} style={{ marginLeft: 34, marginTop: 4 }}>
                                        <Text style={{ color: colors.secondary, fontSize: fs(11) }}>Edit your review</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        ))
                    )}
                </View>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {
        borderWidth: 1,
    },
    heroInfoCard: {
        marginTop: 2,
        marginBottom: 8,
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    heroTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    brandPill: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 9,
        paddingVertical: 5,
        flexDirection: 'row',
        alignItems: 'center',
    },
    stockPill: {
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    ratingInlineRow: {
        marginTop: 2,
        flexDirection: 'row',
        alignItems: 'center',
    },
    image: {
        width: '100%',
    },
    imageCountPill: {
        position: 'absolute',
        top: 8,
        right: 10,
        borderRadius: 10,
        borderWidth: 1,
        paddingHorizontal: 8,
        paddingVertical: 3,
    },
    sliderNav: {
        position: 'absolute',
        top: '46%',
        width: 32,
        height: 32,
        borderRadius: 16,
        borderWidth: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    sliderDots: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    sliderDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginHorizontal: 3,
    },
    thumbRow: {
        flexDirection: 'row',
        marginTop: 2,
        marginBottom: 4,
    },
    thumb: {
        width: 52,
        height: 52,
        borderRadius: 10,
        borderWidth: 2,
        marginRight: 8,
        overflow: 'hidden',
    },
    thumbImage: {
        width: '100%',
        height: '100%',
    },
    contentContainer: {
        marginTop: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    contentHeader: {
        fontWeight: 'bold',
        marginBottom: 8
    },
    contentText: {
        fontWeight: '600',
        marginBottom: 8
    },
    priceText: {
        fontWeight: 'bold',
        marginBottom: 16,
    },
    descriptionContainer: {
        borderWidth: 1,
    },
    sectionTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    purchaseCard: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
    },
    purchaseRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    price: {
        fontWeight: 'bold',
    },
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
    },
    bottomRightWrap: {
        alignItems: 'flex-end',
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    qtyBtn: {
        width: 28,
        height: 28,
        borderRadius: 14,
        alignItems: 'center',
        justifyContent: 'center',
    },
    qtyInput: {
        width: 52,
        height: 32,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '700',
        marginHorizontal: 8,
        paddingVertical: 0,
    },
    reviewsSection: {
        borderWidth: 1,
    },
    reviewForm: {
        borderWidth: 1,
    },
    reviewInput: {
        borderWidth: 1,
        borderRadius: 8,
        padding: 8,
        minHeight: 60,
        textAlignVertical: 'top',
        fontSize: 13,
        marginBottom: 8,
    },
    submitReviewBtn: {
        borderRadius: 8,
        paddingVertical: 8,
        alignItems: 'center',
    },
    reviewItem: {
        paddingVertical: 8,
        borderBottomWidth: 1,
    },
    reviewAvatar: {
        width: 28,
        height: 28,
        borderRadius: 14,
        borderWidth: 1,
        overflow: 'hidden',
    },
})

export default SingleProduct