import { apiSlice } from "./apiSlice";
import { COUPON_URL } from "../constants";

export const couponApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllCoupons: builder.query({
            query: () => ({
              url: COUPON_URL,
              method: 'GET',
              credentials: 'include'
            }),
            providesTags: ['Coupon']
        }),
        getCouponDetails: builder.query({
            query: (couponId) => ({
                url: `${COUPON_URL}/${couponId}`,
                credentials: 'include',
            }),
            keepUnusedDataFor: 5,
        }),
        createCoupon: builder.mutation({
            query: () => ({
                url: COUPON_URL,
                method: 'POST',
                credentials: 'include',
            }),
            invalidatesTags: ['Coupon'],
        }),
        updateCoupon: builder.mutation({
            query: (data) => ({
                url: `${COUPON_URL}/${data.couponId}`,
                method: 'PUT',
                body: data,
                credentials: 'include',
            }),
            invalidatesTags: ['Coupon']
        }),
        // applyCoupon: builder.mutation({
        //     query: ({couponCode,}) => ({
        //         url: `${COUPON_URL}/apply`,
        //         method: 'POST',
        //         body: {couponCode},
        //         credentials: 'include'
        //     }),
        //     invalidatesTags: ['Coupon']
        // }),
        applyCoupon: builder.mutation({
            query: ({ couponCode, orderId }) => {
                // Log the payload to verify structure before sending the request
                const payload = { couponCode, orderId };
                console.log("API Slice Payload:", payload);  // Log the payload here
        
                return {
                    url: `${COUPON_URL}/apply`,
                    method: 'POST',
                    body: payload,  // Make sure both couponCode and orderId are sent in the request body
                    credentials: 'include'
                };
            },
            invalidatesTags: ['Coupon']
        }),
        
        deleteCoupon: builder.mutation({
            query: (couponId) => ({
                url: `${COUPON_URL}/${couponId}`,
                method: 'DELETE',
                credentials: 'include'
            }),
            invalidatesTags: ['Coupon']
        }) 
    }),
});

export const {
    useGetAllCouponsQuery,
    useGetCouponDetailsQuery,
    useCreateCouponMutation,
    useUpdateCouponMutation,
    useApplyCouponMutation,
    useDeleteCouponMutation } = couponApiSlice;

