import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'
import useGetCurrentUser from './hooks/useGetCurrentUser'
import { useSelector } from 'react-redux'
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

function App() {
  const {userData} = useSelector(state => state.user)
  useGetCurrentUser()
  useGetCity()
  useGetShopByCity()
  useGetItemByCity()
  useUpdateLocation()
  // Always call hook; it internally checks for owner role
  useGetMyShop()
  useGetMyOrders()
  return (
    <>
      <Snackbar />
      <Routes>
        <Route path='/' element={userData ? <Home /> : <Navigate to={"/signIn"} /> }/>
        <Route path='/signIn' element={!userData ? <SignIn /> : <Navigate to={'/'} /> }/>
        <Route path='/signUp' element={!userData ? <SignUp /> : <Navigate to={'/'} />} />
        <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={'/'}/>} />
        <Route path='/create-edit-shop' element={userData ? <CreateEditShop /> : <Navigate to={'/'}/>} />
        <Route path='/add-item' element={userData ? <AddItem /> : <Navigate to={'/'}/>} />
        <Route path='/edit-item/:itemId' element={userData ? <EditItem /> : <Navigate to={'/'}/>} />
        <Route path='/cart' element={userData ? <CartPage /> : <Navigate to={'/signIn'}/>} />
        <Route path='/checkOut' element={userData ? <CheckOut /> : <Navigate to={'/signIn'}/>} />
        <Route path='/order-placed' element={userData ? <OrderPlaced /> : <Navigate to={'/signIn'}/>} />
        <Route path='/my-orders' element={userData ? <MyOrders /> : <Navigate to={'/signIn'}/>} />
      </Routes>
    </>
  )
}

export default App
