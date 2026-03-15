import React, { useContext, useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Image, ActivityIndicator, TextInput } from 'react-native';
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import axios from "axios"
import baseURL from "../../config/api"
import AuthGlobal from "../../Context/Store/AuthGlobal"
import { logoutUser } from "../../Context/Actions/Auth.actions"
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import SweetAlert from '../../Shared/SweetAlert';
import { useResponsive } from '../../assets/common/responsive';
import * as ImagePicker from 'expo-image-picker';
import { uploadToCloudinary } from '../../assets/common/cloudinaryUpload';
import Toast from '../../Shared/SnackbarService';
import CustomDropdown from '../../Shared/CustomDropdown';
import {
    findPsgcRegionByNameOrDesignation,
    getPsgcBarangaysByCity,
    getPsgcMunicipalitiesByProvince,
    getPsgcProvincesByRegion,
    getPsgcRegions,
} from '../../assets/common/psgcUtils';
import { getToken, removeToken } from '../../assets/common/tokenStorage';
import Error from '../../Shared/Error';
import { validateForm, hasErrors } from '../../Shared/FormValidation';

const UserProfile = (props) => {
    const context = useContext(AuthGlobal)
    const [userProfile, setUserProfile] = useState('')
    const navigation = useNavigation()
    const colors = useTheme();
    const [showLogoutAlert, setShowLogoutAlert] = useState(false);
    const { fs, ms, spacing, ws } = useResponsive();

    // Edit mode state
    const [editing, setEditing] = useState(false);
    const [editName, setEditName] = useState('');
    const [editEmail, setEditEmail] = useState('');
    const [editPhone, setEditPhone] = useState('');
    const [editImage, setEditImage] = useState(null);
    const [saving, setSaving] = useState(false);
    const [editStreet, setEditStreet] = useState('');
    const [editZip, setEditZip] = useState('');
    const [editRegionDesignation, setEditRegionDesignation] = useState('');
    const [editProvince, setEditProvince] = useState('');
    const [editCityMunicipality, setEditCityMunicipality] = useState('');
    const [editBarangay, setEditBarangay] = useState('');
    const [fieldErrors, setFieldErrors] = useState({});
    const [passwordErrors, setPasswordErrors] = useState({});
    const [showPasswordEditor, setShowPasswordEditor] = useState(false);
    const [oldPassword, setOldPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [updatingPassword, setUpdatingPassword] = useState(false);
    const [filteredProvinces, setFilteredProvinces] = useState([]);
    const [filteredCities, setFilteredCities] = useState([]);
    const [filteredBarangays, setFilteredBarangays] = useState([]);

    const allRegions = getPsgcRegions();

    const regionData = allRegions.map(r => ({ label: r.name, value: r.designation }));
    const provinceData = filteredProvinces.map(p => ({ label: p.name, value: p.name }));
    const cityData = filteredCities.map(c => ({ label: (c.city ? 'City of ' : '') + c.name, value: c.name }));
    const barangayData = filteredBarangays.map(b => ({ label: b.name, value: b.name }));

    useEffect(() => {
        if (!editRegionDesignation) {
            setFilteredProvinces([]);
            setFilteredCities([]);
            setFilteredBarangays([]);
            setEditProvince('');
            setEditCityMunicipality('');
            setEditBarangay('');
            return;
        }

        const provinceList = getPsgcProvincesByRegion(editRegionDesignation);
        setFilteredProvinces(provinceList);

        const provinceStillValid = provinceList.some(p => p.name === editProvince);
        if (!provinceStillValid) {
            setEditProvince('');
            setEditCityMunicipality('');
            setEditBarangay('');
            setFilteredCities([]);
            setFilteredBarangays([]);
        }
    }, [editRegionDesignation]);

    useEffect(() => {
        if (!editProvince) {
            setFilteredCities([]);
            setFilteredBarangays([]);
            setEditCityMunicipality('');
            setEditBarangay('');
            return;
        }

        const cityList = getPsgcMunicipalitiesByProvince(editProvince);
        setFilteredCities(cityList);

        const cityStillValid = cityList.some(c => c.name === editCityMunicipality);
        if (!cityStillValid) {
            setEditCityMunicipality('');
            setEditBarangay('');
            setFilteredBarangays([]);
        }
    }, [editProvince]);

    useEffect(() => {
        if (!editCityMunicipality) {
            setFilteredBarangays([]);
            setEditBarangay('');
            return;
        }

        const barangayList = getPsgcBarangaysByCity({
            province: editProvince,
            cityMunicipality: editCityMunicipality,
        });

        setFilteredBarangays(barangayList);

        const barangayStillValid = barangayList.some(b => b.name === editBarangay);
        if (!barangayStillValid) {
            setEditBarangay('');
        }
    }, [editCityMunicipality]);

    useFocusEffect(
        useCallback(() => {
            if (context.stateUser.isAuthenticated === null) {
                return;
            }

            if (context.stateUser.isAuthenticated === false) {
                navigation.navigate("Login");
                return;
            }

            getToken()
                .then((res) => {
                    if (!res || !context.stateUser?.user?.userId) return;
                    axios
                        .get(`${baseURL}users/${context.stateUser.user.userId}`, {
                            headers: { Authorization: `Bearer ${res}` },
                        })
                        .then((user) => {
                            setUserProfile(user.data);
                            setEditName(user.data.name || '');
                            setEditEmail(user.data.email || '');
                            setEditPhone(user.data.phone || '');
                            setEditStreet(user.data.street || '');
                            setEditZip(user.data.zip || '');
                            const matchedRegion = findPsgcRegionByNameOrDesignation(user.data.region || '');
                            setEditRegionDesignation(matchedRegion?.designation || '');
                            setEditProvince(user.data.province || '');
                            setEditCityMunicipality(user.data.cityMunicipality || '');
                            setEditBarangay(user.data.barangay || '');
                            setEditImage(null);
                        })
                })
                .catch((error) => console.log(error))
            return () => {
                setUserProfile();
            }
        }, [context.stateUser.isAuthenticated, context.stateUser?.user?.userId, navigation]))

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [1, 1],
            quality: 1,
        });
        if (!result.canceled) {
            setEditImage(result.assets[0].uri);
        }
    };

    const takePhoto = async () => {
        const c = await ImagePicker.requestCameraPermissionsAsync();
        if (c.status === 'granted') {
            let result = await ImagePicker.launchCameraAsync({
                aspect: [1, 1],
                quality: 1,
            });
            if (!result.canceled) {
                setEditImage(result.assets[0].uri);
            }
        }
    };

    const saveProfile = async () => {
        const errors = validateForm({
            name: editName,
            email: editEmail,
            phone: editPhone,
            region: editRegionDesignation,
            province: editProvince,
            cityMunicipality: editCityMunicipality,
            barangay: editBarangay,
            street: editStreet,
            zip: editZip,
        });
        setFieldErrors(errors);
        if (hasErrors(errors)) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: errors.name || errors.email || errors.phone || errors.region || 'Please fix form errors',
            });
            return;
        }

        setSaving(true);
        try {
            let imageUrl = userProfile.image || '';
            if (editImage) {
                imageUrl = await uploadToCloudinary(editImage, 'hardwarehaven/avatars');
            }
            const regionName = findPsgcRegionByNameOrDesignation(editRegionDesignation)?.name || '';
            const token = await getToken();
            const res = await axios.put(
                `${baseURL}users/${context.stateUser.user.userId}`,
                {
                    name: editName,
                    email: editEmail,
                    phone: editPhone,
                    image: imageUrl,
                    region: regionName,
                    province: editProvince,
                    cityMunicipality: editCityMunicipality,
                    barangay: editBarangay,
                    street: editStreet,
                    zip: editZip,
                    country: 'Philippines',
                    city: editCityMunicipality,
                },
                { headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" } }
            );
            setUserProfile(res.data);
            setEditing(false);
            setEditImage(null);
            Toast.show({ topOffset: 60, type: "success", text1: "Profile updated" });
        } catch (err) {
            console.log(err);
            Toast.show({ topOffset: 60, type: "error", text1: "Failed to update profile" });
        } finally {
            setSaving(false);
        }
    };

    const avatarUri = editing && editImage ? editImage : (userProfile && userProfile.image ? userProfile.image : null);
    const clearFieldError = (field) => setFieldErrors((prev) => ({ ...prev, [field]: '' }));
    const clearPasswordError = (field) => setPasswordErrors((prev) => ({ ...prev, [field]: '' }));

    const resetPasswordEditor = () => {
        setOldPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setPasswordErrors({});
        setShowOldPassword(false);
        setShowNewPassword(false);
        setShowConfirmPassword(false);
    };

    const handleChangePassword = async () => {
        const errors = validateForm({
            oldPassword,
            newPassword,
            confirmPassword,
        });
        setPasswordErrors(errors);

        if (hasErrors(errors)) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: errors.oldPassword || errors.newPassword || errors.confirmPassword || 'Please fix password form errors',
            });
            return;
        }

        setUpdatingPassword(true);
        try {
            const token = await getToken();
            await axios.post(
                `${baseURL}users/change-password`,
                { oldPassword, newPassword },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            Toast.show({ topOffset: 60, type: 'success', text1: 'Password updated successfully' });
            setShowPasswordEditor(false);
            resetPasswordEditor();
        } catch (err) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: err.response?.data?.message || 'Failed to update password',
            });
        } finally {
            setUpdatingPassword(false);
        }
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <SweetAlert
                visible={showLogoutAlert}
                type="confirm"
                title="Sign Out"
                message="Are you sure you want to sign out?"
                confirmText="Sign Out"
                cancelText="Cancel"
                showCancel={true}
                onConfirm={() => {
                    setShowLogoutAlert(false);
                    removeToken();
                    logoutUser(context.dispatch);
                }}
                onCancel={() => setShowLogoutAlert(false)}
            />
            <ScrollView contentContainerStyle={[styles.subContainer, { paddingTop: spacing.md, paddingBottom: spacing.xl }]}> 
                <View style={[styles.heroCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                    <View style={[styles.avatarCircle, { backgroundColor: colors.surfaceLight, width: 84, height: 84, borderRadius: 42 }]}> 
                        {avatarUri ? (
                            <Image source={{ uri: avatarUri }} style={{ width: '100%', height: '100%', borderRadius: 42 }} />
                        ) : (
                            <Ionicons name="person" size={42} color={colors.primary} />
                        )}
                    </View>
                    <Text style={[styles.userName, { color: colors.text, fontSize: fs(23), marginTop: spacing.sm }]}> 
                        {userProfile ? userProfile.name : ""}
                    </Text>
                    <Text style={{ color: colors.textSecondary, fontSize: fs(13), marginTop: 2 }}>
                        {userProfile ? userProfile.email : ""}
                    </Text>
                    <View style={[styles.memberBadge, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}> 
                        <Ionicons name="shield-checkmark-outline" size={14} color={colors.secondary} />
                        <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginLeft: 6, fontWeight: '600' }}>HardwareHaven Member</Text>
                    </View>
                </View>

                {editing && (
                    <View style={{ flexDirection: 'row', gap: 10, marginBottom: spacing.sm }}>
                        <TouchableOpacity onPress={takePhoto} style={[styles.imgBtn, { backgroundColor: colors.primary }]}>
                            <Ionicons name="camera" size={16} color={colors.textOnPrimary} />
                            <Text style={{ color: colors.textOnPrimary, fontSize: 12, marginLeft: 4 }}>Camera</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={pickImage} style={[styles.imgBtn, { backgroundColor: colors.secondary }]}>
                            <Ionicons name="image" size={16} color={colors.textOnPrimary} />
                            <Text style={{ color: colors.textOnPrimary, fontSize: 12, marginLeft: 4 }}>Gallery</Text>
                        </TouchableOpacity>
                    </View>
                )}

                {editing ? (
                    <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: 12, marginBottom: spacing.md }]}> 
                        <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fs(14), marginBottom: 10 }}>Edit Profile</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Name</Text>
                        <TextInput
                            style={[styles.editInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            value={editName}
                            onChangeText={(text) => { setEditName(text); clearFieldError('name'); }}
                            placeholder="Name"
                            placeholderTextColor={colors.textSecondary}
                        />
                        {fieldErrors.name ? <Error message={fieldErrors.name} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 8 }}>Email</Text>
                        <TextInput
                            style={[styles.editInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            value={editEmail}
                            onChangeText={(text) => { setEditEmail(text); clearFieldError('email'); }}
                            placeholder="Email"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="email-address"
                        />
                        {fieldErrors.email ? <Error message={fieldErrors.email} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 8 }}>Phone</Text>
                        <TextInput
                            style={[styles.editInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            value={editPhone}
                            onChangeText={(text) => { setEditPhone(text); clearFieldError('phone'); }}
                            placeholder="Phone"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="phone-pad"
                        />
                        {fieldErrors.phone ? <Error message={fieldErrors.phone} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Region</Text>
                        <CustomDropdown
                            label=""
                            data={regionData}
                            value={editRegionDesignation}
                            onSelect={(value) => { setEditRegionDesignation(value); clearFieldError('region'); }}
                            placeholder="Select Region"
                            searchable={true}
                            icon="map-outline"
                        />
                        {fieldErrors.region ? <Error message={fieldErrors.region} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Province</Text>
                        <CustomDropdown
                            label=""
                            data={provinceData}
                            value={editProvince}
                            onSelect={(value) => { setEditProvince(value); clearFieldError('province'); }}
                            placeholder="Select Province"
                            searchable={true}
                            enabled={!!editRegionDesignation}
                            icon="business-outline"
                        />
                        {fieldErrors.province ? <Error message={fieldErrors.province} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 10 }}>City / Municipality</Text>
                        <CustomDropdown
                            label=""
                            data={cityData}
                            value={editCityMunicipality}
                            onSelect={(value) => { setEditCityMunicipality(value); clearFieldError('cityMunicipality'); }}
                            placeholder="Select City/Municipality"
                            searchable={true}
                            enabled={!!editProvince}
                            icon="location-outline"
                        />
                        {fieldErrors.cityMunicipality ? <Error message={fieldErrors.cityMunicipality} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 6, marginTop: 10 }}>Barangay</Text>
                        <CustomDropdown
                            label=""
                            data={barangayData}
                            value={editBarangay}
                            onSelect={(value) => { setEditBarangay(value); clearFieldError('barangay'); }}
                            placeholder="Select Barangay"
                            searchable={true}
                            enabled={!!editCityMunicipality}
                            icon="navigate-outline"
                        />
                        {fieldErrors.barangay ? <Error message={fieldErrors.barangay} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 10 }}>Street</Text>
                        <TextInput
                            style={[styles.editInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            value={editStreet}
                            onChangeText={(text) => { setEditStreet(text); clearFieldError('street'); }}
                            placeholder="Street"
                            placeholderTextColor={colors.textSecondary}
                        />
                        {fieldErrors.street ? <Error message={fieldErrors.street} /> : null}
                        <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 8 }}>Zip Code</Text>
                        <TextInput
                            style={[styles.editInput, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                            value={editZip}
                            onChangeText={(text) => { setEditZip(text); clearFieldError('zip'); }}
                            placeholder="Zip"
                            placeholderTextColor={colors.textSecondary}
                            keyboardType="numeric"
                        />
                        {fieldErrors.zip ? <Error message={fieldErrors.zip} /> : null}
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 14 }}>
                            <TouchableOpacity
                                onPress={() => { setEditing(false); setEditImage(null); }}
                                style={[styles.cancelBtn, { borderColor: colors.border }]}
                            >
                                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={saveProfile}
                                style={[styles.saveBtn, { backgroundColor: colors.success }]}
                                disabled={saving}
                            >
                                {saving ? (
                                    <ActivityIndicator color={colors.textOnPrimary} size="small" />
                                ) : (
                                    <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold' }}>Save</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: 12, marginBottom: spacing.md }]}> 
                            <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fs(14), marginBottom: 8 }}>Account Details</Text>
                            <View style={[styles.infoRow, { paddingVertical: spacing.xs }]}>
                                <Ionicons name="mail-outline" size={18} color={colors.secondary} />
                                <Text style={[styles.infoText, { color: colors.text, fontSize: fs(14), marginLeft: 8 }]}>
                                    {userProfile ? userProfile.email : ""}
                                </Text>
                            </View>
                            <View style={[styles.divider, { backgroundColor: colors.border }]} />
                            <View style={[styles.infoRow, { paddingVertical: spacing.xs }]}>
                                <Ionicons name="call-outline" size={18} color={colors.secondary} />
                                <Text style={[styles.infoText, { color: colors.text, fontSize: fs(14), marginLeft: 8 }]}>
                                    {userProfile ? userProfile.phone : ""}
                                </Text>
                            </View>
                            {userProfile && (userProfile.region || userProfile.cityMunicipality) ? (
                                <>
                                    <View style={[styles.divider, { backgroundColor: colors.border }]} />
                                    <View style={[styles.infoRow, { paddingVertical: spacing.xs }]}>
                                        <Ionicons name="location-outline" size={18} color={colors.secondary} />
                                        <Text style={[styles.infoText, { color: colors.text, fontSize: fs(14), marginLeft: 8 }]}>
                                            {[
                                                userProfile.street,
                                                userProfile.barangay,
                                                userProfile.cityMunicipality,
                                                userProfile.province,
                                                userProfile.region,
                                                userProfile.zip,
                                            ].filter(Boolean).join(', ')}
                                        </Text>
                                    </View>
                                </>
                            ) : null}
                        </View>
                        <View style={styles.actionRow}>
                            <TouchableOpacity
                                style={[styles.editBtn, { backgroundColor: colors.primary, paddingVertical: 10, borderRadius: 8 }]}
                                onPress={() => setEditing(true)}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={18} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', marginLeft: 6, fontSize: fs(14) }}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.ordersBtn, { backgroundColor: colors.secondary, paddingVertical: 10, borderRadius: 8 }]}
                                onPress={() => navigation.navigate('My Orders')}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="receipt-outline" size={18} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', marginLeft: 6, fontSize: fs(14) }}>My Orders</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={{ width: '100%', maxWidth: 440, marginBottom: 10 }}>
                            <TouchableOpacity
                                style={[styles.ordersBtn, { backgroundColor: colors.warning, paddingVertical: 10, borderRadius: 8 }]}
                                onPress={() => {
                                    if (showPasswordEditor) {
                                        setShowPasswordEditor(false);
                                        resetPasswordEditor();
                                    } else {
                                        setShowPasswordEditor(true);
                                    }
                                }}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="key-outline" size={18} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', marginLeft: 6, fontSize: fs(14) }}>
                                    {showPasswordEditor ? 'Cancel Password Change' : 'Change Password'}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {showPasswordEditor ? (
                            <View style={[styles.infoCard, { backgroundColor: colors.surface, borderColor: colors.border, padding: spacing.md, borderRadius: 12, marginBottom: spacing.md }]}> 
                                <Text style={{ color: colors.primary, fontWeight: '700', fontSize: fs(14), marginBottom: 10 }}>Update Password</Text>

                                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4 }}>Old Password</Text>
                                <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}> 
                                    <TextInput
                                        style={[styles.passwordInput, { color: colors.text, fontSize: fs(14) }]}
                                        value={oldPassword}
                                        onChangeText={(text) => { setOldPassword(text); clearPasswordError('oldPassword'); }}
                                        secureTextEntry={!showOldPassword}
                                        placeholder="Enter old password"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <TouchableOpacity onPress={() => setShowOldPassword((prev) => !prev)} style={styles.eyeBtn} activeOpacity={0.7}>
                                        <Ionicons name={showOldPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                {passwordErrors.oldPassword ? <Error message={passwordErrors.oldPassword} /> : null}

                                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 8 }}>New Password</Text>
                                <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}> 
                                    <TextInput
                                        style={[styles.passwordInput, { color: colors.text, fontSize: fs(14) }]}
                                        value={newPassword}
                                        onChangeText={(text) => { setNewPassword(text); clearPasswordError('newPassword'); }}
                                        secureTextEntry={!showNewPassword}
                                        placeholder="Enter new password"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <TouchableOpacity onPress={() => setShowNewPassword((prev) => !prev)} style={styles.eyeBtn} activeOpacity={0.7}>
                                        <Ionicons name={showNewPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                {passwordErrors.newPassword ? <Error message={passwordErrors.newPassword} /> : null}

                                <Text style={{ color: colors.textSecondary, fontSize: 12, marginBottom: 4, marginTop: 8 }}>Confirm New Password</Text>
                                <View style={[styles.passwordInputWrap, { backgroundColor: colors.inputBg, borderColor: colors.border }]}> 
                                    <TextInput
                                        style={[styles.passwordInput, { color: colors.text, fontSize: fs(14) }]}
                                        value={confirmPassword}
                                        onChangeText={(text) => { setConfirmPassword(text); clearPasswordError('confirmPassword'); }}
                                        secureTextEntry={!showConfirmPassword}
                                        placeholder="Confirm new password"
                                        placeholderTextColor={colors.textSecondary}
                                    />
                                    <TouchableOpacity onPress={() => setShowConfirmPassword((prev) => !prev)} style={styles.eyeBtn} activeOpacity={0.7}>
                                        <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.textSecondary} />
                                    </TouchableOpacity>
                                </View>
                                {passwordErrors.confirmPassword ? <Error message={passwordErrors.confirmPassword} /> : null}

                                <TouchableOpacity
                                    style={[styles.saveBtn, { backgroundColor: colors.warning, marginTop: 12, alignItems: 'center' }]}
                                    onPress={handleChangePassword}
                                    disabled={updatingPassword}
                                >
                                    {updatingPassword ? (
                                        <ActivityIndicator color={colors.textOnPrimary} size="small" />
                                    ) : (
                                        <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold' }}>Update Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        ) : null}
                    </>
                )}

                <TouchableOpacity
                    style={[styles.signOutBtn, { backgroundColor: colors.danger, paddingVertical: 10, paddingHorizontal: spacing.lg, borderRadius: 8 }]}
                    onPress={() => setShowLogoutAlert(true)}
                    activeOpacity={0.7}
                >
                    <Ionicons name="log-out-outline" size={18} color={colors.textOnPrimary} />
                    <Text style={{ color: colors.textOnPrimary, fontWeight: 'bold', marginLeft: 6, fontSize: fs(14) }}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    subContainer: {
        alignItems: "center",
        paddingHorizontal: 16,
    },
    heroCard: {
        width: '100%',
        maxWidth: 480,
        borderWidth: 1,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        marginBottom: 12,
    },
    avatarCircle: {
        justifyContent: 'center',
        alignItems: 'center',
        overflow: 'hidden',
    },
    memberBadge: {
        marginTop: 10,
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 5,
        paddingHorizontal: 12,
        flexDirection: 'row',
        alignItems: 'center',
    },
    userName: {
        fontWeight: 'bold',
    },
    infoCard: {
        width: '100%',
        maxWidth: 440,
        borderWidth: 1,
    },
    infoRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    infoText: {
        flex: 1,
    },
    divider: {
        height: 1,
        marginVertical: 4,
    },
    signOutBtn: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    editBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    ordersBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
    },
    actionRow: {
        width: '100%',
        maxWidth: 440,
        flexDirection: 'row',
        gap: 10,
        marginBottom: 8,
    },
    imgBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 16,
    },
    editInput: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 14,
    },
    passwordInputWrap: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
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
    cancelBtn: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
    },
    saveBtn: {
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 24,
    },
})

export default UserProfile