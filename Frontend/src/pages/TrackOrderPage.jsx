import React, { useEffect, useState } from "react";
import orderAPI from "../../services/order";
import { openSnackbar } from "../redux/snackbarSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import DeliveryBoyTracking from "../components/DeliveryBoyTracking";
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
    socket.on("updateDeliveryLocation" , ({deliveryBoyId,latitude, longitude}) =>{
        setLiveLocation(prev => ({...prev, [deliveryBoyId]:{lat:latitude,lng:longitude}}))
    })
  }, [socket]);
  return (
    <div className="max-w-4xl mx-auto p-4 flex flex-col gap-6">
      <div
        className="relative flex items-center gap-4 top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
        <h1 className="text-2xl font-bold md:text-center">Track Order</h1>
      </div>
      {currentOrder?.shopOrders?.map((shopOrder, index) => (
        <div
          className="bg-white p-4 rounded-2xl shadow-md border border-orange-100 space-y-4"
          key={index}
        >
          <div>
            <p className="text-lg font-bold mb-2">{shopOrder.shop.name}</p>
            <p className="font-semibold">
              <span>Items:</span>{" "}
              {shopOrder.shopOrderItems?.map((i) => i.name).join(",")}
            </p>
            <p>
              <span className="font-semibold">Subtotal:</span>
              {shopOrder.subTotal}
            </p>
            <p className="mt-6">
              <span className="font-semibold">Delivery Address:</span>
              {currentOrder?.deliveryAddress?.text}
            </p>
          </div>
          {shopOrder.status != "delivered" ? (
            <>
              {shopOrder.assignedDeliveryBoy ? (
                <div className="text-sm text-gray-700">
                  <p className="font-semibold">
                    {" "}
                    <span>Delivery Boy Name:</span>
                    {shopOrder.assignedDeliveryBoy.fullName}
                  </p>
                  <p className="font-semibold">
                    {" "}
                    <span>Delivery Boy Contact No:</span>
                    {shopOrder.assignedDeliveryBoy.mobile}
                  </p>
                </div>
              ) : (
                <p className="font-semibold">
                  Delivery Boy is not assigned yet.
                </p>
              )}
            </>
          ) : (
            <p className="text-green-600 font-semibold text-lg">Delivered</p>
          )}
          {shopOrder.assignedDeliveryBoy && shopOrder.status !== "delivered" && (
            <div className="h-[400px] w-full rounded-2xl overflow-hidden shadow-md">
                <DeliveryBoyTracking
                  data={{
                    deliveryBoyLocation: liveLocation[shopOrder.assignedDeliveryBoy._id] || { lat: shopOrder.assignedDeliveryBoy.location.coordinates[1], lng: shopOrder.assignedDeliveryBoy.location.coordinates[0] },
                    customerLocation: { lat: currentOrder.deliveryAddress.latitude, lng: currentOrder.deliveryAddress.longitude },
                  }}
                />
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TrackOrderPage;
