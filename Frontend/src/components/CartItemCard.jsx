import React, { useState } from 'react'
import { FaMinus, FaPlus } from 'react-icons/fa'
import { CiTrash } from 'react-icons/ci'
import { useDispatch } from 'react-redux'
import { removeCartItem, updateQuantity } from '../redux/userSlice'

const CartItemCard = ({data}) => {
const  dispatch = useDispatch()    
    const handleIncrease = (id, currentQuantity) =>{
        console.log(id,currentQuantity);
        dispatch(updateQuantity({id,quantity:currentQuantity +=1}))
      }
      const handleDecrease = (id, currentQuantity) =>{
        dispatch(updateQuantity({id,quantity:currentQuantity -=1}))

      }
  return (
    <div className='flex items-center justify-between bg-white p-4 rounded-xl shadow border'>
        <div className='flex items-center gap-4'>
            <img src={data.image} alt={data.name} className='w-20 h-20 object-cover rounded-lg border' />
            <div>
                <h1 className='font-medium text-gray-800'>
                    {data.name}
                </h1>
                <p className='text-sm text-gray-500'>₹{data.price} x {data.quantity}</p>
                <p className='font-bold text-gray-900'>{data.price * data.quantity}</p>
            </div>
        </div>
        <div className='flex items-center gap-3'>
        <button className='p-2 bg-gray-100 rounded-full cursor-pointer' onClick={()=> handleDecrease(data.id,data.quantity)}> 
            <FaMinus size={12} />
            </button>
            <span>{data.quantity}</span>
            <button className='p-2 bg-gray-100 rounded-full cursor-pointer' onClick={()=> handleIncrease(data.id,data.quantity)}> 
            <FaPlus size={12} />
            </button>
            <button className='p-2 bg-red-100 text-red-600 rounded-full hover:bg-red-200 cursor-pointer' onClick={() => dispatch(removeCartItem(data.id))}>
                <CiTrash size={18} />
            </button>
        </div>
    </div>
  )
}

export default CartItemCard
