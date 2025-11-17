import React from 'react'
import { Route, Routes } from 'react-router-dom'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import ForgotPassword from './pages/ForgotPassword'

function App() {
  return (
    <Routes>
      <Route path='/' element={<Home />}/>
      <Route path='/signIn' element={<SignIn />}/>
      <Route path='/signUp' element={<SignUp />}/>
      <Route path='/forgot-password' element={<ForgotPassword />}/>
    </Routes>
  )
}

export default App
