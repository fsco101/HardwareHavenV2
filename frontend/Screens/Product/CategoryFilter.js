import React from 'react';
import { StyleSheet, TouchableOpacity, ScrollView, View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const CategoryFilter = (props) => {
    const colors = useTheme();
    const { fs, spacing, ws, ms } = useResponsive();

    const renderChip = ({ label, isActive, onPress, icon = 'pricetag-outline' }) => (
        <TouchableOpacity onPress={onPress} activeOpacity={0.75}>
            <View
                style={[
                    styles.chip,
                    {
                        marginHorizontal: ws(4),
                        backgroundColor: isActive ? colors.primary : colors.surfaceLight,
                        borderColor: isActive ? colors.primary : colors.border,
                    },
                ]}
            >
                <Ionicons
                    name={isActive ? 'checkmark-circle' : icon}
                    size={ms(14, 0.3)}
                    color={isActive ? colors.textOnPrimary : colors.textSecondary}
                />
                <Text
                    style={{
                        color: isActive ? colors.textOnPrimary : colors.text,
                        fontSize: fs(13),
                        fontWeight: isActive ? '700' : '600',
                        marginLeft: 6,
                    }}
                >
                    {label}
                </Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView
            bounces={true}
            horizontal={true}
            style={{ backgroundColor: colors.background }}
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: spacing.sm, paddingVertical: spacing.sm }}
        >
            <View style={styles.row}>
                {renderChip({
                    label: 'All Categories',
                    isActive: props.active === -1,
                    icon: 'apps-outline',
                    onPress: () => {
                        props.categoryFilter('all');
                        props.setActive(-1);
                    },
                })}
                {props.categories.map((item) => (
                    <View
                        key={item._id}
                    >
                        {renderChip({
                            label: item.name,
                            isActive: props.active == props.categories.indexOf(item),
                            onPress: () => {
                                props.categoryFilter(item._id);
                                props.setActive(props.categories.indexOf(item));
                            },
                        })}
                    </View>
                ))}
            </View>
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    chip: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },
})

export default CategoryFilter;