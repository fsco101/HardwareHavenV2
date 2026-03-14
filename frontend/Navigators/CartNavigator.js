import React from 'react'
import { createStackNavigator } from "@react-navigation/stack"

import Cart from '../Screens/Cart/Cart';
import CheckoutNavigator from './CheckoutNavigator';
import { darkColors } from '../Theme/theme';

const Stack = createStackNavigator();

function MyStack() {
    return(
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: darkColors.headerBg },
                headerTintColor: darkColors.text,
            }}
        >
            <Stack.Screen 
                name="Cart"
                component={Cart}
                options={{ headerShown: false }}
            />
            <Stack.Screen 
                name="Checkout"
                component={CheckoutNavigator}
                initialParams={{ enableQuantityInput: true }}
                options={{ title: 'Checkout' }}
            />
        </Stack.Navigator>
    )
}

export default function CartNavigator() {
    return <MyStack />
}