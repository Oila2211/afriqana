import { configureStore, getDefaultMiddleware } from "@reduxjs/toolkit";
import { apiSlice } from "./slices/apiSlice";
import  cartSliceReducer  from './slices/cartSlice';
import authSliceReducer from "./slices/authSlice";
import stripeReducer from "./slices/stripeSlice";
import orderSliceReducer from "./slices/orderSlice";

const  store = configureStore({
    reducer: {
        [apiSlice.reducerPath]: apiSlice.reducer,
        cart: cartSliceReducer,
        auth: authSliceReducer,
        order: orderSliceReducer,
        stripe: stripeReducer,
    },
    middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(apiSlice.middleware),
    devTools: true,
});

export default store;