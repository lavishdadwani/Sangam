import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import { FaShoppingBag } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";
import { setMyOrders, updateRealtimeOrderStatus } from "../redux/userSlice";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import AnimatedCard from "../components/AnimatedCard";

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

  const ordersCount = myOrders?.length || 0;

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-[900px] p-4 md:p-6">
        <PageHeader
          title="My Orders"
          subtitle={ordersCount > 0 ? `${ordersCount} ${ordersCount === 1 ? 'order' : 'orders'} ${userData.role === "user" ? "placed" : "received"}` : null}
          rightContent={ordersCount > 0 ? (
            <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] font-bold text-lg shadow-md">
              {ordersCount}
            </div>
          ) : null}
        />

        {/* Orders List */}
        <div className="space-y-6 md:space-y-8">
            {myOrders && myOrders.length > 0 ? (
                <>
                  {myOrders.map((order,index) =>(
                      <AnimatedCard
                        key={order._id || index}
                        index={index}
                        delay={80}
                      >
                        {userData.role == "user" ? (
                            <UserOrderCard data={order} />
                        ) : userData.role == "owner" ? (
                            <OwnerOrderCard data={order} />
                        ) : null}
                      </AnimatedCard>
                  ))}
                </>
            ) : (
                <EmptyState
                  icon={userData.role === "user" ? FaShoppingBag : TbReceipt2}
                  title={userData.role === "user" ? "No Orders Yet" : "No Orders Received"}
                  description={userData.role === "user" 
                    ? "You haven't placed any orders yet. Start shopping to see your orders here!" 
                    : "You haven't received any orders yet. Once customers place orders, they'll appear here."}
                  buttonText={userData.role === "user" ? "Start Shopping" : null}
                  buttonRoute={userData.role === "user" ? "/" : null}
                />
            )}
        </div>
      </div>
    </div>
  );
};

export default MyOrders;
