import { createSlice } from '@reduxjs/toolkit';

const orderValuesFromStorage = localStorage.getItem('orderValues');

const initialState = {
    orderPrices: orderValuesFromStorage ? JSON.parse(orderValuesFromStorage) : {
        itemsPrice: null,
        deliveryPrice: null,
        taxPrice: null,
        totalPrice: null,
        initialTotalPrice: null,  // Added initial total price
        discountAmount: null,     // Added discount amount
        isFinalized: false,
    },
    orderId: null, // Add orderId to the state
    couponCode: null,
};

const orderSlice = createSlice({
    name: 'order',
    initialState,
    reducers: {
        setOrderValues: (state, action) => {
            // Set initialTotalPrice only if it hasn't been set before
            if (state.orderPrices.initialTotalPrice === null) {
              state.orderPrices.initialTotalPrice = action.payload.totalPrice;
            }
          
            // Calculate discount amount
            const discountAmount = state.orderPrices.initialTotalPrice - action.payload.totalPrice;
          
            // Update the rest of the orderPrices
            state.orderPrices = {
              ...state.orderPrices, // Keep existing state
              ...action.payload, // Update with new values from payload
              discountAmount, // Update discount amount
              initialTotalPrice: state.orderPrices.initialTotalPrice, // Preserve the initial total price
            };
          
            // Persist to localStorage
            localStorage.setItem('orderValues', JSON.stringify(state.orderPrices));
          },
        putCouponCode: ( state, action ) => {
            state.couponCode = action.payload;
            localStorage.setItem('couponCode', state.couponCode);
        },
          

        finalizeOrder: (state) => {
            state.orderPrices.isFinalized = true;
            localStorage.setItem('orderValues', JSON.stringify(state.orderPrices));
        },
        // resetOrderValues: (state) => {
        //     state.orderPrices = {
        //         ...initialState.orderPrices, // Reset to initial state values
        //         isFinalized: false, // Make sure to set isFinalized to false
        //     };

        //     state.orderId = null

        //     // Clear orderValues from localStorage
        //     localStorage.removeItem('orderValues');
        //     localStorage.removeItem('orderId')
        // },
        setOrderId: (state, action) => {
            state.orderId = action.payload;
            localStorage.setItem('orderId', state.orderId); // Persist orderId to localStorage
          },
      
        // resetOrderId: (state) => {
        //     state.orderId = null; // Reset orderId to null
        //     localStorage.removeItem('orderId'); // Remove orderId from localStorage
        //   },
        resetOrderValues: (state) => {
            // Directly reset orderPrices to its initial state
            state.orderPrices = {
                itemsPrice: null,
                deliveryPrice: null,
                taxPrice: null,
                totalPrice: null,
                initialTotalPrice: null,
                discountAmount: null,
                isFinalized: false,
            };
        
            // Reset orderId & coupon null
            state.orderId = null;
            state.couponCode = null
        
            // Explicitly clear orderPrices and orderId from localStorage
            localStorage.removeItem('orderValues');
            localStorage.removeItem('orderId');
            localStorage.removeItem('couponCode');
        },

        
    }
});

export const { setOrderValues, finalizeOrder, resetOrderValues, setOrderId, putCouponCode } = orderSlice.actions;

export default orderSlice.reducer;



// import { createSlice } from '@reduxjs/toolkit';

// const orderValuesFromStorage = localStorage.getItem('orderValues');

// const initialState = {
//     orderPrices: orderValuesFromStorage ? JSON.parse(orderValuesFromStorage) : {
//         itemsPrice: null,
//         deliveryPrice: null,
//         taxPrice: null,
//         totalPrice: null,
//         initialTotalPrice: null,  // Added initial total price
//         discountAmount: null,     // Added discount amount
//         isFinalized: false,
//     },
    
// };

// const orderSlice = createSlice({
//     name: 'order',
//     initialState,
//     reducers: {
//         setOrderValues: (state, action) => {
//             if (state.orderPrices.isFinalized) {
//                 // Only set initialTotalPrice if it hasn't been set before or if we're starting a new order
//                 state.orderPrices.initialTotalPrice = action.payload.totalPrice;

//             }
        
//             // Calculate discount amount
//             const discountAmount = state.orderPrices.initialTotalPrice - action.payload.totalPrice;
        
//             state.orderPrices = {
//                 ...action.payload,
//                 initialTotalPrice: state.orderPrices.initialTotalPrice, // Keep the initial value
//                 discountAmount: discountAmount,
//                 isFinalized: state.orderPrices.isFinalized,
//             };
            
//             localStorage.setItem('orderValues', JSON.stringify(state.orderPrices));

//         },
//         finalizeOrder: (state) => {
//             state.orderPrices.isFinalized = true;
//             localStorage.setItem('orderValues', JSON.stringify(state.orderPrices));
//         },
//         resetOrderValues: (state) => {
//             state.orderPrices = {
//                 ...initialState.orderPrices, // Reset to initial state values
//                 isFinalized: false, // Make sure to set isFinalized to false
//             };

//             // Clear orderValues from localStorage
//             localStorage.removeItem('orderValues');
//         },
        
//     }
// });

// export const { setOrderValues, finalizeOrder, resetOrderValues } = orderSlice.actions;

// export default orderSlice.reducer;
