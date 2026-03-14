import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import axios from 'axios';
import baseURL from '../../config/api';

const PromotionContext = createContext();

export const PromotionProvider = ({ children }) => {
    const [promotions, setPromotions] = useState([]);
    const intervalRef = useRef(null);

    const fetchPromotions = useCallback(async () => {
        try {
            const res = await axios.get(`${baseURL}promotions`);
            setPromotions(res.data);
        } catch (err) {
            console.log('Fetch promotions error:', err.message);
        }
    }, []);

    useEffect(() => {
        fetchPromotions();
        // Refresh every 30 seconds to catch expired promos
        intervalRef.current = setInterval(fetchPromotions, 30000);
        return () => clearInterval(intervalRef.current);
    }, [fetchPromotions]);

    const getPromoForProduct = useCallback((productId) => {
        const now = Date.now();
        return promotions.find(p =>
            p.product &&
            (p.product._id === productId || p.product === productId) &&
            p.isActive &&
            new Date(p.endTime).getTime() > now
        );
    }, [promotions]);

    return (
        <PromotionContext.Provider value={{ promotions, fetchPromotions, getPromoForProduct }}>
            {children}
        </PromotionContext.Provider>
    );
};

export const usePromotions = () => useContext(PromotionContext);

export default PromotionContext;
