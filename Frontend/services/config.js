import axios from "axios";

import { create } from "apisauce"

const customAxiosInstance = axios.create({
    baseURL: "http://localhost:8000/api/auth"
})

const client = create({axiosInstance:customAxiosInstance})

export default {client}