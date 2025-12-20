import React, { useState } from "react";
import { MdPhone } from "react-icons/md";
import OrderAPI from "../../services/order";
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import { updateOrderStatus } from "../redux/userSlice";
import { ORDER_STATUSES, getOrderStatusLabel } from "../constants/orderStatus";

const OwnerOrderCard = ({ data }) => {
  const dispatch = useDispatch();
  const [availableBoys, setAvailableBoys] = useState([]);
  const [updating, setUpdating] = useState(false);

  const handleUpdateStatus = async (orderId, shopId, status) => {
    if (!status) return;
    try {
      setUpdating(true);
      const result = await OrderAPI.updateStatus(orderId, shopId, status);

      if (result.ok) {
        setAvailableBoys(result.data.data.availableBoys);
        dispatch(updateOrderStatus({ orderId, shopId, status }));
        console.log(result.data.data.availableBoys);
        dispatch(openSnackbar("Status changed successfully", "success"));
      } else {
        dispatch(
          openSnackbar(
            result.data?.message || "Failed to change status",
            "error"
          )
        );
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    } finally {
      setUpdating(false);
    }
  };

  const onUpdateStatusChange = (e) => {
    const status = e.target.value;
    handleUpdateStatus(data?._id, data?.shopOrders?.shop?._id, status);
  };

  const currentStatusLabel = getOrderStatusLabel(data?.shopOrders?.status);

  return (
    <div className="bg-white rounded-lg shadow p-4 space-y-4">
      <div>
        <h2 className="text-lg text-gray-800 font-semibold">
          {data?.user?.fullName}
        </h2>
        <p className="text-sm text-gray-500">{data?.user?.email}</p>
        <p className="flex items-center gap-2 text-sm text-gray-600 mt-1">
          <MdPhone className="text-gray-500" />{" "}
          <span>{data?.user?.mobile}</span>
        </p>
        {data.paymentMethod == "online" ? (
          <p>Payment: {data.payment ? "True" : "False"}</p>
        ):(
          <p>Payment Method: {data.paymentMethod}</p>
        )}
      </div>

      {/* ADDRESS */}
      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm space-y-1 border border-gray-200">
        <p>{data?.deliveryAddress?.text}</p>
        <p className="text-xs text-gray-500">
          Lat: {data?.deliveryAddress?.latitude} • Lon:{" "}
          {data?.deliveryAddress?.longitude}
        </p>
      </div>

      {/* ORDER ITEMS */}
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {data?.shopOrders?.shopOrderItems?.map((item, index) => (
          <div
            key={`${item?.item?._id || index}-${index}`}
            className="flex-shrink-0 w-44 border rounded-lg p-3 bg-white shadow-sm hover:shadow-md transition"
          >
            <img
              src={item?.item?.image}
              className="w-full h-28 object-cover rounded-md"
            />
            <p className="text-sm font-semibold mt-2">{item?.name}</p>
            <p className="text-xs text-gray-500">
              Qty: {item?.quantity} × ₹{item?.price}
            </p>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
        <span className="text-sm">
          {" "}
          status:{" "}
          <span className="font-semibold capitalize text-[#ff4d2d]">
            {currentStatusLabel}
          </span>
        </span>
        <select
          className="rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]"
          onChange={onUpdateStatusChange}
          disabled={updating}
          defaultValue=""
        >
          <option value="">Change</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

    {/* DELIVERY BOYS */}
    {data?.shopOrders?.status === "out for delivery" && (
      <div className="mt-3 p-4 bg-orange-50 border border-orange-200 rounded-lg shadow-sm text-sm">
        {data.shopOrders.assignedDeliveryBoy ? (<p className="font-medium text-gray-800 mb-2">
          Assigned Delivery Boys:
        </p>) : (
          <p className="font-medium text-gray-800 mb-2">
          Available Delivery Boys:
        </p> 
        )}

        {availableBoys?.length > 0 ? (
          availableBoys.map((boy, index) => (
            <div
              key={boy.id || index}
              className="text-gray-700 flex items-center gap-3 py-1"
            >
              <span className="font-semibold">{boy.fullName}</span>
              <span className="text-sm text-gray-500">{boy.mobile}</span>
            </div>
          ))
        ) : data.shopOrders.assignedDeliveryBoy ? (
          <div>{data.shopOrders.assignedDeliveryBoy.fullName} - {data.shopOrders.assignedDeliveryBoy.mobile}</div>
        ) :(
          <p className="text-gray-600">Waiting for delivery boy to accept.</p>
        )}
      </div>
    )}


      <div className="text-right font-bold text-gray-800 text-sm">
        Total: ₹{data?.shopOrders?.subTotal}
      </div>
    </div>
  );
};

export default OwnerOrderCard;
