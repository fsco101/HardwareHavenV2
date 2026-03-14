import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native'
import { Text, TextInput, Searchbar, ActivityIndicator } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import ProductList from './ProductList'
import SearchedProduct from "./SearchedProduct";
import Banner from "../../Shared/Banner";
import CategoryFilter from "./CategoryFilter";
import axios from "axios";
import baseURL from "../../config/api";
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts } from '../../Redux/Actions/productActions';

const ProductContainer = () => {
    const INITIAL_VISIBLE_ITEMS = 12;
    const LOAD_MORE_BATCH = 8;

    const colors = useTheme();
    const { ws, fs, spacing, hp } = useResponsive();
    const dispatch = useDispatch();
    const productsState = useSelector((state) => state.products);
    const [products, setProducts] = useState([])
    const [productsFiltered, setProductsFiltered] = useState([]);
    const [focus, setFocus] = useState(false);
    const [categories, setCategories] = useState([]);
    const [active, setActive] = useState(-1);
    const [productsCtg, setProductsCtg] = useState([])
    const [keyword, setKeyword] = useState('')
    const [loading, setLoading] = useState(true)
    const [selectedCategoryId, setSelectedCategoryId] = useState('all');
    const [ratingMin, setRatingMin] = useState(0);
    const [priceMin, setPriceMin] = useState('');
    const [priceMax, setPriceMax] = useState('');
    const [selectedPricePreset, setSelectedPricePreset] = useState(null);
    const [showAdvancedFilters, setShowAdvancedFilters] = useState(true);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_ITEMS);
    const [loadingMore, setLoadingMore] = useState(false);

    const pricePresets = [
        { key: 'all', label: 'Any Price', min: '', max: '' },
        { key: 'budget', label: 'Under 500', min: '', max: '500' },
        { key: 'mid', label: '500 - 1500', min: '500', max: '1500' },
        { key: 'pro', label: '1500 - 5000', min: '1500', max: '5000' },
        { key: 'premium', label: '5000+', min: '5000', max: '' },
    ];

    const applyClientFilters = useCallback((sourceProducts = [], options = {}) => {
        const {
            categoryId = selectedCategoryId,
            searchText = keyword,
            minRating = ratingMin,
            minPriceText = priceMin,
            maxPriceText = priceMax,
        } = options;

        let nextProducts = [...sourceProducts];

        if (categoryId && categoryId !== 'all') {
            nextProducts = nextProducts.filter((item) => (item.category !== null && item.category.id) === categoryId);
        }

        if (searchText) {
            nextProducts = nextProducts.filter((item) =>
                String(item.name || '').toLowerCase().includes(String(searchText).toLowerCase())
            );
        }

        if (minRating > 0) {
            nextProducts = nextProducts.filter((item) => Number(item.rating || 0) >= minRating);
        }

        const minPriceValue = Number(minPriceText);
        if (!Number.isNaN(minPriceValue) && minPriceText !== '') {
            nextProducts = nextProducts.filter((item) => Number(item.price || 0) >= minPriceValue);
        }

        const maxPriceValue = Number(maxPriceText);
        if (!Number.isNaN(maxPriceValue) && maxPriceText !== '') {
            nextProducts = nextProducts.filter((item) => Number(item.price || 0) <= maxPriceValue);
        }

        return nextProducts;
    }, [keyword, priceMax, priceMin, ratingMin, selectedCategoryId]);

    const updateFilteredProducts = useCallback((overrides = {}) => {
        const filtered = applyClientFilters(products, overrides);
        setProductsFiltered(filtered);
        setProductsCtg(filtered);
    }, [applyClientFilters, products]);

    const searchProduct = (text) => {
        setKeyword(text);
        setFocus(true);
        updateFilteredProducts({ searchText: text });
    };

    const onBlur = () => {
        setFocus(false);
    };

    const changeCtg = (ctg) => {
        setSelectedCategoryId(ctg);
        updateFilteredProducts({ categoryId: ctg });
    };

    const resetAdvancedFilters = () => {
        setRatingMin(0);
        setPriceMin('');
        setPriceMax('');
        setSelectedPricePreset('all');
        setSelectedCategoryId('all');
        setActive(-1);
        updateFilteredProducts({
            categoryId: 'all',
            minRating: 0,
            minPriceText: '',
            maxPriceText: '',
        });
    };

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    useEffect(() => {
        updateFilteredProducts();
    }, [updateFilteredProducts]);

    useEffect(() => {
        setVisibleCount(INITIAL_VISIBLE_ITEMS);
    }, [productsCtg.length]);

    useEffect(() => {
        if (Array.isArray(productsState.items)) {
            setProducts(productsState.items);
            setProductsFiltered(productsState.items);
            setProductsCtg(productsState.items);
        }
        setLoading(productsState.loading);
    }, [productsState.items, productsState.loading]);

    useFocusEffect((
        useCallback(
            () => {
                setFocus(false);
                setActive(-1);
                setSelectedCategoryId('all');
                setSelectedPricePreset('all');
                setShowAdvancedFilters(true);
                dispatch(fetchProducts());

                axios
                    .get(`${baseURL}categories`)
                    .then((res) => {
                        setCategories(res.data)
                    })
                    .catch((error) => {
                        console.log('Api categories call error:', error?.message || error)
                    })

                return () => {
                    setProducts([]);
                    setProductsFiltered([]);
                    setFocus(false);
                    setCategories([]);
                    setActive(-1);
                };
            },
            [dispatch],
        )
    ))

    const toggleAdvancedFilters = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setShowAdvancedFilters((prev) => !prev);
    };

    const loadMoreProducts = useCallback(() => {
        if (loadingMore || visibleCount >= productsCtg.length) {
            return;
        }

        setLoadingMore(true);
        setVisibleCount((prev) => Math.min(prev + LOAD_MORE_BATCH, productsCtg.length));
        setTimeout(() => setLoadingMore(false), 150);
    }, [loadingMore, productsCtg.length, visibleCount]);

    const handleListScroll = ({ nativeEvent }) => {
        const paddingToBottom = 180;
        const reachedBottom = nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >= nativeEvent.contentSize.height - paddingToBottom;

        if (reachedBottom) {
            loadMoreProducts();
        }
    };

    const visibleProducts = productsCtg.slice(0, visibleCount);
    const hasMoreProducts = visibleCount < productsCtg.length;

    return (
        <View style={[styles.mainContainer, { backgroundColor: colors.background }]}>
            <Searchbar
                placeholder="Search hardware..."
                onChangeText={searchProduct}
                value={keyword}
                onClearIconPress={onBlur}
                style={{ backgroundColor: colors.inputBg, margin: spacing.sm, borderRadius: ws(12) }}
                inputStyle={{ color: colors.text, fontSize: fs(15) }}
                placeholderTextColor={colors.textSecondary}
                iconColor={colors.primary}
            />
            {focus === true ? (
                <SearchedProduct productsFiltered={productsFiltered} />
            ) : (
                <ScrollView onScroll={handleListScroll} scrollEventThrottle={16}>
                    <View>
                        <Banner />
                    </View>
                    <View>
                        <CategoryFilter
                            categories={categories}
                            categoryFilter={changeCtg}
                            productsCtg={productsCtg}
                            active={active}
                            setActive={setActive}
                        />
                    </View>
                    <View style={[styles.filtersCard, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.sm, marginBottom: spacing.sm, padding: spacing.md }]}> 
                        <View style={styles.filterHeadRow}>
                            <TouchableOpacity style={styles.filterTitleWrap} onPress={toggleAdvancedFilters} activeOpacity={0.75}>
                                <Ionicons name="options-outline" size={18} color={colors.primary} />
                                <Text style={{ color: colors.primary, fontSize: fs(15), fontWeight: '700', marginLeft: 6 }}>
                                    Advanced Filters
                                </Text>
                                <Ionicons
                                    name={showAdvancedFilters ? 'chevron-up' : 'chevron-down'}
                                    size={18}
                                    color={colors.textSecondary}
                                    style={{ marginLeft: 6 }}
                                />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.clearBtn, { borderColor: colors.border }]}
                                onPress={resetAdvancedFilters}
                                activeOpacity={0.75}
                            >
                                <Ionicons name="refresh" size={14} color={colors.textSecondary} />
                                <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginLeft: 4 }}>Reset</Text>
                            </TouchableOpacity>
                        </View>

                        {showAdvancedFilters ? (
                            <>
                                <Text style={[styles.filterLabel, { color: colors.textSecondary, fontSize: fs(12) }]}>Rating</Text>
                                <View style={styles.ratingRow}>
                                    {[0, 1, 2, 3, 4, 5].map((value) => (
                                        <TouchableOpacity
                                            key={value}
                                            style={[
                                                styles.ratingChip,
                                                {
                                                    backgroundColor: ratingMin === value ? colors.primary : colors.surfaceLight,
                                                    borderColor: ratingMin === value ? colors.primary : colors.border,
                                                }
                                            ]}
                                            onPress={() => {
                                                setRatingMin(value);
                                                updateFilteredProducts({ minRating: value });
                                            }}
                                            activeOpacity={0.75}
                                        >
                                            <Ionicons
                                                name={value === 0 ? 'sparkles-outline' : 'star'}
                                                size={13}
                                                color={ratingMin === value ? colors.textOnPrimary : colors.accent}
                                                style={{ marginRight: 4 }}
                                            />
                                            <Text style={{ color: ratingMin === value ? colors.textOnPrimary : colors.text, fontSize: fs(12), fontWeight: '600' }}>
                                                {value === 0 ? 'Any' : `${value}+`}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                <Text style={[styles.filterLabel, { color: colors.textSecondary, fontSize: fs(12), marginTop: spacing.sm + 2 }]}>Price Range</Text>
                                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingVertical: 2 }}>
                                    <View style={styles.presetRow}>
                                        {pricePresets.map((preset) => {
                                            const activePreset = selectedPricePreset === preset.key;
                                            return (
                                                <TouchableOpacity
                                                    key={preset.key}
                                                    style={[
                                                        styles.presetChip,
                                                        {
                                                            backgroundColor: activePreset ? colors.secondary : colors.surfaceLight,
                                                            borderColor: activePreset ? colors.secondary : colors.border,
                                                        },
                                                    ]}
                                                    onPress={() => {
                                                        setSelectedPricePreset(preset.key);
                                                        setPriceMin(preset.min);
                                                        setPriceMax(preset.max);
                                                        updateFilteredProducts({ minPriceText: preset.min, maxPriceText: preset.max });
                                                    }}
                                                    activeOpacity={0.75}
                                                >
                                                    <Text style={{ color: activePreset ? colors.textOnPrimary : colors.text, fontSize: fs(12), fontWeight: '600' }}>
                                                        {preset.label}
                                                    </Text>
                                                </TouchableOpacity>
                                            );
                                        })}
                                    </View>
                                </ScrollView>

                                <View style={styles.priceRow}>
                                    <TextInput
                                        mode="outlined"
                                        label="Min Price"
                                        value={priceMin}
                                        onChangeText={(text) => {
                                            setSelectedPricePreset(null);
                                            setPriceMin(text);
                                            updateFilteredProducts({ minPriceText: text });
                                        }}
                                        keyboardType="numeric"
                                        style={[styles.priceInput, { backgroundColor: colors.inputBg }]}
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.primary}
                                        textColor={colors.text}
                                    />
                                    <TextInput
                                        mode="outlined"
                                        label="Max Price"
                                        value={priceMax}
                                        onChangeText={(text) => {
                                            setSelectedPricePreset(null);
                                            setPriceMax(text);
                                            updateFilteredProducts({ maxPriceText: text });
                                        }}
                                        keyboardType="numeric"
                                        style={[styles.priceInput, { backgroundColor: colors.inputBg }]}
                                        outlineColor={colors.border}
                                        activeOutlineColor={colors.primary}
                                        textColor={colors.text}
                                    />
                                </View>
                            </>
                        ) : null}

                        <View style={styles.activeFilterRow}>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>Active:</Text>
                            <Text style={{ color: colors.text, fontSize: fs(12), marginLeft: 6 }}>
                                {ratingMin > 0 ? `${ratingMin}+ stars` : 'Any rating'}
                                {' • '}
                                {priceMin || priceMax ? `P${priceMin || 0} - P${priceMax || 'up'}` : 'Any price'}
                            </Text>
                        </View>
                    </View>
                    {loading ? (
                        <View style={[styles.center, { height: hp(20) }]}> 
                            <ActivityIndicator animating={true} color={colors.primary} />
                        </View>
                    ) : null}
                    {productsCtg.length > 0 ? (
                        <View style={[styles.listContainer, { backgroundColor: colors.background }]}>
                            {visibleProducts.map((item) => {
                                return (
                                    <ProductList key={item.id} item={item} />
                                )
                            })}
                        </View>
                    ) : (
                        <View style={[styles.center, { height: hp(40) }]}>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>No products found</Text>
                        </View>
                    )}
                    {hasMoreProducts ? (
                        <View style={[styles.center, { paddingBottom: spacing.lg, paddingTop: spacing.sm }]}> 
                            {loadingMore ? (
                                <ActivityIndicator animating={true} color={colors.primary} />
                            ) : (
                                <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>Scroll to load more products</Text>
                            )}
                        </View>
                    ) : null}
                </ScrollView>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    mainContainer: {
        flex: 1,
    },
    listContainer: {
        flex: 1,
        flexDirection: "row",
        alignItems: "flex-start",
        flexWrap: "wrap",
        paddingBottom: 20,
    },
    center: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    filtersCard: {
        borderWidth: 1,
        borderRadius: 12,
    },
    filterHeadRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    filterTitleWrap: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    filterLabel: {
        fontWeight: '600',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    ratingChip: {
        paddingHorizontal: 10,
        paddingVertical: 7,
        borderRadius: 999,
        borderWidth: 1,
        flexDirection: 'row',
        alignItems: 'center',
    },
    presetRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
    },
    presetChip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 7,
    },
    priceRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 2,
    },
    priceInput: {
        flex: 1,
    },
    clearBtn: {
        alignSelf: 'flex-start',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderWidth: 1,
        borderRadius: 999,
    },
    activeFilterRow: {
        marginTop: 10,
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    }
});

export default ProductContainer;