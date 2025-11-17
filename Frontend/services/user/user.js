import apiConfig from "../config.js"

const getUser = () => apiConfig.client.get('user')

const getUserProfile = () => apiConfig.client.get('user/profile')

const signUp = (user) => apiConfig.client.post("user/signUp",user,{withCredentials:true})

const updateUser = (id,user) => apiConfig.client.put(`user/${id}`,user)

const deleteUser = (id) => apiConfig.client.delete(`user/${id}`)

const updatePassword = (id,user) => apiConfig.client.put(`user/${id}`,user)

const signIn = (user) => apiConfig.client.post(`user/signIn`,user)


export default {
    signIn,
    signUp,
    updatePassword,
    updateUser,
    deleteUser,
    getUserProfile,
    getUser
}