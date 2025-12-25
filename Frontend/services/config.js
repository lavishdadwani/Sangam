import axios from "axios";

import { create } from "apisauce"

const customAxiosInstance = axios.create({
    baseURL: `${import.meta.env.VITE_SERVER_URL}/api/auth`, // development
    withCredentials: true // Required for HTTP-only cookies to be sent with requests
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
