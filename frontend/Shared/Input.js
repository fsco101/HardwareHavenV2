import React from 'react';
import { TextInput, StyleSheet } from 'react-native'
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const Input = (props) => {
    const colors = useTheme();
    const { fs } = useResponsive();
    return (
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.border,
                    color: colors.text,
                    height: 44,
                    margin: 6,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    fontSize: fs(14),
                }
            ]}
            placeholder={props.placeholder}
            placeholderTextColor={colors.textSecondary}
            name={props.name}
            id={props.id}
            value={props.value}
            autoCorrect={props.autoCorrect}
            onChangeText={props.onChangeText}
            onFocus={props.onFocus}
            secureTextEntry={props.secureTextEntry}
            keyboardType={props.keyboardType}
            editable={props.editable}
            selectTextOnFocus={props.selectTextOnFocus}
        />
    );
}

const styles = StyleSheet.create({
    input: {
        width: '80%',
        borderWidth: 1.5,
    },
});

export default Input;