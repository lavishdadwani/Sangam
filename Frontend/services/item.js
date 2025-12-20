import apiConfig, { normalizeAxiosResponse } from "./config.js"

const getItems = () => apiConfig.client.get("items")
const getItemById = (id) => apiConfig.client.get(`item/${id}`,{withCredentials:true})

const getItemByCity = (city) => apiConfig.client.get(`item/get-by-city/${city}`)
const getItemByShop = (shop) => apiConfig.client.get(`item/get-by-shop/${shop}`)
const searchItems = (query,city) => apiConfig.client.get(`item/search-items?query=${query}&city=${city}`)

const rating = (data) => apiConfig.client.post('item/rating',data)

// Use the underlying axios instance for multipart/form-data (file upload)
// Normalize the response to match apisauce format (with ok property)
const create = async (itemFormData) => {
  const response = await apiConfig.client.axiosInstance.post("item/create", itemFormData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return normalizeAxiosResponse(response)
}

const edit = async (id, itemFormData) => {
  const response = await apiConfig.client.axiosInstance.put(`item/edit/${id}`, itemFormData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })
  return normalizeAxiosResponse(response)
}

const deleteItem = async (id) => {
  const response = await apiConfig.client.axiosInstance.delete(`item/delete/${id}`)
  return normalizeAxiosResponse(response)
}

export default {
  getItems,
  create,
  getItemById,
  getItemByCity,
  getItemByShop,
  searchItems,
  edit,
  deleteItem,
  rating
}