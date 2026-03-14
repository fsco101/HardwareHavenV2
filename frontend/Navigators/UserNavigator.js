import React from "react";
import { createStackNavigator } from '@react-navigation/stack'
import Login from "../Screens/User/Login";
import Register from "../Screens/User/Register";
import UserProfile from "../Screens/User/UserProfile";
import UserOrders from "../Screens/Orders/UserOrders";
import ResetPassword from "../Screens/User/ResetPassword";
import { darkColors } from '../Theme/theme';

const Stack = createStackNavigator();

const UserNavigator = (props) => {
    return (
        <Stack.Navigator
            screenOptions={{
                headerStyle: { backgroundColor: darkColors.headerBg },
                headerTintColor: darkColors.text,
                headerTitleStyle: { fontWeight: 'bold' },
                cardStyle: { backgroundColor: darkColors.background },
            }}
        >
            <Stack.Screen
                name="Login"
                component={Login}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Register"
                component={Register}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="User Profile"
                component={UserProfile}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="My Orders"
                component={UserOrders}
                options={{ headerShown: false }}
            />
            <Stack.Screen
                name="Reset Password"
                component={ResetPassword}
                options={{ headerShown: false }}
            />
        </Stack.Navigator>
    )
}

export default UserNavigator;