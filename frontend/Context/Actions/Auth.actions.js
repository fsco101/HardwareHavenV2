// import "core-js/stable/atob";
import { jwtDecode } from "jwt-decode"
import Toast from "react-native-toast-message"
import baseURL from "../../config/api"
import { saveToken, removeToken } from "../../assets/common/tokenStorage"

export const SET_CURRENT_USER = "SET_CURRENT_USER";

export const loginUser = (user, dispatch) => {
    
    fetch(`${baseURL}users/login`, {
        method: "POST",
        body: JSON.stringify(user),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => res.json())
    .then(async (data) => {
        if (data) {
            // console.log(data)
            const token = data.token;
            await saveToken(token)
            const decoded = jwtDecode(token)
            console.log("token",token)
            dispatch(setCurrentUser(decoded, user))
        } else {
           logoutUser(dispatch)
        }
    })
    .catch((err) => {
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "Please provide correct credentials",
            text2: ""
        });
        console.log(err)
        logoutUser(dispatch)
    });
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

export const firebaseLoginUser = (firebaseData, dispatch) => {
    fetch(`${baseURL}users/firebase-login`, {
        method: "POST",
        body: JSON.stringify(firebaseData),
        headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
        },
    })
    .then((res) => res.json())
    .then(async (data) => {
        if (data && data.token) {
            const token = data.token;
            await saveToken(token);
            const decoded = jwtDecode(token);
            dispatch(setCurrentUser(decoded, { email: firebaseData.email }));
        } else {
            logoutUser(dispatch);
        }
    })
    .catch((err) => {
        Toast.show({
            topOffset: 60,
            type: "error",
            text1: "Firebase login failed",
            text2: "Please try again",
        });
        console.log(err);
        logoutUser(dispatch);
    });
};

export const setCurrentUser = (decoded, user) => {
    return {
        type: SET_CURRENT_USER,
        payload: decoded,
        userProfile: user
    }
}