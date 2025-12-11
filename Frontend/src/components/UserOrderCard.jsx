import moment from 'moment'
import React from 'react'
import ButtonSquare from './ButtonSquare'

const UserOrderCard = ({data}) => {
  return (
    <div className='bg-white rounded-lg shadow p-4 space-y-4'>
      <div className='flex justify-between border-b pb-2'>
        <div>
            <p className='font-semibold'>
                order #{data._id.slice(-6)}
            </p>
            <p className='text-sm text-gray-500'>
                Date: {moment(data.createdAt).format('MMM DD, YYYY hh:mm A')}
            </p>
        </div>
        <div className='text-right'>
            <p className='text-sm text-gray-500'>{data.paymentMethod?.toUpperCase()}</p>
            <p className='font-medium text-blue-600'>{data.shopOrders[0].status}</p>
        </div>
      </div>

      {data.shopOrders.map((shopOrder,index)=>(
        <div className='border rounded-lg p-3 bg-[#fffaf7] space-y-3' key={index}>
            <p>{shopOrder.shop.name}</p>
            <div className='flex space-x-4 overflow-x-auto pb-2'>
                {shopOrder.shopOrderItems.map((item,index) => (
                    <div key={index} className='flex-shrink-0 w-40 border rounded-lg p-2 bg-white'>
                        <img src={item.item.image} alt="" className='w-full h-24 object-cover rounded'/>
                        <p className='text-sm font-semibold mt-1'>{item.name}</p>
                        <p className='text-xs text-gray-500'>Qty:{item.quantity} X  ₹{item.price}</p>

                    </div>

                ))}
            </div>
            <div className='flex justify-between items-center border-t pt-2'>
                <p className='font-semibold'>Subtotal: {shopOrder.subTotal}</p>
                <span className='text-sm font-medium text-blue-600'>{shopOrder.status}</span>
            </div>
        </div>
      ))}
      <div className='flex justify-between items-center border-t pt-2'>
        <p className='font-semibold'>Total: {data.totalAmount}</p>
        <ButtonSquare>Track Order </ButtonSquare>
      </div>
    </div>
  )
}

export default UserOrderCard
