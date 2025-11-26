import React from 'react'
import Nav from './Navbar'
import { useSelector } from 'react-redux'

const UserDashboard = () => {
    const {userData, city} = useSelector(state => state.user)
  return (
    <div>
      <Nav userData={userData} city={city} />
    </div>
  )
}

export default UserDashboard
