import React, { useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useDispatch, useSelector } from 'react-redux'
import useGetCity from './hooks/useGetCity'
import Snackbar from './components/Snackbar'
import useGetMyShop from './hooks/useGetMyShop'
import CreateEditShop from './pages/CreateEditShop'
import AddItem from './pages/AddItem'
import EditItem from './pages/EditItem'
import useGetShopByCity from './hooks/useGetShopByCity'
import useGetItemByCity from './hooks/useGetItemByCIty'
import CartPage from './pages/CartPage'
import CheckOut from './pages/CheckOut'
import OrderPlaced from './pages/OrderPlaced'
import MyOrders from './pages/MyOrders'
import useGetMyOrders from './hooks/useGetMyOrders'
import useUpdateLocation from './hooks/useUpdateLocation'
import TrackOrderPage from './pages/TrackOrderPage'
import Shop from './pages/Shop'
import { setSocket } from './redux/userSlice'
import { io } from 'socket.io-client'
import Chatbot from './components/Chatbot'

function App() {
  const { userData } = useSelector((state) => state.user)
  const dispatch = useDispatch()
  
  useUpdateLocation()
  useGetCurrentUser()
  useGetCity()
  useGetShopByCity()
  useGetItemByCity()
  useGetMyShop()
  useGetMyOrders()

  useEffect(() => {
    const socketInstance = io(import.meta.env.VITE_SERVER_URL, {
      withCredentials: true,
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      reconnectionAttempts: 5,
    })
    
    dispatch(setSocket(socketInstance))

    const handleConnect = () => {
      if (userData?._id) {
        socketInstance.emit("identity", { userId: userData._id })
      }
    }

    const handleError = (error) => {
      console.error("Socket connection error:", error)
    }

    const handleDisconnect = (reason) => {
      console.log("Socket disconnected:", reason)
    }

    socketInstance.on("connect", handleConnect)
    socketInstance.on("error", handleError)
    socketInstance.on("disconnect", handleDisconnect)

    if (socketInstance.connected && userData?._id) {
      socketInstance.emit("identity", { userId: userData._id })
    }

    return () => {
      // ✅ CLEANUP: Remove all listeners to prevent memory leaks
      socketInstance.off("connect", handleConnect)
      socketInstance.off("error", handleError)
      socketInstance.off("disconnect", handleDisconnect)
      socketInstance.removeAllListeners()
      socketInstance.disconnect()
    }
  }, [userData?._id, dispatch])
  return (
    <>
      <Snackbar />
      {userData?.role === "user" && <Chatbot />}
      <Routes>
        <Route path="/" element={userData ? <Home /> : <Navigate to="/signIn" />} />
        <Route path="/signIn" element={!userData ? <SignIn /> : <Navigate to="/" />} />
        <Route path="/signUp" element={!userData ? <SignUp /> : <Navigate to="/" />} />
        <Route
          path="/forgot-password"
          element={!userData ? <ForgotPassword /> : <Navigate to="/" />}
        />
        <Route
          path="/create-edit-shop"
          element={userData ? <CreateEditShop /> : <Navigate to="/" />}
        />
        <Route
          path="/add-item"
          element={userData ? <AddItem /> : <Navigate to="/" />}
        />
        <Route
          path="/edit-item/:itemId"
          element={userData ? <EditItem /> : <Navigate to="/" />}
        />
        <Route
          path="/cart"
          element={userData ? <CartPage /> : <Navigate to="/signIn" />}
        />
        <Route
          path="/checkOut"
          element={userData ? <CheckOut /> : <Navigate to="/signIn" />}
        />
        <Route
          path="/order-placed"
          element={userData ? <OrderPlaced /> : <Navigate to="/signIn" />}
        />
        <Route
          path="/my-orders"
          element={userData ? <MyOrders /> : <Navigate to="/signIn" />}
        />
        <Route
          path="/track-order/:orderId"
          element={userData ? <TrackOrderPage /> : <Navigate to="/signIn" />}
        />
        <Route
          path="/shop/:shopId"
          element={userData ? <Shop /> : <Navigate to="/signIn" />}
        />
      </Routes>
    </>
  )
}

export default App
