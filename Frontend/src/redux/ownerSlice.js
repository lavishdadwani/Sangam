import { createSlice } from "@reduxjs/toolkit";


const ownerSlice = createSlice({
    name:"owner",
    initialState: {
        shopData: null,
    },
    reducers:{
        setOwnerData:(state,action) =>{
            state.shopData = action.payload
        },
        clearOwnerData:(state) =>{
            state.shopData = null
        }
    }
})

export const { setOwnerData, clearOwnerData } = ownerSlice.actions
export default ownerSlice.reducer