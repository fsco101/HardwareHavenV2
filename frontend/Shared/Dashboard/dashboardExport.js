import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const ensureSharable = async (fileUri) => {
    if (Platform.OS === 'web') {
        Alert.alert('Export complete', `File saved in browser download flow.`);
        return;
    }

    const canShare = await Sharing.isAvailableAsync();
    if (!canShare) {
        Alert.alert('Export complete', `Saved file at ${fileUri}`);
        return;
    }

    await Sharing.shareAsync(fileUri);
};

const toCsv = ({ payload, rows }) => {
    const metaLines = [
        `Report,Hardware Haven Admin Analytics`,
        `Generated At,${new Date().toISOString()}`,
        `Filter,${payload?.filterLabel || payload?.filter || 'N/A'}`,
        `Period Start,${payload?.period?.start || 'N/A'}`,
        `Period End,${payload?.period?.end || 'N/A'}`,
        `Total Users,${payload?.cards?.totalUsers ?? 0}`,
        `Active Users,${payload?.cards?.activeUsers ?? 0}`,
        `Revenue,${payload?.cards?.revenue ?? 0}`,
        `Growth Percent,${payload?.cards?.growth ?? 0}`,
        '',
        'Insights',
        ...(payload?.insights || []).map((line) => `"${line.replace(/"/g, '""')}"`),
        '',
    ];

    if (!rows || rows.length === 0) {
        return `${metaLines.join('\n')}date,totalUsers,activeUsers,revenue\n`;
    }

    const headers = Object.keys(rows[0]);
    const lines = rows.map((row) => headers.map((header) => row[header]).join(','));
    return `${metaLines.join('\n')}${headers.join(',')}\n${lines.join('\n')}`;
};

const escapeHtml = (value) =>
    String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');

const buildLineChartSVG = (chart) => {
    const labels = chart?.labels || [];
    const values = (chart?.datasets?.[0]?.data || []).map((v) => Number(v || 0));
    if (values.length === 0) return '<svg width="100%" height="120"></svg>';

    const width = 620;
    const height = 180;
    const padding = 28;
    const maxValue = Math.max(...values, 1);
    const stepX = values.length > 1 ? (width - padding * 2) / (values.length - 1) : 0;

    const points = values
        .map((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * (height - padding * 2);
            return `${x},${y}`;
        })
        .join(' ');

    const circles = values
        .map((value, index) => {
            const x = padding + index * stepX;
            const y = height - padding - (value / maxValue) * (height - padding * 2);
            return `<circle cx="${x}" cy="${y}" r="3.5" fill="#2ecc71" />`;
        })
        .join('');

    const axisLabels = labels
        .map((label, index) => {
            const x = padding + index * stepX;
            return `<text x="${x}" y="${height - 8}" font-size="9" text-anchor="middle" fill="#667085">${escapeHtml(
                label
            )}</text>`;
        })
        .join('');

    return `
        <svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${width}" height="${height}" fill="#f9fafb" rx="10"/>
            <polyline points="${points}" fill="none" stroke="#2ecc71" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            ${circles}
            ${axisLabels}
        </svg>
    `;
};

const buildBarChartSVG = (chart) => {
    const labels = chart?.labels || [];
    const values = (chart?.datasets?.[0]?.data || []).map((v) => Number(v || 0));
    if (values.length === 0) return '<svg width="100%" height="120"></svg>';

    const width = 620;
    const height = 180;
    const padding = 24;
    const innerWidth = width - padding * 2;
    const innerHeight = height - padding * 2;
    const barSlot = innerWidth / values.length;
    const barWidth = Math.max(14, barSlot * 0.58);
    const maxValue = Math.max(...values, 1);

    const bars = values
        .map((value, index) => {
            const barHeight = (value / maxValue) * innerHeight;
            const x = padding + index * barSlot + (barSlot - barWidth) / 2;
            const y = height - padding - barHeight;
            return `<rect x="${x}" y="${y}" width="${barWidth}" height="${barHeight}" rx="5" fill="#00b4d8"/>`;
        })
        .join('');

    const axisLabels = labels
        .map((label, index) => {
            const x = padding + index * barSlot + barSlot / 2;
            return `<text x="${x}" y="${height - 8}" font-size="9" text-anchor="middle" fill="#667085">${escapeHtml(
                label
            )}</text>`;
        })
        .join('');

    return `
        <svg width="100%" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="${width}" height="${height}" fill="#f9fafb" rx="10"/>
            ${bars}
            ${axisLabels}
        </svg>
    `;
};

const buildPieChartSVG = (segments) => {
    const total = (segments || []).reduce((sum, item) => sum + Number(item.population || 0), 0);
    if (!total) return '<svg width="100%" height="120"></svg>';

    const size = 240;
    const center = size / 2;
    const radius = 90;
    const innerRadius = 52;

    let start = 0;
    const arcs = (segments || [])
        .map((segment) => {
            const value = Number(segment.population || 0);
            const angle = (value / total) * Math.PI * 2;
            const end = start + angle;

            const x1 = center + radius * Math.cos(start);
            const y1 = center + radius * Math.sin(start);
            const x2 = center + radius * Math.cos(end);
            const y2 = center + radius * Math.sin(end);
            const largeArc = angle > Math.PI ? 1 : 0;

            const path = `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;
            start = end;

            return `<path d="${path}" fill="${segment.color}" />`;
        })
        .join('');

    const legend = (segments || [])
        .map(
            (segment, index) =>
                `<g transform="translate(300, ${30 + index * 20})"><rect width="10" height="10" fill="${segment.color}" rx="2" /><text x="16" y="9" font-size="10" fill="#475467">${escapeHtml(segment.name)} (${segment.population})</text></g>`
        )
        .join('');

    return `
        <svg width="100%" viewBox="0 0 620 240" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="0" width="620" height="240" fill="#f9fafb" rx="12"/>
            <g transform="translate(20, 0)">
                ${arcs}
                <circle cx="${center}" cy="${center}" r="${innerRadius}" fill="#ffffff" />
                <text x="${center}" y="${center - 2}" text-anchor="middle" font-size="11" fill="#667085">Orders</text>
                <text x="${center}" y="${center + 14}" text-anchor="middle" font-size="13" font-weight="700" fill="#111827">${total}</text>
            </g>
            ${legend}
        </svg>
    `;
};

export const exportAnalyticsJSON = async (payload) => {
    const uri = `${FileSystem.cacheDirectory}analytics-report.json`;
    await FileSystem.writeAsStringAsync(uri, JSON.stringify({
        report: {
            title: 'Hardware Haven Admin Analytics',
            generatedAt: new Date().toISOString(),
        },
        ...payload,
    }, null, 2), {
        encoding: FileSystem.EncodingType.UTF8,
    });
    await ensureSharable(uri);
};

export const exportAnalyticsCSV = async ({ payload, rows }) => {
    const csv = toCsv({ payload, rows });
    const uri = `${FileSystem.cacheDirectory}analytics-report.csv`;
    await FileSystem.writeAsStringAsync(uri, csv, {
        encoding: FileSystem.EncodingType.UTF8,
    });
    await ensureSharable(uri);
};

export const exportAnalyticsPDF = async ({ title, summary, rows, charts, cards, filterLabel, period }) => {
    const tableRows = (rows || [])
        .map(
            (row) =>
                `<tr><td>${row.date}</td><td>${row.totalUsers}</td><td>${row.activeUsers}</td><td>${Number(
                    row.revenue || 0
                ).toLocaleString()}</td></tr>`
        )
        .join('');

    const html = `
        <html>
            <body style="font-family: Arial; padding: 24px; color: #1b1b1b;">
                <h1 style="margin-bottom: 4px;">${title}</h1>
                <p style="margin-top: 0; color: #5f6368;">Generated at ${new Date().toLocaleString()}</p>
                <p style="margin-top: 0; color: #5f6368;">${escapeHtml(filterLabel || 'Selected range')} (${escapeHtml(
                    period?.start || 'N/A'
                )} to ${escapeHtml(period?.end || 'N/A')})</p>
                <div style="display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 12px;">
                    <div style="border: 1px solid #d0d5dd; border-radius: 10px; padding: 10px; min-width: 150px;">
                        <div style="font-size: 11px; color: #667085;">Total Users</div>
                        <div style="font-size: 18px; font-weight: 700;">${Number(cards?.totalUsers || 0).toLocaleString()}</div>
                    </div>
                    <div style="border: 1px solid #d0d5dd; border-radius: 10px; padding: 10px; min-width: 150px;">
                        <div style="font-size: 11px; color: #667085;">Active Users</div>
                        <div style="font-size: 18px; font-weight: 700;">${Number(cards?.activeUsers || 0).toLocaleString()}</div>
                    </div>
                    <div style="border: 1px solid #d0d5dd; border-radius: 10px; padding: 10px; min-width: 150px;">
                        <div style="font-size: 11px; color: #667085;">Revenue</div>
                        <div style="font-size: 18px; font-weight: 700;">P ${Number(cards?.revenue || 0).toLocaleString()}</div>
                    </div>
                    <div style="border: 1px solid #d0d5dd; border-radius: 10px; padding: 10px; min-width: 150px;">
                        <div style="font-size: 11px; color: #667085;">Growth %</div>
                        <div style="font-size: 18px; font-weight: 700;">${Number(cards?.growth || 0).toFixed(1)}%</div>
                    </div>
                </div>
                <h2>Summary</h2>
                <ul>
                    ${summary.map((line) => `<li>${escapeHtml(line)}</li>`).join('')}
                </ul>
                <h2>Revenue Trend</h2>
                ${buildLineChartSVG(charts?.trendChart)}
                <h2>Category Comparison</h2>
                ${buildBarChartSVG(charts?.categoryChart)}
                <h2>Order Distribution</h2>
                ${buildPieChartSVG(charts?.pieData)}
                <h2>Daily Metrics</h2>
                <table width="100%" cellspacing="0" cellpadding="8" border="1" style="border-collapse: collapse;">
                    <thead>
                        <tr>
                            <th align="left">Date</th>
                            <th align="left">Total Users</th>
                            <th align="left">Active Users</th>
                            <th align="left">Revenue</th>
                        </tr>
                    </thead>
                    <tbody>${tableRows}</tbody>
                </table>
            </body>
        </html>
    `;

    const { uri } = await Print.printToFileAsync({ html });
    await ensureSharable(uri);
};
