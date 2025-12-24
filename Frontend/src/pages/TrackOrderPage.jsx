import React, { useEffect, useState } from "react";
import orderAPI from "../../services/order";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { FaStore, FaShoppingBag, FaMapMarkerAlt, FaUser, FaPhone, FaTruck } from "react-icons/fa";
import { MdDeliveryDining } from "react-icons/md";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
import PageHeader from "../components/PageHeader";
import StatusBadge from "../components/StatusBadge";
import AnimatedCard from "../components/AnimatedCard";
import { FaClock } from "react-icons/fa6";
const TrackOrderPage = () => {
    const {socket} = useSelector(state => state.user)
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { orderId } = useParams();
  const [currentOrder, setCurrentOrder] = useState();
  const [liveLocation, setLiveLocation] = useState({});
  useEffect(() => {
    fetchOrderById(orderId);
  }, [orderId]);
  const fetchOrderById = async (orderId) => {
    try {
      const result = await orderAPI.getOrderByID(orderId);

      if (result.ok) {
        setCurrentOrder(result.data.data);
      } else {
        dispatch(
          openSnackbar(result.data?.message || "Failed to fetch order", "error")
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    }
  };

  useEffect(() => {
    if (socket) {
      socket.on("updateDeliveryLocation", ({deliveryBoyId, latitude, longitude}) => {
        setLiveLocation(prev => ({...prev, [deliveryBoyId]: {lat: latitude, lng: longitude}}));
      });
      return () => {
        socket.off("updateDeliveryLocation");
      };
    }
  }, [socket]);

  return (
    <div className="min-h-screen bg-[#fff9f6] pt-24 pb-12">
      <div className="max-w-4xl mx-auto px-4 md:px-6">
        <PageHeader
          title="Track Order"
          icon={MdDeliveryDining}
        />

        {/* Order Cards */}
        <div className="flex flex-col gap-6 md:gap-8">
          {currentOrder?.shopOrders?.map((shopOrder, index) => (
            <AnimatedCard
              key={index}
              index={index}
              delay={150}
              className="bg-white p-6 md:p-8 rounded-2xl shadow-lg border border-orange-100 space-y-6 transform transition-all duration-300 hover:shadow-xl"
            >
              {/* Shop Header */}
              <div className="flex items-start justify-between border-b border-gray-200 pb-4">
                <div className="flex items-center gap-3">
                  <div className="bg-[#ff4d2d]/10 p-3 rounded-full">
                    <FaStore className="text-[#ff4d2d] text-xl" />
                  </div>
                  <div>
                    <p className="text-xl md:text-2xl font-bold text-gray-800">{shopOrder.shop.name}</p>
                    <div className="mt-2">
                      <StatusBadge status={shopOrder.status} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-700">
                  <FaShoppingBag className="text-[#ff4d2d] flex-shrink-0" />
                  <span className="font-semibold">Items:</span>
                </div>
                <div className="pl-8 flex flex-wrap gap-2">
                  {shopOrder.shopOrderItems?.map((item, idx) => (
                    <span 
                      key={idx}
                      className="inline-block bg-gray-50 px-3 py-1 rounded-lg text-sm text-gray-700 border border-gray-200"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Order Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-[#ff4d2d]/10 p-2 rounded-full mt-0.5">
                    <FaShoppingBag className="text-[#ff4d2d] text-sm" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500 font-medium">Subtotal</p>
                    <p className="text-lg font-bold text-gray-800">₹{shopOrder.subTotal}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="bg-[#ff4d2d]/10 p-2 rounded-full mt-0.5">
                    <FaMapMarkerAlt className="text-[#ff4d2d] text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs text-gray-500 font-medium mb-1">Delivery Address</p>
                    <p className="text-sm text-gray-700 leading-relaxed">{currentOrder?.deliveryAddress?.text}</p>
                  </div>
                </div>
              </div>

              {/* Delivery Boy Info */}
              {shopOrder.status !== "delivered" ? (
                <>
                  {shopOrder.assignedDeliveryBoy ? (
                    <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                      <div className="flex items-center gap-2 text-blue-700 font-semibold mb-2">
                        <FaTruck className="text-blue-600 animate-bounce" style={{ animationDuration: '2s' }} />
                        <span>Delivery Boy Assigned</span>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full">
                            <FaUser className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Name</p>
                            <p className="font-semibold text-gray-800">{shopOrder.assignedDeliveryBoy.fullName}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="bg-white p-2 rounded-full">
                            <FaPhone className="text-blue-600" />
                          </div>
                          <div>
                            <p className="text-xs text-gray-500">Contact</p>
                            <a 
                              href={`tel:${shopOrder.assignedDeliveryBoy.mobile}`}
                              className="font-semibold text-blue-600 hover:underline"
                            >
                              {shopOrder.assignedDeliveryBoy.mobile}
                            </a>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 bg-yellow-50 rounded-xl border border-yellow-200 flex items-center gap-3">
                      <FaClock className="text-yellow-600 animate-pulse" />
                      <p className="font-semibold text-yellow-800">
                        Delivery boy is not assigned yet. Please wait...
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-4 bg-green-50 rounded-xl border border-green-200 flex items-center gap-3">
                  <FaCheckCircle className="text-green-600 text-2xl animate-pulse" />
                  <div>
                    <p className="font-bold text-green-800 text-lg">Order Delivered</p>
                    <p className="text-sm text-green-700">Your order has been successfully delivered!</p>
                  </div>
                </div>
              )}

              {/* Map Tracking */}
              {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
                <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-lg border border-gray-200 transform transition-all duration-300 hover:shadow-xl">
                  <DeliveryBoyTracking
                    data={{
                      deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy._id] || { 
                        lat: shopOrder.assignedDeliveryBoy.location?.coordinates?.[1], 
                        lng: shopOrder.assignedDeliveryBoy.location?.coordinates?.[0] 
                      },
                      customerLocation: { 
                        lat: currentOrder.deliveryAddress?.latitude, 
                        lng: currentOrder.deliveryAddress?.longitude 
                      },
                    }}
                  />
                </div>
              )}
            </AnimatedCard>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TrackOrderPage;
