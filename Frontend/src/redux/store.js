import { configureStore } from "@reduxjs/toolkit"
import userSlice from "./userSlice"
import snackbarSlice from "./snackbarSlice"

export const store = configureStore({
    reducer : {
        user:userSlice,
        snackbar: snackbarSlice,
    }
})