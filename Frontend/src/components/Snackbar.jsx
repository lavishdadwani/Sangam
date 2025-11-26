import React from "react";
import { useDispatch, useSelector } from "react-redux";
import MuiSnackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import Slide from "@mui/material/Slide";
import { closeSnackbar } from "../redux/snackbarSlice";

const SlideDownTransition = (props) => <Slide {...props} direction="down" />;

const Snackbar = () => {
  const dispatch = useDispatch();
  const { isOpen, message, severity, duration } = useSelector(
    (state) => state.snackbar
  );

  const handleClose = (_, reason) => {
    if (reason === "clickaway") return;
    dispatch(closeSnackbar());
  };

  return (
    <MuiSnackbar
      open={isOpen}
      autoHideDuration={duration}
      onClose={handleClose}
      anchorOrigin={{ vertical: "top", horizontal: "center" }}
      TransitionComponent={SlideDownTransition}
    >
      <Alert
        onClose={handleClose}
        severity={severity}
        variant="filled"
        sx={{ width: "100%", minWidth: 280 }}
      >
        {message}
      </Alert>
    </MuiSnackbar>
  );
};

export default Snackbar;

