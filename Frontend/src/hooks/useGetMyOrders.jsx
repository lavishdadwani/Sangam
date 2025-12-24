import React, { useEffect } from "react";
import orderAPI from "../../services/order";
import { useDispatch, useSelector } from "react-redux";
import { setMyOrders } from "../redux/userSlice";

function useGetMyOrders() {
  const dispatch = useDispatch();
  const { userData } = useSelector((state) => state.user);

  useEffect(() => {
    // Will run for all users
    fetchOrders();
  }, [userData]);

  const fetchOrders = async () => {
    try {
      const result = await orderAPI.getOrders();
      if (result.ok) {
        dispatch(setMyOrders(result.data.data));
      } else {
        // If no order is found for this user, clear any previous order data
        dispatch(setMyOrders(null));
        console.error(result.data?.message || "Failed to fetch user orders");
      }
    } catch (err) {
      console.log(err);
      // On error also clear state order data
      dispatch(setMyOrders(null));
    }
  };
}

export default useGetMyOrders;
