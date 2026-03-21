import React from 'react'
import { createStackNavigator } from "@react-navigation/stack"
import ProductContainer from '../Screens/Product/ProductContainer';
import SingleProduct from '../Screens/Product/SingleProduct';
import { darkColors } from '../Theme/theme';
import { buildStackHeaderOptions } from './stackHeaderOptions';

const Stack = createStackNavigator()
function MyStack() {
    return (
        <Stack.Navigator
            screenOptions={buildStackHeaderOptions(darkColors)}
        >
            <Stack.Screen
                name='Main'
                component={ProductContainer}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name='Product Detail'
                component={SingleProduct}
                options={{ headerShown: true }}
            />
        </Stack.Navigator>
    )
}

export default function HomeNavigator() {
    return <MyStack />;
}