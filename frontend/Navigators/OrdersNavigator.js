import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import UserOrders from '../Screens/Orders/UserOrders';
import OrderDetail from '../Screens/Orders/OrderDetail';
import { darkColors } from '../Theme/theme';
import { buildStackHeaderOptions } from './stackHeaderOptions';

const Stack = createStackNavigator();

const OrdersNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={buildStackHeaderOptions(darkColors)}
        >
            <Stack.Screen
                name="My Orders"
                component={UserOrders}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Order Detail"
                component={OrderDetail}
                options={{ headerShown: true, title: 'Order Detail' }}
            />
        </Stack.Navigator>
    );
};

export default OrdersNavigator;
