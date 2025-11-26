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

function App() {
  useGetCurrentUser()
  useGetCity()
  const {userData} = useSelector(state => state.user)
  return (
    <>
      <Snackbar />
      <Routes>
        <Route path='/' element={userData ? <Home /> : <Navigate to={"/signIn"} /> }/>
        <Route path='/signIn' element={!userData ? <SignIn /> : <Navigate to={'/'} /> }/>
        <Route path='/signUp' element={!userData ? <SignUp /> : <Navigate to={'/'} />} />
        <Route path='/forgot-password' element={!userData ? <ForgotPassword /> : <Navigate to={'/'}/>} />
      </Routes>
    </>
  )
}

export default App
