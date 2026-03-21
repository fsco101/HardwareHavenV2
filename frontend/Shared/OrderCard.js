import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

import TrafficLight from "./StyledComponents/TrafficLight";
import EasyButton from "./StyledComponents/EasyButton";
import Toast from './SnackbarService';
import CustomDropdown from './CustomDropdown';
import { useTheme } from '../Theme/theme';

import { useResponsive } from '../assets/common/responsive';
import { formatPHDate } from '../assets/common/phTime';
import { formatOrderNumber } from '../assets/common/orderNumber';
import { getToken } from '../assets/common/tokenStorage';
import { useDispatch } from 'react-redux';
import { updateOrderStatus } from '../Redux/Actions/orderActions';

const codes = [
  { name: "Pending", code: "Pending" },
  { name: "Processing", code: "Processing" },
  { name: "Shipped", code: "Shipped" },
  { name: "Cancelled", code: "Cancelled" },
];

const statusOptions = codes.map((item) => ({
  label: item.name,
  value: item.code,
}));

const getStatusMeta = (status, colors) => {
  if (status === 'Pending') return { color: colors.warning, icon: 'time-outline', label: 'Pending' };
  if (status === 'Processing') return { color: colors.secondary, icon: 'sync-outline', label: 'Processing' };
  if (status === 'Shipped') return { color: colors.primary, icon: 'car-outline', label: 'Shipped' };
  if (status === 'Cancelled') return { color: colors.danger, icon: 'close-circle-outline', label: 'Cancelled' };
  return { color: colors.textSecondary, icon: 'help-circle-outline', label: status || 'Unknown' };
};

const OrderCard = ({ item, update, onRefresh }) => {
  const colors = useTheme();
  const { fs, spacing } = useResponsive();
  const [orderStatus, setOrderStatus] = useState('');
  const [statusText, setStatusText] = useState('');
  const [statusChange, setStatusChange] = useState(item.status);
  const [cardColor, setCardColor] = useState('');
  const [updating, setUpdating] = useState(false);
  const dispatch = useDispatch();
  const orderId = item?._id || item?.id;

  const updateOrder = async () => {
    if (!orderId) {
      Toast.show({
        topOffset: 60,
        type: 'error',
        text1: 'Order update failed',
        text2: 'Missing order ID. Please refresh the order list.',
      });
      return;
    }

    if (!statusChange || statusChange === item.status) {
      Toast.show({
        topOffset: 60,
        type: 'info',
        text1: 'No status change',
        text2: 'Select a different status before updating.',
      });
      return;
    }

    try {
      setUpdating(true);
      const jwt = await getToken();
      if (!jwt) {
        Toast.show({
          topOffset: 60,
          type: 'error',
          text1: 'Session expired',
          text2: 'Please login again as admin.',
        });
        return;
      }

      const result = await dispatch(updateOrderStatus(orderId, statusChange, jwt));
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
        text2: error.response?.data?.message || error.message || "Please try again",
      });
    } finally {
      setUpdating(false);
    }
  }

  useEffect(() => {
    const status = item.status;
    setStatusChange(status);

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
  }, [item.status, colors]);

  return (
    <View style={[styles.container, { backgroundColor: colors.cardBg, borderLeftColor: cardColor, borderLeftWidth: 4, padding: spacing.lg, margin: spacing.sm + 2 }]}>
      <View>
        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(16) }}>Order #{formatOrderNumber(item)}</Text>
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
            <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: spacing.sm, marginBottom: spacing.xs }}>
              Change Status
            </Text>
            <View style={[styles.pickerWrap, { borderColor: colors.border, backgroundColor: colors.inputBg, opacity: updating ? 0.6 : 1 }]}> 
              <View style={[styles.pickerHeader, { borderBottomColor: colors.border }]}> 
                <View style={[styles.statusDot, { backgroundColor: getStatusMeta(statusChange, colors).color }]} />
                <Ionicons
                  name={getStatusMeta(statusChange, colors).icon}
                  size={14}
                  color={getStatusMeta(statusChange, colors).color}
                  style={{ marginRight: 6 }}
                />
                <Text style={{ color: colors.textSecondary, fontSize: fs(11), fontWeight: '600' }}>
                  Selected: <Text style={{ color: getStatusMeta(statusChange, colors).color }}>{getStatusMeta(statusChange, colors).label}</Text>
                </Text>
              </View>
              <View style={styles.dropdownWrap}>
                <CustomDropdown
                  data={statusOptions}
                  value={statusChange}
                  onSelect={setStatusChange}
                  placeholder="Select status"
                  enabled={!updating}
                  searchable={false}
                  icon="list-outline"
                />
              </View>
            </View>
            <EasyButton
              secondary
              large
              disabled={updating}
              onPress={() => updateOrder()}
            >
              <Text style={{ color: colors.textOnPrimary }}>{updating ? 'Updating...' : 'Update'}</Text>
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
  pickerWrap: {
    marginTop: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderRadius: 10,
    overflow: 'hidden',
  },
  pickerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  dropdownWrap: {
    padding: 8,
  },
});

export default OrderCard;