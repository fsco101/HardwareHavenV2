import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import baseURL from '../../config/api';
import { getToken } from '../../assets/common/tokenStorage';
import Toast from '../../Shared/SnackbarService';
import SweetAlert from '../../Shared/SweetAlert';
import CustomDropdown from '../../Shared/CustomDropdown';

const RATING_FILTERS = [
    { label: 'All', value: '0' },
    { label: '5', value: '5' },
    { label: '4', value: '4' },
    { label: '3', value: '3' },
    { label: '2', value: '2' },
    { label: '1', value: '1' },
];

const ReviewManagement = ({ route }) => {
    const colors = useTheme();
    const { fs, spacing, ws } = useResponsive();

    const productIdFromRoute = route?.params?.productId || '';
    const productNameFromRoute = route?.params?.productName || '';

    const [reviews, setReviews] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [rating, setRating] = useState('0');
    const [category, setCategory] = useState('');
    const [deleteTarget, setDeleteTarget] = useState(null);

    const selectedCategoryLabel = useMemo(() => {
        const found = categories.find((c) => String(c._id || c.id) === String(category));
        return found?.name || 'All Categories';
    }, [categories, category]);

    const categoryDropdownData = useMemo(() => {
        const categoryItems = categories.map((item) => ({
            label: item?.name || 'Category',
            value: String(item?._id || item?.id),
        }));

        return [{ label: 'All Categories', value: '' }, ...categoryItems];
    }, [categories]);

    const getAuthConfig = useCallback(async () => {
        const token = await getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }, []);

    const fetchCategories = useCallback(async () => {
        try {
            const res = await axios.get(`${baseURL}categories`);
            setCategories(Array.isArray(res.data) ? res.data : []);
        } catch {
            setCategories([]);
        }
    }, []);

    const fetchReviews = useCallback(async ({ withLoader = true } = {}) => {
        if (withLoader) setLoading(true);

        try {
            const authConfig = await getAuthConfig();
            const params = {
                search,
                rating,
                category,
                product: productIdFromRoute,
            };

            const res = await axios.get(`${baseURL}reviews/admin/manage`, {
                ...authConfig,
                params,
            });

            setReviews(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Failed to load reviews',
                text2: err.response?.data?.message || err.message,
            });
        } finally {
            if (withLoader) setLoading(false);
        }
    }, [category, getAuthConfig, productIdFromRoute, rating, search]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    useEffect(() => {
        fetchReviews({ withLoader: true });
    }, [fetchReviews]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchReviews({ withLoader: false });
        setRefreshing(false);
    }, [fetchReviews]);

    const handleDelete = async () => {
        if (!deleteTarget) return;

        const id = deleteTarget?._id || deleteTarget?.id;
        if (!id) return;

        try {
            const authConfig = await getAuthConfig();
            await axios.delete(`${baseURL}reviews/${id}`, authConfig);
            setReviews((prev) => prev.filter((r) => String(r._id || r.id) !== String(id)));
            Toast.show({ topOffset: 60, type: 'success', text1: 'Review deleted' });
        } catch (err) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Delete failed',
                text2: err.response?.data?.message || err.message,
            });
        } finally {
            setDeleteTarget(null);
        }
    };

    const renderReviewCard = ({ item }) => {
        const userName = item?.user?.name || 'Unknown user';
        const userEmail = item?.user?.email || 'No email';
        const productName = item?.product?.name || 'Unknown product';
        const categoryName = item?.product?.category?.name || 'Uncategorized';
        const stars = '★'.repeat(Math.max(1, Math.min(5, Number(item?.rating || 0))));

        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.sm }]}>
                <View style={styles.cardTopRow}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: fs(14), fontWeight: '700' }}>{productName}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: 2 }}>{categoryName}</Text>
                    </View>
                    <View style={[styles.ratingBadge, { backgroundColor: colors.accent }]}> 
                        <Text style={{ color: colors.headerBg, fontSize: fs(11), fontWeight: '700' }}>{stars}</Text>
                    </View>
                </View>

                <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 6 }}>
                    By: {userName} ({userEmail})
                </Text>

                <Text style={{ color: colors.text, fontSize: fs(13), marginTop: 8 }}>
                    {item?.comment || 'No comment provided.'}
                </Text>

                <View style={[styles.actionsRow, { marginTop: 10 }]}> 
                    <TouchableOpacity
                        style={[styles.deleteBtn, { backgroundColor: colors.danger }]}
                        onPress={() => setDeleteTarget(item)}
                    >
                        <Ionicons name="trash-outline" size={16} color={colors.textOnPrimary} />
                        <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), fontWeight: '700', marginLeft: 6 }}>Delete</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SweetAlert
                visible={!!deleteTarget}
                type="confirm"
                title="Delete Review"
                message="This action cannot be undone. Continue?"
                confirmText="Delete"
                cancelText="Cancel"
                showCancel
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
            />

            <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
                {productIdFromRoute ? (
                    <View style={[styles.scopeCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}> 
                        <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>Scoped Product</Text>
                        <Text style={{ color: colors.text, fontSize: fs(14), fontWeight: '700', marginTop: 2 }} numberOfLines={1}>
                            {productNameFromRoute || productIdFromRoute}
                        </Text>
                    </View>
                ) : null}

                <TextInput
                    style={[
                        styles.searchInput,
                        {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.text,
                            fontSize: fs(14),
                        },
                    ]}
                    placeholder="Search by product, user, comment"
                    placeholderTextColor={colors.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => fetchReviews({ withLoader: true })}
                />

                <View style={{ marginTop: spacing.sm }}>
                    <CustomDropdown
                        label="Rating filter"
                        data={RATING_FILTERS}
                        value={rating}
                        onSelect={setRating}
                        placeholder="Select rating"
                        icon="star-outline"
                    />
                </View>

                <View style={{ marginTop: spacing.sm }}>
                    <CustomDropdown
                        label={`Category filter: ${selectedCategoryLabel}`}
                        data={categoryDropdownData}
                        value={category}
                        onSelect={setCategory}
                        placeholder="Select category"
                        searchable
                        icon="list-outline"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: colors.primary, borderRadius: ws(9), marginBottom: spacing.sm }]}
                    onPress={() => fetchReviews({ withLoader: true })}
                >
                    <Ionicons name="search-outline" size={16} color={colors.textOnPrimary} />
                    <Text style={{ color: colors.textOnPrimary, fontWeight: '700', marginLeft: 6, fontSize: fs(13) }}>Apply Filters</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={reviews}
                    keyExtractor={(item) => String(item?._id || item?.id)}
                    renderItem={renderReviewCard}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(13) }}>No reviews found for current filters.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    scopeCard: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginBottom: 8,
    },
    searchInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    applyBtn: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    cardTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    ratingBadge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionsRow: {
        flexDirection: 'row',
    },
    deleteBtn: {
        borderRadius: 9,
        paddingVertical: 10,
        paddingHorizontal: 14,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

export default ReviewManagement;
