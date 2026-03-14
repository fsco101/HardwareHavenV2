import {
    ADD_TO_CART,
    REMOVE_FROM_CART,
    CLEAR_CART,
    UPDATE_CART_QUANTITY,
    SET_CART_ITEMS
} from '../constants';
import {
    initCartDB,
    saveCartItems,
    loadCartItems,
    clearCart as clearCartInDB,
} from '../../assets/common/cartDB';

export const addToCart = (payload) => {
    return async (dispatch, getState) => {
        dispatch({
            type: ADD_TO_CART,
            payload
        });

        await saveCartItems(getState().cartItems);
    };
}

export const removeFromCart = (payload) => {
    return async (dispatch, getState) => {
        dispatch({
            type: REMOVE_FROM_CART,
            payload
        });

        await saveCartItems(getState().cartItems);
    };
}

export const updateCartQuantity = (payload) => {
    return async (dispatch, getState) => {
        dispatch({
            type: UPDATE_CART_QUANTITY,
            payload
        });

        await saveCartItems(getState().cartItems);
    };
}

export const clearCart = () => {
    return async (dispatch) => {
        dispatch({
            type: CLEAR_CART
        });

        await clearCartInDB();
    };
}

export const initializeCartFromSQLite = () => {
    return async (dispatch) => {
        try {
            await initCartDB();
            const persistedCart = await loadCartItems();

            dispatch({
                type: SET_CART_ITEMS,
                payload: persistedCart,
            });
        } catch (error) {
            console.log('Failed to initialize SQLite cart:', error?.message || error);
        }
    };
};