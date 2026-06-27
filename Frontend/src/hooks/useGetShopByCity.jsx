import React, { useEffect } from "react";
import shopAPI from "../../services/shop"
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
    const dispatch = useDispatch()
  const { currentCity } = useSelector((state) => state.user)
  
  useEffect(() => {
    // Only fetch shops when city is available
    if (!currentCity) return;

    const controller = new AbortController();

    const fetchShops = async () => {
      try {
        const result = await shopAPI.getShopByCity(currentCity, {
          signal: controller.signal,
        });
        if (result.ok) {
          dispatch(setShopsInMyCity(result.data.data));
        } else {
          console.error(result.data?.message);
        }
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("Error fetching shops:", err);
        }
      }
    };

    fetchShops();

    // ✅ CLEANUP: Abort the request if component unmounts or city changes
    return () => {
      controller.abort();
    };
  }, [currentCity, dispatch])
}

export default useGetShopByCity;
