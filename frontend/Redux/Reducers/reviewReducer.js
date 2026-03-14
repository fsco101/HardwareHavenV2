import {
    FETCH_REVIEWS,
    CREATE_REVIEW,
    UPDATE_REVIEW,
    DELETE_REVIEW,
    REVIEW_ERROR,
    CLEAR_REVIEW_ERROR,
} from '../constants';

const initialState = {
    reviews: [],
    error: null,
};

const reviewReducer = (state = initialState, action) => {
    switch (action.type) {
        case FETCH_REVIEWS:
            return { ...state, reviews: action.payload, error: null };
        case CREATE_REVIEW:
            return { ...state, reviews: [action.payload, ...state.reviews], error: null };
        case UPDATE_REVIEW:
            return {
                ...state,
                reviews: state.reviews.map((r) =>
                    r._id === action.payload._id ? action.payload : r
                ),
                error: null,
            };
        case DELETE_REVIEW:
            return {
                ...state,
                reviews: state.reviews.filter((r) => r._id !== action.payload),
                error: null,
            };
        case REVIEW_ERROR:
            return { ...state, error: action.payload };
        case CLEAR_REVIEW_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

export default reviewReducer;
