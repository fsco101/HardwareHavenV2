import React, { useState, useEffect, useContext } from "react";
import { Image, View, StyleSheet, Text, ScrollView, TouchableOpacity, TextInput, ActivityIndicator } from "react-native";
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { addToCart } from '../../Redux/Actions/cartActions'
import { fetchReviews, createReview, updateReview } from '../../Redux/Actions/reviewActions'
import { useDispatch, useSelector } from 'react-redux'
import Toast from 'react-native-toast-message'
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

    const promo = getPromoForProduct(item._id || item.id);
    const displayPrice = promo ? promo.discountedPrice : item.price;

    // Reviews state
    const { reviews, error: reviewError } = useSelector((state) => state.reviews);
    const [myRating, setMyRating] = useState(0);
    const [myComment, setMyComment] = useState('');
    const [editingReview, setEditingReview] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [quantityText, setQuantityText] = useState('1');

    useEffect(() => {
        if (item && item._id) {
            dispatch(fetchReviews(item._id));
        }
    }, [item]);

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
            <ScrollView style={{ marginBottom: ws(80), padding: spacing.xs }}>
                <View style={[styles.imageContainer, { backgroundColor: colors.surface, borderRadius: ws(12), padding: spacing.sm, margin: spacing.sm }]}>
                    <Image
                        source={{
                            uri: item.image ? item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
                        }}
                        resizeMode="contain"
                        style={[styles.image, { height: hp(30) }]}
                    />
                </View>
                <View style={[styles.contentContainer, { paddingHorizontal: spacing.md }]}>
                    <Text style={[styles.contentHeader, { color: colors.text, fontSize: fs(22) }]}>{item.name}</Text>
                    <Text style={[styles.contentText, { color: colors.secondary, fontSize: fs(16) }]}>{item.brand}</Text>
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
                    <Text style={{ color: colors.textSecondary, fontWeight: '600', marginBottom: spacing.sm, fontSize: fs(14) }}>Description</Text>
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
            <View style={[styles.bottomContainer, { backgroundColor: colors.surface, borderTopColor: colors.border, padding: spacing.md }]}> 
                <Text style={[styles.price, { color: colors.accent, fontSize: fs(24) }]}>₱{displayPrice}</Text>
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
                            <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', marginLeft: spacing.sm, fontSize: fs(15) }}>Add to Cart</Text>
                        </TouchableOpacity>
                    </View>
                ) : null}
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    imageContainer: {},
    image: {
        width: '100%',
    },
    contentContainer: {
        marginTop: 16,
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
    stockRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bottomContainer: {
        flexDirection: 'row',
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        alignItems: 'center',
        justifyContent: 'space-between',
        borderTopWidth: 1,
    },
    price: {
        fontWeight: 'bold',
    },
    addToCartBtn: {
        flexDirection: 'row',
        alignItems: 'center',
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