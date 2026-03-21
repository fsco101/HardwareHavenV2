import React from 'react';
import { View, StyleSheet } from 'react-native'
import { FlatList, TouchableOpacity } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const SearchedProduct = ({
    productsFiltered,
    searchHistory = [],
    onSelectHistory,
    onClearHistory,
    onClose,
    onSelectProduct,
}) => {
    const navigation = useNavigation();
    const colors = useTheme();
    const { width, fs, spacing, ms } = useResponsive();
    const cleanUri = (value) => {
        const uri = String(value || '').trim();
        return uri ? uri : '';
    };
    const fallbackImage = 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';
    return (
        <View style={{ width: width, flex: 1, backgroundColor: colors.background }}>
            <View style={[styles.topBar, { borderBottomColor: colors.border, paddingHorizontal: spacing.sm + 4, paddingVertical: spacing.sm }]}> 
                <Text style={{ color: colors.text, fontWeight: '700', fontSize: fs(14) }}>Search Results</Text>
                <TouchableOpacity style={styles.iconBtn} onPress={onClose}>
                    <Ionicons name="close-circle-outline" size={ms(22, 0.3)} color={colors.textSecondary} />
                </TouchableOpacity>
            </View>

            {searchHistory.length > 0 ? (
                <View style={{ paddingHorizontal: spacing.sm + 4, paddingTop: spacing.xs, paddingBottom: spacing.sm }}>
                    <View style={styles.historyHeader}>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>Recent searches</Text>
                        <TouchableOpacity onPress={onClearHistory}>
                            <Text style={{ color: colors.danger, fontSize: fs(12), fontWeight: '700' }}>Clear history</Text>
                        </TouchableOpacity>
                    </View>
                    <FlatList
                        horizontal
                        data={searchHistory}
                        keyExtractor={(item, index) => `${item}-${index}`}
                        showsHorizontalScrollIndicator={false}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={[styles.historyChip, { backgroundColor: colors.surface, borderColor: colors.border }]}
                                onPress={() => onSelectHistory && onSelectHistory(item)}
                            >
                                <Ionicons name="time-outline" size={14} color={colors.textSecondary} />
                                <Text style={{ color: colors.text, marginLeft: 6, fontSize: fs(12) }}>{item}</Text>
                            </TouchableOpacity>
                        )}
                    />
                </View>
            ) : null}

            {productsFiltered.length > 0 ? (
                <FlatList
                    data={productsFiltered}
                    renderItem={({ item }) =>
                        <TouchableOpacity
                            style={[styles.itemRow, { backgroundColor: colors.surface, borderBottomColor: colors.border, padding: spacing.sm + 4 }]}
                            onPress={() => {
                                if (onSelectProduct) onSelectProduct(item);
                                navigation.navigate("Product Detail", { item });
                            }}
                        >
                            <Avatar.Image size={ms(40, 0.3)}
                                source={{
                                    uri: cleanUri(item?.image) || cleanUri(Array.isArray(item?.images) ? item.images[0] : '') || fallbackImage
                                }} />
                            <View style={{ marginLeft: spacing.sm + 4, flex: 1 }}>
                                <Text variant="labelLarge" style={{ color: colors.text, fontSize: fs(14) }}>{item.name}</Text>
                                <Text variant="bodySmall" style={{ color: colors.textSecondary, fontSize: fs(12) }} numberOfLines={1}>{item.description}</Text>
                            </View>
                            <Text variant="labelLarge" style={{ color: colors.accent, fontWeight: 'bold', fontSize: fs(14) }}>
                                ${item.price}
                            </Text>
                        </TouchableOpacity>
                    }
                    keyExtractor={item => item._id}
                />
            ) : (
                <View style={styles.center}>
                    <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>
                        No products match the selected criteria
                    </Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    center: {
        justifyContent: 'center',
        alignItems: 'center',
        height: 100
    },
    itemRow: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 12,
        borderBottomWidth: 1,
    },
    topBar: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottomWidth: 1,
    },
    iconBtn: {
        padding: 2,
    },
    historyHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    historyChip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 10,
        paddingVertical: 6,
        marginRight: 8,
    },
})

export default SearchedProduct;