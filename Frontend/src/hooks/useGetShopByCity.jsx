import React, { useEffect } from "react";
import shopAPI from "../../services/shop"
import { useDispatch, useSelector } from "react-redux";
import { setShopsInMyCity } from "../redux/userSlice";

function useGetShopByCity() {
  const dispatch = useDispatch()
  const { currentCity } = useSelector((state) => state.user)
  
  useEffect(() => {
    // Only fetch shops when city is available
    if (!currentCity) return

    const fetchShops = async () => {
      try {
        const result = await shopAPI.getShopByCity(currentCity)
        if (result.ok) {
          dispatch(setShopsInMyCity(result.data.data))
        } else {
          console.error(result.data?.message)
        }
      } catch (err) {
        console.error("Error fetching shops:", err)
      }
    }

    fetchShops()
  }, [currentCity, dispatch])
}

export default useGetShopByCity;
