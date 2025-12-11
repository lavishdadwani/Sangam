import React, { useState } from 'react'
import { MdPhone } from 'react-icons/md'
import OrderAPI from "../../services/order"
import { useDispatch } from 'react-redux'
import { openSnackbar } from '../redux/snackbarSlice'
import { updateOrderStatus } from '../redux/userSlice'
const OwnerOrderCard = ({data}) => {
    const dispatch = useDispatch()
    const [availableBoys, setAvailableBoys] = useState([])
    const  handleUpdateStatus = async (orderId,shopId,status) => {
      try {
        const result = await OrderAPI.updateStatus(orderId,shopId,status);
    
        if (result.ok) {
          dispatch(updateOrderStatus(orderId,shopId,status));
          setAvailableBoys(result.data.data.availableBoys)
          dispatch(openSnackbar("Status Changed Successfully", "success"));
        } else {
          dispatch(openSnackbar(result.data?.message || "Status Changed Successfully", "error"));
        }
    
      } catch (err) {
        console.error(err);
        dispatch(openSnackbar(err.message, "error"));
      }
    }
    const onUpdateStatusChange = (e) =>{
        const status = e.target.value
        handleUpdateStatus(data._id,data.shopOrders.shop._id,status)
    }
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
        <div>
            <h2 className='text-lg text-gray-800 font-semibold'>{data?.user.fullName}</h2>
            <p className='text-sm text-gray-500'>{data?.user.email}</p>
            <p className='flex items-center gap-2 text-sm text-gray-600 mt-1'> <MdPhone /> <span>{data?.user.mobile}</span></p>
        </div>
        <div className='flex items-start flex-col gap-2 text-gray-600 text-sm'>
            <p>{data?.deliveryAddress.text}</p>
            <p className='text-sm test-gray-500'> Lat:{data?.deliveryAddress?.latitude} , Lon: {data?.deliveryAddress?.longitude}</p>
        </div>
        <div className='flex space-x-4 overflow-x-auto pb-2'>
                {data.shopOrders.shopOrderItems.map((item,index) => (
                    <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                        <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded'/>
                        <p className='text-sm font-semibold mt-1'>{item.name}</p>
                        <p className='text-xs text-gray-500'>Qty:{item.quantity} X  ₹{item.price}</p>

                    </div>

                ))}
            </div>
            <div className='flex justify-between items-center mt-auto pt-3 border-t border-gray-100'>
                <span className='text-sm'> status: <span className='font-semibold capitalize text-[#ff4d2d]'>{data.shopOrders.status}</span></span>
                <select name="" id="" className='rounded-md border px-3 py-1 text-sm focus:outline-none focus:ring-2 border-[#ff4d2d] text-[#ff4d2d]' onChange={onUpdateStatusChange} >
                    <option value="">Change</option>
                    <option value="pending">Pending</option>
                    <option value="preparing">Preparing</option>
                    <option value="out for delivery">Out Of Delivery</option>
                    
                </select>
            </div>

            {data.shopOrders.status == "out for delivery" && (
                <div className='mt-3 p-2 border rounded-lg text-sm bg-orange-50'>
                    <p>Available Delivery Boys:</p>
                    {availableBoys.length > 0 ? (
                        availableBoys.map((boy,index) =>(
                            <div className='text-gray-300'>{boy.fullName}-{boy.mobile}</div>
                        ))
                    ) : (
                        <div>Waiting for the delivery boy to accept the order. </div>
                    )}
                </div>
            )}
            <div className='text-right font-bold text-gray-800 text-sm'>
                Total: ₹{data.shopOrders.subTotal}
            </div>
    </div>
  )
}

export default OwnerOrderCard
