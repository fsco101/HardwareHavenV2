import React from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import { exportAnalyticsCSV, exportAnalyticsJSON, exportAnalyticsPDF } from './dashboardExport';

const ExportButtons = ({ payload, rows, summary }) => {
    const colors = useTheme();
    const { fs, ms, spacing } = useResponsive();

    const safeExport = async (fn) => {
        try {
            await fn();
        } catch (error) {
            Alert.alert('Export failed', error?.message || 'Please try again.');
        }
    };

    return (
        <View style={[styles.wrapper, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.sm }]}> 
            <Text style={{ color: colors.text, fontWeight: '700', fontSize: fs(15), marginBottom: 10 }}>Export Analytics</Text>
            <View style={styles.row}>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.secondary }]}
                    onPress={() => safeExport(() => exportAnalyticsCSV({ payload, rows }))}
                >
                    <Ionicons name="document-text-outline" size={ms(14, 0.2)} color={colors.textOnPrimary} />
                    <Text style={[styles.btnText, { color: colors.textOnPrimary, fontSize: fs(12) }]}>CSV</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.primary }]}
                    onPress={() => safeExport(() => exportAnalyticsJSON(payload))}
                >
                    <Ionicons name="code-slash-outline" size={ms(14, 0.2)} color={colors.textOnPrimary} />
                    <Text style={[styles.btnText, { color: colors.textOnPrimary, fontSize: fs(12) }]}>JSON</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.success }]}
                    onPress={() =>
                        safeExport(() =>
                            exportAnalyticsPDF({
                                title: 'Hardware Haven Admin Dashboard',
                                summary,
                                rows,
                                charts: {
                                    trendChart: payload?.trendChart,
                                    categoryChart: payload?.categoryChart,
                                    pieData: payload?.pieData,
                                },
                                cards: payload?.cards,
                                filterLabel: payload?.filterLabel,
                                period: payload?.period,
                            })
                        )
                    }
                >
                    <Ionicons name="print-outline" size={ms(14, 0.2)} color={colors.textOnPrimary} />
                    <Text style={[styles.btnText, { color: colors.textOnPrimary, fontSize: fs(12) }]}>PDF</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        borderWidth: 1,
        borderRadius: 14,
        padding: 12,
        marginBottom: 12,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    btn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 10,
        paddingVertical: 10,
        marginHorizontal: 3,
    },
    btnText: {
        fontWeight: '700',
        marginLeft: 4,
    },
});

export default ExportButtons;
