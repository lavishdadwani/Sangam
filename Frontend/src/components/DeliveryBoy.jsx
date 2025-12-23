import React, { useEffect, useState } from "react";
import Nav from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import orderAPI from "../../services/order";
import { openSnackbar } from "../redux/snackbarSlice";
import ButtonSquare from "./ButtonSquare";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import AnimatedCard from "./AnimatedCard";
import LoadingMessage from "./LoadingMessage";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { FaMapMarkerAlt, FaShoppingBag, FaRupeeSign, FaCheckCircle, FaClock, FaTruck, FaUser, FaStore } from "react-icons/fa";
import { MdDeliveryDining, MdLocationOn, MdAttachMoney } from "react-icons/md";
import { HiOutlineClipboardCheck } from "react-icons/hi";
const DeliveryBoy = () => {
  const { userData, socket } = useSelector((state) => state.user);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState();
  const [otp, setOtp] = useState();
  const [showOTPBox, setShowOTPBox] = useState(false);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
  const [acceptingOrderId, setAcceptingOrderId] = useState(null);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {

    if(!socket || userData.role !== "deliveryBoy") return
    let watchId;
    if(navigator.geolocation){
       watchId = navigator.geolocation.watchPosition( position =>{
            const latitude = position.coords.latitude
            const longitude = position.coords.longitude
            setDeliveryBoyLocation({lat:latitude,lng:longitude})
            socket.emit("updateLocation", {
                latitude,
                longitude,
                userId:userData._id
            })
        }),
        (error) =>{
            console.log(error);
        },
        {
            enableHighAccuracy:true
        }
    }
    return () => {
        if(watchId)navigator.geolocation.clearWatch(watchId)
    }
  }, [socket, userData]);


  const getAssignment = async (req, res) => {
    try {
      const result = await orderAPI.getAssignments();

      if (result.ok) {
        setAvailableAssignments(result.data.data);
        //   dispatch(openSnackbar("fetched assignment successfully", "success"));
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to fetch assignment",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    }
  };

  const getCurrentOrder = async () => {
    try {
      const result = await orderAPI.getCurrentOrder();

      if (result.ok) {
        setCurrentOrder(result.data.data);
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to accept order",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    }
  };

  useEffect(() => {
      handleTodayDeliveries()
    getAssignment();
    getCurrentOrder();
  }, [userData]);

  const acceptOrder = async (assignmentId) => {
    try {
      setAcceptingOrderId(assignmentId);
      const result = await orderAPI.acceptOrder(assignmentId);

      if (result.ok) {
        // Immediately remove from available assignments for better UX
        setAvailableAssignments(prev => prev.filter(a => a.assignmentId !== assignmentId));
        
        dispatch(
          openSnackbar(
            result.data.message || "Order accepted successfully",
            "success"
          )
        );
        // Refresh current order and available assignments
        await Promise.all([
          getCurrentOrder(),
          getAssignment()
        ]);
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to accept order",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    } finally {
      setAcceptingOrderId(null);
    }
  };

  const sendOtp = async () => {
    try {
      setSendingOtp(true);
      const result = await orderAPI.sendOtp({orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id});
      if (result.ok) {
        setShowOTPBox(true);
        dispatch(
          openSnackbar(
            result.data.message || "OTP sent successfully",
            "success"
          )
        );
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to send OTP",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    } finally {
      setSendingOtp(false);
    }
  };
  const verifyOtp = async () => {
    try {
      setVerifyingOtp(true);
      const result = await orderAPI.verifyOtp({orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp});
      if (result.ok) {
        dispatch(
          openSnackbar(
            result.data.message || "Order delivered successfully",
            "success"
          )
        );
        // Reset states and refresh data
        setShowOTPBox(false);
        setOtp("");
        setCurrentOrder(null);
        // Refresh available assignments and today's deliveries
        await Promise.all([
          getAssignment(),
          handleTodayDeliveries()
        ]);
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to verify OTP",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    } finally {
      setVerifyingOtp(false);
    }
  };

  const handleTodayDeliveries = async () => {
    try {
      const result = await orderAPI.todaysDeliveries();
      if (result.ok) {
        setTodayDeliveries(result.data?.data)
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to accept order",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    }
  };
useEffect(() => {
  if (socket) {
    socket.on("newAssignment", (data) => {
      console.log({data});
      if(data.sentTo === userData._id){
        setAvailableAssignments(prev => [...prev, data]);
      }
    });
    return () => {
      socket.off("newAssignment");
    };
  }
}, [socket, userData._id]);

const ratePerDelivery = 40
const totalEarning = todayDeliveries?.reduce((sum,d) => sum +d.count * ratePerDelivery, 0)

const isLoading = acceptingOrderId !== null || verifyingOtp || sendingOtp;

const getLoadingMessage = () => {
  if (acceptingOrderId) return "Accepting order...";
  if (sendingOtp) return "Sending OTP...";
  if (verifyingOtp) return "Verifying OTP...";
  return "Processing...";
};

  return (
    <div className="w-screen min-h-screen flex flex-col gap-6 items-center bg-[#fff9f6] overflow-y-auto pb-12 relative">
      {/* Loading Overlay */}
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
          <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm mx-4 border-2 border-[#ff4d2d]/20">
            <LoadingMessage
              message={getLoadingMessage()}
              show={true}
              size={50}
              color="#ff4d2d"
              layout="col"
            />
          </div>
        </div>
      )}
      
      <Nav userData={userData} />
      <div className="w-full max-w-[900px] flex flex-col gap-6 items-center mt-[80px] px-4">
        {/* Welcome Card */}
        <AnimatedCard index={0} delay={100} className="w-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-col md:flex-row justify-between items-center gap-4 border border-orange-100">
            <div className="flex items-center gap-4">
              <div className="bg-[#ff4d2d]/10 p-4 rounded-full">
                <MdDeliveryDining className="text-[#ff4d2d] text-3xl" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-[#ff4d2d] mb-1">
                  Welcome, {userData.fullName}
                </h1>
                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <MdLocationOn className="text-[#ff4d2d]" />
                    <span className="font-medium">Lat:</span>
                    <span>{deliveryBoyLocation?.lat?.toFixed(6) || userData.location?.coordinates?.[1]?.toFixed(6) || "N/A"}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MdLocationOn className="text-[#ff4d2d]" />
                    <span className="font-medium">Lng:</span>
                    <span>{deliveryBoyLocation?.lng?.toFixed(6) || userData.location?.coordinates?.[0]?.toFixed(6) || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-green-700">Online</span>
            </div>
          </div>
        </AnimatedCard>

        {/* Dashboard Stats */}
        <AnimatedCard index={1} delay={100} className="w-full">
          <div className="bg-white rounded-2xl shadow-lg p-6 w-full border border-orange-100">
            <div className="flex items-center gap-2 mb-6">
              <FaTruck className="text-[#ff4d2d] text-xl" />
              <h1 className="text-xl font-bold text-[#ff4d2d]">Today's Deliveries</h1>
            </div>
            <ResponsiveContainer width={"100%"} height={200}>
              <BarChart data={todayDeliveries}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="hour" 
                  tickFormatter={(h) => `${h}:00`}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  dataKey="count" 
                  allowDecimals={false}
                  stroke="#6b7280"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  formatter={(value) => [value, "Orders"]} 
                  labelFormatter={label => `${label}:00`}
                  contentStyle={{ 
                    backgroundColor: '#fff', 
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px'
                  }}
                />
                <Bar dataKey="count" fill="#ff4d2d" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
            <div className="max-w-sm mx-auto mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-md text-center border border-green-200">
              <div className="flex items-center justify-center gap-2 mb-2">
                <MdAttachMoney className="text-green-600 text-2xl" />
                <h2 className="text-lg font-semibold text-gray-800">
                  Today's Earnings
                </h2>
              </div>
              <span className="text-4xl font-bold text-green-600">₹{totalEarning || 0}</span>
              <p className="text-xs text-gray-500 mt-2">₹{ratePerDelivery} per delivery</p>
            </div>
          </div>
        </AnimatedCard>

        {/* Available Orders or Current Order */}
        {!currentOrder ? (
          <AnimatedCard index={2} delay={100} className="w-full">
            <div className="bg-white rounded-2xl p-6 shadow-lg w-full border border-orange-100">
              <div className="flex items-center gap-2 mb-6">
                <HiOutlineClipboardCheck className="text-[#ff4d2d] text-xl" />
                <h1 className="text-xl font-bold text-gray-800">Available Orders</h1>
              </div>
              <div className="space-y-4">
                {availableAssignments?.length > 0 ? (
                  availableAssignments.map((a, index) => (
                    <AnimatedCard
                      key={a.assignmentId || index}
                      index={index}
                      delay={80}
                      className="border-2 border-gray-200 rounded-xl p-5 hover:border-[#ff4d2d] transition-all duration-300 hover:shadow-md"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center gap-2">
                            <FaStore className="text-[#ff4d2d] text-sm" />
                            <p className="text-base font-bold text-gray-800">{a.shopName}</p>
                          </div>
                          <div className="flex items-start gap-2">
                            <FaMapMarkerAlt className="text-gray-400 text-sm mt-1 flex-shrink-0" />
                            <p className="text-sm text-gray-600 leading-relaxed">
                              {a.deliveryAddress?.text}
                            </p>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <div className="flex items-center gap-1">
                              <FaShoppingBag className="text-gray-400" />
                              <span>{a.items?.length || 0} items</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FaRupeeSign className="text-gray-400" />
                              <span className="font-semibold">{a.subTotal}</span>
                            </div>
                          </div>
                        </div>
                        <ButtonSquare
                          styleType="default"
                          className="px-6 py-2.5 shadow-md hover:shadow-lg"
                          onClick={() => acceptOrder(a.assignmentId)}
                          loading={acceptingOrderId === a.assignmentId}
                          loadingMessage="Accepting order..."
                          disabled={acceptingOrderId !== null}
                        >
                          Accept Order
                        </ButtonSquare>
                      </div>
                    </AnimatedCard>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="bg-gray-50 rounded-full p-6 w-24 h-24 mx-auto mb-4 flex items-center justify-center">
                      <HiOutlineClipboardCheck className="text-gray-400 text-4xl" />
                    </div>
                    <p className="text-gray-500 font-medium">No Available Orders</p>
                    <p className="text-sm text-gray-400 mt-2">New orders will appear here when available</p>
                  </div>
                )}
              </div>
            </div>
          </AnimatedCard>
        ) : (
          <AnimatedCard index={2} delay={100} className="w-full">
            <div className="bg-white rounded-2xl p-6 shadow-lg w-full border border-orange-100">
              <div className="flex items-center gap-2 mb-6">
                <FaTruck className="text-[#ff4d2d] text-xl animate-bounce" style={{ animationDuration: '2s' }} />
                <h2 className="text-xl font-bold text-gray-800">Current Order</h2>
              </div>
              
              {/* Order Details Card */}
              <div className="border-2 border-[#ff4d2d]/20 rounded-xl p-5 mb-4 bg-gradient-to-br from-orange-50 to-white">
                <div className="flex items-center gap-2 mb-3">
                  <FaStore className="text-[#ff4d2d]" />
                  <p className="font-bold text-lg text-gray-800">{currentOrder.shop?.name}</p>
                </div>
                <div className="space-y-2 mb-3">
                  <div className="flex items-start gap-2">
                    <FaMapMarkerAlt className="text-gray-500 text-sm mt-1 flex-shrink-0" />
                    <p className="text-sm text-gray-700">{currentOrder.deliveryAddress?.text}</p>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-gray-600">
                      <FaShoppingBag className="text-gray-400" />
                      <span>{currentOrder.shopOrder?.shopOrderItems?.length || 0} items</span>
                    </div>
                    <div className="flex items-center gap-1 text-gray-600">
                      <FaRupeeSign className="text-gray-400" />
                      <span className="font-semibold">₹{currentOrder.shopOrder?.subTotal}</span>
                    </div>
                  </div>
                </div>
                {currentOrder.user && (
                  <div className="flex items-center gap-2 pt-3 border-t border-gray-200">
                    <FaUser className="text-gray-500" />
                    <span className="text-sm text-gray-600">
                      <span className="font-semibold">Customer:</span> {currentOrder.user.fullName}
                    </span>
                  </div>
                )}
              </div>

              {/* Map */}
              <div className="h-[400px] w-full rounded-xl overflow-hidden shadow-lg border border-gray-200 mb-4">
                <DeliveryBoyTracking 
                  data={{
                    deliveryBoyLocation: deliveryBoyLocation || { 
                      lat: userData.location?.coordinates?.[1], 
                      lng: userData.location?.coordinates?.[0] 
                    },
                    customerLocation: { 
                      lat: currentOrder.deliveryAddress?.latitude, 
                      lng: currentOrder.deliveryAddress?.longitude 
                    },
                  }} 
                />
              </div>

              {/* OTP Section */}
              {!showOTPBox ? (
                <ButtonSquare 
                  styleType="success"
                  className="w-full py-3.5 text-lg font-semibold shadow-lg hover:shadow-xl"
                  onClick={sendOtp}
                  loading={sendingOtp}
                  loadingMessage="Sending OTP..."
                  disabled={sendingOtp}
                >
                  <div className="flex items-center justify-center gap-2">
                    <FaCheckCircle />
                    <span>Mark As Delivered</span>
                  </div>
                </ButtonSquare>
              ) : (
                <div className="w-full p-5 border-2 border-[#ff4d2d]/20 rounded-xl bg-gradient-to-br from-orange-50 to-white">
                  <div className="flex items-center gap-2 mb-4">
                    <FaClock className="text-[#ff4d2d]" />
                    <p className="text-sm font-semibold text-gray-800">
                      Enter OTP sent to <span className="text-[#ff4d2d] font-bold">{currentOrder.user?.fullName}</span>
                    </p>
                  </div>
                  <input 
                    type="text" 
                    className="w-full border-2 border-gray-300 px-4 py-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:border-transparent transition-all text-center text-lg font-semibold tracking-widest" 
                    placeholder="Enter 4-digit OTP" 
                    maxLength={4}
                    onChange={(e) => setOtp(e.target.value)}
                    value={otp}
                    disabled={verifyingOtp}
                  />
                  <ButtonSquare 
                    styleType="default"
                    className="w-full py-3 text-lg font-semibold shadow-md hover:shadow-lg"
                    onClick={verifyOtp}
                    loading={verifyingOtp}
                    loadingMessage="Verifying OTP..."
                    disabled={verifyingOtp || !otp || otp.length !== 4}
                  >
                    Verify & Complete Delivery
                  </ButtonSquare>
                </div>
              )}
            </div>
          </AnimatedCard>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoy;
