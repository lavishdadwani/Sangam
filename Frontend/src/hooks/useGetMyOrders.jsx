import React, { useEffect } from "react";
import orderAPI from "../../services/order";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // Only fetch if user is logged in
    if (!userData?._id) return;

    const controller = new AbortController();

    const fetchOrders = async () => {
      try {
        const result = await orderAPI.getOrders({
          signal: controller.signal,
        });
        if (result.ok) {
          dispatch(setMyOrders(result.data.data));
        } else {
          // If no order is found for this user, clear any previous order data
          dispatch(setMyOrders(null));
          console.error(result.data?.message || "Failed to fetch user orders");
        }
      } catch (err) {
        // Ignore abort errors (cleanup)
        if (err.name !== "AbortError") {
          console.log(err);
          // On error also clear state order data
          dispatch(setMyOrders(null));
        }
      }
    };

    fetchOrders();

    // ✅ CLEANUP: Abort the request if component unmounts or userData changes
    return () => {
      controller.abort();
    };
  }, [userData?._id, dispatch]);
}

export default useGetMyOrders;
