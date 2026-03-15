import React, { useEffect, useState } from "react"
import {
    View,
    Text,
    FlatList,
    TextInput,
    StyleSheet,
    Modal,
    TouchableOpacity,
} from "react-native"
import EasyButton from "../../Shared/StyledComponents/EasyButton";
import baseURL from "../../config/api";
import axios from "axios";
import { useTheme } from '../../Theme/theme';
import SweetAlert from '../../Shared/SweetAlert';
import Toast from '../../Shared/SnackbarService';
import { validateField } from '../../Shared/FormValidation';
import { useResponsive } from '../../assets/common/responsive';
import { getToken } from '../../assets/common/tokenStorage';

const Item = (props) => {
    const colors = useTheme();
    return (
        <View style={[styles.item, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <Text style={{ color: colors.text, flex: 1 }}>{props.item.name}</Text>
            <View style={styles.itemActions}>
                <EasyButton
                    secondary
                    medium
                    onPress={() => props.edit(props.item)}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Edit</Text>
                </EasyButton>
                <EasyButton
                    danger
                    medium
                    onPress={() => props.delete(props.item.id)}
                >
                    <Text style={{ color: "white", fontWeight: "bold" }}>Delete</Text>
                </EasyButton>
            </View>
        </View>
    )
}

const Categories = (props) => {
    const colors = useTheme();
    const { width, fs, spacing, ws } = useResponsive();
    const [categories, setCategories] = useState([]);
    const [categoryName, setCategoryName] = useState();
    const [token, setToken] = useState();
    const [deleteId, setDeleteId] = useState(null);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [categoryError, setCategoryError] = useState('');
    const [editModalVisible, setEditModalVisible] = useState(false);
    const [editCategoryId, setEditCategoryId] = useState('');
    const [editCategoryName, setEditCategoryName] = useState('');
    const [editCategoryError, setEditCategoryError] = useState('');

    useEffect(() => {
        getToken()
            .then((res) => { setToken(res); })
            .catch((error) => console.log(error));
        axios
            .get(`${baseURL}categories`)
            .then((res) => setCategories(res.data))
            .catch((error) => alert("Error loading categories"))
        return () => {
            setCategories();
            setToken();
        }
    }, [])

    const addCategory = () => {
        const error = validateField('categoryName', categoryName);
        if (error) {
            setCategoryError(error);
            return;
        }
        setCategoryError('');
        const category = { name: categoryName };
        const config = { headers: { Authorization: `Bearer ${token}` } };
        axios
            .post(`${baseURL}categories`, category, config)
            .then((res) => {
                setCategories([...categories, res.data]);
                Toast.show({ topOffset: 60, type: "success", text1: "Category added" });
            })
            .catch((error) => alert("Error adding category"));
        setCategoryName("");
    }

    const deleteCategory = (id) => {
        setDeleteId(id);
        setShowDeleteAlert(true);
    }

    const openEditCategory = (category) => {
        setEditCategoryId(category.id);
        setEditCategoryName(category.name || '');
        setEditCategoryError('');
        setEditModalVisible(true);
    }

    const updateCategory = () => {
        const error = validateField('categoryName', editCategoryName);
        if (error) {
            setEditCategoryError(error);
            return;
        }

        const config = { headers: { Authorization: `Bearer ${token}` } };
        axios
            .put(`${baseURL}categories/${editCategoryId}`, { name: editCategoryName }, config)
            .then((res) => {
                setCategories(prev => prev.map(cat => cat.id === editCategoryId ? res.data : cat));
                setEditModalVisible(false);
                setEditCategoryId('');
                setEditCategoryName('');
                Toast.show({ topOffset: 60, type: "success", text1: "Category updated" });
            })
            .catch(() => {
                Toast.show({ topOffset: 60, type: "error", text1: "Error updating category" });
            });
    }

    const confirmDelete = () => {
        setShowDeleteAlert(false);
        const config = { headers: { Authorization: `Bearer ${token}` } };
        axios
            .delete(`${baseURL}categories/${deleteId}`, config)
            .then((res) => {
                const newCategories = categories.filter((item) => item.id !== deleteId);
                setCategories(newCategories);
                Toast.show({ topOffset: 60, type: "success", text1: "Category deleted" });
            })
            .catch((error) => alert("Error deleting category"));
    }

    return (
        <View style={{ position: "relative", height: "100%", backgroundColor: colors.background }}>
            <Modal
                visible={editModalVisible}
                transparent
                animationType="fade"
                onRequestClose={() => setEditModalVisible(false)}
            >
                <View style={[styles.modalOverlay, { backgroundColor: colors.overlay }]}> 
                    <View style={[styles.modalCard, { backgroundColor: colors.surface, borderColor: colors.border }]}> 
                        <Text style={{ color: colors.text, fontWeight: '700', marginBottom: 8 }}>Edit Category</Text>
                        <TextInput
                            value={editCategoryName}
                            style={[styles.input, { backgroundColor: colors.inputBg, borderColor: editCategoryError ? colors.danger : colors.border, color: colors.text, fontSize: fs(14), width: '100%' }]}
                            placeholderTextColor={colors.textSecondary}
                            placeholder="Category name"
                            onChangeText={(text) => { setEditCategoryName(text); setEditCategoryError(''); }}
                        />
                        {editCategoryError ? <Text style={{ color: colors.danger, marginTop: 4, fontSize: 12 }}>{editCategoryError}</Text> : null}
                        <View style={styles.modalActions}>
                            <TouchableOpacity onPress={() => setEditModalVisible(false)} style={[styles.modalBtn, { borderColor: colors.border }]}> 
                                <Text style={{ color: colors.text, fontWeight: '600' }}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity onPress={updateCategory} style={[styles.modalBtn, { backgroundColor: colors.success, borderColor: colors.success }]}> 
                                <Text style={{ color: colors.textOnPrimary, fontWeight: '700' }}>Update</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>

            <SweetAlert
                visible={showDeleteAlert}
                type="confirm"
                title="Delete Category"
                message="Are you sure you want to delete this category?"
                confirmText="Delete"
                cancelText="Cancel"
                showCancel={true}
                onConfirm={confirmDelete}
                onCancel={() => setShowDeleteAlert(false)}
            />
            <View style={{ marginBottom: 60 }}>
                <FlatList
                    data={categories}
                    renderItem={({ item, index }) => (
                        <Item item={item} index={index} delete={deleteCategory} edit={openEditCategory} />
                    )}
                    keyExtractor={(item) => item.id}
                />
            </View>
            <View style={[styles.bottomBar, { backgroundColor: colors.surface, borderTopColor: colors.border, width: width }]}>
                <View>
                    <Text style={{ color: colors.text, fontWeight: '600', fontSize: fs(14) }}>Add Category</Text>
                </View>
                <View style={{ width: width / 2.5 }}>
                    <TextInput
                        value={categoryName}
                        style={[styles.input, { backgroundColor: colors.inputBg, borderColor: categoryError ? colors.danger : colors.border, color: colors.text, fontSize: fs(14) }]}
                        placeholderTextColor={colors.textSecondary}
                        placeholder="Category name"
                        onChangeText={(text) => { setCategoryName(text); setCategoryError(''); }}
                    />
                </View>
                <View>
                    <EasyButton medium primary onPress={() => addCategory()}>
                        <Text style={{ color: "white", fontWeight: "bold" }}>Submit</Text>
                    </EasyButton>
                </View>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    bottomBar: {
        height: 60,
        padding: 2,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        position: "absolute",
        bottom: 0,
        left: 0,
        borderTopWidth: 1,
    },
    input: {
        height: 40,
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
    },
    item: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 1,
        elevation: 1,
        padding: 12,
        margin: 5,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        borderRadius: 8,
        borderWidth: 1,
    },
    itemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalCard: {
        width: '100%',
        maxWidth: 420,
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: 12,
        gap: 10,
    },
    modalBtn: {
        borderWidth: 1,
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 16,
    },
})

export default Categories;