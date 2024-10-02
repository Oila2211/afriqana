import { apiSlice } from "./apiSlice";
import { REGION_URL } from "../constants";

export const regionApiSlice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        getAllRegions: builder.query({
            query: () => ({
              url: REGION_URL,
              method: 'GET',
              credentials: 'include'
            }),
            providesTags: ['Region']
        }),
        getRegionDetails: builder.query({
            query: (regionId) => ({
                url: `${REGION_URL}/${regionId}`,
                credentials: 'include',
            }),
            keepUnusedDataFor: 5,
        }),
        createRegion: builder.mutation({
            query: () => ({
                url: REGION_URL,
                method: 'POST',
                credentials: 'include',
            }),
            invalidatesTags: ['Region'],
        }),
        updateRegion: builder.mutation({
            query: (data) => ({
                url: `${REGION_URL}/${data.regionId}`,
                method: 'PUT',
                body: data,
                credentials: 'include',
            }),
            invalidatesTags: ['Region']
        }),        
        deleteRegion: builder.mutation({
            query: (regionId) => ({
                url: `${REGION_URL}/${regionId}`,
                method: 'DELETE',
                credentials: 'include'
            }),
            invalidatesTags: ['Region']
        }) 
    }),
});

export const {
    useGetAllRegionsQuery,
    useGetRegionDetailsQuery,
    useCreateRegionMutation,
    useUpdateRegionMutation,
    useDeleteRegionMutation } = regionApiSlice;

