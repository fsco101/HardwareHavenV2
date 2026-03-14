import React from 'react';
import { Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const FILTERS = [
    { key: 'today', label: 'Today' },
    { key: 'last7', label: 'Last 7 days' },
    { key: 'last30', label: 'Last 30 days' },
    { key: 'custom', label: 'Custom' },
];

const formatDateTime = (date) => {
    if (!(date instanceof Date) || Number.isNaN(date.getTime())) return 'Select date';
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const FilterBar = ({ selectedFilter, onFilterChange, customRange, onCustomRangeChange, onApplyCustomRange }) => {
    const colors = useTheme();
    const { fs, spacing } = useResponsive();
    const [pickerState, setPickerState] = React.useState({ visible: false, field: 'start' });

    const openPicker = (field) => setPickerState({ visible: true, field });
    const closePicker = () => setPickerState((prev) => ({ ...prev, visible: false }));

    const pickerValue = pickerState.field === 'start' ? customRange.start : customRange.end;

    return (
        <View style={[styles.wrapper, { marginHorizontal: spacing.sm, marginTop: spacing.sm }]}> 
            <View style={styles.row}>
                {FILTERS.map((item) => (
                    <TouchableOpacity
                        key={item.key}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: selectedFilter === item.key ? colors.primary : colors.surfaceLight,
                                borderColor: selectedFilter === item.key ? colors.primary : colors.border,
                            },
                        ]}
                        onPress={() => onFilterChange(item.key)}
                    >
                        <Text style={{ color: selectedFilter === item.key ? colors.textOnPrimary : colors.textSecondary, fontSize: fs(12), fontWeight: '600' }}>
                            {item.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {selectedFilter === 'custom' && (
                <View style={[styles.customBox, { backgroundColor: colors.surface, borderColor: colors.border, marginTop: spacing.sm }]}> 
                    <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginBottom: 6 }}>
                        Pick exact start and end date-time
                    </Text>

                    <View style={styles.customRow}>
                        <TouchableOpacity
                            style={[styles.dateBtn, { backgroundColor: colors.inputBg, borderColor: colors.border }]}
                            onPress={() => openPicker('start')}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: colors.text, fontSize: fs(12), fontWeight: '600' }}>Start</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: 2 }}>
                                {formatDateTime(customRange.start)}
                            </Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.dateBtn, { backgroundColor: colors.inputBg, borderColor: colors.border, marginLeft: 8 }]}
                            onPress={() => openPicker('end')}
                            activeOpacity={0.8}
                        >
                            <Text style={{ color: colors.text, fontSize: fs(12), fontWeight: '600' }}>End</Text>
                            <Text style={{ color: colors.textSecondary, fontSize: fs(11), marginTop: 2 }}>
                                {formatDateTime(customRange.end)}
                            </Text>
                        </TouchableOpacity>
                    </View>

                    {pickerState.visible && Platform.OS !== 'web' ? (
                        <DateTimePicker
                            value={pickerValue || new Date()}
                            mode={Platform.OS === 'ios' ? 'datetime' : 'date'}
                            display={Platform.OS === 'ios' ? 'inline' : 'default'}
                            onChange={(event, pickedDate) => {
                                if (event.type === 'dismissed') {
                                    closePicker();
                                    return;
                                }

                                if (pickedDate) {
                                    onCustomRangeChange(pickerState.field, pickedDate);
                                }

                                if (Platform.OS !== 'ios') {
                                    closePicker();
                                }
                            }}
                        />
                    ) : null}

                    {Platform.OS === 'web' && (
                        <View style={[styles.customRow, { marginTop: 8 }]}> 
                            <TextInput
                                value={customRange.startInput || ''}
                                onChangeText={(value) => onCustomRangeChange('startInput', value)}
                                placeholder="Start YYYY-MM-DD HH:mm"
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, fontSize: fs(12) }]}
                            />
                            <TextInput
                                value={customRange.endInput || ''}
                                onChangeText={(value) => onCustomRangeChange('endInput', value)}
                                placeholder="End YYYY-MM-DD HH:mm"
                                placeholderTextColor={colors.textSecondary}
                                style={[styles.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text, fontSize: fs(12), marginLeft: 8 }]}
                            />
                        </View>
                    )}

                    <TouchableOpacity style={[styles.applyBtn, { backgroundColor: colors.secondary, marginTop: 8 }]} onPress={onApplyCustomRange}>
                        <Text style={{ color: colors.textOnPrimary, fontWeight: '700', fontSize: fs(12) }}>Apply custom range</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    wrapper: {},
    row: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    chip: {
        borderWidth: 1,
        borderRadius: 999,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 8,
    },
    customBox: {
        borderWidth: 1,
        borderRadius: 12,
        padding: 10,
    },
    customRow: {
        flexDirection: 'row',
    },
    input: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 10,
    },
    dateBtn: {
        flex: 1,
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 9,
        paddingHorizontal: 10,
    },
    applyBtn: {
        borderRadius: 8,
        paddingVertical: 9,
        alignItems: 'center',
    },
});

export default FilterBar;
