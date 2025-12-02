import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import snackbarSlice from "./snackbarSlice"
import ownerSlice from "./ownerSlice"

export const store = configureStore({
    reducer : {
        user:userSlice,
        snackbar: snackbarSlice,
        owner:ownerSlice
    }
})