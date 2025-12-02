import apiConfig, { normalizeAxiosResponse } from "./config.js"

const getItems = () => apiConfig.client.get("items")
const getItemById = (id) => apiConfig.client.get(`item/${id}`,{withCredentials:true})

const getItemByCity = (city) => apiConfig.client.get(`item/get-by-city/${city}`)

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
  edit,
  deleteItem
}