import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCity } from "../redux/userSlice";
import getCityName from "../../services/helpers";

function useGetCity() {
    const dispatch = useDispatch()
    const {userData} = useSelector(state => state.user)
  useEffect(() => {
    getCity()
  },[userData]);

  const getCity =  async () =>{
    navigator.geolocation.getCurrentPosition( 
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          const result = await getCityName(latitude, longitude)
          if (result) {
            const cityName = result.results[0].city
            console.log(cityName)
            dispatch(setCity(cityName))
          }
        } catch (error) {
          console.error("Error getting city name:", error)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
      }
    )
  }

}

export default useGetCity;
