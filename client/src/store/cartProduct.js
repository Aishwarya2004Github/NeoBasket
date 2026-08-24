import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    cart : []
}

const cartSlice = createSlice({
    name : "cartItem",
    initialState : initialState,
    reducers : {
        handleAddItemCart: (state, action) => {
    state.cart = Array.isArray(action.payload)
        ? action.payload
        : []
}
    }
})

export const { handleAddItemCart } = cartSlice.actions

export default cartSlice.reducer