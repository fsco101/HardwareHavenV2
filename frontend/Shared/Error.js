import React from "react"
import { StyleSheet, View, Text } from 'react-native'
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const Error = (props) => {
    const colors = useTheme();
    const { spacing, ws } = useResponsive();
    return (
        <View
            style={[
                styles.container,
                {
                    backgroundColor: colors.danger + '20',
                    borderColor: colors.danger,
                    borderWidth: 1,
                    borderRadius: ws(8),
                    padding: spacing.sm + 2,
                    marginTop: spacing.xs,
                    marginBottom: spacing.sm,
                },
                props.containerStyle,
            ]}
        >
            <Text style={[styles.text, { color: colors.danger }, props.textStyle]}>{props.message}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '80%',
        maxWidth: '80%',
        alignSelf: 'center',
        alignItems: 'center',
    },
    text: {
        fontWeight: '600',
        textAlign: 'center',
        flexShrink: 1,
        width: '100%',
    }
})

export default Error;