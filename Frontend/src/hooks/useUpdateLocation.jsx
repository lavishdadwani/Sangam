import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  setCurrentAddress,
  setCurrentCity,
  setCurrentState,
} from "../redux/userSlice";
import getCityName from "../../services/helpers";
import { setAddress, setLocation } from "../redux/mapSlice";
import userAPI from "../../services/user/user";
import { openSnackbar } from "../redux/snackbarSlice";

function useUpdateLocation() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);
  useEffect(() => {
    navigator.geolocation.watchPosition((pos) => {
      updateLocation(pos.coords.latitude, pos.coords.longitude);
    });
  }, [userData]);

  const updateLocation = async (lat, lng) => {
    try {
      const result = await userAPI.updateLocation({ lat, lng });

      //   if (result.ok) {
      //     // dispatch(setUserData(result.data.data));
      //     dispatch(openSnackbar("Signed in Successfully", "success"));
      //   } else {
      //     dispatch(openSnackbar(result.data?.message || "Failed to sign in", "error"));
      //   }
    } catch (err) {
      console.error(err);
      //   dispatch(openSnackbar(err.message, "error"));
    }
  };
}

export default useUpdateLocation;
