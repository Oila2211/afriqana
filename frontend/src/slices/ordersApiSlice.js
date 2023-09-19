import { apiSlice } from './apiSlice';
import { ORDERS_URL, STRIPE_URL } from '../constants';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (order) => ({
                url: ORDERS_URL,
                method: 'POST',
                credentials: 'include',
                body: {...order},
            }),
        }),
        getOrderDetails: builder.query({
            query: (id) => ({
                url: `${ORDERS_URL}/${id}`,
                credentials: 'include'
            }),
            keepUnusedDataFor: 5
        }),
        payOrder: builder.mutation({
            query: ({orderId, details}) => ({
                url: `${ORDERS_URL}/${orderId}/pay`,
                method: 'PUT',
                credentials: 'include',
                body: {...details},
            }) 
        }),
        createPaymentIntent: builder.mutation({
            query: () => ({
                url: `${STRIPE_URL}`,
                method: 'POST',
                credentials: 'include'
            }),
            keepUnusedDataFor: 5,
        }),
    }), 

    
});

export const { useCreateOrderMutation, useGetOrderDetailsQuery, usePayOrderMutation, useCreatePaymentIntentMutation } = ordersApiSlice;