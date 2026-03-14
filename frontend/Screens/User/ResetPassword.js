import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import Toast from 'react-native-toast-message';
import baseURL from '../../config/api';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import Error from '../../Shared/Error';
import { validateForm, hasErrors } from '../../Shared/FormValidation';

const ResetPassword = ({ navigation }) => {
    const colors = useTheme();
    const { fs, spacing, ws } = useResponsive();

    const [email, setEmail] = useState('');
    const [code, setCode] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loadingSend, setLoadingSend] = useState(false);
    const [loadingReset, setLoadingReset] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);

    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const clearFieldError = (field) => {
        setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    };

    const sendResetCode = async () => {
        if (resendCooldown > 0) {
            Toast.show({
                topOffset: 60,
                type: 'info',
                text1: `Please wait ${resendCooldown}s before resending`,
            });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const errors = validateForm({ email: normalizedEmail });
        setFieldErrors((prev) => ({ ...prev, email: errors.email || '' }));
        if (errors.email) {
            Toast.show({ topOffset: 60, type: 'error', text1: errors.email });
            return;
        }

        setLoadingSend(true);
        try {
            await axios.post(`${baseURL}users/forgot-password`, { email: normalizedEmail });
            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: 'Reset code sent',
                text2: 'Check your Gmail inbox for the verification code.',
            });
            setResendCooldown(60);
        } catch (error) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Failed to send code',
                text2: error.response?.data?.message || 'Please try again',
            });
        } finally {
            setLoadingSend(false);
        }
    };

    const resetPassword = async () => {
        const normalizedEmail = email.trim().toLowerCase();
        const errors = validateForm({
            email: normalizedEmail,
            resetCode: code.trim(),
            newPassword,
            confirmPassword,
        });
        setFieldErrors(errors);
        if (hasErrors(errors)) {
            const firstError = errors.email || errors.resetCode || errors.newPassword || errors.confirmPassword;
            Toast.show({ topOffset: 60, type: 'error', text1: firstError || 'Please fix form errors' });
            return;
        }

        setLoadingReset(true);
        try {
            await axios.post(`${baseURL}users/reset-password`, {
                email: normalizedEmail,
                code: code.trim(),
                newPassword,
            });

            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: 'Password reset successful',
                text2: 'You can now login with your new password.',
            });

            navigation.navigate('Login');
        } catch (error) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Reset failed',
                text2: error.response?.data?.message || 'Please try again',
            });
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}> 
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: ws(12), padding: spacing.md }]}> 
                <Text style={{ color: colors.primary, fontSize: fs(20), fontWeight: '700', marginBottom: spacing.sm }}>
                    Reset Password
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fs(13), marginBottom: spacing.md }}>
                    Enter your Gmail account, request a reset code, then set your new password.
                </Text>

                <TextInput
                    mode="outlined"
                    label="Gmail"
                    value={email}
                    onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={[styles.input, { backgroundColor: colors.inputBg }]}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                />
                {fieldErrors.email ? <Error message={fieldErrors.email} /> : null}

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: (loadingSend || resendCooldown > 0) ? colors.border : colors.secondary }]}
                    onPress={sendResetCode}
                    disabled={loadingSend || resendCooldown > 0}
                >
                    <Text style={{ color: colors.textOnPrimary, fontWeight: '700' }}>
                        {loadingSend ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Send Reset Code'}
                    </Text>
                </TouchableOpacity>

                <TextInput
                    mode="outlined"
                    label="Reset Code"
                    value={code}
                    onChangeText={(text) => { setCode(text); clearFieldError('resetCode'); }}
                    keyboardType="number-pad"
                    style={[styles.input, { backgroundColor: colors.inputBg }]}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                />
                {fieldErrors.resetCode ? <Error message={fieldErrors.resetCode} /> : null}

                <TextInput
                    mode="outlined"
                    label="New Password"
                    value={newPassword}
                    onChangeText={(text) => { setNewPassword(text); clearFieldError('newPassword'); }}
                    secureTextEntry
                    style={[styles.input, { backgroundColor: colors.inputBg }]}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                />
                {fieldErrors.newPassword ? <Error message={fieldErrors.newPassword} /> : null}

                <TextInput
                    mode="outlined"
                    label="Confirm New Password"
                    value={confirmPassword}
                    onChangeText={(text) => { setConfirmPassword(text); clearFieldError('confirmPassword'); }}
                    secureTextEntry
                    style={[styles.input, { backgroundColor: colors.inputBg }]}
                    outlineColor={colors.border}
                    activeOutlineColor={colors.primary}
                    textColor={colors.text}
                />
                {fieldErrors.confirmPassword ? <Error message={fieldErrors.confirmPassword} /> : null}

                <TouchableOpacity
                    style={[styles.btn, { backgroundColor: colors.primary, marginTop: spacing.sm }]}
                    onPress={resetPassword}
                    disabled={loadingReset}
                >
                    <Text style={{ color: colors.textOnPrimary, fontWeight: '700' }}>
                        {loadingReset ? 'Resetting...' : 'Reset Password'}
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    card: {
        borderWidth: 1,
    },
    input: {
        marginBottom: 10,
    },
    btn: {
        height: 44,
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 10,
    },
});

export default ResetPassword;
