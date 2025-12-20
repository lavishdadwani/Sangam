import React, { useEffect, useState } from "react";
import Nav from "./Navbar";
import { useDispatch, useSelector } from "react-redux";
import orderAPI from "../../services/order";
import { openSnackbar } from "../redux/snackbarSlice";
import ButtonSquare from "./ButtonSquare";
import DeliveryBoyTracking from "./DeliveryBoyTracking";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
const DeliveryBoy = () => {
  const { userData, socket } = useSelector((state) => state.user);
  const [availableAssignments, setAvailableAssignments] = useState([]);
  const [currentOrder, setCurrentOrder] = useState();
  const [otp, setOtp] = useState();
  const [showOTPBox, setShowOTPBox] = useState(false);
  const [deliveryBoyLocation, setDeliveryBoyLocation] = useState(null);
  const [todayDeliveries, setTodayDeliveries] = useState([]);
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
      const result = await orderAPI.acceptOrder(assignmentId);

      if (result.ok) {
        //   dispatch(setUserData(result.data.data));
        dispatch(
          openSnackbar(
            result.data.message || "Order accepted successfully2",
            "success"
          )
        );
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

  const sendOtp = async () => {
    try {
      const result = await orderAPI.sendOtp({orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id});
      if (result.ok) {
        setShowOTPBox(true)
        dispatch(
          openSnackbar(
            result.data.message || "Order accepted successfully2",
            "success"
          )
        );
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
  const verifyOtp = async () => {
    try {
      const result = await orderAPI.verifyOtp({orderId:currentOrder._id,shopOrderId:currentOrder.shopOrder._id,otp});
      if (result.ok) {
        dispatch(
          openSnackbar(
            result.data.message || "Order accepted successfully2",
            "success"
          )
        );
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
  socket?.on("newAssignment", (data) =>{
      console.log({data});
    if(data.sentTo == userData._id){
        setAvailableAssignments(prev =>[...prev,data])
    }
  })
  return () =>{
    socket?.off("newAssignment")
  }
}, [socket]);

const ratePerDelivery = 50
const totalEarning = todayDeliveries?.reduce((sum,d) => sum +d.count * ratePerDelivery, 0)

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav userData={userData} />
      <div className="w-full max-w-[800px] flex flex-col gap-5 items-center mt-[80px]">
        <div className="bg-white rounded-2xl shadow-md p-5 flex flex-col justify-start items-center w-[90%] border border-orange-100 text-center gap-2">
          <h1 className="text-xl font-bold text-[#ff4d2d]">
            Welcome, {userData.fullName}
          </h1>
          <p className="text-[#ff4d2d]">
            {" "}
            <span className="font-semibold">Latitude:</span>{" "}
            {deliveryBoyLocation?.lat || userData.location.coordinates[1]} <span>Longitude:</span>{" "}
            {deliveryBoyLocation?.lng || userData.location.coordinates[0]}
          </p>
        </div>
        {/* Dashboard */}
        <div className="bg-white rounded-2xl shadow-md p-5 w-[90%] mb-6 border border-orange-100">
            <h1 className="text-lg font-bold mb-3 text-[#ff4d2d]">Today Deliveries</h1>
            <ResponsiveContainer width={"100%"} height={"200"}>
                <BarChart data={todayDeliveries}>
                    <CartesianGrid strokeDasharray={"3 3"} />
                    <XAxis dataKey="hour" tickFormatter={(h) => `${h}:00`} />
                    <YAxis dataKey="count" allowDecimals={false} />
                    <Tooltip formatter={(value) => [value, "order"]} labelFormatter={label => `${label}:00`} />
                    <Bar dataKey="count" fill="#ff4d2d" />
                </BarChart>
            </ResponsiveContainer>
            <div className="max-w-sm mx-auto mt-6 p-6 bg-white rounded-2xl shadow-lg text-center">
                <h1 className="text-xl font-semibold text-gray-800 mb-2">
                    Todays Earning
                </h1>
                <span className="text-3xl font-bold text-green-600">{totalEarning}</span>
            </div>
        </div>
       {!currentOrder ? ( <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
          <h1 className="text-lg font-bold mb-4 flex items-center gap-2">
            Available Orders
          </h1>
          <div className="space-y-4">
            {availableAssignments?.length > 0 ? (
              availableAssignments.map((a, index) => (
                <div
                  className="border rounded-lg p-4 flex justify-between items-center"
                  key={index}
                >
                  <div>
                    <p className="text-sm font-semibold">{a.shopName}</p>
                    <p className="text-sm text-gray-500">
                      <span className="font-semibold">Delivery Address:</span>{" "}
                      {a.deliveryAddress.text}
                    </p>
                    <p className="text-sm text-gray-400">
                      {a.items.length} items | {a.subTotal}
                    </p>
                  </div>
                  <ButtonSquare
                    className="px-4 py-1"
                    onClick={() => acceptOrder(a.assignmentId)}
                  >
                    Accept
                  </ButtonSquare>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-sm"> No Available Orders</p>
            )}
          </div>
        </div>):(
            <div className="bg-white rounded-2xl p-5 shadow-md w-[90%] border border-orange-100">
                <h2 className="text-lg font-bold mb-3">Current Order</h2>
                <div className="border rounded-lg p-4 mb-3">
                    <p className="font-semibold text-sm">{currentOrder.shop.name}</p>
                    <p className="text-sm text-gray-500">{currentOrder.deliveryAddress.text}</p>
                    <p className="text-sm text-gray-400">{currentOrder.shopOrder?.shopOrderItems.length} items | {currentOrder.shopOrder?.subTotal}</p>
                </div>
                <DeliveryBoyTracking data={{
                    deliveryBoyLocation: deliveryBoyLocation || { lat: userData.location.coordinates[1], lng: userData.location.coordinates[0] },
                    customerLocation: { lat: currentOrder.deliveryAddress.latitude, lng: currentOrder.deliveryAddress.longitude },
                }} />
                {!showOTPBox ? (
                    <ButtonSquare className="w-full mt-4 bg-green-500 font-semibold py-2 px-4 rounded-xl shadow-md hover:bg-green-600 active:scale-95 transition-all duration-200" onClick={sendOtp}> Mark As Delivered</ButtonSquare>
                ) : (
                    <div className="w-full mt-4 p-4 border rounded-xl bg-gray-50">
                        <p className="text-sm font-semibold mb-2">Enter Otp send to <span className="text-orange-500">{currentOrder.user.fullName}</span> </p>
                        <input type="text" className="w-full border px-3 py-2 rounded-lg mb-3 focus:outline-none focus:ring-2 focus:ring-orange-400" placeholder="Enter OTP" onChange={(e) => setOtp(e.target.value)} />
                        <ButtonSquare className="w-full bg-orange-500 py-2 hover:bg-orange-600 transition-all" onClick={verifyOtp} >Submit OTP</ButtonSquare>
                    </div>
                )}
            </div>
        )}
      </div>
    </div>
  );
};

export default DeliveryBoy;
