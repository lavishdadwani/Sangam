import apiConfig from "./config.js"

const create = (data) => apiConfig.client.post("order/create",data)
const verifyPayment = (data) => apiConfig.client.post("order/verify-payment",data)
const getOrders = () => apiConfig.client.get("order/orders",)

// for deliveryBoy
const getAssignments = () => apiConfig.client.get("order/get-assignments",)
const getCurrentOrder = () => apiConfig.client.get("order/current-order",)

const getOrderByID = (id) => apiConfig.client.get(`order/order/${id}`)

const acceptOrder = (id) => apiConfig.client.get(`order/accept-order/${id}`)
const updateStatus = (orderId,shopId,status) => apiConfig.client.post(`order/update-status/${orderId}/${shopId}`,{status})

const sendOtp = (data) => apiConfig.client.post("order/send-delivery-otp",data)
const verifyOtp = (data) => apiConfig.client.post("order/verify-delivery-otp",data)

const todaysDeliveries = () => apiConfig.client.get("order/get-today-deliveries")

export default {
    create,
    getOrders,
    updateStatus,
    getAssignments,
    acceptOrder,
    getCurrentOrder,
    getOrderByID,
    sendOtp,
    verifyOtp,
    verifyPayment,
    todaysDeliveries
}