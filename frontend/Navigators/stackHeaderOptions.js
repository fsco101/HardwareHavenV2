export const buildStackHeaderOptions = (colors) => ({
    headerStyle: {
        backgroundColor: colors.headerBg,
        height: 56,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
        elevation: 0,
        shadowOpacity: 0,
    },
    headerTintColor: colors.text,
    headerTitleStyle: {
        color: colors.text,
        fontWeight: '700',
        fontSize: 16,
    },
    headerTitleAlign: 'center',
    headerTitleAllowFontScaling: false,
    headerBackTitleVisible: false,
    headerStatusBarHeight: 0,
});
