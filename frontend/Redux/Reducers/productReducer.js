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

const initialState = {
    items: [],
    selectedProduct: null,
    loading: false,
    actionLoading: false,
    error: null,
};

const productReducer = (state = initialState, action) => {
    switch (action.type) {
        case PRODUCT_LIST_REQUEST:
        case PRODUCT_DETAILS_REQUEST:
            return { ...state, loading: true, error: null };

        case PRODUCT_LIST_SUCCESS:
            return { ...state, loading: false, items: action.payload || [] };

        case PRODUCT_DETAILS_SUCCESS:
            return { ...state, loading: false, selectedProduct: action.payload || null };

        case PRODUCT_LIST_FAIL:
        case PRODUCT_DETAILS_FAIL:
            return { ...state, loading: false, error: action.payload };

        case PRODUCT_CREATE_REQUEST:
        case PRODUCT_UPDATE_REQUEST:
        case PRODUCT_DELETE_REQUEST:
            return { ...state, actionLoading: true, error: null };

        case PRODUCT_CREATE_SUCCESS:
            return {
                ...state,
                actionLoading: false,
                items: [action.payload, ...state.items],
            };

        case PRODUCT_UPDATE_SUCCESS:
            return {
                ...state,
                actionLoading: false,
                items: state.items.map((item) =>
                    (item._id || item.id) === (action.payload._id || action.payload.id)
                        ? action.payload
                        : item
                ),
                selectedProduct: action.payload,
            };

        case PRODUCT_DELETE_SUCCESS:
            return {
                ...state,
                actionLoading: false,
                items: state.items.filter((item) => (item._id || item.id) !== action.payload),
            };

        case PRODUCT_CREATE_FAIL:
        case PRODUCT_UPDATE_FAIL:
        case PRODUCT_DELETE_FAIL:
            return { ...state, actionLoading: false, error: action.payload };

        default:
            return state;
    }
};

export default productReducer;
