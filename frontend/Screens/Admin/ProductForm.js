import React, { useState, useEffect } from "react"
import {
    View,
    Text,
    Image,
    StyleSheet,
    TouchableOpacity,
    Platform,
    FlatList,
    ActivityIndicator
} from "react-native"
import { Picker } from "@react-native-picker/picker"

import FormContainer from "../../Shared/FormContainer"
import Input from "../../Shared/Input"
import EasyButton from "../../Shared/StyledComponents/EasyButton"
import Error from "../../Shared/Error"

import Toast from '../../Shared/SnackbarService';
import baseURL from "../../config/api"
import axios from "axios"
import * as ImagePicker from "expo-image-picker"
import { useFocusEffect, useNavigation } from "@react-navigation/native"
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from '../../Theme/theme';
import { validateForm, hasErrors } from '../../Shared/FormValidation';
import { uploadToCloudinary, uploadMultipleToCloudinary } from '../../assets/common/cloudinaryUpload';
import { useResponsive } from '../../assets/common/responsive';
import { getToken } from '../../assets/common/tokenStorage';
import { useDispatch } from 'react-redux';
import { createProduct, updateProduct } from '../../Redux/Actions/productActions';

const ProductForm = (props) => {
    const colors = useTheme();
    const { fs, ms, spacing, ws } = useResponsive();
    const [pickerValue, setPickerValue] = useState('');
    const [brand, setBrand] = useState('');
    const [name, setName] = useState('');
    const [price, setPrice] = useState(0);
    const [description, setDescription] = useState('');
    const [image, setImage] = useState('');
    const [mainImage, setMainImage] = useState();
    const [galleryImages, setGalleryImages] = useState([]);
    const [category, setCategory] = useState('');
    const [categories, setCategories] = useState([]);
    const [fieldErrors, setFieldErrors] = useState({});
    const [countInStock, setCountInStock] = useState();
    const [rating, setRating] = useState(0);
    const [isFeatured, setIsFeatured] = useState(false);
    const [richDescription, setRichDescription] = useState();
    const [numReviews, setNumReviews] = useState(0);
    const [item, setItem] = useState(null);
    const [uploading, setUploading] = useState(false);
    const dispatch = useDispatch();
    const hasMainImage = Boolean(mainImage && String(mainImage).trim());
    const validGalleryImages = galleryImages.filter((uri) => Boolean(uri && String(uri).trim()));
    const resolvedMainImage = hasMainImage
        ? String(mainImage).trim()
        : (validGalleryImages[0] ? String(validGalleryImages[0]).trim() : '');

    let navigation = useNavigation()

    useEffect(() => {
        if (!props.route.params) {
            setItem(null);
        } else {
            const incomingItem = props.route.params.item;
            const resolvedCategory = typeof incomingItem?.category === 'object'
                ? incomingItem?.category?._id || incomingItem?.category?.id || ''
                : incomingItem?.category || '';

            setItem(incomingItem);
            setBrand(incomingItem?.brand || '');
            setName(incomingItem?.name || '');
            setPrice(incomingItem?.price != null ? incomingItem.price.toString() : '');
            setDescription(incomingItem?.description || '');
            const fallbackImage = incomingItem?.image || (Array.isArray(incomingItem?.images) && incomingItem.images.length > 0 ? incomingItem.images[0] : '');
            setMainImage(fallbackImage || '');
            setImage(fallbackImage || '');
            setCategory(resolvedCategory);
            setPickerValue(resolvedCategory);
            setCountInStock(incomingItem?.countInStock != null ? incomingItem.countInStock.toString() : '');
            if (incomingItem?.images) {
                setGalleryImages(incomingItem.images);
            }
        }
        axios
            .get(`${baseURL}categories`)
            .then((res) => setCategories(res.data))
            .catch((error) => alert("Error to load categories"));
        (async () => {
            if (Platform.OS !== "web") {
                const {
                    status,
                } = await ImagePicker.requestCameraPermissionsAsync();
                if (status !== "granted") {
                    alert("Sorry, we need camera roll permissions to make this work!")
                }
            }
        })();
        return () => {
            setCategories([])
        }
    }, [])

    const pickImage = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsEditing: true,
            aspect: [4, 3],
            quality: 1
        });
        if (!result.canceled) {
            setMainImage(result.assets[0].uri);
            setImage(result.assets[0].uri);
        }
    }

    const takePhoto = async () => {
        const c = await ImagePicker.requestCameraPermissionsAsync();
        if (c.status === "granted") {
            let result = await ImagePicker.launchCameraAsync({
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setMainImage(result.assets[0].uri);
                setImage(result.assets[0].uri);
            }
        }
    };

    const pickGalleryImages = async () => {
        let result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            allowsMultipleSelection: true,
            quality: 1,
        });
        if (!result.canceled) {
            const newUris = result.assets.map(a => a.uri);
            setGalleryImages(prev => [...prev, ...newUris]);
        }
    }

    const takeGalleryPhoto = async () => {
        const c = await ImagePicker.requestCameraPermissionsAsync();
        if (c.status === "granted") {
            let result = await ImagePicker.launchCameraAsync({
                aspect: [4, 3],
                quality: 1,
            });
            if (!result.canceled) {
                setGalleryImages(prev => [...prev, result.assets[0].uri]);
            }
        }
    };

    const removeGalleryImage = (index) => {
        setGalleryImages(prev => {
            const cleaned = prev.filter((uri) => Boolean(uri && String(uri).trim()));
            return cleaned.filter((_, i) => i !== index);
        });
    };

    const clearFieldError = (field) => {
        setFieldErrors(prev => ({ ...prev, [field]: '' }));
    };

    const addProduct = async () => {
        const errors = validateForm({
            name,
            brand,
            price: price.toString(),
            description,
            category,
            countInStock: (countInStock || '').toString(),
        });
        setFieldErrors(errors);
        if (hasErrors(errors)) return;

        setUploading(true);

        try {
            // Upload main image to Cloudinary if it's a local file
            let mainImageUrl = image;
            if (image && !image.startsWith('http')) {
                mainImageUrl = await uploadToCloudinary(image, 'hardwarehaven/products');
            }

            // Upload gallery images to Cloudinary
            const localGallery = galleryImages.filter(uri => !uri.startsWith('http'));
            const existingGallery = galleryImages.filter(uri => uri.startsWith('http'));
            let uploadedGallery = [];
            if (localGallery.length > 0) {
                uploadedGallery = await uploadMultipleToCloudinary(localGallery, 'hardwarehaven/products');
            }
            const allGalleryUrls = [...existingGallery, ...uploadedGallery];

            const productData = {
                name,
                brand,
                price,
                description,
                category,
                countInStock,
                richDescription,
                rating,
                numReviews,
                isFeatured,
                image: mainImageUrl,
                images: JSON.stringify(allGalleryUrls),
            };

            const token = await getToken();
            if (!token) {
                Toast.show({ topOffset: 60, type: "error", text1: "Please login again" });
                return;
            }

            if (item !== null) {
                const targetProductId = item.id || item._id;
                const result = await dispatch(updateProduct(targetProductId, productData, token));
                if (result.success) {
                    Toast.show({ topOffset: 60, type: "success", text1: "Product successfully updated" });
                    setTimeout(() => { navigation.navigate("Products"); }, 500);
                } else {
                    Toast.show({ topOffset: 60, type: "error", text1: result.message || "Update failed" });
                }
            } else {
                const result = await dispatch(createProduct(productData, token));
                if (result.success) {
                    Toast.show({ topOffset: 60, type: "success", text1: "New Product added" });
                    setTimeout(() => { navigation.navigate("Products"); }, 500);
                } else {
                    Toast.show({ topOffset: 60, type: "error", text1: result.message || "Create failed" });
                }
            }
        } catch (error) {
            const message = error?.message || 'Please try again';
            console.log(error);
            Toast.show({ topOffset: 60, type: "error", text1: "Image upload failed", text2: message });
        } finally {
            setUploading(false);
        }
    }

    return (
        <FormContainer title={item !== null ? "Edit Product" : "Add Product"}>
            <View style={[styles.imageContainer, { borderColor: colors.border, width: 140, height: 140, borderRadius: 70 }]}>
                {resolvedMainImage ? (
                    <Image style={styles.image} source={{ uri: resolvedMainImage }} />
                ) : (
                    <View style={[styles.imagePlaceholder, { backgroundColor: colors.surfaceLight }]}> 
                        <Ionicons name="image-outline" size={32} color={colors.textSecondary} />
                    </View>
                )}
                <TouchableOpacity
                    onPress={pickImage}
                    style={[styles.imagePicker, { backgroundColor: colors.primary, right: 5, bottom: 5, padding: 6 }]}>
                    <Ionicons style={{ color: colors.textOnPrimary }} name="image" size={16} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={takePhoto}
                    style={[styles.imagePicker, { backgroundColor: colors.secondary, left: 5, bottom: 5, padding: 6 }]}>
                    <Ionicons style={{ color: colors.textOnPrimary }} name="camera" size={16} />
                </TouchableOpacity>
            </View>

            <View style={[styles.sectionHeader, { marginTop: 10 }]}>
                <Ionicons name="images-outline" size={18} color={colors.primary} />
                <Text style={{ color: colors.primary, fontWeight: 'bold', fontSize: fs(13), marginLeft: 4 }}>
                    Gallery Images ({validGalleryImages.length})
                </Text>
            </View>
            <View style={styles.galleryRow}>
                <TouchableOpacity
                    onPress={pickGalleryImages}
                    style={[styles.galleryAddBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border, width: 50, height: 50 }]}>
                    <Ionicons name="add-outline" size={22} color={colors.primary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 9, marginTop: 1 }}>Files</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={takeGalleryPhoto}
                    style={[styles.galleryAddBtn, { backgroundColor: colors.surfaceLight, borderColor: colors.border, width: 50, height: 50 }]}>
                    <Ionicons name="camera-outline" size={22} color={colors.secondary} />
                    <Text style={{ color: colors.textSecondary, fontSize: 9, marginTop: 1 }}>Camera</Text>
                </TouchableOpacity>
                <FlatList
                    data={validGalleryImages}
                    horizontal
                    keyExtractor={(item, index) => index.toString()}
                    renderItem={({ item: uri, index }) => (
                        <View style={styles.galleryThumbContainer}>
                            <Image source={{ uri }} style={[styles.galleryThumb, { width: 50, height: 50 }]} />
                            <TouchableOpacity
                                onPress={() => removeGalleryImage(index)}
                                style={[styles.galleryRemoveBtn, { backgroundColor: colors.danger, width: 18, height: 18, borderRadius: 9 }]}>
                                <Ionicons name="close" size={12} color={colors.textOnPrimary} />
                            </TouchableOpacity>
                        </View>
                    )}
                />
            </View>

            <View style={styles.label}>
                <Text style={{ color: colors.textSecondary }}>Brand</Text>
            </View>
            <Input placeholder="Brand" name="brand" id="brand" value={brand}
                onChangeText={(text) => { setBrand(text); clearFieldError('brand'); }} />
            {fieldErrors.brand ? <Error message={fieldErrors.brand} /> : null}

            <View style={styles.label}>
                <Text style={{ color: colors.textSecondary }}>Name</Text>
            </View>
            <Input placeholder="Name" name="name" id="name" value={name}
                onChangeText={(text) => { setName(text); clearFieldError('name'); }} />
            {fieldErrors.name ? <Error message={fieldErrors.name} /> : null}

            <View style={styles.label}>
                <Text style={{ color: colors.textSecondary }}>Price</Text>
            </View>
            <Input placeholder="Price" name="price" id="price" value={price}
                keyboardType={"numeric"} onChangeText={(text) => { setPrice(text); clearFieldError('price'); }} />
            {fieldErrors.price ? <Error message={fieldErrors.price} /> : null}

            <View style={styles.label}>
                <Text style={{ color: colors.textSecondary }}>Count in Stock</Text>
            </View>
            <Input placeholder="Stock" name="stock" id="stock" value={countInStock}
                keyboardType={"numeric"} onChangeText={(text) => { setCountInStock(text); clearFieldError('countInStock'); }} />
            {fieldErrors.countInStock ? <Error message={fieldErrors.countInStock} /> : null}

            <View style={styles.label}>
                <Text style={{ color: colors.textSecondary }}>Description</Text>
            </View>
            <Input placeholder="Description" name="description" id="description" value={description}
                onChangeText={(text) => { setDescription(text); clearFieldError('description'); }} />
            {fieldErrors.description ? <Error message={fieldErrors.description} /> : null}

            <View style={[styles.pickerContainer, { backgroundColor: colors.inputBg, borderColor: fieldErrors.category ? colors.danger : colors.border }]}>
                <Picker
                    style={{ height: 50, width: '100%', color: colors.text }}
                    selectedValue={pickerValue}
                    onValueChange={(e) => { setPickerValue(e); setCategory(e); clearFieldError('category'); }}
                    dropdownIconColor={colors.primary}
                >
                    <Picker.Item label="Select Category" value="" color={colors.textSecondary} />
                    {categories.map((c, index) => (
                        <Picker.Item key={c.id} label={c.name} value={c.id} />
                    ))}
                </Picker>
            </View>
            {fieldErrors.category ? <Error message={fieldErrors.category} /> : null}

            <View style={styles.buttonContainer}>
                <EasyButton large primary onPress={() => addProduct()} disabled={uploading}>
                    {uploading ? (
                        <ActivityIndicator color="white" size="small" />
                    ) : (
                        <Text style={styles.buttonText}>Confirm</Text>
                    )}
                </EasyButton>
            </View>
        </FormContainer>
    )
}


const styles = StyleSheet.create({
    label: {
        width: "80%",
        marginTop: 10
    },
    buttonContainer: {
        width: "80%",
        marginBottom: 40,
        marginTop: 16,
        alignItems: "center"
    },
    buttonText: {
        color: "white"
    },
    imageContainer: {
        borderStyle: "solid",
        borderWidth: 3,
        padding: 0,
        justifyContent: "center",
        elevation: 10
    },
    image: {
        width: "100%",
        height: "100%",
        borderRadius: 100
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        borderRadius: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    imagePicker: {
        position: "absolute",
        borderRadius: 100,
        elevation: 20
    },
    pickerContainer: {
        width: '80%',
        borderWidth: 1,
        borderRadius: 12,
        marginVertical: 10,
        overflow: 'hidden',
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginBottom: 8,
    },
    galleryRow: {
        flexDirection: 'row',
        alignItems: 'center',
        width: '80%',
        marginBottom: 10,
    },
    galleryAddBtn: {
        borderRadius: 8,
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 8,
    },
    galleryThumbContainer: {
        marginRight: 8,
        position: 'relative',
    },
    galleryThumb: {
        borderRadius: 8,
    },
    galleryRemoveBtn: {
        position: 'absolute',
        top: -6,
        right: -6,
        justifyContent: 'center',
        alignItems: 'center',
    },
})


export default ProductForm;