import React, { useEffect } from "react";
import ownerAPI from "../../services/shop";
import { useDispatch, useSelector } from "react-redux";
import { setOwnerData } from "../redux/ownerSlice";

function useGetMyShop() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // Only run for logged-in owners
    if (!userData || userData.role !== "owner") return;

    const controller = new AbortController();

    const fetchOwner = async () => {
      try {
        const result = await ownerAPI.getShop({
          signal: controller.signal,
        });

        // console.log(result.data);
        if (result.ok) {
          dispatch(setOwnerData(result.data.data));
        } else {
          // If no shop is found for this owner, clear any previous shop data
          dispatch(setOwnerData(null));
          console.error(result.data?.message || "Failed to fetch owner shop");
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.log(err);
          // On error also clear stale shop data
          dispatch(setOwnerData(null));
        }
      }
    };

    fetchOwner();

    // ✅ CLEANUP: Abort the request if component unmounts or userData changes
    return () => {
      controller.abort();
    };
  }, [userData?._id, userData?.role, dispatch]);
}

export default useGetMyShop;
