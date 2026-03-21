import React, { useCallback } from "react";
import { View, FlatList, Text, ActivityIndicator } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import OrderCard from "../../Shared/OrderCard";
import { useTheme } from '../../Theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../Redux/Actions/orderActions';
import { useResponsive } from '../../assets/common/responsive';

const Orders = (props) => {
    const colors = useTheme();
    const { fs } = useResponsive();
    const dispatch = useDispatch();
    const orderList = useSelector((state) => state.orders.orders);
    const loading = useSelector((state) => state.orders.loading);
    const error = useSelector((state) => state.orders.error);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchOrders());
        }, [dispatch])
    )

    const getOrders = () => {
        dispatch(fetchOrders());
    }

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            {loading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <ActivityIndicator size="large" color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, marginTop: 10, fontSize: fs(13) }}>
                        Loading orders...
                    </Text>
                </View>
            ) : null}

            <FlatList
                data={orderList || []}
                renderItem={({ item }) => (
                    <OrderCard item={item} update={true} onRefresh={getOrders} />
                )}
                keyExtractor={(item, index) => String(item?.id || item?._id || index)}
                ListEmptyComponent={!loading ? (
                    <View style={{ padding: 24, alignItems: 'center' }}>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(13), textAlign: 'center' }}>
                            {error ? `Failed to load orders: ${error}` : 'No orders found.'}
                        </Text>
                    </View>
                ) : null}
            />
        </View>
    )
}

export default Orders;