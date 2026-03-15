import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TrafficLight from "./StyledComponents/TrafficLight";
import EasyButton from "./StyledComponents/EasyButton";
import Toast from './SnackbarService';
import { Picker } from "@react-native-picker/picker";
import { useTheme } from '../Theme/theme';

import { useResponsive } from '../assets/common/responsive';
import { formatPHDate } from '../assets/common/phTime';
import { getToken } from '../assets/common/tokenStorage';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../Redux/Actions/orderActions';

const codes = [
  { name: "Pending", code: "Pending" },
  { name: "Processing", code: "Processing" },
  { name: "Shipped", code: "Shipped" },
];
const OrderCard = ({ item, update, onRefresh }) => {
  const colors = useTheme();
  const { fs, spacing } = useResponsive();
  const [orderStatus, setOrderStatus] = useState('');
  const [statusText, setStatusText] = useState('');
  const [statusChange, setStatusChange] = useState(item.status);
  const [cardColor, setCardColor] = useState('');
  const dispatch = useDispatch();

  const updateOrder = async () => {
    try {
      const jwt = await getToken();
      const result = await dispatch(updateOrderStatus(item.id, statusChange, jwt));
      if (result.success) {
        Toast.show({
          topOffset: 60,
          type: "success",
          text1: "Order Updated",
          text2: `Status changed to ${statusChange}`,
        });
        if (onRefresh) onRefresh();
      } else {
        Toast.show({
          topOffset: 60,
          type: "error",
          text1: "Something went wrong",
          text2: result.message || "Please try again",
        });
      }
    } catch (error) {
      Toast.show({
        topOffset: 60,
        type: "error",
        text1: "Something went wrong",
        text2: error.response?.data?.message || "Please try again",
      });
    }
  }

  useEffect(() => {
    const status = item.status;
    if (status === "Pending") {
      setOrderStatus(<TrafficLight unavailable></TrafficLight>);
      setStatusText("Pending");
      setCardColor(colors.warning);
    } else if (status === "Processing") {
      setOrderStatus(<TrafficLight limited></TrafficLight>);
      setStatusText("Processing");
      setCardColor(colors.secondary);
    } else if (status === "Shipped") {
      setOrderStatus(<TrafficLight limited></TrafficLight>);
      setStatusText("Shipped");
      setCardColor(colors.primary);
    } else if (status === "Delivered") {
      setOrderStatus(<TrafficLight available></TrafficLight>);
      setStatusText("Delivered");
      setCardColor(colors.success);
    } else if (status === "Cancelled") {
      setOrderStatus(null);
      setStatusText("Cancelled");
      setCardColor(colors.danger);
    } else {
      setOrderStatus(null);
      setStatusText(status || "Unknown");
      setCardColor(colors.textSecondary);
    }

    return () => {
      setOrderStatus(null);
      setStatusText('');
      setCardColor('');
    };
  }, [item.status]);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderLeftColor: cardColor, borderLeftWidth: 4, padding: spacing.lg, margin: spacing.sm + 2 }]}>
      <View>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(16) }}>Order #{item.id?.substring(item.id.length - 8) || item.id}</Text>
      </View>
      <View style={{ marginTop: spacing.sm + 2 }}>
        <Text style={{ color: colors.text, fontSize: fs(14) }}>
          Status: <Text style={{ color: cardColor, fontWeight: 'bold' }}>{statusText}</Text> {orderStatus}
        </Text>
        {item.paymentMethod && (
          <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>
            Payment: {item.paymentMethod === 'COD' ? 'Cash on Delivery' : 'Online'}{' '}
            ({item.paymentStatus || 'Pending'})
          </Text>
        )}
        <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>
          Address: {item.shippingAddress1} {item.shippingAddress2}
        </Text>
        <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>
          Date: {formatPHDate(item.dateOrdered)}
        </Text>
        <View style={[styles.priceContainer, { marginTop: spacing.sm + 2 }]}>
          <Text style={{ color: colors.textSecondary, fontSize: fs(14) }}>Price: </Text>
          <Text style={[styles.price, { color: colors.accent, fontSize: fs(16) }]}>P{item.totalPrice?.toFixed(2)}</Text>
        </View>
        {item.status === 'Cancelled' && item.cancellationReason ? (
          <Text style={{ color: colors.danger, fontSize: fs(12), marginTop: spacing.sm }}>
            Reason: {item.cancellationReason}
          </Text>
        ) : null}
        {update && item.status !== 'Cancelled' && item.status !== 'Delivered' ? <View>
          <>
            <Picker
              width="80%"
              style={{ width: undefined, color: colors.text, backgroundColor: colors.inputBg }}
              selectedValue={statusChange}
              placeholder="Change Status"
              onValueChange={(e) => setStatusChange(e)}
            >
              {codes.map((c) => {
                return <Picker.Item
                  key={c.code}
                  label={c.name}
                  value={c.code}
                />
              })}
            </Picker>
            <EasyButton
              secondary
              large
              onPress={() => updateOrder()}
            >
              <Text style={{ color: colors.textOnPrimary }}>Update</Text>
            </EasyButton>
          </>
        </View> : null}
        {update && item.status === 'Delivered' ? (
          <Text style={{ color: colors.success, marginTop: spacing.sm, fontSize: fs(12), fontWeight: '600' }}>
            Locked: Buyer confirmed delivery.
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    elevation: 3,
  },
  priceContainer: {
    alignSelf: "flex-end",
    flexDirection: "row",
  },
  price: {
    fontWeight: "bold",
  },
});

export default OrderCard;