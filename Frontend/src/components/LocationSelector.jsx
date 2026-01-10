import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setLocation, setAddress } from "../redux/mapSlice";
import { setCurrentCity, setCurrentState, setCurrentAddress, setUserData } from "../redux/userSlice";
import getCityName, { getAddressByLatLng } from "../../services/helpers";
import userAPI from "../../services/user/user";
import { IoLocationSharp, IoSearchOutline } from "react-icons/io5";
import { TbCurrentLocation } from "react-icons/tb";
import { FaLocationDot } from "react-icons/fa6";
import CustomModal from "./Modal";
import MapContainer from "./MapContainer";
import ButtonSquare from "./ButtonSquare";
import InputText from "./InputText";
import { openSnackbar } from "../redux/snackbarSlice";

const LocationSelector = () => {
  const dispatch = useDispatch();
  const { location, address } = useSelector((state) => state.map);
  const { currentCity, currentState, userData } = useSelector((state) => state.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [addressInput, setAddressInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Initialize location from userData when component mounts or userData changes
  useEffect(() => {
    if (userData?.location?.coordinates) {
      const [lng, lat] = userData.location.coordinates;
      if (lat !== 0 || lng !== 0) {
        if (!location?.lat || !location?.lng || (location.lat === 0 && location.lng === 0)) {
          dispatch(setLocation({ lat, lng }));
        }
        if (userData.location.address && !address) {
          dispatch(setAddress(userData.location.address));
          setAddressInput(userData.location.address);
        }
        if (userData.location.city && !currentCity) {
          dispatch(setCurrentCity(userData.location.city));
        }
        if (userData.location.state && !currentState) {
          dispatch(setCurrentState(userData.location.state));
        }
      } else {
        dispatch(setLocation({ lat: 0, lng: 0 }));
        setIsModalOpen(true);
      }
    }
  }, [userData?.location?.coordinates]);

  useEffect(() => {
    if (address) {
      setAddressInput(address);
    }
  }, [address]);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (showSuggestions && !e.target.closest('.suggestions-container')) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showSuggestions]);

  const getAddressLatLng = async (lat, lng) => {
    try {
      setLoading(true);
      const result = await getCityName(lat, lng);
      if (result && result.results && result.results.length > 0) {
        const cityName = result.results[0].city;
        const stateName = result.results[0].state;
        const addressText = result.results[0].address_line2 || result.results[0].address_line1;
        
        dispatch(setAddress(addressText));
        dispatch(setCurrentAddress(addressText));
        if (cityName) {
          dispatch(setCurrentCity(cityName));
        }
        if (stateName) {
          dispatch(setCurrentState(stateName));
        }
        // dispatch(openSnackbar("Location updated successfully", "success"));
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar("Failed to get address", "error"));
    } finally {
      setLoading(false);
    }
  };

  const onDragEnd = (e) => {
    const { lat, lng } = e.target._latlng;
    dispatch(setLocation({ lat, lng }));
    getAddressLatLng(lat, lng);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      dispatch(openSnackbar("Geolocation is not supported by your browser", "error"));
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;
        dispatch(setLocation({ lat: latitude, lng: longitude }));
        await getAddressLatLng(latitude, longitude);
      },
      (error) => {
        console.error("Geolocation error:", error);
        dispatch(openSnackbar("Failed to get current location", "error"));
        setLoading(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handleAddressSearch = async (query) => {
    if (!query || query.length < 3) {
      setSearchSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    try {
      const result = await getAddressByLatLng(query);
      if (result && result.results && result.results.length > 0) {
        setSearchSuggestions(result.results.slice(0, 5));
        setShowSuggestions(true);
      } else {
        setSearchSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (err) {
      console.error("Search error:", err);
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectSuggestion = async (suggestion) => {
    setAddressInput(suggestion.formatted || suggestion.address_line1 || suggestion.address_line2);
    setShowSuggestions(false);
    
    if (suggestion.lat && suggestion.lon) {
      dispatch(setLocation({ lat: suggestion.lat, lng: suggestion.lon }));
      await getAddressLatLng(suggestion.lat, suggestion.lon);
    }
  };

  const handleConfirmLocation = async () => {
    if (!location?.lat || !location?.lng || (location.lat === 0 && location.lng === 0)) {
      dispatch(openSnackbar("Please select a valid location", "warning"));
      return;
    }

    try {
      setLoading(true);
      
      const locationData = {
        lat: location.lat,
        lng: location.lng,
      };

      if (address && address.trim() !== "") {
        locationData.address = address.trim();
      }
      if (currentCity && currentCity.trim() !== "") {
        locationData.city = currentCity.trim();
      }
      if (currentState && currentState.trim() !== "") {
        locationData.state = currentState.trim();
      }
            const result = await userAPI.updateLocation(locationData);
      
      if (result.ok) {

        if (result.data?.data) {
          dispatch(setUserData(result.data.data));
        } else {
          const updatedUserData = {
            ...userData,
            location: {
              ...userData.location,
              coordinates: [location.lng, location.lat], // MongoDB format: [lng, lat]
              address: address || userData.location?.address || null,
              city: currentCity || userData.location?.city || null,
              state: currentState || userData.location?.state || null,
            },
          };
          dispatch(setUserData(updatedUserData));
        }
        
        setIsModalOpen(false);
        dispatch(openSnackbar("Location updated successfully", "success"));
      } else {
        dispatch(openSnackbar(result.data?.message || "Failed to update location", "error"));
      }
    } catch (err) {
      console.error("Update location error:", err);
      dispatch(openSnackbar(err.response?.data?.message || "Failed to update location", "error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsModalOpen(true)}
        className="flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg bg-transparent hover:bg-white/50 transition-all duration-200 cursor-pointer h-full min-h-[44px]"
      >
        <FaLocationDot size={20} className="text-[#ff4d2d] flex-shrink-0" />
        <span className="text-sm md:text-base font-medium text-gray-700 truncate max-w-[120px] md:max-w-[200px]">
          {userData?.location?.address || currentCity || "Select your Location"}
        </span>
      </button>

      <CustomModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Select Your Location"
        size="sm"
      >
        <div className="space-y-4">
          {/* Address Search */}
          <div className="flex gap-2 items-end">
            <div className="flex-1 relative z-50">
              <InputText
                label="Search Address"
                labelIcon={IoLocationSharp}
                type="text"
                name="address"
                placeholder="Enter your address..."
                value={addressInput}
                onChange={(e) => {
                  setAddressInput(e.target.value);
                  handleAddressSearch(e.target.value);
                }}
                onFocus={() => {
                  if (searchSuggestions.length > 0) setShowSuggestions(true);
                }}
                inputClassName="pr-10"
              />
              
             
              <div className="absolute right-3 top-[2.75rem] -translate-y-1/2 z-10">
                <IoSearchOutline
                  className="text-gray-400 pointer-events-none"
                  size={18}
                />
              </div>
              
              {/* Search Suggestions */}
              {showSuggestions && searchSuggestions.length > 0 && (
                <div className="suggestions-container absolute z-[60] w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSelectSuggestion(suggestion)}
                      className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0"
                    >
                      <p className="text-sm font-medium text-gray-800">
                        {suggestion.formatted || suggestion.address_line1 || suggestion.address_line2}
                      </p>
                      {suggestion.city && (
                        <p className="text-xs text-gray-500 mt-0.5">
                          {suggestion.city}, {suggestion.state}
                        </p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <ButtonSquare
              onClick={getCurrentLocation}
              disabled={loading}
              styleType="primary"
              className="px-4 py-3"
              title="Use current location"
            >
              <TbCurrentLocation size={20} />
            </ButtonSquare>
          </div>

          {/* Map */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Drag marker to adjust location
            </label>
            <p className="text-xs text-gray-500 mb-2 italic">
              Note: Move the map marker to change the delivery location.
            </p>
            <MapContainer
              location={location}
              onDragEnd={onDragEnd}
              draggable={true}
              height="400px"
            />
          </div>

          {/* Selected Address Display */}
          {address && (
            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p className="text-xs text-gray-500 mb-1">Selected Address:</p>
              <p className="text-sm font-medium text-gray-800">{address}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2">
            <ButtonSquare
              onClick={handleConfirmLocation}
              styleType="default"
              loading={loading}
              loadingMessage="Updating location..."
              disabled={loading || !location?.lat || !location?.lng || (location.lat === 0 && location.lng === 0)}
              className="flex-1 py-3"
            >
              Confirm Location
            </ButtonSquare>
            <ButtonSquare
              onClick={() => setIsModalOpen(false)}
              styleType="outline"
              disabled={loading}
              className="px-6 py-3"
            >
              Cancel
            </ButtonSquare>
          </div>
        </div>
      </CustomModal>
    </>
  );
};

export default LocationSelector;

