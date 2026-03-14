import styled, { css } from "styled-components/native";
import { moderateScale } from "../../assets/common/responsive";

const EasyButton = styled.TouchableOpacity`
    flex-direction: row;
    border-radius: ${moderateScale(8, 0.3)}px;
    padding: ${moderateScale(10, 0.3)}px;
    margin: ${moderateScale(5, 0.3)}px;
    justify-content: center;
    align-items: center;
    background: transparent;

    ${(props) =>
        props.primary &&
        css`
            background: #ff6600;
        `
    }

    ${(props) =>
        props.secondary &&
        css`
            background: #00b4d8;
        `
    }

    ${(props) => 
        props.danger &&
        css`
            background: #e74c3c;
        `
    }

    ${(props) => 
        props.large &&
        css`
            width: ${moderateScale(135, 0.3)}px;
        `
    }

    ${(props) => 
        props.medium &&
        css`
            width: ${moderateScale(100, 0.3)}px;
        `
    }

    ${(props) => 
        props.small &&
        css`
            width: ${moderateScale(40, 0.3)}px;
        `
    }
`;

export default EasyButton