import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const AnalyticsSummary = ({ insights = [] }) => {
    const colors = useTheme();
    const { fs, spacing, ms } = useResponsive();

    return (
        <View style={[styles.container, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.sm }]}> 
            <Text style={[styles.title, { color: colors.text, fontSize: fs(15) }]}>Analytics Insights</Text>
            {insights.map((line, index) => (
                <View key={`${line}-${index}`} style={styles.row}>
                    <Ionicons name="sparkles-outline" size={ms(14, 0.2)} color={colors.secondary} style={{ marginTop: 2 }} />
                    <Text style={[styles.text, { color: colors.textSecondary, fontSize: fs(12) }]}>{line}</Text>
                </View>
            ))}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        marginBottom: 12,
    },
    title: {
        fontWeight: '700',
        marginBottom: 8,
    },
    row: {
        flexDirection: 'row',
        marginBottom: 6,
    },
    text: {
        flex: 1,
        marginLeft: 8,
        lineHeight: 18,
    },
});

export default AnalyticsSummary;
