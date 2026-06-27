import apiConfig from "./config.js"

const submitComplaint = (data) => apiConfig.client.post("complaints", data)
const getMyComplaints = () => apiConfig.client.get("complaints")

export default { submitComplaint, getMyComplaints }
