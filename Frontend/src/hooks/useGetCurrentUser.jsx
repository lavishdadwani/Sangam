import React, { useEffect } from "react";
import userAPI from "../../services/user/user"
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
    const dispatch = useDispatch()
  
  useEffect(() => {
    const controller = new AbortController();

    const fetchUser = async () => {
      try {
        const result = await userAPI.getCurrentUser({
          signal: controller.signal,
        });
        console.log(result.data);
        if (result.ok) {
          dispatch(setUserData(result.data.data));
        }
      } catch (err) {
        // Ignore abort errors (cleanup)
        if (err.name !== "AbortError") {
          console.log(err);
        }
      }
    };

    fetchUser();

    // ✅ CLEANUP: Abort the request if component unmounts
    return () => {
      controller.abort();
    };
  }, [dispatch]);
}

export default useGetCurrentUser;
