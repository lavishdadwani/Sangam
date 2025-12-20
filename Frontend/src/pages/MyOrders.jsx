import React, { useEffect } from "react";
import { IoIosArrowRoundBack } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { FaShoppingBag } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";
import ButtonSquare from "../components/ButtonSquare";
import { setMyOrders, updateRealtimeOrderStatus } from "../redux/userSlice";

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch()

  useEffect(() => {
    socket?.on('newOrder', (data) =>{
        if(data.shopOrders?.owner._id == userData._id){
            dispatch(setMyOrders([data, ...myOrders]))
        }
    })
    socket?.on('update-status', ({orderId, shopId, userId,status}) =>{
        if(userId == userData._id){
            dispatch(updateRealtimeOrderStatus({orderId, shopId,status}))
        }
    })
    return () => {
        socket?.off("newOrder")
        socket?.off("update-status")
    }
  }, [socket]);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4">
      <div className="w-full max-w-[800px] p-4">
        <div className="flex items-center gap-[20px] mb-6">
          <div className="z-[10] cursor-pointer" onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <h1 className="text-2xl font-bold text-start">My Orders</h1>
        </div>
        <div className="space-y-6">
            {myOrders && myOrders.length > 0 ? (
                myOrders.map((order,index) =>(
                    userData.role == "user" ? (
                        <UserOrderCard data={order} key={index} />
                    ) : userData.role == "owner" ? (
                        <OwnerOrderCard data={order} key={index} />
                    ) : null
                ))
            ) : (
                <div className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="flex flex-col items-center justify-center gap-6 max-w-md">
                        {/* Icon Container */}
                        <div className="bg-gradient-to-br from-orange-100 to-orange-50 rounded-full p-8 shadow-lg">
                            {userData.role == "user" ? (
                                <FaShoppingBag className="text-[#ff4d2d] text-6xl" />
                            ) : (
                                <TbReceipt2 className="text-[#ff4d2d] text-6xl" />
                            )}
                        </div>
                        
                        {/* Message */}
                        <div className="text-center space-y-2">
                            <h2 className="text-2xl font-bold text-gray-800">
                                {userData.role == "user" 
                                    ? "No Orders Yet" 
                                    : "No Orders Received"}
                            </h2>
                            <p className="text-gray-500 text-base leading-relaxed">
                                {userData.role == "user" 
                                    ? "You haven't placed any orders yet. Start shopping to see your orders here!" 
                                    : "You haven't received any orders yet. Once customers place orders, they'll appear here."}
                            </p>
                        </div>
                        
                        {/* Action Button for Users */}
                        {userData.role == "user" && (
                            <ButtonSquare
                                styleType="default"
                                onClick={() => navigate("/")}
                                className="mt-4 px-6 py-3 shadow-md hover:shadow-lg"
                            >
                                Start Shopping
                            </ButtonSquare>
                        )}
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
