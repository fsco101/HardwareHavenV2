import * as React from "react";
import {
  createDrawerNavigator,
} from "@react-navigation/drawer";

import Main from "./Main";
import DrawerContent from "../Shared/DrawerContent";
import { useTheme } from '../Theme/theme';
import { useResponsive } from '../assets/common/responsive';

const NativeDrawer = createDrawerNavigator();
const DrawerNavigator = () => {
  const colors = useTheme();
  const { deviceType, width } = useResponsive();

  const drawerWidth = deviceType === 'mobile'
    ? Math.min(Math.round(width * 0.84), 340)
    : Math.min(Math.round(width * 0.45), 420);

  return (
    <NativeDrawer.Navigator
      screenOptions={{
        drawerStyle: {
          width: drawerWidth,
          backgroundColor: colors.surface,
        },
        headerShown: false,
      }}
      drawerContent={(props) => <DrawerContent {...props} />}
    >
      <NativeDrawer.Screen name="My app" component={Main} />
    </NativeDrawer.Navigator>
  );
}
export default DrawerNavigator