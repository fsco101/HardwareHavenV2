import axios from 'axios';
import baseURL from '../../config/api';
import {
    ORDER_LIST_REQUEST,
    ORDER_LIST_SUCCESS,
    ORDER_LIST_FAIL,
    ORDER_CREATE_REQUEST,
    ORDER_CREATE_SUCCESS,
    ORDER_CREATE_FAIL,
    ORDER_MY_LIST_REQUEST,
    ORDER_MY_LIST_SUCCESS,
    ORDER_MY_LIST_FAIL,
    ORDER_STATUS_UPDATE_REQUEST,
    ORDER_STATUS_UPDATE_SUCCESS,
    ORDER_STATUS_UPDATE_FAIL,
    ORDER_CANCEL_REQUEST,
    ORDER_CANCEL_SUCCESS,
    ORDER_CANCEL_FAIL,
    ORDER_CONFIRM_DELIVERY_REQUEST,
    ORDER_CONFIRM_DELIVERY_SUCCESS,
    ORDER_CONFIRM_DELIVERY_FAIL,
} from '../constants';

export const createOrder = (orderPayload, token) => async (dispatch) => {
    dispatch({ type: ORDER_CREATE_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.post(`${baseURL}orders`, orderPayload, config);
        dispatch({ type: ORDER_CREATE_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to create order';
        dispatch({ type: ORDER_CREATE_FAIL, payload: message });
        return { success: false, message };
    }
};

export const fetchOrders = () => async (dispatch) => {
    dispatch({ type: ORDER_LIST_REQUEST });

    try {
        const res = await axios.get(`${baseURL}orders`);
        dispatch({ type: ORDER_LIST_SUCCESS, payload: res.data });
    } catch (error) {
        dispatch({
            type: ORDER_LIST_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch orders',
        });
    }
};

export const fetchMyOrders = (userId) => async (dispatch) => {
    dispatch({ type: ORDER_MY_LIST_REQUEST });

    try {
        const res = await axios.get(`${baseURL}orders/my-orders/${userId}`);
        dispatch({ type: ORDER_MY_LIST_SUCCESS, payload: res.data });
    } catch (error) {
        dispatch({
            type: ORDER_MY_LIST_FAIL,
            payload: error.response?.data?.message || 'Failed to fetch your orders',
        });
    }
};

export const updateOrderStatus = (orderId, status, token) => async (dispatch) => {
    dispatch({ type: ORDER_STATUS_UPDATE_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.put(`${baseURL}orders/${orderId}`, { status }, config);
        dispatch({ type: ORDER_STATUS_UPDATE_SUCCESS, payload: res.data });
        return { success: true, data: res.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to update order status';
        dispatch({ type: ORDER_STATUS_UPDATE_FAIL, payload: message });
        return { success: false, message };
    }
};

export const cancelOrder = (orderId, reason, token) => async (dispatch) => {
    dispatch({ type: ORDER_CANCEL_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.put(`${baseURL}orders/cancel/${orderId}`, { reason }, config);
        dispatch({ type: ORDER_CANCEL_SUCCESS, payload: res.data?.order || { _id: orderId, status: 'Cancelled' } });
        return { success: true, data: res.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to cancel order';
        dispatch({ type: ORDER_CANCEL_FAIL, payload: message });
        return { success: false, message };
    }
};

export const confirmOrderDelivery = (orderId, token) => async (dispatch) => {
    dispatch({ type: ORDER_CONFIRM_DELIVERY_REQUEST });

    try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        const res = await axios.put(`${baseURL}orders/confirm-delivery/${orderId}`, {}, config);
        dispatch({ type: ORDER_CONFIRM_DELIVERY_SUCCESS, payload: res.data?.order || { _id: orderId, status: 'Delivered' } });
        return { success: true, data: res.data };
    } catch (error) {
        const message = error.response?.data?.message || 'Failed to confirm order delivery';
        dispatch({ type: ORDER_CONFIRM_DELIVERY_FAIL, payload: message });
        return { success: false, message };
    }
};
