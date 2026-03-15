import React, { useState } from "react";
import {
    View,
    StyleSheet,
    Text,
    Image,
    TouchableOpacity,
    Modal
} from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from "@react-navigation/native"
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import { useTheme } from '../../Theme/theme';
import { useResponsive } from '../../assets/common/responsive';

const ListItem = ({ item, index, deleteProduct }) => {
    const [modalVisible, setModalVisible] = useState(false)
    const navigation = useNavigation()
    const colors = useTheme();
    const { width, fs, spacing, ms, ws, deviceType } = useResponsive();
    const isMobile = deviceType === 'mobile';
    const cleanUri = (value) => {
        const uri = String(value || '').trim();
        return uri ? uri : '';
    };
    const imageUri = cleanUri(item?.image) || cleanUri(Array.isArray(item?.images) ? item.images[0] : '');
    const fallbackImage = 'https://cdn.pixabay.com/photo/2012/04/01/17/29/box-23649_960_720.png';

    return (
        <View>
            <Modal
                animationType="fade"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => { setModalVisible(false) }}
            >
                <View style={[styles.centeredView, { backgroundColor: colors.overlay }]}>
                    <View style={[styles.modalView, { backgroundColor: colors.surface, padding: spacing.xl + 7, borderRadius: ws(16) }]}>
                        <TouchableOpacity
                            onPress={() => { setModalVisible(false) }}
                            style={{ alignSelf: "flex-end", position: "absolute", top: spacing.sm + 2, right: spacing.sm + 6 }}
                        >
                            <Ionicons name="close" size={ms(22, 0.3)} color={colors.textSecondary} />
                        </TouchableOpacity>
                        <Text style={{ color: colors.text, fontWeight: 'bold', fontSize: fs(16), marginBottom: spacing.lg }}>Product Actions</Text>
                        <EasyButton
                            medium
                            secondary
                            onPress={() => [navigation.navigate("ProductForm", { item }), setModalVisible(false)]}
                        >
                            <Text style={styles.textStyle}>Edit</Text>
                        </EasyButton>
                        <EasyButton
                            medium
                            danger
                            onPress={() => [deleteProduct(item.id || item._id), setModalVisible(false)]}
                        >
                            <Text style={styles.textStyle}>Delete</Text>
                        </EasyButton>
                        <EasyButton
                            medium
                            secondary
                            onPress={() => [
                                navigation.navigate('Review Management', {
                                    productId: item?._id || item?.id,
                                    productName: item?.name || '',
                                }),
                                setModalVisible(false),
                            ]}
                        >
                            <Text style={styles.textStyle}>Reviews</Text>
                        </EasyButton>
                    </View>
                </View>
            </Modal>
            <TouchableOpacity
                onPress={() => { navigation.navigate('Home', { screen: 'Product Detail', params: { item } }) }}
                onLongPress={() => setModalVisible(true)}
                style={[
                    isMobile ? styles.mobileCard : styles.container,
                    {
                        backgroundColor: index % 2 == 0 ? colors.surface : colors.surfaceLight,
                        width: width,
                        borderColor: colors.border,
                    },
                ]}
            >
                <Image
                    source={{ uri: imageUri || fallbackImage }}
                    resizeMode="contain"
                    style={[
                        styles.image,
                        isMobile
                            ? { width: ws(68), height: ws(68), borderRadius: ws(10) }
                            : { width: width / 6, height: ws(56), borderRadius: 8 },
                    ]}
                />
                {isMobile ? (
                    <View style={{ flex: 1, marginLeft: spacing.sm }}>
                        <Text style={[styles.mobileName, { color: colors.text, fontSize: fs(14) }]} numberOfLines={2}>{item.name || ''}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 2 }}>Brand: {item.brand || 'N/A'}</Text>
                        <Text style={{ color: colors.textSecondary, fontSize: fs(12), marginTop: 2 }} numberOfLines={1}>Category: {item.category ? item.category.name : 'N/A'}</Text>
                        <Text style={{ color: colors.accent, fontSize: fs(14), fontWeight: '700', marginTop: spacing.xs }}>P {item.price}</Text>

                        <View style={[styles.mobileActionsWrap, { marginTop: spacing.sm }]}> 
                            <TouchableOpacity
                                style={[styles.mobileActionBtn, { backgroundColor: colors.secondary }]}
                                onPress={() => navigation.navigate("ProductForm", { item })}
                            >
                                <Ionicons name="create-outline" size={14} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), fontWeight: '700', marginLeft: 4 }}>Edit</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mobileActionBtn, { backgroundColor: colors.danger }]}
                                onPress={() => deleteProduct(item.id || item._id)}
                            >
                                <Ionicons name="trash-outline" size={14} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), fontWeight: '700', marginLeft: 4 }}>Delete</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.mobileActionBtn, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('Review Management', {
                                    productId: item?._id || item?.id,
                                    productName: item?.name || '',
                                })}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textOnPrimary} />
                                <Text style={{ color: colors.textOnPrimary, fontSize: fs(12), fontWeight: '700', marginLeft: 4 }}>Reviews</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                ) : (
                    <>
                        <Text style={[styles.item, { color: colors.text, width: width / 6, fontSize: fs(13) }]}>{item.brand}</Text>
                        <Text style={[styles.item, { color: colors.text, width: width / 6, fontSize: fs(13) }]} numberOfLines={1} ellipsizeMode="tail">{item.name ? item.name : null}</Text>
                        <Text style={[styles.item, { color: colors.textSecondary, width: width / 6, fontSize: fs(13) }]} numberOfLines={1} ellipsizeMode="tail">{item.category ? item.category.name : null}</Text>
                        <Text style={[styles.item, { color: colors.accent, width: width / 6, fontSize: fs(13) }]}>P {item.price}</Text>
                        <View style={[styles.actionsWrap, { width: width / 6 }]}> 
                            <TouchableOpacity
                                style={[styles.actionIconBtn, { backgroundColor: colors.secondary }]}
                                onPress={() => navigation.navigate("ProductForm", { item })}
                            >
                                <Ionicons name="create-outline" size={14} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionIconBtn, { backgroundColor: colors.danger }]}
                                onPress={() => deleteProduct(item.id || item._id)}
                            >
                                <Ionicons name="trash-outline" size={14} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.actionIconBtn, { backgroundColor: colors.primary }]}
                                onPress={() => navigation.navigate('Review Management', {
                                    productId: item?._id || item?.id,
                                    productName: item?.name || '',
                                })}
                            >
                                <Ionicons name="chatbubble-ellipses-outline" size={14} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                        </View>
                    </>
                )}
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        padding: 5,
        alignItems: 'center',
    },
    mobileCard: {
        flexDirection: 'row',
        padding: 10,
        alignItems: 'flex-start',
        borderWidth: 1,
        borderRadius: 10,
        marginHorizontal: 6,
        marginTop: 6,
    },
    image: {
        height: 20,
        margin: 2
    },
    item: {
        flexWrap: "wrap",
        margin: 3,
    },
    mobileName: {
        fontWeight: '700',
    },
    actionsWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 6,
    },
    mobileActionsWrap: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    mobileActionBtn: {
        minWidth: 74,
        height: 30,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        paddingHorizontal: 8,
    },
    actionIconBtn: {
        width: 26,
        height: 26,
        borderRadius: 13,
        alignItems: 'center',
        justifyContent: 'center',
    },
    centeredView: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    modalView: {
        margin: 20,
        alignItems: "center",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5
    },
    textStyle: {
        color: "white",
        fontWeight: "bold"
    }
})

export default ListItem;