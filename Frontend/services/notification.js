import apiConfig from "./config.js"

const getNotifications = () => apiConfig.client.get("user/notifications")

export default { getNotifications }
