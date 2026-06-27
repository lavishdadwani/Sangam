import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserOrderCard from "../components/UserOrderCard";
import OwnerOrderCard from "../components/OwnerOrderCard";
import ComplaintForm from "../components/ComplaintForm";
import { FaShoppingBag, FaExclamationTriangle } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";
import { setMyOrders, updateRealtimeOrderStatus } from "../redux/userSlice";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import AnimatedCard from "../components/AnimatedCard";

const ACTIVE_STATUSES = ["pending", "preparing", "awaiting pickup", "out for delivery"];

const getOrderTab = (order) => {
  const statuses = order.shopOrders?.map((so) => so.status) ?? [];
  if (statuses.every((s) => s === "delivered")) return "delivered";
  if (statuses.every((s) => s === "cancelled")) return "cancelled";
  if (statuses.some((s) => ACTIVE_STATUSES.includes(s))) return "active";
  return "all";
};

const TABS = [
  { key: "all",       label: "All" },
  { key: "active",    label: "Active" },
  { key: "delivered", label: "Delivered" },
  { key: "cancelled", label: "Cancelled" },
];

const MyOrders = () => {
  const { userData, myOrders, socket } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [showComplaintForm, setShowComplaintForm] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

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
  const filteredOrders = activeTab === "all"
    ? myOrders
    : (myOrders ?? []).filter((o) => getOrderTab(o) === activeTab);

  return (
    <div className="w-full min-h-screen bg-[#fff9f6] flex justify-center px-4 pt-24 pb-12">
      <div className="w-full max-w-[900px] p-4 md:p-6">
        <PageHeader
          title="My Orders"
          subtitle={ordersCount > 0 ? `${ordersCount} ${ordersCount === 1 ? 'order' : 'orders'} ${userData.role === "user" ? "placed" : "received"}` : null}
          rightContent={
            <div className="flex items-center gap-3">
              {ordersCount > 0 && (
                <div className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] font-bold text-lg shadow-md">
                  {ordersCount}
                </div>
              )}
              {userData.role === "user" && (
                <button
                  onClick={() => setShowComplaintForm(true)}
                  className="flex items-center gap-2 text-sm text-[#ff4d2d] border border-[#ff4d2d] px-4 py-2 rounded-full hover:bg-[#ff4d2d]/5 transition-colors font-medium"
                >
                  <FaExclamationTriangle size={13} />
                  Report Issue
                </button>
              )}
            </div>
          }
        />

        {/* Filter tabs — users only */}
        {userData.role === "user" && ordersCount > 0 && (
          <div className="flex gap-2 mb-6 flex-wrap">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "bg-[#ff4d2d] text-white shadow"
                    : "bg-white text-gray-600 border border-gray-200 hover:border-[#ff4d2d]/40"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Orders List */}
        <div className="space-y-6 md:space-y-8">
            {filteredOrders && filteredOrders.length > 0 ? (
                <>
                  {filteredOrders.map((order,index) =>(
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
      {showComplaintForm && (
        <ComplaintForm onClose={() => setShowComplaintForm(false)} />
      )}
    </div>
  );
};

export default MyOrders;
