import {
    ADD_TO_CART,
    REMOVE_FROM_CART,
    CLEAR_CART,
    UPDATE_CART_QUANTITY,
    SET_CART_ITEMS
} from '../constants';

const cartItems = (state = [], action) => {
    switch (action.type) {
        case ADD_TO_CART:
            const productId = action.payload._id || action.payload.id;
            const existingIndex = state.findIndex(
                item => (item._id || item.id) === productId
            );
            if (existingIndex >= 0) {
                const updated = [...state];
                const newQty = (updated[existingIndex].quantity || 1) + (action.payload.quantity || 1);
                updated[existingIndex] = {
                    ...updated[existingIndex],
                    quantity: newQty,
                    effectivePrice: action.payload.effectivePrice ?? updated[existingIndex].effectivePrice,
                    originalPrice: action.payload.originalPrice ?? updated[existingIndex].originalPrice,
                };
                return updated;
            }
            return [...state, { ...action.payload, quantity: action.payload.quantity || 1 }];
        case UPDATE_CART_QUANTITY:
            return state.map(item => {
                const itemId = item._id || item.id;
                const payloadId = action.payload._id || action.payload.id;
                if (itemId === payloadId) {
                    return { ...item, quantity: action.payload.quantity };
                }
                return item;
            });
        case REMOVE_FROM_CART:
            const removeId = action.payload._id || action.payload.id || action.payload;
            return state.filter(cartItem => {
                const cartItemId = cartItem._id || cartItem.id;
                return cartItemId !== removeId;
            });
        case CLEAR_CART:
            return [];
        case SET_CART_ITEMS:
            return Array.isArray(action.payload) ? action.payload : [];
    }
    return state;
}

export default cartItems;