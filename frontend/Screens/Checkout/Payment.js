import React, { useState } from 'react'
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native'
import { RadioButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Theme/theme';
import { Ionicons } from '@expo/vector-icons';
import { useResponsive } from '../../assets/common/responsive';
import Toast from 'react-native-toast-message';

const methods = [
  { name: 'Cash on Delivery', value: 'COD', icon: 'cash-outline', description: 'Pay when you receive your order' },
  { name: 'Online Payment (GCash / GrabPay)', value: 'Online', icon: 'phone-portrait-outline', description: 'Pay via GCash or GrabPay' },
]

const Payment = ({ route }) => {
  const incomingOrder = route?.params?.order || route?.params || null;
  const [selected, setSelected] = useState('');
  const navigation = useNavigation()
  const colors = useTheme();
  const { fs, ms, spacing, ws } = useResponsive();

  const handleContinue = () => {
    if (!incomingOrder) {
      Toast.show({
        topOffset: 60,
        type: "error",
        text1: "Missing checkout data",
        text2: "Please complete Shipping first.",
      });
      navigation.navigate("Shipping");
      return;
    }

    if (!selected) {
      Toast.show({
        topOffset: 60,
        type: "error",
        text1: "Please select a payment method",
      });
      return;
    }
    // Attach payment method to order
    const orderWithPayment = {
      ...incomingOrder,
      paymentMethod: selected,
    };
    navigation.navigate("Confirm", { order: orderWithPayment });
  }

  return (
    <View style={[styles.container, { backgroundColor: colors.background, paddingTop: spacing.xxl + 12, paddingHorizontal: spacing.lg }]}>
      <Ionicons name="card-outline" size={ms(50, 0.3)} color={colors.primary} style={{ marginBottom: spacing.md }} />
      <Text style={{ fontSize: fs(22), fontWeight: 'bold', color: colors.text, marginBottom: spacing.lg }}>Payment Method</Text>
      <View style={[styles.radioContainer, { backgroundColor: colors.surface, borderColor: colors.border, borderRadius: ws(12), marginBottom: spacing.lg }]}>
        <RadioButton.Group
          value={selected}
          onValueChange={(value) => setSelected(value)}
        >
          {methods.map((item, index) => (
            <View key={index} style={{ borderBottomWidth: index < methods.length - 1 ? 1 : 0, borderBottomColor: colors.border }}>
              <RadioButton.Item
                value={item.value}
                color={colors.primary}
                label={item.name}
                labelStyle={{ color: colors.text, fontWeight: '600', fontSize: fs(14) }}
              />
              <View style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: 16, paddingBottom: 10 }}>
                <Ionicons name={item.icon} size={ms(16, 0.3)} color={colors.textSecondary} />
                <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginLeft: 6 }}>{item.description}</Text>
              </View>
            </View>
          ))}
        </RadioButton.Group>
      </View>

      {selected === 'Online' && (
        <View style={[styles.infoBox, { backgroundColor: colors.surfaceLight, borderColor: colors.secondary, padding: spacing.md, borderRadius: ws(10), marginBottom: spacing.md }]}>
          <Ionicons name="information-circle-outline" size={ms(18, 0.3)} color={colors.secondary} />
          <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginLeft: 8, flex: 1 }}>
            You will be redirected to PayMongo to complete payment via GCash or GrabPay.
          </Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.confirmBtn, {
          backgroundColor: selected ? colors.primary : colors.border,
          paddingVertical: spacing.sm + 6,
          paddingHorizontal: spacing.xl,
          borderRadius: ws(10),
          marginTop: spacing.lg
        }]}
        onPress={handleContinue}
        activeOpacity={0.7}
        disabled={!selected}
      >
        <Text style={{ color: selected ? colors.textOnPrimary : colors.textSecondary, fontWeight: 'bold', fontSize: fs(16) }}>Continue</Text>
        <Ionicons name="arrow-forward" size={ms(20, 0.3)} color={selected ? colors.textOnPrimary : colors.textSecondary} style={{ marginLeft: spacing.sm }} />
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  radioContainer: {
    width: '100%',
    borderWidth: 1,
    overflow: 'hidden',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
  },
  confirmBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export default Payment;