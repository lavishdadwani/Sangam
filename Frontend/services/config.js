import axios from "axios";

import { create } from "apisauce"

const customAxiosInstance = axios.create({
    // baseURL: "http://localhost:8000/api/auth" // local
    baseURL: "https://sangam-h96y.onrender.com/api/auth" // development
})

const client = create({axiosInstance:customAxiosInstance})

// Helper function to normalize axios responses to match apisauce format
export const normalizeAxiosResponse = (axiosResponse) => {
    const status = axiosResponse.status;
    const ok = status >= 200 && status < 300;
    
    return {
        ok,
        status,
        data: axiosResponse.data,
        problem: ok ? null : 'CLIENT_ERROR',
        originalError: ok ? null : axiosResponse
    };
};

export default {client}
