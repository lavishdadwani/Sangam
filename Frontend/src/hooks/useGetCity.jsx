import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setCurrentAddress, setCurrentCity,setCurrentState } from "../redux/userSlice";
import getCityName from "../../services/helpers";
import { setAddress, setLocation } from "../redux/mapSlice";

function useGetCity() {
  const dispatch = useDispatch()
  const { userData, currentCity } = useSelector((state) => state.user)

  useEffect(() => {
    // Only fetch city if user is logged in and city is not already set
    if (!userData || currentCity) return

    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser")
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const latitude = position.coords.latitude
          const longitude = position.coords.longitude
          dispatch(setLocation({ lat: latitude, lng: longitude }))
          
          const result = await getCityName(latitude, longitude)
          if (result && result.results && result.results.length > 0) {
            const cityName = result.results[0].city
            const stateName = result.results[0].state
            const address = result.results[0].address_line2 || result.results[0].address_line1
            
            if (cityName) {
              dispatch(setCurrentAddress(address))
              dispatch(setCurrentCity(cityName))
              dispatch(setCurrentState(stateName))
              dispatch(setAddress(result.results[0].address_line2))
            } else {
              console.error("City name not found in geolocation response")
            }
          } else {
            console.error("Invalid geolocation response:", result)
          }
        } catch (error) {
          console.error("Error getting city name:", error)
        }
      },
      (error) => {
        console.error("Error getting location:", error)
        // Handle different error types
        switch (error.code) {
          case error.PERMISSION_DENIED:
            console.error("User denied the request for Geolocation")
            break
          case error.POSITION_UNAVAILABLE:
            console.error("Location information is unavailable")
            break
          case error.TIMEOUT:
            console.error("The request to get user location timed out")
            break
          default:
            console.error("An unknown error occurred")
            break
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    )
  }, [userData, currentCity, dispatch])
}

export default useGetCity;
