import axios from 'axios';
import baseURL from '../../config/api';
import {
    FETCH_REVIEWS,
    CREATE_REVIEW,
    UPDATE_REVIEW,
    DELETE_REVIEW,
    REVIEW_ERROR,
    CLEAR_REVIEW_ERROR,
} from '../constants';

export const fetchReviews = (productId) => async (dispatch) => {
    try {
        const res = await axios.get(`${baseURL}reviews/product/${productId}`);
        dispatch({ type: FETCH_REVIEWS, payload: res.data });
    } catch (err) {
        dispatch({ type: REVIEW_ERROR, payload: err.response?.data?.message || 'Failed to fetch reviews' });
    }
};

export const createReview = (reviewData) => async (dispatch) => {
    try {
        const res = await axios.post(`${baseURL}reviews`, reviewData);
        dispatch({ type: CREATE_REVIEW, payload: res.data });
        return { success: true };
    } catch (err) {
        const msg = err.response?.data?.message || 'Failed to create review';
        dispatch({ type: REVIEW_ERROR, payload: msg });
        return { success: false, message: msg };
    }
};

export const updateReview = (id, reviewData) => async (dispatch) => {
    try {
        const res = await axios.put(`${baseURL}reviews/${id}`, reviewData);
        dispatch({ type: UPDATE_REVIEW, payload: res.data });
        return { success: true };
    } catch (err) {
        const msg = err.response?.data?.message || 'Failed to update review';
        dispatch({ type: REVIEW_ERROR, payload: msg });
        return { success: false, message: msg };
    }
};

export const deleteReview = (id) => async (dispatch) => {
    try {
        await axios.delete(`${baseURL}reviews/${id}`);
        dispatch({ type: DELETE_REVIEW, payload: id });
        return { success: true };
    } catch (err) {
        dispatch({ type: REVIEW_ERROR, payload: 'Failed to delete review' });
        return { success: false };
    }
};

export const clearReviewError = () => ({ type: CLEAR_REVIEW_ERROR });
