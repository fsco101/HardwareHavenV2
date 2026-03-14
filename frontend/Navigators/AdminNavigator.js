import React from "react"
import { createStackNavigator } from "@react-navigation/stack"

import Orders from "../Screens/Admin/Orders"
import Products from "../Screens/Admin/Products"
import ProductForm from "../Screens/Admin/ProductForm"
import Categories from "../Screens/Admin/Categories"
import Dashboard from "../Screens/Admin/Dashboard"
import Promotions from "../Screens/Admin/Promotions"
import { darkColors } from '../Theme/theme';

const Stack = createStackNavigator();

const AdminNavigator = () => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: darkColors.headerBg },
                headerTintColor: darkColors.text,
                headerTitleStyle: { color: darkColors.text },
            }}
        >
            <Stack.Screen
                name="Dashboard"
                component={Dashboard}
                options={{ title: "Dashboard" }}
            />
            <Stack.Screen
                name="Products"
                component={Products}
                options={{ title: "Products" }}
            />
            <Stack.Screen name="Categories" component={Categories} />
            <Stack.Screen name="Orders" component={Orders} />
            <Stack.Screen name="ProductForm" component={ProductForm} />
            <Stack.Screen name="Promotions" component={Promotions} />
        </Stack.Navigator>
    )
}
export default AdminNavigator