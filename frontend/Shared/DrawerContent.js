import React, { useContext, useEffect, useMemo, useState } from 'react';
import { View, TouchableOpacity, Image, ScrollView } from 'react-native';
import { Drawer, Text, Switch } from 'react-native-paper';
import { useTheme, useToggleTheme, useThemeMode } from '../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../assets/common/responsive';
import { useNotifications } from '../Context/Store/NotificationContext';
import AuthGlobal from '../Context/Store/AuthGlobal';
import axios from 'axios';
import baseURL from '../config/api';
import { getToken } from '../assets/common/tokenStorage';

const DrawerContent = ({ navigation }) => {
  const [active, setActive] = useState('');
  const [profile, setProfile] = useState(null);
  const colors = useTheme();
  const toggleTheme = useToggleTheme();
  const mode = useThemeMode();
  const { fs, spacing, ms, ws } = useResponsive();
  const { openNotifications } = useNotifications();
  const auth = useContext(AuthGlobal);

  const user = auth?.stateUser?.user || {};
  const isAuthenticated = auth?.stateUser?.isAuthenticated === true;
  const isAdmin = user?.isAdmin === true;
  const userId = user?.userId;

  useEffect(() => {
    let mounted = true;

    const loadProfile = async () => {
      if (!isAuthenticated || !userId) {
        if (mounted) setProfile(null);
        return;
      }

      try {
        const token = await getToken();
        if (!token) return;

        const res = await axios.get(`${baseURL}users/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (mounted) setProfile(res.data || null);
      } catch (err) {
        if (mounted) setProfile(null);
      }
    };

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated, userId]);

  const displayName = useMemo(() => profile?.name || user?.name || 'Guest User', [profile, user]);
  const displayEmail = useMemo(() => profile?.email || user?.email || 'Sign in to access account', [profile, user]);
  const avatarUri = profile?.image || user?.image || null;

  const handleRoute = (itemKey, tabRouteName, nestedParams = undefined) => {
    setActive(itemKey);

    navigation.navigate('My app', {
      screen: tabRouteName,
      ...(nestedParams ? { params: nestedParams } : {}),
    });

    if (typeof navigation.closeDrawer === 'function') navigation.closeDrawer();
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.surface, paddingTop: spacing.xl }}>
      <View style={{ paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={{
            width: ws(52),
            height: ws(52),
            borderRadius: ws(26),
            backgroundColor: colors.surfaceLight,
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            marginRight: spacing.sm,
            borderWidth: 1,
            borderColor: colors.border,
          }}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%' }} />
            ) : (
              <Ionicons name="person" size={ms(24, 0.3)} color={colors.primary} />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={{ color: colors.text, fontSize: fs(16), fontWeight: '700' }} numberOfLines={1}>{displayName}</Text>
            <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 2 }} numberOfLines={1}>{displayEmail}</Text>
            {isAdmin ? (
              <View style={{ alignSelf: 'flex-start', marginTop: 4, backgroundColor: colors.primaryDark, borderRadius: ws(20), paddingHorizontal: spacing.xs + 4, paddingVertical: 2 }}>
                <Text style={{ color: colors.textOnPrimary, fontSize: fs(10), fontWeight: '700' }}>ADMIN</Text>
              </View>
            ) : null}
          </View>
        </View>

        <Text style={{ color: colors.primary, fontSize: fs(18), fontWeight: 'bold', marginTop: spacing.sm + 2 }}>HardwareHaven</Text>
        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: spacing.xs }}>Your one-stop hardware shop</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: spacing.md }}>
      <Drawer.Section>
        <Drawer.Item
          label="Home"
          active={active === 'Home'}
          onPress={() => handleRoute('Home', 'Home')}
          icon="home"
          theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
        />
        <Drawer.Item
          label="Cart"
          active={active === 'Cart'}
          onPress={() => handleRoute('Cart', 'Cart Screen')}
          icon="cart"
          theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
        />
        {isAuthenticated ? (
          <>
            <Drawer.Item
              label="My Orders"
              active={active === 'My Orders'}
              onPress={() => handleRoute('My Orders', 'Orders', { screen: 'My Orders' })}
              icon="package-variant-closed"
              theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
            />
            <Drawer.Item
              label="My Profile"
              active={active === 'Profile'}
              onPress={() => handleRoute('Profile', 'User', { screen: 'User Profile' })}
              icon="account"
              theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
            />
            <Drawer.Item
              label="Notifications"
              active={active === 'Notifications'}
              icon="bell"
              onPress={() => {
                setActive('Notifications');
                if (typeof navigation.closeDrawer === 'function') {
                  navigation.closeDrawer();
                }
                openNotifications();
              }}
              theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
            />
          </>
        ) : (
          <>
            <Drawer.Item
              label="Login"
              active={active === 'Login'}
              onPress={() => handleRoute('Login', 'User', { screen: 'Login' })}
              icon="login"
              theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
            />
            <Drawer.Item
              label="Register"
              active={active === 'Register'}
              onPress={() => handleRoute('Register', 'User', { screen: 'Register' })}
              icon="account-plus"
              theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
            />
          </>
        )}
      </Drawer.Section>

      {isAdmin ? (
        <Drawer.Section>
          <Text style={{ color: colors.textSecondary, fontSize: fs(12), paddingHorizontal: spacing.md, paddingBottom: spacing.xs }}>Admin Menu</Text>
          <Drawer.Item
            label="Dashboard"
            active={active === 'Dashboard'}
            onPress={() => handleRoute('Dashboard', 'Admin', { screen: 'Dashboard' })}
            icon="view-dashboard-outline"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
          <Drawer.Item
            label="Products"
            active={active === 'Products'}
            onPress={() => handleRoute('Products', 'Admin', { screen: 'Products' })}
            icon="cube-outline"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
          <Drawer.Item
            label="Categories"
            active={active === 'Categories'}
            onPress={() => handleRoute('Categories', 'Admin', { screen: 'Categories' })}
            icon="shape-outline"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
          <Drawer.Item
            label="Manage Orders"
            active={active === 'Manage Orders'}
            onPress={() => handleRoute('Manage Orders', 'Admin', { screen: 'Orders' })}
            icon="clipboard-list-outline"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
          <Drawer.Item
            label="Promotions"
            active={active === 'Promotions'}
            onPress={() => handleRoute('Promotions', 'Admin', { screen: 'Promotions' })}
            icon="tag-heart-outline"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
          <Drawer.Item
            label="User Management"
            active={active === 'User Management'}
            onPress={() => handleRoute('User Management', 'Admin', { screen: 'User Management' })}
            icon="account-cog-outline"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
          <Drawer.Item
            label="Review Management"
            active={active === 'Review Management'}
            onPress={() => handleRoute('Review Management', 'Admin', { screen: 'Review Management' })}
            icon="message-draw"
            theme={{ colors: { onSurfaceVariant: colors.text, onSecondaryContainer: colors.primary } }}
          />
        </Drawer.Section>
      ) : null}
      </ScrollView>

      <View style={{ marginTop: 'auto', borderTopWidth: 1, borderTopColor: colors.border, padding: spacing.md }}>
        <TouchableOpacity
          onPress={toggleTheme}
          activeOpacity={0.7}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: colors.surfaceLight,
            borderRadius: ws(12),
            padding: spacing.sm + 6,
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Ionicons
              name={mode === 'dark' ? 'moon' : 'sunny'}
              size={ms(22, 0.3)}
              color={colors.primary}
            />
            <Text style={{ color: colors.text, marginLeft: spacing.sm + 4, fontWeight: '600', fontSize: fs(15) }}>
              {mode === 'dark' ? 'Dark Mode' : 'Light Mode'}
            </Text>
          </View>
          <Switch
            value={mode === 'dark'}
            onValueChange={toggleTheme}
            color={colors.primary}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DrawerContent;