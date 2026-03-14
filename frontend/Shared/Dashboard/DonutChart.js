import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

const brightenHex = (hex, amount = 24) => {
    const clean = String(hex || '').replace('#', '');
    if (clean.length !== 6) return hex;

    const r = clamp(parseInt(clean.slice(0, 2), 16) + amount, 0, 255);
    const g = clamp(parseInt(clean.slice(2, 4), 16) + amount, 0, 255);
    const b = clamp(parseInt(clean.slice(4, 6), 16) + amount, 0, 255);

    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b
        .toString(16)
        .padStart(2, '0')}`;
};

const DonutChart = ({ data = [], size = 220, selectedName, onSelect }) => {
    const colors = useTheme();
    const { fs, spacing } = useResponsive();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const total = useMemo(() => data.reduce((sum, item) => sum + Number(item.population || 0), 0), [data]);

    useEffect(() => {
        Animated.sequence([
            Animated.spring(scaleAnim, {
                toValue: 1.04,
                friction: 5,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 6,
                useNativeDriver: true,
            }),
        ]).start();
    }, [selectedName]);

    const radius = size / 2 - 16;
    const strokeBase = Math.max(16, Math.round(size * 0.12));
    const normalized = data.filter((item) => Number(item.population || 0) > 0);

    let cumulative = 0;
    const segments = normalized.map((item) => {
        const value = Number(item.population || 0);
        const ratio = total > 0 ? value / total : 0;
        const length = ratio * (2 * Math.PI * radius);
        const offset = -(cumulative * 2 * Math.PI * radius);
        cumulative += ratio;

        const isSelected = selectedName === item.name;
        return {
            ...item,
            length,
            offset,
            isSelected,
        };
    });

    const selected = segments.find((segment) => segment.isSelected) || segments[0];
    const selectedPct = total > 0 ? ((selected?.population || 0) / total) * 100 : 0;

    return (
        <View>
            <Animated.View style={[styles.chartWrap, { transform: [{ scale: scaleAnim }] }]}>
                <Svg width={size} height={size}>
                    {segments.map((segment) => (
                        <Circle
                            key={segment.name}
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="transparent"
                            stroke={segment.isSelected ? brightenHex(segment.color, 26) : segment.color}
                            strokeWidth={segment.isSelected ? strokeBase + 4 : strokeBase}
                            strokeDasharray={`${segment.length} ${2 * Math.PI * radius}`}
                            strokeDashoffset={segment.offset}
                            strokeLinecap="round"
                            rotation="-90"
                            originX={size / 2}
                            originY={size / 2}
                            onPress={() => onSelect && onSelect(segment)}
                        />
                    ))}
                </Svg>
                <View style={[styles.centerHole, {
                    width: size * 0.48,
                    height: size * 0.48,
                    borderRadius: (size * 0.48) / 2,
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                }]}> 
                    <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>Selected</Text>
                    <Text style={{ color: colors.text, fontWeight: '700', fontSize: fs(13), marginTop: 2 }}>
                        {selected?.name || 'None'}
                    </Text>
                    <Text style={{ color: colors.accent, fontWeight: '700', fontSize: fs(12), marginTop: 2 }}>
                        {selectedPct.toFixed(1)}%
                    </Text>
                </View>
            </Animated.View>

            <View style={{ marginTop: spacing.sm }}>
                {segments.map((segment) => {
                    const percent = total > 0 ? ((segment.population / total) * 100).toFixed(1) : '0.0';
                    const active = segment.isSelected;
                    return (
                        <TouchableOpacity
                            key={segment.name}
                            style={[
                                styles.legendRow,
                                {
                                    borderBottomColor: colors.border,
                                    backgroundColor: active ? colors.surfaceLight : 'transparent',
                                },
                            ]}
                            onPress={() => onSelect && onSelect(segment)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.dot, { backgroundColor: segment.color }]} />
                            <Text style={{ color: colors.text, flex: 1, fontSize: fs(13), fontWeight: active ? '700' : '500' }}>
                                {segment.name}
                            </Text>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(12) }}>{segment.population}</Text>
                            <Text style={{ color: colors.accent, fontSize: fs(12), marginLeft: 8 }}>{percent}%</Text>
                        </TouchableOpacity>
                    );
                })}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    chartWrap: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    centerHole: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    legendRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 9,
        paddingHorizontal: 8,
        borderBottomWidth: 1,
        borderRadius: 8,
    },
    dot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        marginRight: 8,
    },
});

export default DonutChart;
