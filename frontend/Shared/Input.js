import React from 'react';
import { TextInput, StyleSheet } from 'react-native'
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const Input = (props) => {
    const colors = useTheme();
    const { fs } = useResponsive();
    const hasError = Boolean(props.error);

    return (
        <TextInput
            style={[
                styles.input,
                {
                    backgroundColor: colors.inputBg,
                    borderColor: hasError ? colors.danger : colors.border,
                    color: colors.text,
                    height: 44,
                    margin: 6,
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    fontSize: fs(14),
                }
            ,
                props.style,
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
            {...props.textInputProps}
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