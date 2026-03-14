import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const ChartContainer = ({ title, subtitle, children, pinnedLabel, pinnedValue }) => {
    const colors = useTheme();
    const { fs, spacing } = useResponsive();

    return (
        <View style={[styles.wrapper, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.sm }]}> 
            <Text style={[styles.title, { color: colors.text, fontSize: fs(16) }]}>{title}</Text>
            {!!subtitle && <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fs(12) }]}>{subtitle}</Text>}
            <View style={{ marginTop: spacing.sm }}>{children}</View>
            {!!pinnedLabel && (
                <View style={[styles.pinCard, { backgroundColor: colors.surfaceLight, borderColor: colors.border, marginTop: spacing.sm }]}> 
                    <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>{pinnedLabel}</Text>
                    <Text style={{ color: colors.text, fontSize: fs(13), fontWeight: '700', marginTop: 2 }}>{pinnedValue}</Text>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        marginBottom: 12,
    },
    title: {
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 4,
    },
    pinCard: {
        borderWidth: 1,
        borderRadius: 10,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
});

export default ChartContainer;
