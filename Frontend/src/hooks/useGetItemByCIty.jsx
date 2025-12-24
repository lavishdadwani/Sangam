import React, { useEffect } from "react";
import itemAPI from "../../services/item"
import { useDispatch, useSelector } from "react-redux";
import { setItemsInMyCity } from "../redux/userSlice";

function useGetItemByCity() {
    const dispatch = useDispatch()
    const {currentCity} = useSelector(state => state.user)
  useEffect(() => {
    fetchItems()
  },[currentCity]);

  const fetchItems = async () => {
    try {
        const result = await itemAPI.getItemByCity(currentCity)
        if(result.ok){
            dispatch(setItemsInMyCity(result.data.data))
            console.log(result.data.data);
          }else{
            console.error(result.data?.message);
          }
    } catch (err) {
        console.log(err)
    }
  };
}

export default useGetItemByCity;
