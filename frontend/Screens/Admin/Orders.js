import React, { useCallback } from "react";
import { View, FlatList } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import OrderCard from "../../Shared/OrderCard";
import { useTheme } from '../../Theme/theme';
import { useDispatch, useSelector } from 'react-redux';
import { fetchOrders } from '../../Redux/Actions/orderActions';

const Orders = (props) => {
    const colors = useTheme();
    const dispatch = useDispatch();
    const orderList = useSelector((state) => state.orders.orders);

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
            <FlatList
                data={orderList}
                renderItem={({ item }) => (
                    <OrderCard item={item} update={true} onRefresh={getOrders} />
                )}
                keyExtractor={(item) => item.id}
            />
        </View>
    )
}

export default Orders;