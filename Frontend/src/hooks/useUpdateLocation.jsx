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
    // Only start watching location if user is logged in
    if (!userData?._id) return;

    let watchId = null;

    try {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          updateLocation(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
          console.error("Geolocation error:", err);
        },
        {
          enableHighAccuracy: false,
          timeout: 10000,
          maximumAge: 30000, // Cache position for 30 seconds
        }
      );
    } catch (err) {
      console.error("Geolocation not supported:", err);
    }

    // ✅ CLEANUP: Clear the geolocation watcher
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [userData?._id]);

  const updateLocation = async (lat, lng) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const result = await userAPI.updateLocation(
        { lat, lng },
        { signal: controller.signal }
      );

      clearTimeout(timeoutId);

      //   if (result.ok) {
      //     // dispatch(setUserData(result.data.data));
      //     dispatch(openSnackbar("Signed in Successfully", "success"));
      //   } else {
      //     dispatch(openSnackbar(result.data?.message || "Failed to sign in", "error"));
      //   }
    } catch (err) {
      if (err.name !== "AbortError") {
        console.error(err);
      }
      //   dispatch(openSnackbar(err.message, "error"));
    }
  };
}

export default useUpdateLocation;
