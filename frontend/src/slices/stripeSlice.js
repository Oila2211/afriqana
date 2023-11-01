import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  clientSecret: null,
};

const stripeSlice = createSlice({
  name: 'stripe',
  initialState,
  reducers: {
    setClientSecret: (state, action) => {
      state.clientSecret = action.payload;
    },
  },
});

export const { setClientSecret } = stripeSlice.actions;

export default stripeSlice.reducer;