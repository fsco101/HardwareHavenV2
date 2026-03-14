import React, { useContext } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { View } from "react-native";
import HomeNavigator from "./HomeNavigator";
import { Ionicons } from "@expo/vector-icons";
import CartNavigator from "./CartNavigator";
import CartIcon from "../Shared/CartIcon";
import UserNavigator from "./UserNavigator";
import AdminNavigator from "./AdminNavigator";
import OrdersNavigator from "./OrdersNavigator";
import Login from "../Screens/User/Login";
import Register from "../Screens/User/Register";
import { useTheme } from '../Theme/theme';
import AuthGlobal from '../Context/Store/AuthGlobal';

const Tab = createBottomTabNavigator();

const Main = () => {
    const colors = useTheme();
    const context = useContext(AuthGlobal);
    const isAdmin = context.stateUser?.user?.isAdmin === true;
    const isAuthenticated = context.stateUser?.isAuthenticated === true;
    const isGuest = !isAuthenticated;

    return (
        <Tab.Navigator
            initialRouteName="Home"
            screenOptions={{
                headerShown: false,
                tabBarHideOnKeyboard: true,
                tabBarShowLabel: false,
                tabBarActiveTintColor: colors.primary,
                tabBarInactiveTintColor: colors.textSecondary,
                tabBarStyle: {
                    backgroundColor: colors.tabBarBg,
                    borderTopColor: colors.border,
                    borderTopWidth: 1,
                    elevation: 10,
                    height: 60,
                    paddingBottom: 6,
                    paddingTop: 6,
                },
                tabBarItemStyle: {
                    flex: 1,
                    alignItems: 'center',
                    justifyContent: 'center',
                },
            }}
        >
            <Tab.Screen
                name="Home"
                component={HomeNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="home" style={{ position: "relative" }} color={color} size={30} />
                    ),
                }}
            />
            <Tab.Screen
                name="Cart Screen"
                component={CartNavigator}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color }) => (
                        <>
                            <Ionicons name="cart" style={{ position: "relative" }} color={color} size={30} />
                            <CartIcon />
                        </>
                    ),
                }}
            />
            {isGuest && (
                <Tab.Screen
                    name="Login"
                    component={Login}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="log-in-outline" style={{ position: "relative" }} color={color} size={30} />
                        ),
                    }}
                />
            )}
            {isGuest && (
                <Tab.Screen
                    name="Register"
                    component={Register}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="person-add-outline" style={{ position: "relative" }} color={color} size={30} />
                        ),
                    }}
                />
            )}
            {isAuthenticated && (
                <Tab.Screen
                    name="Orders"
                    component={OrdersNavigator}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="receipt" style={{ position: "relative" }} color={color} size={30} />
                        ),
                    }}
                />
            )}
            {isAdmin && (
                <Tab.Screen
                    name="Admin"
                    component={AdminNavigator}
                    options={{
                        headerShown: false,
                        tabBarIcon: ({ color }) => (
                            <Ionicons name="cog" style={{ position: "relative" }} color={color} size={30} />
                        ),
                    }}
                />
            )}
            <Tab.Screen
                name="User"
                component={UserNavigator}
                options={{
                    tabBarIcon: ({ color }) => (
                        <Ionicons name="person" style={{ position: "relative" }} color={color} size={30} />
                    ),
                    // Keep route mounted for nested navigation (e.g., Drawer Login/Register),
                    // but hide the tab entry for guest users.
                    ...(isAuthenticated ? {} : { tabBarButton: () => null }),
                }}
                listeners={({ navigation }) => ({
                    tabPress: (e) => {
                        e.preventDefault();
                        if (isAuthenticated) {
                            navigation.navigate('User', { screen: 'User Profile' });
                        } else {
                            navigation.navigate('User', { screen: 'Login' });
                        }
                    },
                })}
            />
        </Tab.Navigator>
    )
}
export default Main