import React from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'

import Checkout from '../Screens/Checkout/Checkout';
import Payment from '../Screens/Checkout/Payment';
import Confirm from '../Screens/Checkout/Confirm';
import { darkColors } from '../Theme/theme';

const Tab = createMaterialTopTabNavigator();

function MyTabs() {
    return (
        <Tab.Navigator
            screenOptions={{
                tabBarStyle: { backgroundColor: darkColors.surface },
                tabBarActiveTintColor: darkColors.primary,
                tabBarInactiveTintColor: darkColors.textSecondary,
                tabBarIndicatorStyle: { backgroundColor: darkColors.primary },
            }}
        >
            <Tab.Screen name="Shipping" component={Checkout} />
            <Tab.Screen name="Payment" component={Payment} />
            <Tab.Screen name="Confirm" component={Confirm} />
        </Tab.Navigator>
    );
}

export default function CheckoutNavigator() {
    return <MyTabs />
}