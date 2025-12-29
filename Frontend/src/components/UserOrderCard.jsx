import moment from 'moment'
import React, { useState, useMemo } from 'react'
import ButtonSquare from './ButtonSquare'
import StatusBadge from './StatusBadge'
import { useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { openSnackbar } from '../redux/snackbarSlice'
import ItemAPI from "../../services/item"
import { FaStore, FaRupeeSign, FaStar } from 'react-icons/fa'
import { HiReceiptRefund } from 'react-icons/hi'
import { MdPayment, MdDeliveryDining } from 'react-icons/md'

const UserOrderCard = ({ data }) => {
    const [selectedRating, setSelectedRating] = useState({})
    const navigate = useNavigate()
  const dispatch = useDispatch()

  // Calculate items total and delivery fee
  const { itemsTotal, deliveryFee } = useMemo(() => {
    const total = data.shopOrders?.reduce((sum, shopOrder) => sum + (shopOrder.subTotal || 0), 0) || 0
    const fee = total > 500 ? 0 : 40
    return { itemsTotal: total, deliveryFee: fee }
  }, [data.shopOrders])

  const handleRating = async (itemId, rating) => {
      try {
      const result = await ItemAPI.rating({ itemId, rating })
        if (result.ok) {
        setSelectedRating(prev => ({ ...prev, [itemId]: rating }))
        // dispatch(openSnackbar("Rating submitted successfully", "success"))
        } else {
        dispatch(openSnackbar(result.data?.message || "Failed to submit rating", "error"))
        }
      } catch (err) {
      console.error(err)
      dispatch(openSnackbar(err.message || "Something went wrong", "error"))
      }
    }

  const getPaymentStatus = () => {
    if (data.paymentMethod === "cod") {
      return { text: "Cash on Delivery", icon: HiReceiptRefund, color: "text-orange-600" }
    }
    return {
      text: data.payment ? "Paid" : "Pending",
      icon: MdPayment,
      color: data.payment ? "text-green-600" : "text-yellow-600"
    }
  }

  const paymentInfo = getPaymentStatus()
  const PaymentIcon = paymentInfo.icon

  return (
    <div className='bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-xl transition-shadow duration-300'>
      {/* Header Section */}
      <div className='bg-gradient-to-r from-[#fff9f6] to-white px-6 py-4 border-b border-gray-200'>
        <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4'>
          <div className='space-y-1'>
            <div className='flex items-center gap-2'>
              <span className='text-xs font-medium text-gray-500 uppercase tracking-wider'>Order</span>
              <span className='font-bold text-lg text-gray-900'>#{data._id.slice(-8).toUpperCase()}</span>
            </div>
            <div className='flex items-center gap-2 text-sm text-gray-600'>
              <span className='font-medium'>{moment(data.createdAt).format('MMM DD, YYYY')}</span>
              <span className='text-gray-400'>•</span>
              <span>{moment(data.createdAt).format('hh:mm A')}</span>
            </div>
          </div>
          <div className='flex flex-col sm:items-end gap-2'>
            <div className='flex items-center gap-2 text-sm'>
              <PaymentIcon className={`${paymentInfo.color} text-base`} />
              <span className={`font-medium ${paymentInfo.color}`}>{paymentInfo.text}</span>
        </div>
            {data.shopOrders?.[0] && (
              <StatusBadge status={data.shopOrders[0].status} />
            )}
          </div>
        </div>
      </div>

      {/* Shop Orders Section */}
      <div className='p-6 space-y-4'>
        {data.shopOrders?.map((shopOrder, shopIndex) => (
          <div
            key={shopIndex}
            className='border-2 border-gray-100 rounded-xl p-4 bg-gradient-to-br from-[#fffaf7] to-white space-y-4 hover:border-[#ff4d2d]/20 transition-colors duration-200'
          >
            {/* Shop Header */}
            <div className='flex items-center justify-between pb-3 border-b border-gray-200'>
              <div className='flex items-center gap-3'>
                <div className='p-2 bg-[#ff4d2d]/10 rounded-lg'>
                  <FaStore className='text-[#ff4d2d] text-lg' />
                </div>
                <div>
                  <h3 className='font-bold text-gray-900 text-lg'>{shopOrder.shop.name}</h3>
                  <p className='text-xs text-gray-500'>Shop Order</p>
                </div>
              </div>
              <StatusBadge status={shopOrder.status} showIcon={false} />
            </div>

            {/* Items Grid */}
            <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3'>
              {shopOrder.shopOrderItems?.map((item, itemIndex) => (
                <div
                  key={itemIndex}
                  className='bg-white border border-gray-200 rounded-lg p-3 hover:shadow-md transition-shadow duration-200 group'
                >
                  <div className='relative overflow-hidden rounded-lg mb-2'>
                    <img
                      src={item.item.image}
                      alt={item.name}
                      className='w-full h-28 object-cover group-hover:scale-105 transition-transform duration-300'
                    />
                  </div>
                  <div className='space-y-1'>
                    <h4 className='text-sm font-semibold text-gray-900 line-clamp-2 min-h-[2.5rem]'>
                      {item.name}
                    </h4>
                    <div className='flex items-center justify-between text-xs text-gray-600'>
                      <span>Qty: {item.quantity}</span>
                      <span className='font-medium'>× ₹{item.price}</span>
                    </div>
                    <div className='flex items-center gap-1 text-sm font-bold text-gray-900 pt-1'>
                      <FaRupeeSign className='text-xs' />
                      <span>{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Rating Section */}
                  {shopOrder.status === "delivered" && (
                    <div className='mt-3 pt-3 border-t border-gray-100'>
                      <p className='text-xs font-medium text-gray-600 mb-2'>Rate this item:</p>
                      <div className='flex items-center gap-1'>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => handleRating(item.item._id, star)}
                            className={`transition-all duration-200 hover:scale-110 ${
                              selectedRating[item.item._id] >= star
                                ? "text-yellow-400"
                                : "text-gray-300 hover:text-yellow-300"
                            }`}
                            aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                          >
                            <FaStar className='text-base' />
                          </button>
                                ))}
                            </div>
                    </div>
                  )}
                </div>
                ))}
            </div>

            {/* Shop Order Footer */}
            <div className='flex items-center justify-between pt-3 border-t border-gray-200'>
              <div className='flex items-center gap-2'>
                <span className='text-sm text-gray-600'>Subtotal:</span>
                <span className='text-lg font-bold text-gray-900 flex items-center gap-1'>
                  <FaRupeeSign className='text-sm' />
                  {shopOrder.subTotal?.toFixed(2)}
                </span>
              </div>
              <StatusBadge status={shopOrder.status} />
            </div>
        </div>
      ))}
      </div>

      {/* Footer Section */}
      <div className='bg-gradient-to-r from-gray-50 to-white px-6 py-4 border-t border-gray-200'>
        {/* Price Breakdown */}
        <div className='space-y-2 mb-4 pb-4 border-b border-gray-200'>
          <div className='flex items-center justify-between text-sm'>
            <span className='text-gray-600'>Items Total:</span>
            <span className='font-medium text-gray-900 flex items-center gap-1'>
              <FaRupeeSign className='text-xs' />
              {itemsTotal.toFixed(2)}
            </span>
          </div>
          <div className='flex items-center justify-between text-sm'>
            <div className='flex items-center gap-2 text-gray-600'>
              <MdDeliveryDining className={`text-base ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-600'}`} />
              <span>Delivery Fee:</span>
            </div>
            <span className={`font-medium flex items-center gap-1 ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
              {deliveryFee === 0 ? (
                <span className='font-semibold'>Free</span>
              ) : (
                <>
                  <FaRupeeSign className='text-xs' />
                  {deliveryFee.toFixed(2)}
                </>
              )}
            </span>
          </div>
        </div>

        {/* Total and Track Button */}
        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4'>
          <div className='flex items-center gap-2'>
            <span className='text-base font-semibold text-gray-700'>Total Amount:</span>
            <span className='text-2xl font-bold text-[#ff4d2d] flex items-center gap-1'>
              <FaRupeeSign className='text-xl' />
              {data.totalAmount?.toFixed(2)}
            </span>
          </div>
          <ButtonSquare
            onClick={() => navigate(`/track-order/${data._id}`)}
            className='px-6 py-2.5 shadow-md hover:shadow-lg'
          >
            Track Order
          </ButtonSquare>
        </div>
      </div>
    </div>
  )
}

export default UserOrderCard
