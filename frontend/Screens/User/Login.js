
import React, { useState, useContext, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Platform, TextInput } from 'react-native'
import { useNavigation } from '@react-navigation/native';
import FormContainer from "../../Shared/FormContainer";
import AuthGlobal from '../../Context/Store/AuthGlobal'
import { loginUser, firebaseLoginUser } from '../../Context/Actions/Auth.actions'
import Input from "../../Shared/Input";
import Error from "../../Shared/Error";
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { validateForm, hasErrors } from '../../Shared/FormValidation';
import { auth, googleProvider } from '../../config/firebase';
import { signInWithPopup } from 'firebase/auth';
import Toast from 'react-native-toast-message';
import { useResponsive } from '../../assets/common/responsive';

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

    const handleSubmit = () => {
        const errors = validateForm({ email, password });
        setFieldErrors(errors);
        if (hasErrors(errors)) {
            setError("");
            return;
        }
        setError("");
        setFieldErrors({});
        const user = { email, password };
        loginUser(user, context.dispatch);
    };

    const handleGoogleLogin = async () => {
        if (Platform.OS !== 'web') {
            Toast.show({
                topOffset: 60,
                type: "info",
                text1: "Google Sign-In is only available on web",
            });
            return;
        }
        setGoogleLoading(true);
        try {
            const result = await signInWithPopup(auth, googleProvider);
            const firebaseUser = result.user;

            firebaseLoginUser(
                {
                    email: firebaseUser.email,
                    firebaseUid: firebaseUser.uid,
                    name: firebaseUser.displayName || '',
                },
                context.dispatch
            );
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
                text1: message,
            });
        } finally {
            setGoogleLoading(false);
        }
    };

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

    return (
        <FormContainer title="Login">
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
                onChangeText={(text) => { setEmail(text.toLowerCase()); setFieldErrors(prev => ({ ...prev, email: '' })); }}
            />
            {fieldErrors.email ? <Error message={fieldErrors.email} /> : null}

            <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}> 
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
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <ActivityIndicator color={colors.text} size="small" />
                ) : (
                    <>
                        <Ionicons name="logo-google" size={18} color={colors.secondary} style={{ marginRight: 6 }} />
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(15) }}>Sign in with Google</Text>
                    </>
                )}
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Reset Password')} style={{ marginTop: spacing.sm }}>
                <Text style={{ color: colors.secondary, fontWeight: '600', fontSize: fs(13) }}>Forgot password?</Text>
            </TouchableOpacity>

            <View style={[styles.registerRow, { marginTop: spacing.lg }]}>
                <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>Don't have an account? </Text>
                <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={{ color: colors.secondary, fontWeight: 'bold', fontSize: fs(14) }}>Register</Text>
                </TouchableOpacity>
            </View>
        </FormContainer>
    )
}
const styles = StyleSheet.create({
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