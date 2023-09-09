import { apiSlice } from './apiSlice';
import { ORDER_URL, STRIPE_URL } from '../constants';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        createOrder: builder.mutation({
            query: (order) => ({
                url: ORDER_URL,
                method: 'POST',
                credentials: 'include',
                body: {...order},
            }),
        }),
        getOrderDetails: builder.query({
            query: (orderId) => ({
                url: `${ORDER_URL}/${orderId}`,
                credentials: 'include'
            }),
            keepUnusedDataFor: 5
        }),
        payOrder: builder.mutation({
            query: (orderId, details) => ({
                url: `${ORDER_URL}/${orderId}/pay`,
                method: 'PUT',
                credentials: 'include',
                body: {...details},
            }) 
        }),
        getStripeKey: builder.query({
            query: () => ({
                url: `${STRIPE_URL}/key`,
                credentials: 'include'
            }),
            keepUnusedDataFor: 5,
        })
    }), 

    
});

export const { useCreateOrderMutation, useGetOrderDetailsQuery, usePayOrderMutation, useGetStripeKeyQuery } = ordersApiSlice;