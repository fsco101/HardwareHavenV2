import React, { useState, useCallback, useContext } from 'react';
import {
    View, Text, ScrollView, StyleSheet, TouchableOpacity,
    TextInput, FlatList, ActivityIndicator, Image
} from 'react-native';
import { Searchbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import axios from 'axios';
import baseURL from '../../config/api';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import { formatPHDate } from '../../assets/common/phTime';
import SweetAlert from '../../Shared/SweetAlert';
import Toast from 'react-native-toast-message';
import AuthGlobal from '../../Context/Store/AuthGlobal';
import PromotionCountdown from '../../Shared/PromotionCountdown';
import { getToken } from '../../assets/common/tokenStorage';
import { validateField } from '../../Shared/FormValidation';

const DURATIONS = [
    { label: '5 min', value: 5 },
    { label: '15 min', value: 15 },
    { label: '30 min', value: 30 },
    { label: '1 hour', value: 60 },
    { label: '2 hours', value: 120 },
    { label: '6 hours', value: 360 },
    { label: '12 hours', value: 720 },
    { label: '24 hours', value: 1440 },
];

const TARGET_OPTIONS = [
    { label: 'All Users', value: 'all' },
    { label: 'Top Buyers', value: 'top_buyers' },
    { label: 'Big Spenders', value: 'big_spenders' },
];

const Promotions = () => {
    const colors = useTheme();
    const { fs, spacing, ws, width } = useResponsive();
    const context = useContext(AuthGlobal);
    const userId = context.stateUser?.user?.userId;

    // Products
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchText, setSearchText] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Promotion form
    const [discountedPrice, setDiscountedPrice] = useState('');
    const [duration, setDuration] = useState(30);
    const [targetUsers, setTargetUsers] = useState('all');
    const [discountError, setDiscountError] = useState('');

    // Active promotions
    const [promotions, setPromotions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [creating, setCreating] = useState(false);
    const [tab, setTab] = useState('create'); // 'create' | 'active'

    // Alert
    const [alertVisible, setAlertVisible] = useState(false);
    const [deactivateId, setDeactivateId] = useState(null);

    const getAuthConfig = useCallback(async () => {
        const token = await getToken();
        if (!token) {
            throw new Error('Missing authentication token. Please login again.');
        }
        return { headers: { Authorization: `Bearer ${token}` } };
    }, []);

    const fetchData = useCallback(async () => {
        setLoading(true);
        try {
            const authConfig = await getAuthConfig();
            const [prodRes, catRes, promoRes] = await Promise.all([
                axios.get(`${baseURL}products`),
                axios.get(`${baseURL}categories`),
                axios.get(`${baseURL}promotions/admin/all`, authConfig),
            ]);
            setProducts(prodRes.data);
            setCategories(catRes.data);
            setPromotions(promoRes.data);
        } catch (err) {
            const message = err.response?.data?.message || err.message;
            console.log('Promotions fetch error:', message);
            if (err.response?.status === 401 || err.response?.status === 403) {
                Toast.show({ topOffset: 60, type: 'error', text1: 'Unauthorized', text2: 'Please login as admin to manage promotions' });
            }
        } finally {
            setLoading(false);
        }
    }, [getAuthConfig]);

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [fetchData])
    );

    const filteredProducts = products.filter(p => {
        const matchesSearch = !searchText || p.name.toLowerCase().includes(searchText.toLowerCase());
        const matchesCat = selectedCategory === 'all' || (p.category && p.category._id === selectedCategory);
        return matchesSearch && matchesCat;
    });

    const handleCreate = async () => {
        if (!selectedProduct) {
            Toast.show({ topOffset: 60, type: 'error', text1: 'Please select a product' });
            return;
        }

        const priceValidationError = validateField('discountedPrice', discountedPrice);
        if (priceValidationError) {
            setDiscountError(priceValidationError);
            Toast.show({ topOffset: 60, type: 'error', text1: priceValidationError });
            return;
        }

        const dp = parseFloat(discountedPrice);
        if (dp >= selectedProduct.price) {
            setDiscountError('Discounted price must be less than original price');
            Toast.show({ topOffset: 60, type: 'error', text1: 'Discounted price must be less than original price' });
            return;
        }

        setCreating(true);
        try {
            const authConfig = await getAuthConfig();
            await axios.post(`${baseURL}promotions`, {
                productId: selectedProduct._id,
                discountedPrice: dp,
                durationMinutes: duration,
                targetUsers,
                createdBy: userId,
            }, authConfig);
            Toast.show({ topOffset: 60, type: 'success', text1: 'Promotion created!', text2: 'Notifications sent to users' });
            setSelectedProduct(null);
            setDiscountedPrice('');
            setDiscountError('');
            setTab('active');
            fetchData();
        } catch (err) {
            Toast.show({ topOffset: 60, type: 'error', text1: 'Failed', text2: err.response?.data?.message || err.message });
        }
        setCreating(false);
    };

    const handleDeactivate = (id) => {
        setDeactivateId(id);
        setAlertVisible(true);
    };

    const confirmDeactivate = async () => {
        setAlertVisible(false);
        try {
            const authConfig = await getAuthConfig();
            await axios.put(`${baseURL}promotions/deactivate/${deactivateId}`, {}, authConfig);
            Toast.show({ topOffset: 60, type: 'success', text1: 'Promotion deactivated' });
            fetchData();
        } catch (err) {
            Toast.show({ topOffset: 60, type: 'error', text1: 'Failed to deactivate', text2: err.response?.data?.message || err.message });
        }
    };

    const activePromos = promotions.filter(p => p.isActive && new Date(p.endTime) > new Date());
    const expiredPromos = promotions.filter(p => !p.isActive || new Date(p.endTime) <= new Date());

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SweetAlert
                visible={alertVisible}
                type="confirm"
                title="Deactivate Promotion"
                message="Are you sure you want to end this promotion?"
                confirmText="Deactivate"
                cancelText="Cancel"
                showCancel
                onConfirm={confirmDeactivate}
                onCancel={() => setAlertVisible(false)}
            />

            {/* Tabs */}
            <View style={[styles.tabRow, { borderBottomColor: colors.border }]}>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'create' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setTab('create')}
                >
                    <Ionicons name="add-circle-outline" size={18} color={tab === 'create' ? colors.primary : colors.textSecondary} />
                    <Text style={{ color: tab === 'create' ? colors.primary : colors.textSecondary, fontWeight: tab === 'create' ? 'bold' : 'normal', fontSize: fs(14), marginLeft: 4 }}>Create</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tabBtn, tab === 'active' && { borderBottomColor: colors.primary, borderBottomWidth: 2 }]}
                    onPress={() => setTab('active')}
                >
                    <Ionicons name="flame-outline" size={18} color={tab === 'active' ? colors.primary : colors.textSecondary} />
                    <Text style={{ color: tab === 'active' ? colors.primary : colors.textSecondary, fontWeight: tab === 'active' ? 'bold' : 'normal', fontSize: fs(14), marginLeft: 4 }}>
                        Active ({activePromos.length})
                    </Text>
                </TouchableOpacity>
            </View>

            {tab === 'create' ? (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
                    {/* Product Search */}
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(15) }]}>1. Select Product</Text>
                    <Searchbar
                        placeholder="Search products..."
                        value={searchText}
                        onChangeText={setSearchText}
                        style={{ backgroundColor: colors.inputBg, borderRadius: ws(10), marginBottom: 8 }}
                        inputStyle={{ color: colors.text, fontSize: fs(14) }}
                        placeholderTextColor={colors.textSecondary}
                        iconColor={colors.primary}
                    />

                    {/* Category filter */}
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 8 }}>
                        <TouchableOpacity
                            style={[styles.catChip, { backgroundColor: selectedCategory === 'all' ? colors.primary : colors.surfaceLight }]}
                            onPress={() => setSelectedCategory('all')}
                        >
                            <Text style={{ color: selectedCategory === 'all' ? colors.textOnPrimary : colors.textSecondary, fontSize: fs(12) }}>All</Text>
                        </TouchableOpacity>
                        {categories.map(c => (
                            <TouchableOpacity
                                key={c._id}
                                style={[styles.catChip, { backgroundColor: selectedCategory === c._id ? colors.primary : colors.surfaceLight }]}
                                onPress={() => setSelectedCategory(c._id)}
                            >
                                <Text style={{ color: selectedCategory === c._id ? colors.textOnPrimary : colors.textSecondary, fontSize: fs(12) }}>{c.name}</Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>

                    {/* Product list */}
                    <View style={{ maxHeight: 200, marginBottom: 12 }}>
                        <ScrollView nestedScrollEnabled>
                            {filteredProducts.map((item) => (
                                <TouchableOpacity
                                    key={item._id || item.id}
                                    style={[styles.productItem, {
                                        backgroundColor: selectedProduct?._id === item._id ? colors.surfaceLight : colors.surface,
                                        borderColor: selectedProduct?._id === item._id ? colors.primary : colors.border,
                                    }]}
                                    onPress={() => { setSelectedProduct(item); setDiscountedPrice(''); }}
                                >
                                    <Image source={{ uri: item.image || 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png' }} style={styles.productThumb} />
                                    <View style={{ flex: 1, marginLeft: 8 }}>
                                        <Text style={{ color: colors.text, fontWeight: '600', fontSize: fs(13) }} numberOfLines={1}>{item.name}</Text>
                                        <Text style={{ color: colors.accent, fontSize: fs(12) }}>₱{item.price}</Text>
                                    </View>
                                    {selectedProduct?._id === item._id && (
                                        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                    )}
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {selectedProduct && (
                        <View style={[styles.selectedBanner, { backgroundColor: colors.surfaceLight, borderColor: colors.primary }]}>
                            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(14) }}>Selected: {selectedProduct.name}</Text>
                            <Text style={{ color: colors.accent, fontSize: fs(13) }}>Original Price: ₱{selectedProduct.price}</Text>
                        </View>
                    )}

                    {/* Discounted Price */}
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(15), marginTop: 12 }]}>2. Set Discounted Price</Text>
                    <TextInput
                        style={[styles.priceInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, fontSize: fs(16) }]}
                        placeholder="Enter discounted price"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="numeric"
                        value={discountedPrice}
                        onChangeText={(text) => { setDiscountedPrice(text); setDiscountError(''); }}
                    />
                    {discountError ? (
                        <Text style={{ color: colors.danger, fontSize: fs(12), marginBottom: 8 }}>{discountError}</Text>
                    ) : null}
                    {selectedProduct && discountedPrice ? (
                        <Text style={{ color: colors.success, fontSize: fs(12), marginBottom: 8 }}>
                            Discount: {Math.round((1 - parseFloat(discountedPrice) / selectedProduct.price) * 100)}% off
                        </Text>
                    ) : null}

                    {/* Duration */}
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(15), marginTop: 4 }]}>3. Set Time Limit</Text>
                    <View style={styles.durationRow}>
                        {DURATIONS.map(d => (
                            <TouchableOpacity
                                key={d.value}
                                style={[styles.durChip, {
                                    backgroundColor: duration === d.value ? colors.primary : colors.surfaceLight,
                                    borderRadius: ws(8),
                                }]}
                                onPress={() => setDuration(d.value)}
                            >
                                <Text style={{
                                    color: duration === d.value ? colors.textOnPrimary : colors.textSecondary,
                                    fontSize: fs(12),
                                    fontWeight: duration === d.value ? 'bold' : 'normal',
                                }}>{d.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Target Users */}
                    <Text style={[styles.sectionTitle, { color: colors.text, fontSize: fs(15), marginTop: 12 }]}>4. Target Users</Text>
                    <View style={styles.durationRow}>
                        {TARGET_OPTIONS.map(t => (
                            <TouchableOpacity
                                key={t.value}
                                style={[styles.durChip, {
                                    backgroundColor: targetUsers === t.value ? colors.secondary : colors.surfaceLight,
                                    borderRadius: ws(8),
                                }]}
                                onPress={() => setTargetUsers(t.value)}
                            >
                                <Text style={{
                                    color: targetUsers === t.value ? colors.textOnPrimary : colors.textSecondary,
                                    fontSize: fs(12),
                                    fontWeight: targetUsers === t.value ? 'bold' : 'normal',
                                }}>{t.label}</Text>
                            </TouchableOpacity>
                        ))}
                    </View>

                    {/* Submit */}
                    <TouchableOpacity
                        style={[styles.createBtn, { backgroundColor: colors.primary, marginTop: 16, marginBottom: 32 }]}
                        onPress={handleCreate}
                        disabled={creating}
                    >
                        {creating ? (
                            <ActivityIndicator color={colors.textOnPrimary} />
                        ) : (
                            <>
                                <Ionicons name="megaphone-outline" size={20} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', fontSize: fs(15), marginLeft: 8 }}>Create Promotion</Text>
                            </>
                        )}
                    </TouchableOpacity>
                </ScrollView>
            ) : (
                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: spacing.md }}>
                    {activePromos.length === 0 && expiredPromos.length === 0 ? (
                        <View style={styles.emptyContainer}>
                            <Ionicons name="pricetag-outline" size={50} color={colors.surfaceLight} />
                            <Text style={{ color: colors.textSecondary, marginTop: 8 }}>No promotions yet</Text>
                        </View>
                    ) : null}

                    {activePromos.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: colors.success, fontSize: fs(15) }]}>
                                <Ionicons name="flame" size={16} color={colors.success} /> Active Promotions
                            </Text>
                            {activePromos.map(promo => (
                                <View key={promo._id} style={[styles.promoCard, { backgroundColor: colors.surface, borderLeftColor: colors.success }]}>
                                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                        {promo.product?.image ? (
                                            <Image source={{ uri: promo.product.image }} style={styles.promoThumb} />
                                        ) : null}
                                        <View style={{ flex: 1, marginLeft: 8 }}>
                                            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(14) }}>{promo.product?.name}</Text>
                                            <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 2 }}>
                                                <Text style={{ color: colors.textSecondary, textDecorationLine: 'line-through', fontSize: fs(12) }}>₱{promo.originalPrice}</Text>
                                                <Text style={{ color: colors.accent, fontWeight: 'bold', fontSize: fs(14), marginLeft: 8 }}>₱{promo.discountedPrice}</Text>
                                            </View>
                                        </View>
                                    </View>
                                    <PromotionCountdown endTime={promo.endTime} />
                                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
                                        <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>Target: {promo.targetUsers}</Text>
                                        <TouchableOpacity onPress={() => handleDeactivate(promo._id)}>
                                            <Text style={{ color: colors.danger, fontSize: fs(12), fontWeight: '600' }}>End Promo</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            ))}
                        </>
                    )}

                    {expiredPromos.length > 0 && (
                        <>
                            <Text style={[styles.sectionTitle, { color: colors.textSecondary, fontSize: fs(15), marginTop: 16 }]}>Past Promotions</Text>
                            {expiredPromos.slice(0, 20).map(promo => (
                                <View key={promo._id} style={[styles.promoCard, { backgroundColor: colors.surface, borderLeftColor: colors.textSecondary, opacity: 0.7 }]}>
                                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: fs(13) }}>{promo.product?.name}</Text>
                                    <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>
                                        ₱{promo.originalPrice} → ₱{promo.discountedPrice} | {formatPHDate(promo.startTime)} - {formatPHDate(promo.endTime)}
                                    </Text>
                                </View>
                            ))}
                        </>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    tabRow: { flexDirection: 'row', borderBottomWidth: 1, paddingHorizontal: 16 },
    tabBtn: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 16 },
    sectionTitle: { fontWeight: 'bold', marginBottom: 8 },
    catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 16, marginRight: 6 },
    productItem: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, borderWidth: 1, marginBottom: 4 },
    productThumb: { width: 40, height: 40, borderRadius: 6, backgroundColor: '#222' },
    selectedBanner: { padding: 10, borderRadius: 8, borderWidth: 1, marginBottom: 8 },
    priceInput: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 4 },
    durationRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 4 },
    durChip: { paddingHorizontal: 12, paddingVertical: 8 },
    createBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 14, borderRadius: 10 },
    emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40 },
    promoCard: { padding: 12, borderRadius: 10, borderLeftWidth: 4, marginBottom: 10, elevation: 2 },
    promoThumb: { width: 44, height: 44, borderRadius: 8, backgroundColor: '#222' },
});

export default Promotions;
