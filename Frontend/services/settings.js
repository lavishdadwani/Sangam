import apiConfig from "./config.js"

const getPlatformSettings = () => apiConfig.client.get("user/settings")

export default { getPlatformSettings }
