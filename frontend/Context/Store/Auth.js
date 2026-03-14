import React, { useEffect, useReducer, useState } from "react";
// import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"

import authReducer from "../Reducers/Auth.reducer";
import { setCurrentUser } from "../Actions/Auth.actions";
import AuthGlobal from './AuthGlobal'
import { getToken, removeToken } from '../../assets/common/tokenStorage';

const Auth = props => {
    const [stateUser, dispatch] = useReducer(authReducer, {
        isAuthenticated: null,
        user: {}
    });
    const [showChild, setShowChild] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const bootstrapAuth = async () => {
            try {
                const token = await getToken();
                if (token && isMounted) {
                    const decoded = jwtDecode(token);
                    dispatch(setCurrentUser(decoded));
                }
            } catch (err) {
                await removeToken();
            } finally {
                if (isMounted) {
                    setShowChild(true);
                }
            }
        };

        bootstrapAuth();

        return () => {
            isMounted = false;
        };
    }, [])


    if (!showChild) {
        return null;
    } else {
        return (
            <AuthGlobal.Provider
                value={{
                    stateUser,
                    dispatch
                }}
            >
                {props.children}
            </AuthGlobal.Provider>
        )
    }
};

export default Auth