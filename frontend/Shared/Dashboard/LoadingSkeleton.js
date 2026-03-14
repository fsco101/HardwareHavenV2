import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const SkeletonBlock = ({ height, style }) => {
    const colors = useTheme();
    const shimmer = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(shimmer, {
                    toValue: 1,
                    duration: 700,
                    useNativeDriver: true,
                }),
                Animated.timing(shimmer, {
                    toValue: 0,
                    duration: 700,
                    useNativeDriver: true,
                }),
            ])
        ).start();
    }, []);

    const opacity = shimmer.interpolate({
        inputRange: [0, 1],
        outputRange: [0.35, 0.7],
    });

    return (
        <Animated.View
            style={[
                styles.block,
                style,
                { height, backgroundColor: colors.surfaceLight, opacity },
            ]}
        />
    );
};

const LoadingSkeleton = () => {
    const { spacing } = useResponsive();

    return (
        <View style={{ paddingHorizontal: spacing.sm, paddingTop: spacing.sm }}>
            <SkeletonBlock height={42} style={{ borderRadius: 12, marginBottom: 10 }} />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 10 }}>
                <SkeletonBlock height={110} style={{ flex: 1, minWidth: 140, borderRadius: 12, margin: 6 }} />
                <SkeletonBlock height={110} style={{ flex: 1, minWidth: 140, borderRadius: 12, margin: 6 }} />
                <SkeletonBlock height={110} style={{ flex: 1, minWidth: 140, borderRadius: 12, margin: 6 }} />
                <SkeletonBlock height={110} style={{ flex: 1, minWidth: 140, borderRadius: 12, margin: 6 }} />
            </View>
            <SkeletonBlock height={220} style={{ borderRadius: 12, marginBottom: 10 }} />
            <SkeletonBlock height={220} style={{ borderRadius: 12, marginBottom: 10 }} />
        </View>
    );
};

const styles = StyleSheet.create({
    block: {
        width: '100%',
    },
});

export default LoadingSkeleton;
