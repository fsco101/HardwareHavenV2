import React from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const FormContainer = ({children, title}) => {
    const colors = useTheme();
    const { width, fs, spacing } = useResponsive();
    const containerWidth = Math.min(width, 500);
    return (
        <ScrollView contentContainerStyle={[styles.container, { backgroundColor: colors.background, marginTop: spacing.lg, width: containerWidth, alignSelf: 'center' }]}>
            <Text style={[styles.title, { color: colors.primary, fontSize: fs(24), marginBottom: spacing.md }]}>{title}</Text>
            {children}
        </ScrollView>
    )
}

const styles = StyleSheet.create({
    container: {
        marginBottom: 60,
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontWeight: 'bold',
    }
})

export default FormContainer;