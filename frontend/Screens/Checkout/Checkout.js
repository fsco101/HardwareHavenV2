import React, { useEffect, useState, useContext } from 'react'
import { Text, View, TouchableOpacity, StyleSheet, ActivityIndicator, TextInput } from 'react-native'
import FormContainer from '../../Shared/FormContainer'
import Input from '../../Shared/Input'
import Error from '../../Shared/Error'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigation } from '@react-navigation/native';
import AuthGlobal from '../../Context/Store/AuthGlobal'
import Toast from '../../Shared/SnackbarService';
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { validateForm, hasErrors } from '../../Shared/FormValidation';
import { useResponsive } from '../../assets/common/responsive';
import AsyncStorage from '@react-native-async-storage/async-storage'
import axios from 'axios'
import baseURL from '../../config/api'
import { updateCartQuantity } from '../../Redux/Actions/cartActions'
import { getToken } from '../../assets/common/tokenStorage'

const Checkout = (props) => {
    const colors = useTheme();
    const { fs, ms, spacing, ws } = useResponsive();
    const [user, setUser] = useState('')
    const [orderItems, setOrderItems] = useState([])
    const [address, setAddress] = useState('')
    const [address2, setAddress2] = useState('')
    const [city, setCity] = useState('')
    const [zip, setZip] = useState('')
    const [country, setCountry] = useState('Philippines')
    const [phone, setPhone] = useState('')
    const [region, setRegion] = useState('')
    const [province, setProvince] = useState('')
    const [cityMunicipality, setCityMunicipality] = useState('')
    const [barangay, setBarangay] = useState('')
    const [fieldErrors, setFieldErrors] = useState({})
    const [loading, setLoading] = useState(true)

    const navigation = useNavigation()
    const dispatch = useDispatch()
    const cartItems = useSelector(state => state.cartItems)
    const context = useContext(AuthGlobal);

    const applyProfileToForm = (profile = {}) => {
        setPhone(profile.phone || '');
        setRegion(profile.region || '');
        setProvince(profile.province || '');
        setCityMunicipality(profile.cityMunicipality || '');
        setBarangay(profile.barangay || '');
        setCity(profile.city || profile.cityMunicipality || '');
        setZip(profile.zip || '');
        setCountry(profile.country || 'Philippines');
        const streetParts = [profile.street, profile.barangay].filter(Boolean);
        setAddress(streetParts.join(', ') || '');
        const addr2Parts = [profile.cityMunicipality, profile.province, profile.region].filter(Boolean);
        setAddress2(addr2Parts.join(', ') || '');
    };

    useEffect(() => {
        let isMounted = true;

        setOrderItems((cartItems || []).map(item => ({ ...item, quantity: item.quantity || 1 })))

        if (!cartItems || cartItems.length === 0) {
            Toast.show({
                topOffset: 60,
                type: 'info',
                text1: 'No items in cart',
                text2: 'Add products before checkout.',
            });
            navigation.navigate('Cart Screen', { screen: 'Cart' });
            setLoading(false);
            return;
        }

        const bootstrapCheckout = async () => {
            if (!context.stateUser.isAuthenticated) {
                navigation.navigate("User", { screen: 'Login' });
                Toast.show({
                    topOffset: 60,
                    type: "error",
                    text1: "Please Login to Checkout",
                    text2: ""
                });
                if (isMounted) setLoading(false);
                return;
            }

            const userId = context.stateUser.user.userId;
            setUser(userId);

            const cacheKey = `profile_cache_${userId}`;

            // 1) Hydrate instantly from cache (if available)
            try {
                const cached = await AsyncStorage.getItem(cacheKey);
                if (cached && isMounted) {
                    const cachedProfile = JSON.parse(cached);
                    applyProfileToForm(cachedProfile);
                    setLoading(false);
                }
            } catch (e) {
                // Keep going even if cache parse fails
            }

            // 2) Fetch fresh profile in background
            try {
                const token = await getToken();
                const res = await axios.get(`${baseURL}users/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` },
                    timeout: 5000,
                });

                const profile = res.data || {};

                if (!isMounted) return;

                // Persist fresh profile for faster next checkout load
                AsyncStorage.setItem(cacheKey, JSON.stringify(profile)).catch(() => null);

                // Check if user has phone and address
                const hasPhone = profile.phone && profile.phone.trim() !== '';
                const hasAddress = (profile.street || profile.barangay || profile.cityMunicipality || profile.region);
                if (!hasPhone || !hasAddress) {
                    Toast.show({
                        topOffset: 60,
                        type: "info",
                        text1: "Profile Incomplete",
                        text2: "Please update your address and phone in your profile first.",
                    });
                    navigation.navigate("User", { screen: 'User Profile' });
                    setLoading(false);
                    return;
                }

                applyProfileToForm(profile);
            } catch (err) {
                // Stop spinner even when API is slow/fails.
                if (isMounted) setLoading(false);
                console.log(err?.message || err);
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        bootstrapCheckout();

        return () => {
            isMounted = false;
        }
    }, [cartItems, context.stateUser.isAuthenticated, context.stateUser.user?.userId])

    const checkOut = () => {
        if (!user) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Please login again',
                text2: 'Unable to resolve your account for this order.',
            });
            navigation.navigate('User', { screen: 'Login' });
            return;
        }

        if (!orderItems || orderItems.length === 0) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Cart is empty',
            });
            navigation.navigate('Cart Screen', { screen: 'Cart' });
            return;
        }

        const errors = validateForm({
            phone,
            shippingAddress1: address,
        });
        if (errors.shippingAddress1) {
            errors.address = errors.shippingAddress1;
            delete errors.shippingAddress1;
        }
        setFieldErrors(errors);
        if (hasErrors(errors)) return;

        let order = {
            city,
            country,
            dateOrdered: Date.now(),
            orderItems,
            phone,
            shippingAddress1: address,
            shippingAddress2: address2,
            region,
            province,
            cityMunicipality,
            barangay,
            user,
            zip,
        }
        navigation.navigate("Payment", { order })
    }

    const handleQuantityInput = (item, inputText) => {
        const cleaned = String(inputText || '').replace(/[^0-9]/g, '');
        if (!cleaned) return;

        const parsed = parseInt(cleaned, 10);
        if (Number.isNaN(parsed)) return;

        const maxStock = Number(item.countInStock || 1);
        const nextQty = Math.max(1, Math.min(parsed, maxStock));

        const itemId = item._id || item.id;
        setOrderItems(prev => prev.map(oi => ((oi._id || oi.id) === itemId ? { ...oi, quantity: nextQty } : oi)));
        dispatch(updateCartQuantity({ ...item, quantity: nextQty }));
    };

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text style={{ color: colors.textSecondary, marginTop: 10 }}>Loading address...</Text>
            </View>
        );
    }

    return (
        <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            extraHeight={200}
            enableOnAndroid={true}
            style={{ backgroundColor: colors.background }}
            contentContainerStyle={{ flexGrow: 1, paddingBottom: spacing.xl }}
            showsVerticalScrollIndicator={true}
        >
            <FormContainer title={"Shipping Address"}>
                <View style={[styles.qtyCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, width: '80%' }]}> 
                    <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fs(14), marginBottom: spacing.sm }}>Order Quantity</Text>
                    {(orderItems || []).map((item) => (
                        <View key={item._id || item.id} style={[styles.qtyRow, { borderBottomColor: colors.border }]}> 
                            <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={{ color: colors.text, fontSize: fs(13), fontWeight: '600' }} numberOfLines={1}>{item.name}</Text>
                                <Text style={{ color: colors.textSecondary, fontSize: fs(11) }}>Stock: {item.countInStock || 0}</Text>
                            </View>
                            <TextInput
                                style={[styles.qtyInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                                keyboardType="numeric"
                                value={String(item.quantity || 1)}
                                onChangeText={(text) => handleQuantityInput(item, text)}
                            />
                        </View>
                    ))}
                </View>

                <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, marginBottom: spacing.md, width: '80%' }]}>
                    <Ionicons name="information-circle-outline" size={16} color={colors.secondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginLeft: 6, flex: 1 }}>
                        Shipping address is synced from your profile. To change it, edit your profile first.
                    </Text>
                </View>

                <Input placeholder={"Phone"} name={"phone"} value={phone} keyboardType={"numeric"}
                    error={!!fieldErrors.phone}
                    editable={false} selectTextOnFocus={false} />
                {fieldErrors.phone ? <Error message={fieldErrors.phone} /> : null}

                <Input placeholder={"Shipping Address 1"} name={"ShippingAddress1"} value={address}
                    error={!!fieldErrors.address}
                    editable={false} selectTextOnFocus={false} />
                {fieldErrors.address ? <Error message={fieldErrors.address} /> : null}

                <Input placeholder={"Shipping Address 2"} name={"ShippingAddress2"} value={address2}
                    editable={false} selectTextOnFocus={false} />
                <Input placeholder={"City / Municipality"} name={"city"} value={city}
                    editable={false} selectTextOnFocus={false} />
                <Input placeholder={"Zip Code"} name={"zip"} value={zip} keyboardType={"numeric"}
                    editable={false} selectTextOnFocus={false} />

                <TouchableOpacity
                    style={[styles.editProfileBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border, paddingVertical: spacing.sm, borderRadius: ws(10), marginTop: spacing.sm }]}
                    onPress={() => navigation.navigate('User', { screen: 'User Profile' })}
                    activeOpacity={0.7}
                >
                    <Ionicons name="create-outline" size={ms(18, 0.3)} color={colors.text} />
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: fs(14), marginLeft: spacing.sm }}>
                        Edit Address in Profile
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.confirmBtn, { backgroundColor: colors.primary, paddingVertical: spacing.sm + 6, borderRadius: ws(10), marginTop: spacing.lg, marginBottom: spacing.xl }]}
                    onPress={() => checkOut()}
                    activeOpacity={0.7}
                >
                    <Ionicons name="arrow-forward-circle-outline" size={ms(20, 0.3)} color={colors.textOnPrimary} />
                    <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', fontSize: fs(16), marginLeft: spacing.sm }}>Continue</Text>
                </TouchableOpacity>
            </FormContainer>
        </KeyboardAwareScrollView>
    )
}

const styles = StyleSheet.create({
    qtyCard: {
        borderWidth: 1,
        borderRadius: 10,
    },
    qtyRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        borderBottomWidth: 1,
    },
    qtyInput: {
        width: 56,
        height: 34,
        borderWidth: 1,
        borderRadius: 8,
        textAlign: 'center',
        fontWeight: '700',
    },
    infoCard: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 10,
    },
    confirmBtn: {
        flexDirection: 'row',
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
    },
    editProfileBtn: {
        flexDirection: 'row',
        width: '80%',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
    },
});

export default Checkout