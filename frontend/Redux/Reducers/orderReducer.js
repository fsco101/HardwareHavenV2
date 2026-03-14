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

const initialState = {
    orders: [],
    myOrders: [],
    loading: false,
    actionLoading: false,
    error: null,
};

const mergeOrderInList = (list, updatedOrder) => {
    const updatedId = updatedOrder?._id || updatedOrder?.id;
    if (!updatedId) return list;

    return list.map((order) => ((order._id || order.id) === updatedId ? { ...order, ...updatedOrder } : order));
};

const orderReducer = (state = initialState, action) => {
    switch (action.type) {
        case ORDER_LIST_REQUEST:
        case ORDER_CREATE_REQUEST:
        case ORDER_MY_LIST_REQUEST:
            return { ...state, loading: true, error: null };

        case ORDER_LIST_SUCCESS:
            return { ...state, loading: false, orders: action.payload || [] };

        case ORDER_MY_LIST_SUCCESS:
            return { ...state, loading: false, myOrders: action.payload || [] };

        case ORDER_CREATE_SUCCESS:
            return {
                ...state,
                loading: false,
                myOrders: [action.payload, ...(state.myOrders || [])],
            };

        case ORDER_LIST_FAIL:
        case ORDER_CREATE_FAIL:
        case ORDER_MY_LIST_FAIL:
            return { ...state, loading: false, error: action.payload };

        case ORDER_STATUS_UPDATE_REQUEST:
        case ORDER_CANCEL_REQUEST:
        case ORDER_CONFIRM_DELIVERY_REQUEST:
            return { ...state, actionLoading: true, error: null };

        case ORDER_STATUS_UPDATE_SUCCESS:
        case ORDER_CANCEL_SUCCESS:
        case ORDER_CONFIRM_DELIVERY_SUCCESS:
            return {
                ...state,
                actionLoading: false,
                orders: mergeOrderInList(state.orders, action.payload),
                myOrders: mergeOrderInList(state.myOrders, action.payload),
            };

        case ORDER_STATUS_UPDATE_FAIL:
        case ORDER_CANCEL_FAIL:
        case ORDER_CONFIRM_DELIVERY_FAIL:
            return { ...state, actionLoading: false, error: action.payload };

        default:
            return state;
    }
};

export default orderReducer;
