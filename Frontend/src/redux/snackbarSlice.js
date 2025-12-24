import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isOpen: false,
  message: "",
  severity: "info", // info | success | error | warning
  duration: 3000,
};

const snackbarSlice = createSlice({
  name: "snackbar",
  initialState,
  reducers: {
    openSnackbar: {
      reducer: (state, action) => {
        const { message, severity = "info", duration = 3000 } = action.payload;
        state.isOpen = true;
        state.message = message;
        state.severity = severity;
        state.duration = duration;
      },
      prepare: (message, severity = "info", duration = 3000) => ({
        payload: { message, severity, duration },
      }),
    },
    closeSnackbar: (state) => {
      state.isOpen = false;
      state.message = "";
    },
  },
});

export const { openSnackbar, closeSnackbar } = snackbarSlice.actions;

export default snackbarSlice.reducer;

