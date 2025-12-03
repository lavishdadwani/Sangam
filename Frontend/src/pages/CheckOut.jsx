import React from 'react'
import { IoIosArrowRoundBack } from 'react-icons/io'
import { IoLocationSharp } from "react-icons/io5";

const CheckOut = () => {
  return (
    <div className='min-h-screen bg-[#fff9f6] flex items-center justify-center p-6'>
      <div className="absolute top-[20px] left-[20px] z-[10]" onClick={() => navigate("/")}>
            <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
          </div>
          <div className='w-full max-w-[900px] bg-white rounded-2xl shadow-xl p-6 space-y-6'>
            <h1 className='text-2xl font-bold text-gray-800'>Checkout</h1>
            <section >
                <h2 className='text-lg font-semibold mb-2 flex items-center gap-2 text-gray-800'>
                   <IoLocationSharp  size={12} className='text-[#ff4d2d]'/> Delivery Location
                </h2>
                <div>
                    <input type="text" name="" id="" />
                    <button></button>
                    <button></button>
                </div>
            </section>
          </div>
    </div>
  )
}

export default CheckOut
