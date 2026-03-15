import React, { useState, useEffect, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Animated,
    ScrollView,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useNavigation } from '@react-navigation/native';

import Input from "../../Shared/Input";
import Error from "../../Shared/Error";
import CustomDropdown from "../../Shared/CustomDropdown";
import axios from "axios";
import baseURL from "../../config/api";
import Toast from '../../Shared/SnackbarService';
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../../Theme/theme';
import { validateForm, hasErrors } from '../../Shared/FormValidation';
import { uploadToCloudinary } from '../../assets/common/cloudinaryUpload';

import * as ImagePicker from "expo-image-picker";
import { useResponsive } from '../../assets/common/responsive';
import {
    findPsgcRegionByNameOrDesignation,
    getPsgcBarangaysByCity,
    getPsgcMunicipalitiesByProvince,
    getPsgcProvincesByRegion,
    getPsgcRegions,
} from '../../assets/common/psgcUtils';

const STEPS = [
    { key: 'account', title: 'Account', icon: 'person-outline' },
    { key: 'address', title: 'Address', icon: 'location-outline' },
    { key: 'review', title: 'Review', icon: 'checkmark-circle-outline' },
];

const Register = (props) => {
    const colors = useTheme();
    const { fs, ms, spacing, ws, wp } = useResponsive();
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [image, setImage] = useState(null);
    const [mainImage, setMainImage] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(0);
    const [showPassword, setShowPassword] = useState(false);

    // PH Address fields
    const [selectedRegion, setSelectedRegion] = useState('');
    const [selectedProvince, setSelectedProvince] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [barangay, setBarangay] = useState('');
    const [street, setStreet] = useState('');
    const [zip, setZip] = useState('');

    const [filteredProvinces, setFilteredProvinces] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredBarangays, setFilteredBarangays] = useState([]);

    // Animations
    const slideAnim = useRef(new Animated.Value(0)).current;
    const fadeAnim = useRef(new Animated.Value(1)).current;

    const navigation = useNavigation();

    // Prepare dropdown data from psgc
    const allRegions = getPsgcRegions();

    const regionData = allRegions.map(r => ({ label: r.name, value: r.designation }));
    const provinceData = filteredProvinces.map(p => ({ label: p.name, value: p.name }));
    const cityData = filteredCities.map(c => ({ label: (c.city ? 'City of ' : '') + c.name, value: c.name }));
    const barangayData = filteredBarangays.map(b => ({ label: b.name, value: b.name }));

    useEffect(() => {
        if (selectedRegion) {
            const filtered = getPsgcProvincesByRegion(selectedRegion);
            setFilteredProvinces(filtered);
            setSelectedProvince('');
            setSelectedCity('');
            setBarangay('');
            setFilteredCities([]);
            setFilteredBarangays([]);
        } else {
            setFilteredProvinces([]);
            setSelectedProvince('');
            setSelectedCity('');
            setBarangay('');
            setFilteredCities([]);
            setFilteredBarangays([]);
        }
    }, [selectedRegion]);

    useEffect(() => {
        if (selectedProvince) {
            const filtered = getPsgcMunicipalitiesByProvince(selectedProvince);
            setFilteredCities(filtered);
            setSelectedCity('');
            setBarangay('');
            setFilteredBarangays([]);
        } else {
            setFilteredCities([]);
            setSelectedCity('');
            setBarangay('');
            setFilteredBarangays([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedCity) {
            const filtered = getPsgcBarangaysByCity({
                province: selectedProvince,
                cityMunicipality: selectedCity,
            });
            setFilteredBarangays(filtered);
            setBarangay('');
        } else {
            setFilteredBarangays([]);
            setBarangay('');
        }
    }, [selectedCity]);

    const animateStep = (newStep) => {
        const direction = newStep > step ? 1 : -1;
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
            Animated.timing(slideAnim, { toValue: -direction * 40, duration: 150, useNativeDriver: true }),
        ]).start(() => {
            setStep(newStep);
            slideAnim.setValue(direction * 40);
            Animated.parallel([
                Animated.timing(fadeAnim, { toValue: 1, duration: 200, useNativeDriver: true }),
                Animated.timing(slideAnim, { toValue: 0, duration: 200, useNativeDriver: true }),
            ]).start();
        });
    };

    const takePhoto = async () => {
        const c = await ImagePicker.requestCameraPermissionsAsync();
        if (c.status === "granted") {
            let result = await ImagePicker.launchCameraAsync({
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setMainImage(result.assets[0].uri);
                setImage(result.assets[0].uri);
            }
        }
    };

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1,
        });
        if (!result.canceled) {
            setImage(result.assets[0].uri);
            setMainImage(result.assets[0].uri);
        }
    };

    const validateStep = (currentStep) => {
        if (currentStep === 0) {
            const errors = validateForm({ email, name, phone, password });
            setFieldErrors(errors);
            return !hasErrors(errors);
        }
        if (currentStep === 1) {
            const errors = validateForm({
                region: selectedRegion,
                province: selectedProvince,
                cityMunicipality: selectedCity,
                barangay,
            });
            setFieldErrors(errors);
            return !hasErrors(errors);
        }
        return true;
    };

    const handleNext = () => {
        if (validateStep(step)) {
            animateStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            animateStep(step - 1);
        }
    };

    const register = async () => {
        const errors = validateForm({
            email, name, phone, password,
            region: selectedRegion,
            province: selectedProvince,
            cityMunicipality: selectedCity,
            barangay,
        });
        setFieldErrors(errors);
        if (hasErrors(errors)) {
            // Go to first step with errors
            if (errors.email || errors.name || errors.phone || errors.password) {
                animateStep(0);
            } else {
                animateStep(1);
            }
            return;
        }

        setLoading(true);

        try {
            let avatarUrl = '';
            if (image) {
                avatarUrl = await uploadToCloudinary(image, 'hardwarehaven/avatars');
            }

            const regionName = findPsgcRegionByNameOrDesignation(selectedRegion)?.name || '';
            const provinceName = selectedProvince;
            const cityName = selectedCity;

            const userData = {
                name,
                email,
                password,
                phone,
                isAdmin: false,
                image: avatarUrl,
                region: regionName,
                province: provinceName,
                cityMunicipality: cityName,
                barangay,
                street,
                zip,
                country: 'Philippines',
            };

            const res = await axios.post(`${baseURL}users/register`, userData, {
                headers: { "Content-Type": "application/json" },
            });

            if (res.status === 200) {
                Toast.show({
                    topOffset: 60,
                    type: "success",
                    text1: "Registration Succeeded",
                    text2: "Please Login into your account",
                });
                setTimeout(() => {
                    navigation.navigate("Login");
                }, 500);
            }
        } catch (error) {
            Toast.show({
                position: 'bottom',
                bottomOffset: 20,
                type: "error",
                text1: "Something went wrong",
                text2: "Please try again",
            });
            console.log(error);
        } finally {
            setLoading(false);
        }
    };

    const clearFieldError = (field) => {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

    const getRegionName = () => findPsgcRegionByNameOrDesignation(selectedRegion)?.name || '—';
    const getProvinceName = () => selectedProvince || '—';
    const getCityName = () => selectedCity || '—';

    // ─── Step Progress Bar ───
    const renderProgressBar = () => (
        <View style={styles.progressContainer}>
            {STEPS.map((s, i) => {
                const isActive = i === step;
                const isDone = i < step;
                return (
                    <React.Fragment key={s.key}>
                        <TouchableOpacity
                            onPress={() => {
                                if (i < step) animateStep(i);
                                else if (i === step + 1 && validateStep(step)) animateStep(i);
                            }}
                            style={[
                                styles.stepDot,
                                {
                                    backgroundColor: isDone ? colors.success : isActive ? colors.primary : colors.surfaceLight,
                                    borderColor: isDone ? colors.success : isActive ? colors.primary : colors.border,
                                },
                            ]}
                        >
                            {isDone ? (
                                <Ionicons name="checkmark" size={ms(16, 0.3)} color={colors.textOnPrimary} />
                            ) : (
                                <Ionicons name={s.icon} size={ms(16, 0.3)} color={isActive ? colors.textOnPrimary : colors.textSecondary} />
                            )}
                        </TouchableOpacity>
                        {i < STEPS.length - 1 && (
                            <View style={[styles.stepLine, { backgroundColor: i < step ? colors.success : colors.border }]} />
                        )}
                    </React.Fragment>
                );
            })}
        </View>
    );

    // ─── Step 1: Account Info ───
    const renderAccountStep = () => (
        <View style={styles.stepContent}>
            <View style={[styles.avatarSection, { borderColor: colors.border }]}>
                <View style={[styles.imageContainer, { borderColor: mainImage ? colors.primary : colors.border, backgroundColor: colors.surfaceLight, width: 90, height: 90, borderRadius: 45, marginBottom: 8 }]}>
                    {mainImage ? (
                        <Image style={styles.image} source={{ uri: mainImage }} />
                    ) : (
                        <Ionicons name="person" size={40} color={colors.textSecondary} />
                    )}
                </View>
                <View style={styles.imageButtons}>
                    <TouchableOpacity
                        onPress={takePhoto}
                        style={[styles.imgBtn, { backgroundColor: colors.primary }]}
                    >
                        <Ionicons name="camera" size={ms(18, 0.3)} color={colors.textOnPrimary} />
                        <Text style={[styles.imgBtnText, { color: colors.textOnPrimary, fontSize: fs(13) }]}>Camera</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={pickImage}
                        style={[styles.imgBtn, { backgroundColor: colors.secondary }]}
                    >
                        <Ionicons name="image" size={ms(18, 0.3)} color={colors.textOnPrimary} />
                        <Text style={[styles.imgBtnText, { color: colors.textOnPrimary, fontSize: fs(13) }]}>Gallery</Text>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={styles.fieldGroup}>
                <View style={styles.fieldLabel}>
                    <Ionicons name="mail-outline" size={ms(16, 0.3)} color={colors.primary} />
                    <Text style={[styles.fieldLabelText, { color: colors.textSecondary, fontSize: fs(13) }]}>Email</Text>
                </View>
                <Input
                    placeholder={"your@email.com"}
                    name={"email"}
                    id={"email"}
                    value={email}
                    onChangeText={(text) => { setEmail(text.toLowerCase()); clearFieldError('email'); }}
                />
                {fieldErrors.email ? <Error message={fieldErrors.email} /> : null}
            </View>

            <View style={styles.fieldGroup}>
                <View style={styles.fieldLabel}>
                    <Ionicons name="person-outline" size={ms(16, 0.3)} color={colors.primary} />
                    <Text style={[styles.fieldLabelText, { color: colors.textSecondary, fontSize: fs(13) }]}>Full Name</Text>
                </View>
                <Input
                    placeholder={"Juan Dela Cruz"}
                    name={"name"}
                    id={"name"}
                    value={name}
                    onChangeText={(text) => { setName(text); clearFieldError('name'); }}
                />
                {fieldErrors.name ? <Error message={fieldErrors.name} /> : null}
            </View>

            <View style={styles.fieldGroup}>
                <View style={styles.fieldLabel}>
                    <Ionicons name="call-outline" size={ms(16, 0.3)} color={colors.primary} />
                    <Text style={[styles.fieldLabelText, { color: colors.textSecondary, fontSize: fs(13) }]}>Phone</Text>
                </View>
                <Input
                    placeholder={"09XX XXX XXXX"}
                    name={"phone"}
                    id={"phone"}
                    value={phone}
                    keyboardType={"numeric"}
                    onChangeText={(text) => { setPhone(text); clearFieldError('phone'); }}
                />
                {fieldErrors.phone ? <Error message={fieldErrors.phone} /> : null}
            </View>

            <View style={styles.fieldGroup}>
                <View style={styles.fieldLabel}>
                    <Ionicons name="lock-closed-outline" size={ms(16, 0.3)} color={colors.primary} />
                    <Text style={[styles.fieldLabelText, { color: colors.textSecondary, fontSize: fs(13) }]}>Password</Text>
                </View>
                <View style={styles.passwordRow}>
                    <Input
                        placeholder={"Create a password"}
                        name={"password"}
                        id={"password"}
                        value={password}
                        secureTextEntry={!showPassword}
                        onChangeText={(text) => { setPassword(text); clearFieldError('password'); }}
                    />
                    <TouchableOpacity
                        onPress={() => setShowPassword(!showPassword)}
                        style={[styles.eyeBtn, { top: ws(22) }]}
                    >
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={ms(22, 0.3)} color={colors.textSecondary} />
                    </TouchableOpacity>
                </View>
                {fieldErrors.password ? <Error message={fieldErrors.password} /> : null}
            </View>
        </View>
    );

    // ─── Step 2: Address ───
    const renderAddressStep = () => (
        <View style={styles.stepContent}>
            <View style={[styles.sectionCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.lg, borderRadius: ws(16) }]}>
                <View style={[styles.sectionCardHeader, { marginBottom: spacing.md }]}>
                    <Ionicons name="flag-outline" size={ms(20, 0.3)} color={colors.primary} />
                    <Text style={[styles.sectionCardTitle, { color: colors.primary, fontSize: fs(17) }]}>Philippine Address</Text>
                </View>

                <View style={styles.dropdownField}>
                    <CustomDropdown
                        label="Region"
                        data={regionData}
                        value={selectedRegion}
                        onSelect={(val) => { setSelectedRegion(val); clearFieldError('region'); }}
                        placeholder="Select Region"
                        searchable={true}
                        icon="globe-outline"
                        error={!!fieldErrors.region}
                    />
                    {fieldErrors.region ? <Error message={fieldErrors.region} /> : null}
                </View>

                <View style={styles.dropdownField}>
                    <CustomDropdown
                        label="Province"
                        data={provinceData}
                        value={selectedProvince}
                        onSelect={(val) => { setSelectedProvince(val); clearFieldError('province'); }}
                        placeholder="Select Province"
                        enabled={filteredProvinces.length > 0}
                        searchable={true}
                        icon="map-outline"
                        error={!!fieldErrors.province}
                    />
                    {fieldErrors.province ? <Error message={fieldErrors.province} /> : null}
                </View>

                <View style={styles.dropdownField}>
                    <CustomDropdown
                        label="City / Municipality"
                        data={cityData}
                        value={selectedCity}
                        onSelect={(val) => { setSelectedCity(val); clearFieldError('cityMunicipality'); }}
                        placeholder="Select City/Municipality"
                        enabled={filteredCities.length > 0}
                        searchable={true}
                        icon="business-outline"
                        error={!!fieldErrors.cityMunicipality}
                    />
                    {fieldErrors.cityMunicipality ? <Error message={fieldErrors.cityMunicipality} /> : null}
                </View>

                <View style={styles.dropdownField}>
                    <CustomDropdown
                        label="Barangay"
                        data={barangayData}
                        value={barangay}
                        onSelect={(val) => { setBarangay(val); clearFieldError('barangay'); }}
                        placeholder="Select Barangay"
                        enabled={filteredBarangays.length > 0}
                        searchable={true}
                        icon="home-outline"
                        error={!!fieldErrors.barangay}
                    />
                    {fieldErrors.barangay ? <Error message={fieldErrors.barangay} /> : null}
                </View>

                <View style={styles.fieldGroup}>
                    <View style={styles.fieldLabel}>
                        <Ionicons name="navigate-outline" size={ms(16, 0.3)} color={colors.textSecondary} />
                        <Text style={[styles.fieldLabelText, { color: colors.textSecondary, fontSize: fs(13) }]}>Street (optional)</Text>
                    </View>
                    <Input
                        placeholder={"Street Address"}
                        name={"street"}
                        id={"street"}
                        value={street}
                        onChangeText={(text) => setStreet(text)}
                    />
                </View>

                <View style={styles.fieldGroup}>
                    <View style={styles.fieldLabel}>
                        <Ionicons name="mail-open-outline" size={ms(16, 0.3)} color={colors.textSecondary} />
                        <Text style={[styles.fieldLabelText, { color: colors.textSecondary, fontSize: fs(13) }]}>Zip Code (optional)</Text>
                    </View>
                    <Input
                        placeholder={"Zip Code"}
                        name={"zip"}
                        id={"zip"}
                        value={zip}
                        keyboardType={"numeric"}
                        onChangeText={(text) => setZip(text)}
                    />
                </View>
            </View>
        </View>
    );

    // ─── Step 3: Review ───
    const renderReviewStep = () => (
        <View style={styles.stepContent}>
            <View style={[styles.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.lg, borderRadius: ws(16) }]}>
                <View style={styles.reviewAvatarRow}>
                    <View style={[styles.reviewAvatar, { borderColor: colors.primary, backgroundColor: colors.surfaceLight, width: ms(60, 0.3), height: ms(60, 0.3), borderRadius: ms(30, 0.3) }]}>
                        {mainImage ? (
                            <Image style={styles.reviewAvatarImage} source={{ uri: mainImage }} />
                        ) : (
                            <Ionicons name="person" size={ms(30, 0.3)} color={colors.textSecondary} />
                        )}
                    </View>
                    <View style={{ marginLeft: spacing.sm + 6, flex: 1 }}>
                        <Text style={[styles.reviewName, { color: colors.text, fontSize: fs(18) }]}>{name || 'Your Name'}</Text>
                        <Text style={[styles.reviewEmail, { color: colors.textSecondary, fontSize: fs(14) }]}>{email || 'your@email.com'}</Text>
                    </View>
                </View>

                <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                <Text style={[styles.reviewSectionLabel, { color: colors.primary, fontSize: fs(14) }]}>Contact</Text>
                <View style={styles.reviewRow}>
                    <Ionicons name="call-outline" size={ms(16, 0.3)} color={colors.secondary} />
                    <Text style={[styles.reviewText, { color: colors.text, fontSize: fs(14) }]}>{phone || '—'}</Text>
                </View>

                <View style={[styles.reviewDivider, { backgroundColor: colors.border }]} />

                <Text style={[styles.reviewSectionLabel, { color: colors.primary, fontSize: fs(14) }]}>Address</Text>
                <View style={styles.reviewRow}>
                    <Ionicons name="location-outline" size={ms(16, 0.3)} color={colors.secondary} />
                    <Text style={[styles.reviewText, { color: colors.text, fontSize: fs(14) }]}>
                        {street ? `${street}, ` : ''}{barangay || '—'}
                    </Text>
                </View>
                <View style={styles.reviewRow}>
                    <Ionicons name="business-outline" size={ms(16, 0.3)} color={colors.secondary} />
                    <Text style={[styles.reviewText, { color: colors.text, fontSize: fs(14) }]}>
                        {getCityName()}, {getProvinceName()}
                    </Text>
                </View>
                <View style={styles.reviewRow}>
                    <Ionicons name="globe-outline" size={ms(16, 0.3)} color={colors.secondary} />
                    <Text style={[styles.reviewText, { color: colors.text, fontSize: fs(14) }]}>
                        {getRegionName()}{zip ? `, ${zip}` : ''} — Philippines
                    </Text>
                </View>
            </View>
        </View>
    );

    return (
        <KeyboardAwareScrollView
            viewIsInsideTabBar={true}
            extraHeight={200}
            enableOnAndroid={true}
            style={{ backgroundColor: colors.background }}
        >
                <View style={[styles.container, { backgroundColor: colors.background, paddingHorizontal: spacing.lg, paddingTop: spacing.lg, paddingBottom: spacing.xxl + 12 }]}>
                {/* Header */}
                <View style={[styles.headerSection, { marginBottom: spacing.md }]}>
                    <Text style={[styles.title, { color: colors.primary, fontSize: fs(22) }]}>Create Account</Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary, fontSize: fs(13), marginTop: 4 }]}>
                        Step {step + 1} of {STEPS.length}: {STEPS[step].title}
                    </Text>
                </View>

                {renderProgressBar()}

                {/* Animated Step Content */}
                <Animated.View
                    style={{
                        opacity: fadeAnim,
                        transform: [{ translateX: slideAnim }],
                    }}
                >
                    {step === 0 && renderAccountStep()}
                    {step === 1 && renderAddressStep()}
                    {step === 2 && renderReviewStep()}
                </Animated.View>

                {/* Navigation Buttons */}
                <View style={[styles.navButtons, { marginTop: spacing.md }]}>
                    {step > 0 ? (
                        <TouchableOpacity
                            style={[styles.backBtn, { borderColor: colors.border, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, borderRadius: ws(10) }]}
                            onPress={handleBack}
                            activeOpacity={0.7}
                        >
                            <Ionicons name="arrow-back" size={ms(18, 0.3)} color={colors.text} />
                            <Text style={[styles.backBtnText, { color: colors.text, fontSize: fs(15) }]}>Back</Text>
                        </TouchableOpacity>
                    ) : <View />}

                    {step < STEPS.length - 1 ? (
                        <TouchableOpacity
                            style={[styles.nextBtn, { backgroundColor: colors.primary, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, borderRadius: ws(10) }]}
                            onPress={handleNext}
                            activeOpacity={0.7}
                        >
                            <Text style={[styles.nextBtnText, { color: colors.textOnPrimary, fontSize: fs(16) }]}>Continue</Text>
                            <Ionicons name="arrow-forward" size={ms(18, 0.3)} color={colors.textOnPrimary} />
                        </TouchableOpacity>
                    ) : (
                        <TouchableOpacity
                            style={[styles.nextBtn, { backgroundColor: colors.success, paddingVertical: spacing.sm + 4, paddingHorizontal: spacing.lg, borderRadius: ws(10) }]}
                            onPress={register}
                            activeOpacity={0.7}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color={colors.textOnPrimary} size="small" />
                            ) : (
                                <>
                                    <Text style={[styles.nextBtnText, { color: colors.textOnPrimary, fontSize: fs(16) }]}>Register</Text>
                                    <Ionicons name="checkmark-circle" size={ms(18, 0.3)} color={colors.textOnPrimary} />
                                </>
                            )}
                        </TouchableOpacity>
                    )}
                </View>

                <View style={[styles.loginRow, { marginTop: spacing.lg, marginBottom: spacing.xl }]}>
                    <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate("Login")}>
                        <Text style={{ color: colors.secondary, fontWeight: 'bold', fontSize: fs(14) }}>Login</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </KeyboardAwareScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    headerSection: {
        alignItems: 'center',
    },
    title: {
        fontWeight: 'bold',
    },
    subtitle: {
    },
    // Progress bar
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 24,
        paddingHorizontal: 20,
    },
    stepDot: {
        width: 36,
        height: 36,
        borderRadius: 18,
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
    },
    stepLine: {
        flex: 1,
        height: 3,
        borderRadius: 2,
        marginHorizontal: 8,
    },
    // Step content
    stepContent: {
        alignItems: 'center',
    },
    // Avatar
    avatarSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    imageContainer: {
        borderWidth: 3,
        justifyContent: "center",
        alignItems: 'center',
        overflow: 'hidden',
    },
    image: {
        width: "100%",
        height: "100%",
    },
    imageButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    imgBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        paddingHorizontal: 14,
        borderRadius: 20,
        gap: 6,
    },
    imgBtnText: {
        fontWeight: '600',
    },
    // Fields
    fieldGroup: {
        width: '100%',
        alignItems: 'center',
    },
    fieldLabel: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginTop: 8,
        marginBottom: 2,
        gap: 6,
    },
    fieldLabelText: {
        fontWeight: '600',
    },
    passwordRow: {
        width: '100%',
        alignItems: 'center',
        position: 'relative',
    },
    eyeBtn: {
        position: 'absolute',
        right: '14%',
        padding: 4,
    },
    // Address card
    sectionCard: {
        width: '100%',
        borderWidth: 1,
    },
    sectionCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    sectionCardTitle: {
        fontWeight: 'bold',
    },
    dropdownField: {
        marginBottom: 8,
    },
    // Review
    reviewCard: {
        width: '100%',
        borderWidth: 1,
    },
    reviewAvatarRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    reviewAvatar: {
        borderWidth: 2,
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    reviewAvatarImage: {
        width: '100%',
        height: '100%',
    },
    reviewName: {
        fontWeight: 'bold',
    },
    reviewEmail: {
        marginTop: 2,
    },
    reviewDivider: {
        height: 1,
        marginVertical: 14,
    },
    reviewSectionLabel: {
        fontWeight: 'bold',
        marginBottom: 8,
    },
    reviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 6,
        gap: 8,
    },
    reviewText: {
    },
    // Nav buttons
    navButtons: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 4,
    },
    backBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        gap: 6,
    },
    backBtnText: {
        fontWeight: '600',
    },
    nextBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    nextBtnText: {
        fontWeight: 'bold',
    },
    loginRow: {
        flexDirection: 'row',
        justifyContent: 'center',
    },
});

export default Register;
