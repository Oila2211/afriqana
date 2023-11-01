import { createSlice } from '@reduxjs/toolkit';

const userInfoFromStorage = localStorage.getItem('userInfo') 
const initialState = {
    // userInfo: userInfoFromStorage ? JSON.parse(userInfoFromStorage) : null,
    // userInfo: (userInfoFromStorage !== null && userInfoFromStorage !== "undefined") ? JSON.parse(userInfoFromStorage) : null,
    userInfo: (userInfoFromStorage && userInfoFromStorage !== "undefined") ? JSON.parse(userInfoFromStorage) : null,
};

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setCredentials: (state, action) => {
            state.userInfo = action.payload;
            localStorage.setItem('userInfo', JSON.stringify(action.payload))
        },
        updateUserInfoAfterPayment: (state, action) => {
            // It will merge the new user data with the current one
            state.userInfo = { ...state.userInfo, ...action.payload };
            localStorage.setItem('userInfo', JSON.stringify({ ...state.userInfo, ...action.payload }))
        },
        logout: (state, action) => {
            state.userInfo = null;
            localStorage.removeItem('userInfo')
        }
    }
})

export const { setCredentials, logout, updateUserInfoAfterPayment } = authSlice.actions;

export default authSlice.reducer