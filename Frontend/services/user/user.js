import apiConfig from "../config.js"

const getUser = () => apiConfig.client.get('user')

const getUserProfile = () => apiConfig.client.get('user/profile')

const signUp = (user) => apiConfig.client.post("user/signUp",user)

const signOut = (user) => apiConfig.client.get("user/signOut")

const updateUser = (id,user) => apiConfig.client.put(`user/${id}`,user)

const deleteUser = (id) => apiConfig.client.delete(`user/${id}`)

const updatePassword = (id,user) => apiConfig.client.put(`user/${id}`,user)

const signIn = (user) => apiConfig.client.post(`user/signIn`,user)

const sendOtp = (data) => apiConfig.client.post(`user/send-otp`,data)

const verifyOtp = (data) => apiConfig.client.post(`user/verify-otp`,data)

const resetPassword = (data) => apiConfig.client.post(`user/reset-password`,data)

const signUpWithGoogle = (data) => apiConfig.client.post(`user/google-auth`,data)

const getCurrentUser = () => apiConfig.client.get(`user/current-user`)

const updateLocation = (data) => apiConfig.client.post(`user/update-location`,data)


export default {
    signIn,
    signUp,
    signOut,
    updatePassword,
    updateUser,
    deleteUser,
    getUserProfile,
    getUser,
    sendOtp,
    verifyOtp,
    resetPassword,
    signUpWithGoogle,
    getCurrentUser,
    updateLocation
}