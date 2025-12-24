import axios from "axios";

import { create } from "apisauce"

const customAxiosInstance = axios.create({
    // baseURL: "http://localhost:8000/api/auth"   // local
    baseURL: "https://sangam-h96y.onrender.com/api/auth" // development
})

const client = create({axiosInstance:customAxiosInstance})

export default {client}
