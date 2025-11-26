import axios from "axios";

import { create } from "apisauce"

const customAxiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/auth",
    withCredentials: true // This is required for cookies to be sent/received
})

const client = create({axiosInstance:customAxiosInstance})

export default {client}