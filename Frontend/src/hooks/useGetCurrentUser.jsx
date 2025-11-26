import React, { useEffect } from "react";
import userAPI from "../../services/user/user"
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

function useGetCurrentUser() {
    const dispatch = useDispatch()
  useEffect(() => {
    fetchUser()
  },[]);

  const fetchUser = async () => {
    try {
        const result = await userAPI.getCurrentUser()
        console.log(result.data)
        if(result.ok){
            dispatch(setUserData(result.data.data))
          }else{
          }
    } catch (err) {
        console.log(err)
    }
  };
}

export default useGetCurrentUser;
