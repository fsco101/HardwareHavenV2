import React, { useEffect, useRef, useState } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const DashboardCard = ({ title, value, prefix = '', suffix = '', icon, accent, subtitle }) => {
    const colors = useTheme();
    const { fs, ms, spacing } = useResponsive();
    const animatedValue = useRef(new Animated.Value(0)).current;
    const [displayValue, setDisplayValue] = useState(0);

    useEffect(() => {
        const numericValue = Number(value || 0);
        animatedValue.setValue(0);
        const id = animatedValue.addListener(({ value: next }) => {
            setDisplayValue(Math.round(next));
        });

        Animated.timing(animatedValue, {
            toValue: numericValue,
            duration: 800,
            useNativeDriver: false,
        }).start();

        return () => {
            animatedValue.removeListener(id);
        };
    }, [value]);

    return (
        <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
            <View style={[styles.iconWrap, { backgroundColor: colors.surfaceLight }]}> 
                <Ionicons name={icon} size={ms(18, 0.3)} color={accent || colors.primary} />
            </View>
            <Text style={[styles.title, { color: colors.textSecondary, fontSize: fs(12) }]}>{title}</Text>
            <Text style={[styles.value, { color: colors.text, fontSize: fs(19) }]}>
                {prefix}
                {displayValue.toLocaleString()}
                {suffix}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fs(11) }]}>{subtitle}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    card: {
        flex: 1,
        minWidth: 140,
        borderRadius: 14,
        borderWidth: 1,
        padding: 12,
        margin: 6,
    },
    iconWrap: {
        width: 32,
        height: 32,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
    title: {
        fontWeight: '600',
    },
    value: {
        fontWeight: '700',
        marginTop: 6,
    },
    subtitle: {
        marginTop: 6,
    },
});

export default DashboardCard;
