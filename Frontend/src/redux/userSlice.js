import { createSlice } from "@reduxjs/toolkit";


const userSlice = createSlice({
    name:"user",
    initialState: {
        userData: null,
        currentCity: null,
        currentState: null,
        currentAddress: null,
        shopsInMyCity: null,
        itemsInMyCIty: null,
        cartItem:[{
            id:null,
            name:null,
            price:null,
            image:null,
            shop:null,
            quantity:null,
            foodType:null,
        }],
    },
    reducers:{
        setUserData:(state,action) =>{
            state.userData = action.payload
        },
        setCurrentState:(state,action) =>{
            state.currentState = action.payload
        },
        setCurrentCity:(state,action) =>{
            state.currentCity = action.payload
        },
        setCurrentAddress:(state,action) =>{
            state.currentAddress = action.payload
        },
        setShopsInMyCity:(state,action) =>{
            state.shopsInMyCity = action.payload
        },
        setItemsInMyCity:(state,action) =>{
            state.itemsInMyCIty = action.payload
        },
        addToCart:(state,action) =>{
            const cartItem = action.payload
            const existingItem = state.cartItem.find( i => i.id == cartItem.id)
            if(existingItem){
                existingItem.quantity +=  cartItem.quantity
            }else{
                state.cartItem.push(cartItem)
            }
        },

    }
})

export const { setUserData,setCurrentAddress, setCurrentCity, setCurrentState, setShopsInMyCity, setItemsInMyCity,addToCart } = userSlice.actions
export default userSlice.reducer