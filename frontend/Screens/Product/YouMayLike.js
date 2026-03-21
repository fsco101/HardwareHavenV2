import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, Image, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const YouMayLike = ({
    products = [],
    currentProductId = '',
    currentCategoryId = '',
    title = 'You May Also Like',
    limit = 8,
}) => {
    const navigation = useNavigation();
    const colors = useTheme();
    const { ws, fs, spacing } = useResponsive();

    const cleanUri = (value) => {
        const uri = String(value || '').trim();
        return uri ? uri : '';
    };

    const fallbackImage = 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
    const [slideshowTick, setSlideshowTick] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setSlideshowTick((prev) => prev + 1);
        }, 2600);

        return () => clearInterval(timer);
    }, []);

    const openProductDetail = (item) => {
        if (navigation && typeof navigation.push === 'function') {
            navigation.push('Product Detail', { item });
            return;
        }
        navigation.navigate('Product Detail', { item });
    };

    const suggestions = useMemo(() => {
        const safeCurrentId = String(currentProductId || '');
        const safeCategoryId = String(currentCategoryId || '');

        const others = (Array.isArray(products) ? products : []).filter((item) => String(item?._id || item?.id || '') !== safeCurrentId);

        const sameCategory = safeCategoryId
            ? others.filter((item) => String(item?.category?.id || item?.category || '') === safeCategoryId)
            : [];

        const merged = [...sameCategory, ...others];

        const deduped = [];
        const seen = new Set();
        for (const item of merged) {
            const id = String(item?._id || item?.id || '');
            if (!id || seen.has(id)) continue;
            seen.add(id);
            deduped.push(item);
        }

        return deduped.slice(0, Math.max(1, Number(limit) || 8));
    }, [products, currentProductId, currentCategoryId, limit]);

    if (!suggestions.length) {
        return null;
    }

    return (
        <View style={{ marginTop: spacing.md }}>
            <Text style={{ color: colors.text, fontSize: fs(16), fontWeight: '800', marginBottom: spacing.sm }}>
                {title}
            </Text>

            <FlatList
                horizontal
                showsHorizontalScrollIndicator={false}
                data={suggestions}
                keyExtractor={(item) => String(item?._id || item?.id)}
                renderItem={({ item }) => {
                    const imagePool = [
                        cleanUri(item?.image),
                        ...(Array.isArray(item?.images) ? item.images.map((img) => cleanUri(img)) : []),
                    ].filter(Boolean);
                    const uniqueImages = Array.from(new Set(imagePool));
                    const imagesForCard = uniqueImages.length > 0 ? uniqueImages : [fallbackImage];
                    const activeImageIndex = slideshowTick % imagesForCard.length;
                    const imageUri = imagesForCard[activeImageIndex];
                    const itemPrice = Number(item?.price || 0);

                    return (
                        <TouchableOpacity
                            activeOpacity={0.85}
                            style={[
                                styles.card,
                                {
                                    width: ws(140),
                                    marginRight: spacing.sm,
                                    backgroundColor: colors.surface,
                                    borderColor: colors.border,
                                    borderRadius: ws(10),
                                    padding: spacing.xs + 2,
                                },
                            ]}
                            onPress={() => openProductDetail(item)}
                        >
                            <Image
                                source={{ uri: imageUri }}
                                style={{ width: '100%', height: ws(92), borderRadius: ws(8), backgroundColor: colors.inputBg }}
                                resizeMode="cover"
                            />

                            {imagesForCard.length > 1 ? (
                                <View style={{ flexDirection: 'row', justifyContent: 'center', marginTop: 6 }}>
                                    {imagesForCard.map((_, idx) => (
                                        <View
                                            key={`${String(item?._id || item?.id)}-dot-${idx}`}
                                            style={{
                                                width: idx === activeImageIndex ? 10 : 6,
                                                height: 6,
                                                borderRadius: 999,
                                                marginHorizontal: 2,
                                                backgroundColor: idx === activeImageIndex ? colors.primary : colors.textSecondary,
                                                opacity: idx === activeImageIndex ? 1 : 0.45,
                                            }}
                                        />
                                    ))}
                                </View>
                            ) : null}

                            <Text
                                style={{ color: colors.text, fontSize: fs(12), fontWeight: '700', marginTop: spacing.xs }}
                                numberOfLines={2}
                            >
                                {item?.name || 'Product'}
                            </Text>

                            <Text style={{ color: colors.accent, fontSize: fs(13), fontWeight: '800', marginTop: 2 }}>
                                P{itemPrice.toFixed(2)}
                            </Text>
                        </TouchableOpacity>
                    );
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
    },
});

export default YouMayLike;
