export const addDecimals = (num) => {
    return (Math.round(num * 100) / 100).toFixed(2);
}

export const updateCart = (state) =>{

    //Calculate items price
    state.itemsPrice = addDecimals(state.cartItems.reduce((acc, item) => acc + item.price * item.qty, 0));

    //calculate delivery price
    state.deliveryPrice = addDecimals(state.itemsPrice > 100 ? 0 : 10);

    // calculate tax price (12% tax)
    state.taxPrice = addDecimals(Number((0.12 * state.itemsPrice).toFixed(2)));

    //calculate total price
    state.totalPrice = (
        Number(state.itemsPrice) +
        Number(state.deliveryPrice) +
        Number(state.taxPrice) 

    ).toFixed(2);

    localStorage.setItem('cart', JSON.stringify(state));

    return state
}