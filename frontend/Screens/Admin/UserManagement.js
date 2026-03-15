import React, { useCallback, useEffect, useState } from 'react';
import {
    ActivityIndicator,
    FlatList,
    Modal,
    RefreshControl,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from 'react-native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';
import baseURL from '../../config/api';
import { getToken } from '../../assets/common/tokenStorage';
import Toast from '../../Shared/SnackbarService';
import CustomDropdown from '../../Shared/CustomDropdown';

const ROLE_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Users', value: 'user' },
    { label: 'Admins', value: 'admin' },
];

const STATUS_FILTERS = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Inactive', value: 'inactive' },
];

const UserManagement = () => {
    const colors = useTheme();
    const { fs, spacing, ws } = useResponsive();

    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [busyMap, setBusyMap] = useState({});
    const [deactivateModalVisible, setDeactivateModalVisible] = useState(false);
    const [deactivationReason, setDeactivationReason] = useState('');
    const [deactivateTargetUser, setDeactivateTargetUser] = useState(null);

    const getAuthConfig = useCallback(async () => {
        const token = await getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        };
    }, []);

    const fetchUsers = useCallback(async ({ withLoader = true } = {}) => {
        if (withLoader) setLoading(true);

        try {
            const authConfig = await getAuthConfig();
            const res = await axios.get(`${baseURL}users/admin/manage`, {
                ...authConfig,
                params: {
                    search,
                    role: roleFilter,
                    status: statusFilter,
                },
            });
            setUsers(Array.isArray(res.data) ? res.data : []);
        } catch (err) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Failed to load users',
                text2: err.response?.data?.message || err.message,
            });
        } finally {
            if (withLoader) setLoading(false);
        }
    }, [getAuthConfig, roleFilter, search, statusFilter]);

    useEffect(() => {
        fetchUsers({ withLoader: true });
    }, [fetchUsers]);

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await fetchUsers({ withLoader: false });
        setRefreshing(false);
    }, [fetchUsers]);

    const setBusy = (id, value) => {
        setBusyMap((prev) => ({ ...prev, [id]: value }));
    };

    const handleRoleChange = async (user) => {
        const id = user?._id || user?.id;
        if (!id) return;

        const nextRole = user?.isAdmin ? 'user' : 'admin';
        setBusy(id, true);
        try {
            const authConfig = await getAuthConfig();
            const res = await axios.put(`${baseURL}users/admin/${id}/role`, { role: nextRole }, authConfig);
            const updated = res?.data?.user;
            if (updated) {
                setUsers((prev) => prev.map((u) => ((u._id || u.id) === id ? updated : u)));
            }
            Toast.show({ topOffset: 60, type: 'success', text1: `User role changed to ${nextRole}` });
        } catch (err) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Role update failed',
                text2: err.response?.data?.message || err.message,
            });
        } finally {
            setBusy(id, false);
        }
    };

    const submitStatusChange = async (user, nextStatus, reason = '') => {
        const id = user?._id || user?.id;
        if (!id) return;

        setBusy(id, true);
        try {
            const authConfig = await getAuthConfig();
            const payload = {
                isActive: nextStatus,
            };

            if (!nextStatus) {
                payload.deactivationReason = reason;
            }

            const res = await axios.put(`${baseURL}users/admin/${id}/status`, payload, authConfig);
            const updated = res?.data?.user;
            if (updated) {
                setUsers((prev) => prev.map((u) => ((u._id || u.id) === id ? updated : u)));
            }
            Toast.show({
                topOffset: 60,
                type: 'success',
                text1: nextStatus ? 'User activated' : 'User deactivated',
            });
        } catch (err) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Status update failed',
                text2: err.response?.data?.message || err.message,
            });
        } finally {
            setBusy(id, false);
        }
    };

    const handleStatusChange = async (user) => {
        const nextStatus = !user?.isActive;
        if (!nextStatus) {
            setDeactivateTargetUser(user);
            setDeactivationReason('');
            setDeactivateModalVisible(true);
            return;
        }

        await submitStatusChange(user, true);
    };

    const confirmDeactivate = async () => {
        const reason = deactivationReason.trim();
        if (!reason) {
            Toast.show({
                topOffset: 60,
                type: 'error',
                text1: 'Deactivation reason is required',
            });
            return;
        }

        const target = deactivateTargetUser;
        setDeactivateModalVisible(false);
        setDeactivateTargetUser(null);
        setDeactivationReason('');

        if (target) {
            await submitStatusChange(target, false, reason);
        }
    };

    const renderUserCard = ({ item }) => {
        const id = item?._id || item?.id;
        const isBusy = !!busyMap[id];

        return (
            <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.border, marginHorizontal: spacing.sm }]}>
                <View style={styles.cardHeader}>
                    <View style={{ flex: 1 }}>
                        <Text style={{ color: colors.text, fontSize: fs(15), fontWeight: '700' }} numberOfLines={1}>
                            {item?.name || 'Unnamed User'}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 2 }} numberOfLines={1}>
                            {item?.email || 'No email'}
                        </Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: 2 }} numberOfLines={1}>
                            {item?.phone || 'No phone'}
                        </Text>
                    </View>
                    <View style={styles.badgesWrap}>
                        <View style={[styles.badge, { backgroundColor: item?.isAdmin ? colors.secondary : colors.surfaceLight }]}>
                            <Text style={{ color: colors.textOnPrimary, fontSize: fs(10), fontWeight: '700' }}>
                                {item?.isAdmin ? 'ADMIN' : 'USER'}
                            </Text>
                        </View>
                        <View style={[styles.badge, { backgroundColor: item?.isActive === false ? colors.danger : colors.success }]}>
                            <Text style={{ color: colors.textOnPrimary, fontSize: fs(10), fontWeight: '700' }}>
                                {item?.isActive === false ? 'INACTIVE' : 'ACTIVE'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.actionsRow}>
                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: colors.secondary }]}
                        onPress={() => handleRoleChange(item)}
                        disabled={isBusy}
                    >
                        {isBusy ? (
                            <ActivityIndicator color={colors.textOnPrimary} size="small" />
                        ) : (
                            <>
                                <Ionicons name="swap-horizontal-outline" size={16} color={colors.textOnPrimary} />
                                <Text style={[styles.actionText, { fontSize: fs(12), color: colors.textOnPrimary }]}>Set {item?.isAdmin ? 'User' : 'Admin'}</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={[styles.actionBtn, { backgroundColor: item?.isActive === false ? colors.success : colors.warning }]}
                        onPress={() => handleStatusChange(item)}
                        disabled={isBusy}
                    >
                        {isBusy ? (
                            <ActivityIndicator color={colors.textOnPrimary} size="small" />
                        ) : (
                            <>
                                <Ionicons
                                    name={item?.isActive === false ? 'checkmark-circle-outline' : 'ban-outline'}
                                    size={16}
                                    color={colors.textOnPrimary}
                                />
                                <Text style={[styles.actionText, { fontSize: fs(12), color: colors.textOnPrimary }]}>
                                    {item?.isActive === false ? 'Activate' : 'Deactivate'}
                                </Text>
                            </>
                        )}
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Modal
                visible={deactivateModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setDeactivateModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
                    <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                        <Text style={{ color: colors.text, fontSize: fs(16), fontWeight: '700' }}>Deactivate User</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 6 }}>
                            Provide the reason shown to the user on login.
                        </Text>

                        <TextInput
                            style={[
                                styles.reasonInput,
                                {
                                    backgroundColor: colors.inputBg,
                                    borderColor: colors.border,
                                    color: colors.text,
                                    fontSize: fs(13),
                                },
                            ]}
                            multiline
                            placeholder="Reason for deactivation"
                            placeholderTextColor={colors.textSecondary}
                            value={deactivationReason}
                            onChangeText={setDeactivationReason}
                        />

                        <View style={styles.modalActions}>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border }]}
                                onPress={() => {
                                    setDeactivateModalVisible(false);
                                    setDeactivateTargetUser(null);
                                    setDeactivationReason('');
                                }}
                            >
                                <Text style={{ color: colors.textSecondary, fontSize: fs(12), fontWeight: '700' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalBtn, { backgroundColor: colors.danger }]}
                                onPress={confirmDeactivate}
                            >
                                <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), fontWeight: '700' }}>Deactivate</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <View style={{ paddingHorizontal: spacing.md, paddingTop: spacing.md }}>
                <TextInput
                    style={[
                        styles.searchInput,
                        {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.border,
                            color: colors.text,
                            fontSize: fs(14),
                        },
                    ]}
                    placeholder="Search by name, email, phone"
                    placeholderTextColor={colors.textSecondary}
                    value={search}
                    onChangeText={setSearch}
                    onSubmitEditing={() => fetchUsers({ withLoader: true })}
                />

                <View style={{ marginTop: spacing.sm }}>
                    <CustomDropdown
                        label="Role filter"
                        data={ROLE_FILTERS}
                        value={roleFilter}
                        onSelect={setRoleFilter}
                        placeholder="Select role"
                        icon="person-outline"
                    />
                </View>

                <View style={{ marginTop: spacing.sm }}>
                    <CustomDropdown
                        label="Status filter"
                        data={STATUS_FILTERS}
                        value={statusFilter}
                        onSelect={setStatusFilter}
                        placeholder="Select status"
                        icon="pulse-outline"
                    />
                </View>

                <TouchableOpacity
                    style={[styles.applyBtn, { backgroundColor: colors.primary, borderRadius: ws(9), marginBottom: spacing.sm }]}
                    onPress={() => fetchUsers({ withLoader: true })}
                >
                    <Ionicons name="search-outline" size={16} color={colors.textOnPrimary} />
                    <Text style={{ color: colors.textOnPrimary, fontWeight: '700', marginLeft: 6, fontSize: fs(13) }}>Apply Filters</Text>
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={users}
                    keyExtractor={(item) => String(item?._id || item?.id)}
                    renderItem={renderUserCard}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListEmptyComponent={
                        <View style={styles.emptyWrap}>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(13) }}>No users found for current filters.</Text>
                        </View>
                    }
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: { flex: 1 },
    searchInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
    },
    filterRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 6,
        marginBottom: 2,
    },
    filterChip: {
        borderWidth: 1,
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    applyBtn: {
        marginTop: 8,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 10,
    },
    loadingWrap: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyWrap: {
        padding: 20,
        alignItems: 'center',
    },
    card: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 12,
        marginTop: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        gap: 10,
    },
    badgesWrap: {
        alignItems: 'flex-end',
        gap: 6,
    },
    badge: {
        borderRadius: 12,
        paddingHorizontal: 8,
        paddingVertical: 4,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 12,
    },
    actionBtn: {
        flex: 1,
        borderRadius: 9,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    actionText: {
        marginLeft: 6,
        fontWeight: '700',
    },
    modalOverlay: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
    },
    modalCard: {
        width: '100%',
        maxWidth: 420,
        borderRadius: 12,
        borderWidth: 1,
        padding: 14,
    },
    reasonInput: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
        paddingVertical: 8,
        marginTop: 10,
        minHeight: 90,
        textAlignVertical: 'top',
    },
    modalActions: {
        marginTop: 12,
        flexDirection: 'row',
        gap: 8,
    },
    modalBtn: {
        flex: 1,
        borderRadius: 10,
        borderWidth: 1,
        paddingVertical: 10,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export default UserManagement;
