import axios from 'axios';
import baseURL from '../../config/api';
import {
    PRODUCT_LIST_REQUEST,
    PRODUCT_LIST_SUCCESS,
    PRODUCT_LIST_FAIL,
    PRODUCT_DETAILS_REQUEST,
    PRODUCT_DETAILS_SUCCESS,
    PRODUCT_DETAILS_FAIL,
    PRODUCT_CREATE_REQUEST,
    PRODUCT_CREATE_SUCCESS,
    PRODUCT_CREATE_FAIL,
    PRODUCT_UPDATE_REQUEST,
    PRODUCT_UPDATE_SUCCESS,
    PRODUCT_UPDATE_FAIL,
    PRODUCT_DELETE_REQUEST,
    PRODUCT_DELETE_SUCCESS,
    PRODUCT_DELETE_FAIL,
} from '../constants';

export const fetchProducts = (filters = {}) => async (dispatch) => {
    dispatch({ type: PRODUCT_LIST_REQUEST });

    try {
        const params = new URLSearchParams();

        if (filters.categories?.length) {
            params.append('categories', filters.categories.join(','));
        }
        if (filters.search) {
            params.append('search', filters.search);
        }
        if (filters.priceMin !== undefined && filters.priceMin !== '') {
            params.append('priceMin', String(filters.priceMin));
        }
        if (filters.priceMax !== undefined && filters.priceMax !== '') {
            params.append('priceMax', String(filters.priceMax));
        }
        if (filters.ratingMin !== undefined && filters.ratingMin !== '') {
            params.append('ratingMin', String(filters.ratingMin));
        }

        const query = params.toString();
        const endpoint = query ? `${baseURL}products?${query}` : `${baseURL}products`;
        const res = await axios.get(endpoint);

        dispatch({ type: PRODUCT_LIST_SUCCESS, payload: res.data });
    } catch (error) {
        dispatch({
            type: PRODUCT_LIST_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch products',
        });
    }
};

export const fetchProductDetails = (productId) => async (dispatch) => {
    dispatch({ type: PRODUCT_DETAILS_REQUEST });

    try {
        const res = await axios.get(`${baseURL}products/${productId}`);
        dispatch({ type: PRODUCT_DETAILS_SUCCESS, payload: res.data });
    } catch (error) {
        dispatch({
            type: PRODUCT_DETAILS_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch product details',
        });
    }
};

export const createProduct = (productData, token) => async (dispatch) => {
    dispatch({ type: PRODUCT_CREATE_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.post(`${baseURL}products`, productData, config);
        dispatch({ type: PRODUCT_CREATE_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to create product';
        dispatch({ type: PRODUCT_CREATE_FAIL, payload: message });
        return { success: false, message };
    }
};

export const updateProduct = (productId, productData, token) => async (dispatch) => {
    dispatch({ type: PRODUCT_UPDATE_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.put(`${baseURL}products/${productId}`, productData, config);
        dispatch({ type: PRODUCT_UPDATE_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to update product';
        dispatch({ type: PRODUCT_UPDATE_FAIL, payload: message });
        return { success: false, message };
    }
};

export const deleteProduct = (productId, token) => async (dispatch) => {
    dispatch({ type: PRODUCT_DELETE_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        await axios.delete(`${baseURL}products/${productId}`, config);
        dispatch({ type: PRODUCT_DELETE_SUCCESS, payload: productId });
        return { success: true };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to delete product';
        dispatch({ type: PRODUCT_DELETE_FAIL, payload: message });
        return { success: false, message };
    }
};
