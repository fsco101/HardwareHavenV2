import React from 'react';
import { View, StyleSheet } from 'react-native'
import { FlatList, TouchableOpacity } from 'react-native';
import { Text, Avatar, Divider } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const SearchedProduct = ({ productsFiltered }) => {
    const navigation = useNavigation();
    const colors = useTheme();
    const { width, fs, spacing, ms } = useResponsive();
    return (
        <View style={{ width: width, flex: 1, backgroundColor: colors.background }}>
            {productsFiltered.length > 0 ? (
                <FlatList
                    data={productsFiltered}
                    renderItem={({ item }) =>
                        <TouchableOpacity
                            style={[styles.itemRow, { backgroundColor: colors.surface, borderBottomColor: colors.border, padding: spacing.sm + 4 }]}
                            onPress={() => navigation.navigate("Product Detail", { item })}
                        >
                            <Avatar.Image size={ms(40, 0.3)}
                                source={{
                                    uri: item.image ?
                                        item.image : 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png'
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
})

export default SearchedProduct;