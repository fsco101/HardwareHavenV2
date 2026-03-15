// import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import Toast from '../../Shared/SnackbarService';
import baseURL from "../../config/api"
import { saveToken, removeToken } from "../../assets/common/tokenStorage"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = async (user, dispatch) => {
    try {
        const res = await fetch(`${baseURL}users/login`, {
            method: "POST",
            body: JSON.stringify(user),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.token) {
            logoutUser(dispatch);
            return {
                success: false,
                message: data?.message || "Please provide correct credentials",
                code: data?.code,
                deactivation: data?.deactivation,
            };
        }

        const token = data.token;
        await saveToken(token);
        const decoded = jwtDecode(token);
        dispatch(setCurrentUser(decoded, user));

        return { success: true };
    } catch (err) {
        logoutUser(dispatch);
        return {
            success: false,
            message: "Network error. Please try again.",
        };
    }
};

export const getUserProfile = (id) => {
    fetch(`${baseURL}users/${id}`, {
        method: "GET",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json"
        },
    })
    .then((res) => res.json())
    .then((data) => console.log(data));
}

export const logoutUser = (dispatch) => {
    removeToken();
    dispatch(setCurrentUser({}))
}

export const firebaseLoginUser = async (firebaseData, dispatch) => {
    try {
        const res = await fetch(`${baseURL}users/firebase-login`, {
            method: "POST",
            body: JSON.stringify(firebaseData),
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
            },
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || !data?.token) {
            logoutUser(dispatch);
            return {
                success: false,
                message: data?.message || "Firebase login failed",
                code: data?.code,
                deactivation: data?.deactivation,
            };
        }

        const token = data.token;
        await saveToken(token);
        const decoded = jwtDecode(token);
        dispatch(setCurrentUser(decoded, { email: firebaseData?.email || '' }));

        return { success: true };
    } catch (err) {
        logoutUser(dispatch);
        return {
            success: false,
            message: "Firebase login failed",
        };
    }
};

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    }
}