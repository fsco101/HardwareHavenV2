import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { TextInput } from 'react-native-paper';
import axios from 'axios';
import baseURL from '../../config/api';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import Error from '../../Shared/Error';
import { validateForm, hasErrors } from '../../Shared/FormValidation';
import SweetAlert from '../../Shared/SweetAlert';

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
    const [step, setStep] = useState('request');
    const [alertConfig, setAlertConfig] = useState({
        visible: false,
        type: 'info',
        title: '',
        message: '',
        navigateToLogin: false,
    });

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

    const showAlert = ({ type = 'info', title = '', message = '', navigateToLogin = false }) => {
        setAlertConfig({
            visible: true,
            type,
            title,
            message,
            navigateToLogin,
        });
    };

    const closeAlert = () => {
        const shouldNavigateToLogin = alertConfig.navigateToLogin;
        setAlertConfig({
            visible: false,
            type: 'info',
            title: '',
            message: '',
            navigateToLogin: false,
        });

        if (shouldNavigateToLogin) {
            navigation.navigate('Login');
        }
    };

    const sendResetCode = async () => {
        if (resendCooldown > 0) {
            showAlert({
                type: 'info',
                title: 'Please wait',
                message: `Please wait ${resendCooldown}s before resending the code.`,
            });
            return;
        }

        const normalizedEmail = email.trim().toLowerCase();
        const errors = validateForm({ email: normalizedEmail });
        setFieldErrors((prev) => ({ ...prev, email: errors.email || '' }));
        if (errors.email) {
            showAlert({ type: 'error', title: 'Invalid Email', message: errors.email });
            return;
        }

        setLoadingSend(true);
        try {
            await axios.post(`${baseURL}users/forgot-password`, { email: normalizedEmail });
            setStep('reset');
            showAlert({
                type: 'success',
                title: 'Reset Code Sent',
                message: 'Check your email inbox for the verification code, then continue to step 2.',
            });
            setResendCooldown(60);
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Failed to Send Code',
                message: error.response?.data?.message || 'Please try again.',
            });
        } finally {
            setLoadingSend(false);
        }
    };

    const resetPassword = async () => {
        if (step !== 'reset') {
            showAlert({
                type: 'warning',
                title: 'Complete Step 1 First',
                message: 'Send a reset code to your email before resetting the password.',
            });
            return;
        }

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
            showAlert({ type: 'error', title: 'Validation Error', message: firstError || 'Please fix form errors.' });
            return;
        }

        setLoadingReset(true);
        try {
            await axios.post(`${baseURL}users/reset-password`, {
                email: normalizedEmail,
                code: code.trim(),
                newPassword,
            });

            showAlert({
                type: 'success',
                title: 'Password Reset Successful',
                message: 'You can now login with your new password.',
                navigateToLogin: true,
            });
        } catch (error) {
            showAlert({
                type: 'error',
                title: 'Reset Failed',
                message: error.response?.data?.message || 'Please try again.',
            });
        } finally {
            setLoadingReset(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background, padding: spacing.lg }]}> 
            <SweetAlert
                visible={alertConfig.visible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                confirmText="OK"
                onConfirm={closeAlert}
                onCancel={closeAlert}
            />
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: ws(12), padding: spacing.md }]}> 
                <Text style={{ color: colors.primary, fontSize: fs(20), fontWeight: '700', marginBottom: spacing.sm }}>
                    Reset Password
                </Text>
                <Text style={{ color: colors.textSecondary, fontSize: fs(13), marginBottom: spacing.md }}>
                    Step 1: Request a reset code. Step 2: Enter the code and set your new password.
                </Text>

                <View style={[styles.stepRow, { marginBottom: spacing.md }]}> 
                    <View style={[styles.stepBadge, { backgroundColor: step === 'request' ? colors.primary : colors.surfaceLight }]}> 
                        <Text style={{ color: step === 'request' ? colors.textOnPrimary : colors.textSecondary, fontWeight: '700', fontSize: fs(12) }}>1</Text>
                    </View>
                    <Text style={{ color: step === 'request' ? colors.text : colors.textSecondary, fontSize: fs(12), marginRight: 10 }}>Request Code</Text>
                    <View style={[styles.stepDivider, { backgroundColor: colors.border }]} />
                    <View style={[styles.stepBadge, { backgroundColor: step === 'reset' ? colors.primary : colors.surfaceLight }]}> 
                        <Text style={{ color: step === 'reset' ? colors.textOnPrimary : colors.textSecondary, fontWeight: '700', fontSize: fs(12) }}>2</Text>
                    </View>
                    <Text style={{ color: step === 'reset' ? colors.text : colors.textSecondary, fontSize: fs(12) }}>Reset Password</Text>
                </View>

                <TextInput
                    mode="outlined"
                    label="Email"
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
                        {loadingSend ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : step === 'request' ? 'Send Reset Code' : 'Resend Code'}
                    </Text>
                </TouchableOpacity>

                {step === 'reset' ? (
                    <>
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
                    </>
                ) : null}
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
    stepRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepBadge: {
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 6,
    },
    stepDivider: {
        height: 1,
        flex: 1,
        marginHorizontal: 8,
    },
});

export default ResetPassword;
