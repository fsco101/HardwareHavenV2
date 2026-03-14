import React from "react";
import { View } from "react-native";
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

import ProductCard from "./ProductCard";
const ProductList = (props) => {
    const { item } = props;
    const navigation = useNavigation();
    const colors = useTheme();
    const { columns } = useResponsive();
    return (
        <View style={{ width: `${100 / columns}%`, backgroundColor: colors.background }}>
            <ProductCard
                {...item}
                onPressDetail={() => navigation.navigate("Product Detail", { item })}
            />
        </View>
    )
}
export default ProductList;