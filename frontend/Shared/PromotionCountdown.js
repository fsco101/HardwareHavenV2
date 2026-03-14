import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Theme/theme';

const PromotionCountdown = ({ endTime, style }) => {
    const colors = useTheme();
    const [remaining, setRemaining] = useState(getRemaining(endTime));
    const intervalRef = useRef(null);

    useEffect(() => {
        setRemaining(getRemaining(endTime));
        intervalRef.current = setInterval(() => {
            const r = getRemaining(endTime);
            setRemaining(r);
            if (r.total <= 0) {
                clearInterval(intervalRef.current);
            }
        }, 1000);
        return () => clearInterval(intervalRef.current);
    }, [endTime]);

    if (remaining.total <= 0) {
        return (
            <View style={[styles.container, style, { backgroundColor: colors.surfaceLight }]}>
                <Text style={{ color: colors.textSecondary, fontSize: 12 }}>Promotion ended</Text>
            </View>
        );
    }

    return (
        <View style={[styles.container, style, { backgroundColor: 'rgba(255,102,0,0.15)' }]}>
            <Ionicons name="time-outline" size={14} color={colors.danger} />
            <Text style={[styles.text, { color: colors.danger }]}>
                {remaining.hours > 0 ? `${pad(remaining.hours)}:` : ''}{pad(remaining.minutes)}:{pad(remaining.seconds)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 11, marginLeft: 4 }}>left</Text>
        </View>
    );
};

function getRemaining(endTime) {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const total = Math.max(0, end - now);
    return {
        total,
        hours: Math.floor(total / 3600000),
        minutes: Math.floor((total % 3600000) / 60000),
        seconds: Math.floor((total % 60000) / 1000),
    };
}

function pad(n) {
    return String(n).padStart(2, '0');
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        marginTop: 4,
        alignSelf: 'flex-start',
    },
    text: {
        fontWeight: 'bold',
        fontSize: 14,
        marginLeft: 4,
        fontVariant: ['tabular-nums'],
    },
});

export default PromotionCountdown;
