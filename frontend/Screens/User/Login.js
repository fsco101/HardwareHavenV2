
import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import * as AuthSession from 'expo-auth-session';
import Constants from 'expo-constants';
import FormContainer from "../../Shared/FormContainer";
import AuthGlobal from '../../Context/Store/AuthGlobal'
import { loginUser, firebaseLoginUser } from '../../Context/Actions/Auth.actions'
import Input from "../../Shared/Input";
import Error from "../../Shared/Error";
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { validateForm, hasErrors } from '../../Shared/FormValidation';
import { auth, googleProvider, googleAuthConfig } from '../../config/firebase';
import { GoogleAuthProvider, signInWithCredential, signInWithPopup } from 'firebase/auth';
import Toast from '../../Shared/SnackbarService';
import { useResponsive } from '../../assets/common/responsive';
import SweetAlert from '../../Shared/SweetAlert';

WebBrowser.maybeCompleteAuthSession();

const Login = (props) => {
    const context = useContext(AuthGlobal)
    const navigation = useNavigation()
    const colors = useTheme();
    const { fs, ms, spacing, ws } = useResponsive();
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState("")
    const [fieldErrors, setFieldErrors] = useState({})
    const [googleLoading, setGoogleLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [deactivationAlert, setDeactivationAlert] = useState({ visible: false, message: '' })
    const isExpoGo =
        Constants.appOwnership === 'expo' ||
        Constants.executionEnvironment === 'storeClient';

    const nativeGoogleRedirectUri = AuthSession.makeRedirectUri({
        scheme: Constants.expoConfig?.scheme || 'hardwarehaven',
        path: 'oauthredirect',
    });

    const getLoginErrorToast = (result) => {
        const rawMessage = String(result?.message || '').toLowerCase();

        if (rawMessage.includes('password is wrong')) {
            return {
                text1: 'Incorrect password',
                text2: 'Double-check your password and try again.',
            };
        }

        if (rawMessage.includes('user not found') || rawMessage.includes('the user not found')) {
            return {
                text1: 'Account not found',
                text2: 'No account matches this email address.',
            };
        }

        if (rawMessage.includes('network')) {
            return {
                text1: 'Network issue',
                text2: 'Check your connection, then try again.',
            };
        }

        return {
            text1: 'Login failed',
            text2: result?.message || 'Please check your credentials and try again.',
        };
    };

    const googleRequestConfig = {
        expoClientId: googleAuthConfig.expoClientId || googleAuthConfig.webClientId,
        androidClientId:
            googleAuthConfig.androidClientId ||
            googleAuthConfig.webClientId ||
            googleAuthConfig.expoClientId,
        iosClientId:
            googleAuthConfig.iosClientId ||
            googleAuthConfig.webClientId ||
            googleAuthConfig.expoClientId,
        webClientId: googleAuthConfig.webClientId || googleAuthConfig.expoClientId,
        redirectUri: Platform.OS === 'web' ? undefined : nativeGoogleRedirectUri,
        responseType: 'id_token',
        scopes: ['openid', 'profile', 'email'],
        prompt: 'login',
    };

    const [request, response, promptAsync] = Google.useAuthRequest(googleRequestConfig);

    useEffect(() => {
        if (!__DEV__) {
            return;
        }

        console.log('[GoogleAuth][Config]', {
            platform: Platform.OS,
            appOwnership: Constants.appOwnership,
            executionEnvironment: Constants.executionEnvironment,
            scheme: Constants.expoConfig?.scheme,
            isExpoGo,
            nativeGoogleRedirectUri,
            requestRedirectUri: request?.redirectUri,
            requestUrl: request?.url,
        });
    }, [isExpoGo, nativeGoogleRedirectUri, request]);

    const showDeactivationAlert = (deactivation) => {
        const reason = String(deactivation?.reason || 'No reason provided by admin.').trim();
        const dateRaw = deactivation?.date;
        const dateText = dateRaw ? new Date(dateRaw).toLocaleString() : 'Date unavailable';

        setDeactivationAlert({
            visible: true,
            message: `Your account was deactivated on ${dateText}.\n\nReason: ${reason}`,
        });
    };

    const handleSubmit = async () => {
        const errors = validateForm({ email, password });
        setFieldErrors(errors);
        if (hasErrors(errors)) {
            setError("");
            return;
        }
        setError("");
        setFieldErrors({});
        const user = { email, password };
        const result = await loginUser(user, context.dispatch);

        if (!result?.success) {
            if (result?.code === 'ACCOUNT_DEACTIVATED') {
                showDeactivationAlert(result?.deactivation);
                return;
            }

            const toast = getLoginErrorToast(result);

            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: toast.text1,
                text2: toast.text2,
            });
        }
    };

    const handleGoogleLogin = async () => {
        if (Platform.OS !== 'web') {
            if (isExpoGo) {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Google Sign-In not supported in Expo Go',
                    text2: 'Use a development build or APK so Google can redirect back to your app scheme.',
                });
                return;
            }

            if (!request) {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Google Sign-In unavailable',
                    text2: 'Google client IDs are missing or invalid in app configuration.',
                });
                return;
            }

            if (__DEV__) {
                console.log('[GoogleAuth][PromptStart]', {
                    requestRedirectUri: request?.redirectUri,
                    requestUrl: request?.url,
                });
            }

            setGoogleLoading(true);
            await promptAsync();
            return;
        }

        setGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;
            const idToken = await firebaseUser.getIdToken();

            const loginResult = await firebaseLoginUser(
                {
                    idToken,
                },
                context.dispatch
            );

            if (!loginResult?.success) {
                if (loginResult?.code === 'ACCOUNT_DEACTIVATED') {
                    showDeactivationAlert(loginResult?.deactivation);
                    return;
                }

                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Google login failed',
                    text2: loginResult?.message || 'Please try again or use email/password login.',
                });
            }
        } catch (err) {
            if (err.code === 'auth/popup-closed-by-user') return;
            let message = 'Google sign-in failed';
            if (err.code === 'auth/account-exists-with-different-credential')
                message = 'An account already exists with this email';
            else if (err.code === 'auth/cancelled-popup-request')
                return;

            Toast.show({
                topOffset: 60,
                type: "error",
                text1: 'Google login failed',
                text2: message,
            });
        } finally {
            setGoogleLoading(false);
        }
    };

    useEffect(() => {
        const handleMobileGoogleLogin = async () => {
            if (Platform.OS === 'web') {
                return;
            }

            if (__DEV__ && response) {
                console.log('[GoogleAuth][Response]', {
                    type: response.type,
                    hasAuthentication: !!response.authentication,
                    hasParams: !!response.params,
                    hasIdToken:
                        !!response.authentication?.idToken ||
                        !!response.params?.id_token,
                });
            }

            if (!response || response.type !== 'success') {
                if (response?.type === 'cancel' || response?.type === 'dismiss') {
                    setGoogleLoading(false);
                }
                return;
            }

            try {
                const idToken = response.authentication?.idToken || response.params?.id_token;
                if (!idToken) {
                    throw new Error('Google authentication did not return an ID token.');
                }

                const credential = GoogleAuthProvider.credential(idToken);
                const firebaseCredentialResult = await signInWithCredential(auth, credential);
                const firebaseIdToken = await firebaseCredentialResult.user.getIdToken();

                const loginResult = await firebaseLoginUser(
                    {
                        idToken: firebaseIdToken,
                    },
                    context.dispatch
                );

                if (!loginResult?.success) {
                    if (loginResult?.code === 'ACCOUNT_DEACTIVATED') {
                        showDeactivationAlert(loginResult?.deactivation);
                        return;
                    }

                    Toast.show({
                        topOffset: 60,
                        type: 'error',
                        text1: 'Google login failed',
                        text2: loginResult?.message || 'Please try again or use email/password login.',
                    });
                }
            } catch (err) {
                Toast.show({
                    topOffset: 60,
                    type: 'error',
                    text1: 'Google login failed',
                    text2: err?.message || 'Please try again.',
                });
            } finally {
                setGoogleLoading(false);
            }
        };

        handleMobileGoogleLogin();
    }, [context.dispatch, response]);

    useEffect(() => {
        if (context.stateUser.isAuthenticated === true) {
            const isAdmin = context.stateUser?.user?.isAdmin === true;
            const parentNavigation = navigation.getParent();
            if (isAdmin) {
                if (parentNavigation) {
                    parentNavigation.navigate('Admin', { screen: 'Dashboard' });
                } else {
                    navigation.navigate('Admin', { screen: 'Dashboard' });
                }
            } else {
                if (parentNavigation) {
                    parentNavigation.navigate('Home', { screen: 'Main' });
                } else {
                    navigation.navigate('Home', { screen: 'Main' });
                }
            }
        }
    }, [context.stateUser.isAuthenticated, context.stateUser?.user?.isAdmin, navigation])

    const handleForgotPassword = () => {
        const currentRouteNames = navigation.getState?.()?.routeNames || [];
        if (currentRouteNames.includes('Reset Password')) {
            navigation.navigate('Reset Password');
            return;
        }

        if (currentRouteNames.includes('User')) {
            navigation.navigate('User', { screen: 'Reset Password' });
            return;
        }

        const parentNavigation = navigation.getParent?.();
        const parentRouteNames = parentNavigation?.getState?.()?.routeNames || [];
        if (parentNavigation && parentRouteNames.includes('User')) {
            parentNavigation.navigate('User', { screen: 'Reset Password' });
            return;
        }

        navigation.navigate('Reset Password');
    };

    return (
        <View style={[styles.screen, { backgroundColor: colors.background }]}> 
            <FormContainer title="Login">
                <SweetAlert
                    visible={deactivationAlert.visible}
                    type="warning"
                    title="Account Deactivated"
                    message={deactivationAlert.message}
                    confirmText="OK"
                    onConfirm={() => setDeactivationAlert({ visible: false, message: '' })}
                    onCancel={() => setDeactivationAlert({ visible: false, message: '' })}
                />
                <View style={{ marginBottom: spacing.md, alignItems: 'center' }}>
                    <View style={[styles.iconCircle, { backgroundColor: colors.surfaceLight, width: 64, height: 64, borderRadius: 32 }]}> 
                        <Ionicons name="person-circle-outline" size={40} color={colors.primary} />
                    </View>
                </View>
                <Input
                    placeholder={"Enter email"}
                    name={"email"}
                    id={"email"}
                    value={email}
                    error={!!fieldErrors.email}
                    onChangeText={(text) => { setEmail(text.toLowerCase()); setFieldErrors(prev => ({ ...prev, email: '' })); }}
                />
                {fieldErrors.email ? <Error message={fieldErrors.email} /> : null}

                <View
                    style={[
                        styles.passwordInputWrap,
                        {
                            backgroundColor: colors.inputBg,
                            borderColor: fieldErrors.password ? colors.danger : colors.border,
                        },
                    ]}
                > 
                    <TextInput
                        style={[styles.passwordInput, { color: colors.text, fontSize: fs(14) }]}
                        placeholder="Enter Password"
                        placeholderTextColor={colors.textSecondary}
                        value={password}
                        secureTextEntry={!showPassword}
                        onChangeText={(text) => { setPassword(text); setFieldErrors(prev => ({ ...prev, password: '' })); }}
                    />
                    <TouchableOpacity onPress={() => setShowPassword((prev) => !prev)} style={styles.eyeBtn} activeOpacity={0.7}>
                        <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                {fieldErrors.password ? <Error message={fieldErrors.password} /> : null}

                {error ? <Error message={error} /> : null}

                <TouchableOpacity
                    style={[styles.loginBtn, { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8, marginTop: spacing.md }]}
                    onPress={() => handleSubmit()}
                    activeOpacity={0.7}
                >
                    <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', fontSize: fs(15) }}>Login</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.googleBtn, { backgroundColor: colors.surface, borderColor: colors.border, paddingVertical: 10, borderRadius: 8, marginTop: 8 }]}
                    onPress={() => handleGoogleLogin()}
                    activeOpacity={0.7}
                    disabled={googleLoading || (Platform.OS !== 'web' && isExpoGo)}
                >
                    {googleLoading ? (
                        <ActivityIndicator color={colors.text} size="small" />
                    ) : (
                        <>
                            <Ionicons name="logo-google" size={18} color={colors.secondary} style={{ marginRight: 6 }} />
                            <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(15) }}>
                                {Platform.OS !== 'web' && isExpoGo ? 'Google Sign-In requires dev build' : 'Sign in with Google'}
                            </Text>
                        </>
                    )}
                </TouchableOpacity>

                <TouchableOpacity onPress={handleForgotPassword} style={{ marginTop: spacing.sm }}>
                    <Text style={{ color: colors.secondary, fontWeight: '600', fontSize: fs(13) }}>Forgot password?</Text>
                </TouchableOpacity>

                <View style={[styles.registerRow, { marginTop: spacing.lg }]}> 
                    <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>Don't have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                        <Text style={{ color: colors.secondary, fontWeight: 'bold', fontSize: fs(14) }}>Register</Text>
                    </TouchableOpacity>
                </View>
            </FormContainer>
        </View>
    )
}
const styles = StyleSheet.create({
    screen: {
        flex: 1,
    },
    iconCircle: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    passwordInputWrap: {
        width: '80%',
        borderWidth: 1.5,
        margin: 6,
        borderRadius: 10,
        paddingHorizontal: 12,
        height: 44,
        flexDirection: 'row',
        alignItems: 'center',
    },
    passwordInput: {
        flex: 1,
    },
    eyeBtn: {
        paddingLeft: 8,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loginBtn: {
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    googleBtn: {
        width: '80%',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
    registerRow: {
        flexDirection: 'row',
    },
});
export default Login;