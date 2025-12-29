import React, { useEffect } from "react";
import itemAPI from "../../services/item"
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice";

function useGetItemByCity() {
    const dispatch = useDispatch()
  const { currentCity } = useSelector((state) => state.user)
  
  useEffect(() => {
    // Only fetch items when city is available
    if (!currentCity) return

  const fetchItems = async () => {
    try {
        const result = await itemAPI.getItemByCity(currentCity)
        if (result.ok) {
            dispatch(setItemsInMyCity(result.data.data))
        } else {
          console.error(result.data?.message)
          }
    } catch (err) {
        console.error("Error fetching items:", err)
      }
    }

    fetchItems()
  }, [currentCity, dispatch])
}

export default useGetItemByCity;
