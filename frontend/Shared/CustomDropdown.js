import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    Modal,
    FlatList,
    StyleSheet,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../Theme/theme';

const CustomDropdown = ({
    label,
    data,
    value,
    onSelect,
    labelKey = 'label',
    valueKey = 'value',
    placeholder = 'Select...',
    enabled = true,
    error = false,
    searchable = false,
    icon,
}) => {
    const colors = useTheme();
    const [visible, setVisible] = useState(false);
    const [search, setSearch] = useState('');

    const selectedItem = data.find(item => item[valueKey] === value);
    const displayText = selectedItem ? selectedItem[labelKey] : placeholder;

    const filtered = searchable && search
        ? data.filter(item => item[labelKey].toLowerCase().includes(search.toLowerCase()))
        : data;

    const handleSelect = (item) => {
        onSelect(item[valueKey]);
        setVisible(false);
        setSearch('');
    };

    return (
        <View style={styles.wrapper}>
            {label ? (
                <Text style={[styles.label, { color: colors.textSecondary }]}>{label}</Text>
            ) : null}
            <TouchableOpacity
                activeOpacity={0.7}
                disabled={!enabled}
                onPress={() => setVisible(true)}
                style={[
                    styles.selector,
                    {
                        backgroundColor: colors.inputBg,
                        borderColor: error ? colors.danger : colors.border,
                        opacity: enabled ? 1 : 0.5,
                    },
                ]}
            >
                {icon ? (
                    <Ionicons name={icon} size={18} color={colors.primary} style={{ marginRight: 10 }} />
                ) : null}
                <Text
                    style={[
                        styles.selectorText,
                        { color: selectedItem ? colors.text : colors.textSecondary },
                    ]}
                    numberOfLines={1}
                >
                    {displayText}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.primary} />
            </TouchableOpacity>

            <Modal
                visible={visible}
                transparent
                animationType="slide"
                onRequestClose={() => { setVisible(false); setSearch(''); }}
            >
                <TouchableOpacity
                    style={[styles.overlay, { backgroundColor: colors.overlay }]}
                    activeOpacity={1}
                    onPress={() => { setVisible(false); setSearch(''); }}
                >
                    <View style={[styles.modal, { backgroundColor: colors.surface }]}>
                        <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
                            <Text style={[styles.modalTitle, { color: colors.text }]}>{label || placeholder}</Text>
                            <TouchableOpacity onPress={() => { setVisible(false); setSearch(''); }}>
                                <Ionicons name="close-circle" size={26} color={colors.textSecondary} />
                            </TouchableOpacity>
                        </View>
                        {searchable ? (
                            <View style={[styles.searchContainer, { backgroundColor: colors.inputBg, borderColor: colors.border }]}>
                                <Ionicons name="search" size={18} color={colors.textSecondary} />
                                <TextInput
                                    style={[styles.searchInput, { color: colors.text }]}
                                    placeholder="Search..."
                                    placeholderTextColor={colors.textSecondary}
                                    value={search}
                                    onChangeText={setSearch}
                                    autoFocus
                                />
                            </View>
                        ) : null}
                        <FlatList
                            data={filtered}
                            keyExtractor={(item, index) => `${item[valueKey]}-${index}`}
                            renderItem={({ item }) => {
                                const isSelected = item[valueKey] === value;
                                return (
                                    <TouchableOpacity
                                        style={[
                                            styles.option,
                                            {
                                                backgroundColor: isSelected ? colors.primary + '20' : 'transparent',
                                                borderBottomColor: colors.border,
                                            },
                                        ]}
                                        onPress={() => handleSelect(item)}
                                        activeOpacity={0.6}
                                    >
                                        <Text style={[styles.optionText, { color: isSelected ? colors.primary : colors.text }]}>
                                            {item[labelKey]}
                                        </Text>
                                        {isSelected ? (
                                            <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
                                        ) : null}
                                    </TouchableOpacity>
                                );
                            }}
                            ListEmptyComponent={
                                <View style={styles.empty}>
                                    <Text style={{ color: colors.textSecondary }}>No options found</Text>
                                </View>
                            }
                        />
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {
        width: '100%',
    },
    label: {
        fontSize: 13,
        fontWeight: '600',
        marginBottom: 6,
    },
    selector: {
        flexDirection: 'row',
        alignItems: 'center',
        height: 52,
        borderRadius: 12,
        borderWidth: 1.5,
        paddingHorizontal: 14,
    },
    selectorText: {
        flex: 1,
        fontSize: 15,
    },
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
    },
    modal: {
        maxHeight: '70%',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        paddingBottom: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 16,
        borderBottomWidth: 1,
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        margin: 12,
        paddingHorizontal: 12,
        borderRadius: 10,
        borderWidth: 1,
        height: 44,
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 15,
    },
    option: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 0.5,
    },
    optionText: {
        fontSize: 15,
        flex: 1,
    },
    empty: {
        padding: 30,
        alignItems: 'center',
    },
});

export default CustomDropdown;
