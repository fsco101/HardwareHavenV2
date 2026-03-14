import styled, { css } from "styled-components/native";
import { moderateScale } from "../../assets/common/responsive";

const TrafficLight = styled.View`
  border-radius: 50px;
  width: ${moderateScale(10, 0.3)}px;
  height: ${moderateScale(10, 0.3)}px;
  padding: ${moderateScale(10, 0.3)}px;

  ${(props) =>
    props.available &&
    css`
      background: #2ecc71;
    `}

  ${(props) =>
    props.limited &&
    css`
      background: #f39c12;
    `}

    ${(props) =>
    props.unavailable &&
    css`
      background: #e74c3c;
    `}
`;

export default TrafficLight;