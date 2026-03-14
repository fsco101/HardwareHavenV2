const parseDate = (value) => new Date(`${value}T00:00:00`);

const formatShortDate = (value) => {
    const date = parseDate(value);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatWeekday = (value) => {
    const date = parseDate(value);
    return date.toLocaleDateString('en-US', { weekday: 'long' });
};

const addDays = (date, days) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const startOfDay = (date) => {
    const value = new Date(date);
    value.setHours(0, 0, 0, 0);
    return value;
};

const endOfDay = (date) => {
    const value = new Date(date);
    value.setHours(23, 59, 59, 999);
    return value;
};

const getWindowConfig = (filter, latestDate, customRange) => {
    const latest = startOfDay(latestDate);

    if (filter === 'today') {
        return {
            start: startOfDay(latest),
            end: endOfDay(latest),
            label: 'Today',
        };
    }

    if (filter === 'last7') {
        return {
            start: startOfDay(addDays(latest, -6)),
            end: endOfDay(latest),
            label: 'Last 7 days',
        };
    }

    if (filter === 'last30') {
        return {
            start: startOfDay(addDays(latest, -29)),
            end: endOfDay(latest),
            label: 'Last 30 days',
        };
    }

    const customStart = customRange?.start ? startOfDay(parseDate(customRange.start)) : startOfDay(addDays(latest, -13));
    const customEnd = customRange?.end ? endOfDay(parseDate(customRange.end)) : endOfDay(latest);

    return {
        start: customStart,
        end: customEnd,
        label: 'Custom range',
    };
};

const percentChange = (current, previous) => {
    if (!previous) {
        return current > 0 ? 100 : 0;
    }
    return ((current - previous) / previous) * 100;
};

const compactTrend = (items, targetPoints = 8) => {
    if (items.length <= targetPoints) {
        return items;
    }

    const step = Math.ceil(items.length / targetPoints);
    return items.filter((_, index) => index % step === 0 || index === items.length - 1);
};

const normalizeFromApiPayload = (rawData) => {
    const dailyMetrics = [...(rawData?.dailyMetrics || [])].map((item) => ({
        date: item.date,
        totalUsers: Number(rawData?.userCount || 0),
        activeUsers: Number(item.activeUsers || rawData?.activeUsers || 0),
        revenue: Number(item.revenue || 0),
    }));

    return {
        dailyMetrics,
        categoryComparison:
            (rawData?.categoryComparison || []).length > 0
                ? rawData.categoryComparison
                : (rawData?.topProducts || []).slice(0, 6).map((p) => ({ label: p.name, value: p.totalQty })),
        orderDistribution: rawData?.statusDistribution || [],
        events: rawData?.events || [],
        userCount: Number(rawData?.userCount || 0),
        activeUsers: Number(rawData?.activeUsers || 0),
        totalRevenue: Number(rawData?.totalRevenue || 0),
        growthPercent: Number(rawData?.growthPercent || 0),
        previousRevenue: Number(rawData?.previousRevenue || 0),
        topProducts: rawData?.topProducts || [],
        range: rawData?.range,
        period: rawData?.period,
    };
};

export const buildDashboardAnalytics = (rawData, filter, customRange) => {
    const normalized = rawData?.revenueOverTime ? normalizeFromApiPayload(rawData) : rawData;
    const dailyMetrics = [...(normalized?.dailyMetrics || [])].sort((a, b) => (a.date > b.date ? 1 : -1));

    if (dailyMetrics.length === 0) {
        return {
            cards: {
                totalUsers: 0,
                activeUsers: 0,
                revenue: 0,
                growth: 0,
                growthDelta: 0,
            },
            trendChart: { labels: ['N/A'], datasets: [{ data: [0] }] },
            categoryChart: { labels: ['N/A'], datasets: [{ data: [0] }] },
            pieData: [],
            insights: ['No analytics data available for this period.'],
            exportRows: [],
            filterLabel: 'No data',
        };
    }

    const latestDate = parseDate(dailyMetrics[dailyMetrics.length - 1].date);
    const windowConfig = getWindowConfig(filter, latestDate, customRange);

    const filtered = dailyMetrics.filter((metric) => {
        const date = parseDate(metric.date);
        return date >= windowConfig.start && date <= windowConfig.end;
    });

    const safeFiltered = filtered.length > 0 ? filtered : [dailyMetrics[dailyMetrics.length - 1]];
    const periodLength = safeFiltered.length;

    const previousEnd = addDays(windowConfig.start, -1);
    const previousStart = addDays(previousEnd, -(periodLength - 1));
    const previousPeriod = dailyMetrics.filter((metric) => {
        const date = parseDate(metric.date);
        return date >= startOfDay(previousStart) && date <= endOfDay(previousEnd);
    });

    const currentFirst = safeFiltered[0];
    const currentLast = safeFiltered[safeFiltered.length - 1];

    const previousFirst = previousPeriod[0] || currentFirst;
    const previousLast = previousPeriod[previousPeriod.length - 1] || previousFirst;

    const totalUsers = currentLast.totalUsers || 0;
    const activeUsers = currentLast.activeUsers || 0;
    const revenue = safeFiltered.reduce((sum, day) => sum + Number(day.revenue || 0), 0);
    const growth = percentChange(currentLast.totalUsers || 0, currentFirst.totalUsers || 0);
    const growthDelta = percentChange(currentLast.totalUsers || 0, previousLast.totalUsers || 0);

    const sampledTrend = compactTrend(safeFiltered, filter === 'last30' ? 10 : 7);
    const trendChart = {
        labels: sampledTrend.map((item) => formatShortDate(item.date)),
        datasets: [{ data: sampledTrend.map((item) => Number(item.revenue || 0)) }],
    };

    const categoryItems = (normalized?.categoryComparison || []).slice(0, 6);
    const categoryChart = {
        labels: categoryItems.map((item) => item.label),
        datasets: [{ data: categoryItems.map((item) => Number(item.value || 0)) }],
    };

    const pieData = (normalized?.orderDistribution || [])
        .filter((item) => Number(item.value || 0) > 0)
        .map((item) => ({
            name: item.label,
            population: Number(item.value || 0),
            color: item.color,
            legendFontColor: '#8893a7',
            legendFontSize: 12,
        }));

    const revenuePeak = safeFiltered.reduce((peak, item) => {
        if (!peak || Number(item.revenue || 0) > Number(peak.revenue || 0)) {
            return item;
        }
        return peak;
    }, null);

    const event = (normalized?.events || []).find((e) => e.date === revenuePeak?.date);
    const activeAvg = Math.round(
        safeFiltered.reduce((sum, day) => sum + Number(day.activeUsers || 0), 0) / safeFiltered.length
    );
    const previousRevenue = previousPeriod.reduce((sum, day) => sum + Number(day.revenue || 0), 0);
    const revenueDelta = percentChange(revenue, previousRevenue || 0);

    const topProduct = (normalized?.topProducts || [])[0];
    const dominantStatus = pieData.reduce((acc, item) => {
        if (!acc || item.population > acc.population) return item;
        return acc;
    }, null);

    const insights = [
        `User growth changed by ${growthDelta.toFixed(1)}% compared to the previous period.`,
        `Average active users in this range is ${activeAvg}.`,
        `Revenue ${revenueDelta >= 0 ? 'increased' : 'decreased'} ${Math.abs(revenueDelta).toFixed(1)}% versus prior period.`,
        revenuePeak
            ? `Revenue peak occurred on ${formatWeekday(revenuePeak.date)} (${formatShortDate(revenuePeak.date)}) with ${Number(revenuePeak.revenue || 0).toLocaleString()}.`
            : 'No revenue peak available.',
        topProduct
            ? `Top product by volume is ${topProduct.name} with ${topProduct.totalQty} sold.`
            : 'Top product data is not available in this range.',
        dominantStatus
            ? `Most common order status is ${dominantStatus.name} (${dominantStatus.population} orders).`
            : 'Order status distribution is unavailable for this range.',
        event ? `Possible driver: ${event.note}` : 'No tagged campaign event was found for the peak day.',
    ];

    const exportRows = safeFiltered.map((item) => ({
        date: item.date,
        totalUsers: item.totalUsers,
        activeUsers: item.activeUsers,
        revenue: item.revenue,
    }));

    return {
        cards: {
            totalUsers: normalized?.userCount || totalUsers,
            activeUsers: normalized?.activeUsers || activeUsers,
            revenue: normalized?.totalRevenue || revenue,
            growth: Number.isFinite(normalized?.growthPercent) ? normalized.growthPercent : growth,
            growthDelta,
        },
        trendChart,
        categoryChart,
        pieData,
        insights,
        exportRows,
        filterLabel: windowConfig.label,
        topProducts: normalized?.topProducts || [],
        orderDistribution: normalized?.orderDistribution || [],
        period: {
            start: safeFiltered[0]?.date,
            end: safeFiltered[safeFiltered.length - 1]?.date,
        },
    };
};
