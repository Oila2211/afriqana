import { apiSlice } from './apiSlice';
import { ORDERS_URL, STRIPE_URL } from '../constants';

export const ordersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        calculateDeliveryPrice: builder.mutation({
            query: (deliveryAddress) => ({
                url: `${ORDERS_URL}/calculate-delivery`,
                method: 'POST',
                credentials: 'include',
                body: {deliveryAddress},
            }),
        }),
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
            }),
            invalidatesTags: [{ type: 'User'}] 
        }),
        createPaymentIntent: builder.mutation({
            query: () => ({
                url: `${STRIPE_URL}`,
                method: 'POST',
                credentials: 'include'
            }),
            keepUnusedDataFor: 5,
        }),
        getMyOrders: builder.query({
            query: () => ({
                url: `${ORDERS_URL}/myorders`,
                credentials: 'include'
            }),
            keepUnusedDataFor: 5,
        }),
        getOrders: builder.query({
            query: () => ({
                url: ORDERS_URL,
                credentials: 'include'
            }),
            keepUnusedDataFor: 5,
        }),
        deliverOrder: builder.mutation({
            query: (orderId) => ({
                url: `${ORDERS_URL}/${orderId}/deliver`,
                method: 'PUT',
                credentials: 'include',
            })
        })
    }), 

    
});

export const { 
  useCalculateDeliveryPriceMutation,
  useCreateOrderMutation, 
  useGetOrderDetailsQuery, 
  usePayOrderMutation, 
  useCreatePaymentIntentMutation, 
  useGetMyOrdersQuery, 
  useGetOrdersQuery,
  useDeliverOrderMutation 
} = ordersApiSlice;