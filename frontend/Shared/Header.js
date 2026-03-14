import React, { useContext } from "react"
import { StyleSheet, View, Text, TouchableOpacity } from "react-native"
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';
import NotificationBell from './NotificationBell';
import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { navigationRef } from '../Navigators/navigationRef';
import AuthGlobal from '../Context/Store/AuthGlobal';

const Header = () => {
    const auth = useContext(AuthGlobal);
    const colors = useTheme();
    const { fs, spacing, ms, ws } = useResponsive();
    const isAuthenticated = auth?.stateUser?.isAuthenticated === true;

    const toggleDrawer = () => {
        if (navigationRef.isReady()) {
            navigationRef.dispatch(DrawerActions.toggleDrawer());
        }
    };

    return (
        <SafeAreaView style={[styles.header, { backgroundColor: colors.headerBg, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg }]}>
            <TouchableOpacity
                onPress={toggleDrawer}
                activeOpacity={0.75}
                style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                    borderWidth: 1,
                    borderRadius: ws(10),
                    paddingHorizontal: spacing.sm,
                    paddingVertical: spacing.xs + 1,
                    marginRight: spacing.sm,
                }}
            >
                <Ionicons name="menu" size={ms(18, 0.3)} color={colors.primary} />
                <Text style={{ color: colors.textSecondary, fontWeight: '600', marginLeft: 4, fontSize: fs(12) }}>Menu</Text>
            </TouchableOpacity>
            <View style={styles.logoRow}>
                <Text style={[styles.brandText, { color: colors.primary, fontSize: fs(22) }]}>Hardware</Text>
                <Text style={[styles.brandText, { color: colors.text, fontSize: fs(22) }]}>Haven</Text>
            </View>
            {isAuthenticated ? <NotificationBell /> : <View style={{ width: ws(30) }} />}
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    header: {
        width: "100%",
        flexDirection: 'row',
        alignContent: "center",
        justifyContent: "space-between",
        alignItems: 'center',
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    brandText: {
        fontWeight: 'bold',
        letterSpacing: 1,
    },
})

export default Header;