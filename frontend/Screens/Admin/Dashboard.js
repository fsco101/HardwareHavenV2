import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
    LayoutAnimation,
    Platform,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    UIManager,
    View,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { BarChart, LineChart } from 'react-native-chart-kit';
import axios from 'axios';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import dashboardAnalytics from '../../assets/data/dashboardAnalytics';
import baseURL from '../../config/api';
import { getToken } from '../../assets/common/tokenStorage';
import {
    AnalyticsSummary,
    ChartContainer,
    DashboardCard,
    DonutChart,
    ExportButtons,
    FilterBar,
    LoadingSkeleton,
} from '../../Shared/Dashboard';
import { buildDashboardAnalytics } from '../../Shared/Dashboard/analyticsUtils';
import Toast from 'react-native-toast-message';

const parseWebDateTime = (input) => {
    if (!input) return null;
    const safe = String(input).trim().replace(' ', 'T');
    const date = new Date(safe);
    if (Number.isNaN(date.getTime())) return null;
    return date;
};

const mapFilterToApiRange = (filter) => {
    if (filter === 'today') return 'today';
    if (filter === 'last7') return 'weekly';
    if (filter === 'last30') return 'monthly';
    if (filter === 'custom') return 'custom';
    return 'monthly';
};

const Dashboard = () => {
    const colors = useTheme();
    const navigation = useNavigation();
    const { fs, spacing, width: screenWidth, isWeb } = useResponsive();
    const [rawData, setRawData] = useState(dashboardAnalytics);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedFilter, setSelectedFilter] = useState('last7');
    const [customRange, setCustomRange] = useState({
        start: new Date('2026-03-01T00:00:00'),
        end: new Date('2026-03-14T23:59:59'),
        startInput: '2026-03-01 00:00',
        endInput: '2026-03-14 23:59',
    });
    const [appliedCustomRange, setAppliedCustomRange] = useState({
        start: new Date('2026-03-01T00:00:00'),
        end: new Date('2026-03-14T23:59:59'),
    });
    const [selectedRevenuePoint, setSelectedRevenuePoint] = useState(null);
    const [selectedCategoryPoint, setSelectedCategoryPoint] = useState(null);
    const [selectedPieSlice, setSelectedPieSlice] = useState(null);
    const [isLiveData, setIsLiveData] = useState(false);

    const chartWidth = Math.max(290, screenWidth - spacing.md * 2);

    useEffect(() => {
        if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }, []);

    const fetchDashboard = useCallback(
        async ({ showLoader = false } = {}) => {
            if (showLoader) setLoading(true);

            try {
                const token = await getToken();
                if (!token) {
                    throw new Error('No admin token found.');
                }

                const params = {
                    range: mapFilterToApiRange(selectedFilter),
                };

                if (selectedFilter === 'custom') {
                    params.startDate = appliedCustomRange.start.toISOString();
                    params.endDate = appliedCustomRange.end.toISOString();
                }

                const response = await axios.get(`${baseURL}dashboard`, {
                    params,
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setRawData(response.data);
                setIsLiveData(true);
            } catch (error) {
                setRawData(dashboardAnalytics);
                setIsLiveData(false);
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Live dashboard unavailable',
                    text2: 'Loaded fallback analytics data.',
                });
            } finally {
                if (showLoader) setLoading(false);
            }
        },
        [selectedFilter, appliedCustomRange]
    );

    useEffect(() => {
        fetchDashboard({ showLoader: true });
    }, [fetchDashboard]);

    const analytics = useMemo(
        () => buildDashboardAnalytics(rawData, selectedFilter, customRange),
        [rawData, selectedFilter, customRange]
    );

    const refreshAnalytics = useCallback(async () => {
        setRefreshing(true);
        await fetchDashboard({ showLoader: false });
        setRefreshing(false);
    }, [fetchDashboard]);

    const handleFilterChange = useCallback((nextFilter) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedFilter(nextFilter);
        setSelectedRevenuePoint(null);
        setSelectedCategoryPoint(null);
        setSelectedPieSlice(null);
    }, []);

    const applyCustomRange = useCallback(() => {
        let nextStart = customRange.start;
        let nextEnd = customRange.end;

        if (isWeb) {
            const parsedStart = parseWebDateTime(customRange.startInput);
            const parsedEnd = parseWebDateTime(customRange.endInput);

            if (!parsedStart || !parsedEnd) {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Invalid date-time input',
                    text2: 'Use YYYY-MM-DD HH:mm format for both start and end.',
                });
                return;
            }

            nextStart = parsedStart;
            nextEnd = parsedEnd;
        }

        if (nextStart > nextEnd) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Invalid range',
                text2: 'Start datetime must be before end datetime.',
            });
            return;
        }

        setAppliedCustomRange({ start: nextStart, end: nextEnd });
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedFilter('custom');
        setSelectedRevenuePoint(null);
        setSelectedCategoryPoint(null);
        setSelectedPieSlice(null);
    }, [customRange, isWeb]);

    const chartConfig = {
        backgroundColor: colors.surface,
        backgroundGradientFrom: colors.surface,
        backgroundGradientTo: colors.cardBg,
        decimalPlaces: 0,
        color: (opacity = 1) => `rgba(255, 102, 0, ${opacity})`,
        labelColor: () => colors.textSecondary,
        style: { borderRadius: 12 },
        propsForBackgroundLines: { stroke: colors.border },
    };

    if (loading) {
        return (
            <View style={[styles.container, { backgroundColor: colors.background }]}>
                <LoadingSkeleton />
            </View>
        );
    }

    return (
        <ScrollView
            style={[styles.container, { backgroundColor: colors.background }]}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refreshAnalytics} tintColor={colors.primary} />}
            contentContainerStyle={{ paddingBottom: spacing.xl }}
        >
            <View style={[styles.headerCard, { backgroundColor: colors.surface, borderColor: colors.border, margin: spacing.sm }]}> 
                <Text style={{ color: colors.text, fontSize: fs(20), fontWeight: '700' }}>Admin Analytics</Text>
                <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 2 }}>
                    {analytics.filterLabel} ({analytics.period.start} to {analytics.period.end})
                </Text>
                <Text style={{ color: isLiveData ? colors.success : colors.warning, fontSize: fs(11), marginTop: 4, fontWeight: '600' }}>
                    {isLiveData ? 'Live data from database' : 'Fallback mock data'}
                </Text>
            </View>

            <FilterBar
                selectedFilter={selectedFilter}
                onFilterChange={handleFilterChange}
                customRange={customRange}
                onCustomRangeChange={(key, value) => {
                    setCustomRange((prev) => {
                        if (key === 'start' || key === 'end') {
                            const formatted = value.toISOString().slice(0, 16).replace('T', ' ');
                            return {
                                ...prev,
                                [key]: value,
                                [`${key}Input`]: formatted,
                            };
                        }

                        return {
                            ...prev,
                            [key]: value,
                        };
                    });
                }}
                onApplyCustomRange={applyCustomRange}
            />

            <View style={[styles.navRow, { paddingHorizontal: spacing.sm, marginTop: spacing.xs }]}> 
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.primary }]} onPress={() => navigation.navigate('Products')}> 
                    <Ionicons name="cube-outline" size={16} color={colors.textOnPrimary} />
                    <Text style={[styles.navBtnText, { color: colors.textOnPrimary, fontSize: fs(12) }]}>Products</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.secondary }]} onPress={() => navigation.navigate('Orders')}> 
                    <Ionicons name="bag-outline" size={16} color={colors.textOnPrimary} />
                    <Text style={[styles.navBtnText, { color: colors.textOnPrimary, fontSize: fs(12) }]}>Orders</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.accent }]} onPress={() => navigation.navigate('Categories')}> 
                    <Ionicons name="list-outline" size={16} color="#1a1a2e" />
                    <Text style={[styles.navBtnText, { color: '#1a1a2e', fontSize: fs(12) }]}>Categories</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.navBtn, { backgroundColor: colors.success }]} onPress={() => navigation.navigate('Promotions')}> 
                    <Ionicons name="pricetag-outline" size={16} color={colors.textOnPrimary} />
                    <Text style={[styles.navBtnText, { color: colors.textOnPrimary, fontSize: fs(12) }]}>Promos</Text>
                </TouchableOpacity>
            </View>

            <View style={[styles.summaryRow, { marginTop: spacing.xs }]}> 
                <DashboardCard
                    title="Total Users"
                    value={analytics.cards.totalUsers}
                    icon="people-outline"
                    accent={colors.secondary}
                    subtitle="Registered users"
                />
                <DashboardCard
                    title="Active Users"
                    value={analytics.cards.activeUsers}
                    icon="pulse-outline"
                    accent={colors.success}
                    subtitle="Latest active users"
                />
                <DashboardCard
                    title="Revenue"
                    value={analytics.cards.revenue}
                    prefix="P "
                    icon="cash-outline"
                    accent={colors.accent}
                    subtitle="Selected period total"
                />
                <DashboardCard
                    title="Growth %"
                    value={Number(analytics.cards.growth.toFixed(1))}
                    suffix="%"
                    icon="trending-up-outline"
                    accent={colors.primary}
                    subtitle={`vs prior: ${analytics.cards.growthDelta.toFixed(1)}%`}
                />
            </View>

            <ChartContainer
                title="Revenue Trend"
                subtitle="Tap a point to pin value"
                pinnedLabel="Pinned Revenue"
                pinnedValue={
                    selectedRevenuePoint
                        ? `${selectedRevenuePoint.label}: P ${Number(selectedRevenuePoint.value || 0).toLocaleString()}`
                        : 'Tap a point in the line chart'
                }
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <LineChart
                        data={analytics.trendChart}
                        width={Math.max(chartWidth, analytics.trendChart.labels.length * 60)}
                        height={200}
                        chartConfig={{ ...chartConfig, color: (o) => `rgba(46, 204, 113, ${o})` }}
                        bezier
                        style={{ borderRadius: 12 }}
                        yAxisLabel="P "
                        verticalLabelRotation={analytics.trendChart.labels.length > 6 ? 20 : 0}
                        onDataPointClick={({ value, index }) => {
                            setSelectedRevenuePoint({
                                label: analytics.trendChart.labels[index],
                                value,
                            });
                        }}
                    />
                </ScrollView>
            </ChartContainer>

            <ChartContainer
                title="Category Comparison"
                subtitle="Tap bars to inspect values"
                pinnedLabel="Pinned Category"
                pinnedValue={
                    selectedCategoryPoint
                        ? `${selectedCategoryPoint.label}: ${selectedCategoryPoint.value}`
                        : 'Tap a bar in the chart'
                }
            >
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    <BarChart
                        data={analytics.categoryChart}
                        width={Math.max(chartWidth, analytics.categoryChart.labels.length * 78)}
                        height={220}
                        chartConfig={{ ...chartConfig, color: (o) => `rgba(0, 180, 216, ${o})` }}
                        style={{ borderRadius: 12 }}
                        yAxisSuffix=""
                        fromZero
                        showValuesOnTopOfBars
                        onDataPointClick={({ value, index }) => {
                            setSelectedCategoryPoint({
                                label: analytics.categoryChart.labels[index],
                                value,
                            });
                        }}
                    />
                </ScrollView>
            </ChartContainer>

            {analytics.pieData.length > 0 && (
                <ChartContainer
                    title="Order Distribution"
                    subtitle="Tap a slice or status row to highlight"
                    pinnedLabel="Pinned Distribution"
                    pinnedValue={
                        selectedPieSlice
                            ? `${selectedPieSlice.name}: ${selectedPieSlice.population} orders`
                            : 'Tap a slice or status row'
                    }
                >
                    <DonutChart
                        data={analytics.pieData}
                        size={Math.min(chartWidth, 250)}
                        selectedName={selectedPieSlice?.name}
                        onSelect={(slice) => setSelectedPieSlice(slice)}
                    />
                </ChartContainer>
            )}

            <AnalyticsSummary insights={analytics.insights} />

            <ExportButtons
                payload={{
                    generatedAt: rawData.generatedAt,
                    filter: selectedFilter,
                    filterLabel: analytics.filterLabel,
                    period: analytics.period,
                    cards: analytics.cards,
                    insights: analytics.insights,
                    rows: analytics.exportRows,
                    trendChart: analytics.trendChart,
                    categoryChart: analytics.categoryChart,
                    pieData: analytics.pieData,
                }}
                rows={analytics.exportRows}
                summary={analytics.insights}
            />
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    headerCard: {
        borderWidth: 1,
        borderRadius: 14,
        paddingVertical: 14,
        paddingHorizontal: 14,
    },
    navRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
    navBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 12,
        borderRadius: 10,
        minWidth: '47%',
        justifyContent: 'center',
        marginBottom: 8,
    },
    navBtnText: { fontWeight: '600' },
    summaryRow: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-around', marginHorizontal: 6 },
});

export default Dashboard;
