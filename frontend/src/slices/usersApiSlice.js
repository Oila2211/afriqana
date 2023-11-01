import { USERS_URL } from "../constants";
import { apiSlice } from "./apiSlice";

export const usersApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/login`,
                method: 'POST',
                credentials: "include",
                body: data,
            }),
        }),
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}`,
                method: 'POST',
                credentials: 'include',
                body: data,
            })
        }),
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST',
                credentials: 'include',
            }),
        }),
        profile: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data,
                credentials: 'include',
                
            }),
            providesTags: ['User'],
            keepUnusedDataFor: 5,
        }),
        redeemPoints: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/redeem`,
                method: 'POST',
                body: data,
                credentials: 'include'
            }),
            invalidatesTags: ['User'],
            providesTags: ['User'],
            keepUnusedDataFor: 5,
        }),
        currentUserDetails: builder.query({
            query: () => ({
                url: `${USERS_URL}/profile`,
                method: 'GET',
                credentials: 'include',
            }),
            providesTags: ['User'],
            keepUnusedDataFor: 5,  
        }),
        getUsers: builder.query({
            query: () => ({
                url: USERS_URL,
                credentials: 'include',
            }),
            providesTags: ['Users'],
            keepUnusedDataFor: 5,  
        })
    }),
        
})


export const { useLogoutMutation, useLoginMutation, useRegisterMutation, useProfileMutation, useRedeemPointsMutation, useCurrentUserDetailsQuery, useGetUsersQuery } = usersApiSlice;
