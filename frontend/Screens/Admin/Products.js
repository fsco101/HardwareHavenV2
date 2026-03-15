import React, { useState, useCallback } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    RefreshControl,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native"
import { Searchbar } from 'react-native-paper';
import ListItem from "./ListItem"
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import { useNavigation } from "@react-navigation/native"
import { useTheme } from '../../Theme/theme';
import SweetAlert from '../../Shared/SweetAlert';
import Toast from '../../Shared/SnackbarService';
import { useResponsive } from '../../assets/common/responsive';
import { useDispatch, useSelector } from 'react-redux';
import { deleteProduct as deleteProductAction, fetchProducts } from '../../Redux/Actions/productActions';
import { getToken } from '../../assets/common/tokenStorage';

const Products = (props) => {
    const colors = useTheme();
    const { width, fs, spacing, ws, deviceType } = useResponsive();
    const isMobile = deviceType === 'mobile';
    const [productList, setProductList] = useState([]);
    const [productFilter, setProductFilter] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigation = useNavigation()
    const [refreshing, setRefreshing] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const dispatch = useDispatch();
    const productsState = useSelector((state) => state.products);

    const ListHeader = () => {
        if (isMobile) return null;
        return (
            <View style={[styles.listHeader, { backgroundColor: colors.surfaceLight }]}>
                <View style={[styles.headerItem, { width: width / 6 }]}></View>
                <View style={[styles.headerItem, { width: width / 6 }]}>
                    <Text style={{ fontWeight: '600', color: colors.text, fontSize: fs(13) }}>Brand</Text>
                </View>
                <View style={[styles.headerItem, { width: width / 6 }]}>
                    <Text style={{ fontWeight: '600', color: colors.text, fontSize: fs(13) }}>Name</Text>
                </View>
                <View style={[styles.headerItem, { width: width / 6 }]}>
                    <Text style={{ fontWeight: '600', color: colors.text, fontSize: fs(13) }}>Category</Text>
                </View>
                <View style={[styles.headerItem, { width: width / 6 }]}>
                    <Text style={{ fontWeight: '600', color: colors.text, fontSize: fs(13) }}>Price</Text>
                </View>
                <View style={[styles.headerItem, { width: width / 6 }]}> 
                    <Text style={{ fontWeight: '600', color: colors.text, fontSize: fs(13) }}>Actions</Text>
                </View>
            </View>
        )
    }

    const searchProduct = (text) => {
        if (text === "") {
            setProductFilter(productList)
        }
        setProductFilter(
            productList.filter((i) =>
                i.name.toLowerCase().includes(text.toLowerCase())
            )
        )
    }

    const promptDeleteProduct = (id) => {
        setDeleteId(id);
        setShowDeleteAlert(true);
    }

    const confirmDelete = () => {
        setShowDeleteAlert(false);
        (async () => {
            const token = await getToken();
            const result = await dispatch(deleteProductAction(deleteId, token));
            if (result?.success) {
                const products = productFilter.filter((item) => item.id !== deleteId);
                setProductFilter(products);
                Toast.show({ topOffset: 60, type: "success", text1: "Product deleted" });
            } else {
                Toast.show({ topOffset: 60, type: "error", text1: result?.message || 'Delete failed' });
            }
        })();
    }

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        dispatch(fetchProducts()).finally(() => {
            setRefreshing(false);
        });
    }, [dispatch]);

    useFocusEffect(
        useCallback(() => {
            dispatch(fetchProducts());
            return () => {
                setProductList([]);
                setProductFilter([]);
                setLoading(true);
            }
        }, [dispatch])
    )

    React.useEffect(() => {
        if (Array.isArray(productsState.items)) {
            setProductList(productsState.items);
            setProductFilter(productsState.items);
        }
        setLoading(productsState.loading);
    }, [productsState.items, productsState.loading]);

    return (
        <View style={{ flex: 1, backgroundColor: colors.background }}>
            <SweetAlert
                visible={showDeleteAlert}
                type="confirm"
                title="Delete Product"
                message="Are you sure you want to delete this product?"
                confirmText="Delete"
                cancelText="Cancel"
                showCancel={true}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteAlert(false)}
            />
            <View style={[styles.buttonContainer, { marginHorizontal: spacing.md, marginTop: spacing.md, marginBottom: spacing.sm }]}> 
                <EasyButton secondary medium onPress={() => navigation.navigate("Dashboard")}>
                    <Ionicons name="analytics-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Dashboard</Text>
                </EasyButton>
                <EasyButton secondary medium onPress={() => navigation.navigate("Orders")}>
                    <Ionicons name="bag-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Orders</Text>
                </EasyButton>
                <EasyButton secondary medium onPress={() => navigation.navigate("ProductForm")}>
                    <Ionicons name="add-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Products</Text>
                </EasyButton>
                <EasyButton secondary medium onPress={() => navigation.navigate("Categories")}>
                    <Ionicons name="add-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Categories</Text>
                </EasyButton>
                <EasyButton secondary medium onPress={() => navigation.navigate("User Management")}>
                    <Ionicons name="people-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Users</Text>
                </EasyButton>
                <EasyButton secondary medium onPress={() => navigation.navigate("Review Management")}>
                    <Ionicons name="chatbubbles-outline" size={18} color="white" />
                    <Text style={styles.buttonText}>Reviews</Text>
                </EasyButton>
            </View>
            <Searchbar
                placeholder="Search products..."
                onChangeText={(text) => searchProduct(text)}
                style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm + 2, backgroundColor: colors.inputBg, borderRadius: ws(12) }}
                inputStyle={{ color: colors.text, fontSize: fs(14) }}
                placeholderTextColor={colors.textSecondary}
                iconColor={colors.primary}
            />
            {loading ? (
                <View style={styles.spinner}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} />}
                    ListHeaderComponent={ListHeader}
                    data={productFilter}
                    renderItem={({ item, index }) => (
                        <ListItem item={item} index={index} deleteProduct={promptDeleteProduct} />
                    )}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingBottom: spacing.xl }}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    listHeader: {
        flexDirection: 'row',
        padding: 5,
    },
    headerItem: {
        margin: 3,
    },
    spinner: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center'
    },
    buttonContainer: {
        alignSelf: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 8,
    },
    buttonText: {
        marginLeft: 4,
        color: 'white'
    }
})

export default Products;