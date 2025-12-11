import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import snackbarSlice from "./snackbarSlice"
import ownerSlice from "./ownerSlice"
import mapSlice from "./mapSlice"

export const store = configureStore({
    reducer : {
        user:userSlice,
        snackbar: snackbarSlice,
        owner:ownerSlice,
        map:mapSlice,
    }
})