import { legacy_createStore as createStore, combineReducers, applyMiddleware } from 'redux';
import { thunk } from 'redux-thunk';

import cartItems from './Reducers/cartItems';
import reviewReducer from './Reducers/reviewReducer';
import productReducer from './Reducers/productReducer';
import orderReducer from './Reducers/orderReducer';

const reducers = combineReducers({
    cartItems: cartItems,
    reviews: reviewReducer,
    products: productReducer,
    orders: orderReducer,
})

const store = createStore(
    reducers,
    applyMiddleware(thunk)
)

export default store;