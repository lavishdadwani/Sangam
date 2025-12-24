import axios from "axios";

export const getCityName = async (lat, lon) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_GEOAPI}reverse?lat=${lat}&lon=${lon}&format=json&apiKey=${
        import.meta.env.VITE_GEOAPI_KEY
      }`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching city name:", error);
    throw error;
  }
};
export const getAddressByLatLng = async (address) => {
  try {
    const response = await axios.get(
      `${import.meta.env.VITE_GEOAPI}search?text=${encodeURIComponent(address)}&format=json&apiKey=${
        import.meta.env.VITE_GEOAPI_KEY
      }`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching address name:", error);
    throw error;
  }
};

export default getCityName