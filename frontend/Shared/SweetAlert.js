import React from 'react';
import { View, Text, Modal, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const SweetAlert = ({
    visible = false,
    title = '',
    message = '',
    type = 'info',        // 'success' | 'error' | 'warning' | 'info' | 'confirm'
    confirmText = 'OK',
    cancelText = 'Cancel',
    onConfirm = () => {},
    onCancel = () => {},
    showCancel = false,
}) => {
    const colors = useTheme();
    const { wp, fs, ms, spacing, ws, width } = useResponsive();

    const isCompact = width < 420;

    const iconMap = {
        success: { name: 'checkmark-circle', color: colors.success },
        error: { name: 'close-circle', color: colors.danger },
        warning: { name: 'warning', color: colors.warning },
        info: { name: 'information-circle', color: colors.secondary },
        confirm: { name: 'help-circle', color: colors.warning },
    };

    const icon = iconMap[type] || iconMap.info;

    return (
        <Modal
            transparent
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel}
        >
            <View style={[styles.overlay, { backgroundColor: colors.overlay }]}> 
                <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onCancel} activeOpacity={1} />
                <View style={[styles.alertBox, { backgroundColor: colors.surface, borderColor: colors.border, width: wp(88), padding: spacing.lg, borderRadius: ws(16) }]}> 
                    <View style={[styles.topBar, { backgroundColor: icon.color }]} />
                    <View style={[styles.iconWrap, { backgroundColor: `${icon.color}22`, borderColor: `${icon.color}55` }]}> 
                        <Ionicons name={icon.name} size={ms(34, 0.3)} color={icon.color} />
                    </View>
                    {title ? <Text style={[styles.title, { color: colors.text, fontSize: fs(20), marginBottom: spacing.sm }]}>{title}</Text> : null}
                    {message ? <Text style={[styles.message, { color: colors.textSecondary, fontSize: fs(14), marginBottom: spacing.lg, lineHeight: fs(20) }]}>{message}</Text> : null}

                    <View style={[styles.buttonRow, { gap: spacing.sm + 4, flexDirection: isCompact ? 'column-reverse' : 'row' }]}> 
                        {(showCancel || type === 'confirm') && (
                            <TouchableOpacity
                                style={[styles.button, {
                                    backgroundColor: colors.surfaceLight,
                                    borderColor: colors.border,
                                    borderWidth: 1,
                                    paddingVertical: spacing.sm + 2,
                                    paddingHorizontal: spacing.lg,
                                    borderRadius: ws(10),
                                    width: isCompact ? '100%' : undefined,
                                }]}
                                onPress={onCancel}
                                activeOpacity={0.7}
                            >
                                <Text style={[styles.buttonText, { color: colors.textSecondary, fontSize: fs(15) }]}>{cancelText}</Text>
                            </TouchableOpacity>
                        )}
                        <TouchableOpacity
                            style={[
                                styles.button,
                                {
                                    backgroundColor:
                                        type === 'error' || type === 'confirm'
                                            ? colors.danger
                                            : type === 'success'
                                            ? colors.success
                                            : colors.primary,
                                    paddingVertical: spacing.sm + 2,
                                    paddingHorizontal: spacing.lg,
                                    borderRadius: ws(10),
                                    width: isCompact ? '100%' : undefined,
                                },
                            ]
                            }
                            onPress={onConfirm}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.buttonText, { color: colors.textOnPrimary, fontSize: fs(15) }]}>{confirmText}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    alertBox: {
        maxWidth: 400,
        alignItems: 'center',
        borderWidth: 1,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        overflow: 'hidden',
    },
    topBar: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: 5,
    },
    iconWrap: {
        width: 64,
        height: 64,
        borderRadius: 32,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        marginBottom: 10,
    },
    title: {
        fontWeight: 'bold',
        textAlign: 'center',
    },
    message: {
        textAlign: 'center',
    },
    buttonRow: {
        justifyContent: 'center',
        width: '100%',
    },
    button: {
        minWidth: 100,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontWeight: '600',
    },
});

export default SweetAlert;
