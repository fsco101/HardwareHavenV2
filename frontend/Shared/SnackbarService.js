import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Snackbar } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../Theme/theme';

const listeners = new Set();

const notifyListeners = (payload) => {
    listeners.forEach((listener) => {
        try {
            listener(payload);
        } catch (error) {
            // ignore listener failures
        }
    });
};

const Toast = {
    show(options = {}) {
        const {
            type = 'info',
            text1 = '',
            text2 = '',
            visibilityTime = 3000,
            autoHide = true,
            topOffset = 0,
        } = options;

        notifyListeners({
            visible: true,
            type,
            text1,
            text2,
            topOffset,
            duration: autoHide === false ? Number.MAX_SAFE_INTEGER : visibilityTime,
        });
    },
    hide() {
        notifyListeners({ visible: false });
    },
};

export const SnackbarHost = () => {
    const colors = useTheme();
    const insets = useSafeAreaInsets();
    const hideTimerRef = useRef(null);
    const [state, setState] = useState({
        visible: false,
        type: 'info',
        text1: '',
        text2: '',
        topOffset: 0,
        duration: 3000,
    });

    useEffect(() => {
        const listener = (payload) => {
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
                hideTimerRef.current = null;
            }

            if (payload.visible === false) {
                setState((prev) => ({ ...prev, visible: false }));
                return;
            }

            setState({
                visible: true,
                type: payload.type || 'info',
                text1: payload.text1 || '',
                text2: payload.text2 || '',
                topOffset: Number(payload.topOffset) || 0,
                duration: Number(payload.duration) || 3000,
            });

            const duration = Number(payload.duration) || 3000;
            if (duration < Number.MAX_SAFE_INTEGER) {
                hideTimerRef.current = setTimeout(() => {
                    setState((prev) => ({ ...prev, visible: false }));
                }, duration);
            }
        };

        listeners.add(listener);
        return () => {
            listeners.delete(listener);
            if (hideTimerRef.current) {
                clearTimeout(hideTimerRef.current);
            }
        };
    }, []);

    const typeBackgroundMap = {
        success: colors.success,
        error: colors.danger,
        warning: colors.warning,
        info: colors.surfaceLight,
    };

    const typeTextMap = {
        success: colors.textOnPrimary,
        error: colors.textOnPrimary,
        warning: colors.headerBg,
        info: colors.text,
    };

    const typeIconMap = {
        success: 'checkmark-circle',
        error: 'alert-circle',
        warning: 'warning',
        info: 'information-circle',
    };

    const backgroundColor = typeBackgroundMap[state.type] || colors.surfaceLight;
    const textColor = typeTextMap[state.type] || colors.text;
    const iconName = typeIconMap[state.type] || 'information-circle';
    const hasSubtext = Boolean(state.text2 && String(state.text2).trim());
    const top = Math.max((insets.top || 0) + 10, state.topOffset || 0);

    return (
        <Snackbar
            visible={state.visible}
            onDismiss={() => setState((prev) => ({ ...prev, visible: false }))}
            duration={state.duration}
            wrapperStyle={[styles.wrapper, { top }]}
            style={[styles.snackbar, { backgroundColor }]}
            action={{
                label: 'Close',
                textColor,
                onPress: () => setState((prev) => ({ ...prev, visible: false })),
            }}
        >
            <View style={styles.contentRow}>
                <Ionicons name={iconName} size={20} color={textColor} style={styles.icon} />
                <View style={styles.textWrap}>
                    <Text style={[styles.title, { color: textColor }]} numberOfLines={hasSubtext ? 1 : 2}>
                        {state.text1 || 'Notice'}
                    </Text>
                    {hasSubtext ? (
                        <Text style={[styles.subtitle, { color: textColor }]} numberOfLines={2}>
                            {state.text2}
                        </Text>
                    ) : null}
                </View>
            </View>
        </Snackbar>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        position: 'absolute',
        left: 12,
        right: 12,
    },
    snackbar: {
        borderRadius: 14,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.22,
        shadowRadius: 8,
    },
    contentRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    icon: {
        marginRight: 10,
    },
    textWrap: {
        flex: 1,
        minWidth: 0,
    },
    title: {
        fontSize: 14,
        fontWeight: '700',
    },
    subtitle: {
        marginTop: 2,
        fontSize: 12,
        opacity: 0.92,
    },
});

export default Toast;
