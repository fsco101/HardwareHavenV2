import React from "react";
import { StyleSheet } from "react-native";
import { useSelector } from 'react-redux'
import { Badge, Text } from 'react-native-paper';
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const CartIcon = (props) => {
  const colors = useTheme();
  const { fs, ms } = useResponsive();
  const cartItems = useSelector(state => state.cartItems)
  return (
    <>
      {cartItems.length ? (
        <Badge style={[styles.badge, { backgroundColor: colors.primary, width: ms(20, 0.3) }]}>
          <Text style={[styles.text, { color: colors.textOnPrimary, fontSize: fs(12) }]}>{cartItems.length}</Text>
        </Badge>
      ) : null}
    </>
  );
};

const styles = StyleSheet.create({
  badge: {
    position: "absolute",
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    alignContent: "center",
    top: -2,
    right: -8,
  },
  text: {
    width: 100,
    fontWeight: "bold",
  },
})

export default CartIcon