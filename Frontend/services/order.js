import apiConfig from "./config.js"

const create = (data) => apiConfig.client.post("order/create",data)
const getOrders = () => apiConfig.client.get("order/orders",)
const updateStatus = (orderId,shopId,status) => apiConfig.client.post(`order/update-status/${orderId}/${shopId}`,{status})


export default {
    create,
    getOrders,
    updateStatus
}