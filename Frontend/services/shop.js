import apiConfig, { normalizeAxiosResponse } from "./config.js"

const getShop = () => apiConfig.client.get("shop/get-shop")

const getShopByCity = (city) => apiConfig.client.get(`shop/get-by-city/${city}`)

// Use the underlying axios instance for multipart/form-data (file upload)
// Normalize the response to match apisauce format (with ok property)
const createEditShop = async (shopFormData) => {
  const response = await apiConfig.client.axiosInstance.post("shop/create-edit", shopFormData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return normalizeAxiosResponse(response)
}

export default {
  getShop,
  createEditShop,
  getShopByCity
}