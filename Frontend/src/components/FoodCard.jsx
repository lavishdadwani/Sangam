import React, { useState, useEffect } from 'react'
import { FaDrumstickBite, FaLeaf, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateQuantity, removeCartItem } from '../redux/userSlice'

const FoodCard = ({data}) => {
  const  dispatch = useDispatch()
  const  {cartItems} = useSelector(state => state.user) 
  const [quantity, setQuantity] = useState(0)
  
  useEffect(() => {
    const cartItem = cartItems.find(item => item.id === data._id)
    if (cartItem) {
      setQuantity(cartItem.quantity)
    } else {
      setQuantity(0)
    }
  }, [cartItems, data._id])

  const renderStars = (rating) =>{
    const stars = [];
    for (let i = 1; i <= 5; i++){
      stars.push(
        (i <= rating) ? <FaStar className='text-yellow-500 text-lg' /> : <FaRegStar className='text-yellow-500 text-lg' />
       )
    }
    return stars
  }

  const isInCart = cartItems.some(item => item.id === data._id)

  const handleIncrease = () =>{
    const newQty = quantity + 1
    setQuantity(newQty)
    
    if (isInCart) {
      dispatch(updateQuantity({ id: data._id, quantity: newQty }))
    }
  }
  
  const handleDecrease = () =>{
    if(quantity > 0){
      const newQty = quantity - 1
      setQuantity(newQty)
      
      if (isInCart) {
        if (newQty === 0) {
          dispatch(removeCartItem(data._id))
        } else {
          dispatch(updateQuantity({ id: data._id, quantity: newQty }))
        }
      }
    }
  }
  return (
    <div className='w-full sm:w-[220px] md:w-[250px] shrink-0 rounded-xl md:rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl hover:border-[#e64323] transition-all duration-300 flex flex-col group'>
        <div className='relative w-full h-[160px] sm:h-[180px] flex justify-center items-center bg-gradient-to-br from-gray-50 to-white overflow-hidden' >
            <div className='absolute top-2 right-2 sm:top-3 sm:right-3 bg-white/95 backdrop-blur-sm rounded-full p-1 sm:p-1.5 shadow-lg z-10 border border-gray-100'>
            {data.foodType === 'veg' ? <FaLeaf className='text-green-600 text-sm sm:text-base' /> : <FaDrumstickBite className='text-red-600 text-sm sm:text-base' /> }
            </div>
            <img 
              src={data.image} 
              alt={data.name} 
              className='w-full h-full object-cover transition-transform duration-500 group-hover:scale-110' 
            />
            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300' />
        </div>
        <div className='flex-1 flex flex-col p-3 sm:p-4 gap-2'>
          <h1 className='font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-[#ff4d2d] transition-colors duration-200'>
            {data.name}
          </h1>
          <div className='flex items-center gap-1 sm:gap-1.5'>
            <div className='flex items-center gap-0.5'>
              {renderStars(data.rating?.average || 0)}
            </div>
            <span className='text-xs text-gray-500 font-medium'>
              ({data?.rating.count || 0})
            </span>
          </div>
        </div>
        <div className='flex items-center justify-between mt-auto p-3 sm:p-4 bg-gray-50 border-t border-gray-100'>
          <div className='flex flex-col'>
            <span className='text-xs text-gray-500 font-medium'>Price</span>
            <span className='font-bold text-gray-900 text-base sm:text-lg'>
              ₹{data.price}
            </span>
          </div>
          <div className='flex items-center border-2 border-gray-200 rounded-full overflow-hidden shadow-sm bg-white'>
            <button 
              className='px-2 sm:px-2.5 py-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation' 
              onClick={handleDecrease}
              disabled={quantity === 0}
              aria-label="Decrease quantity"
            > 
              <FaMinus size={12} className="text-gray-700" />
            </button>
            <span className="min-w-[24px] sm:min-w-[28px] text-center font-semibold text-gray-900 text-xs sm:text-sm px-1">
              {quantity}
            </span>
            <button 
              className='px-2 sm:px-2.5 py-1.5 hover:bg-gray-100 active:bg-gray-200 transition-colors touch-manipulation' 
              onClick={handleIncrease}
              aria-label="Increase quantity"
            > 
              <FaPlus size={12} className="text-gray-700" />
            </button>
            <button 
              className={`${
                isInCart 
                  ? "bg-gray-800 hover:bg-gray-700" 
                  : "bg-[#ff4d2d] hover:bg-[#e64323]"
              } text-white px-3 sm:px-4 py-2 transition-all duration-200 active:scale-95 shadow-sm touch-manipulation`} 
              onClick={ () =>{
                if (quantity > 0) {
                  if (isInCart) {
                    dispatch(updateQuantity({ id: data._id, quantity: quantity }))
                  } else {
                    dispatch(addToCart({
                      id: data._id,
                      name: data.name,
                      price: data.price,
                      image: data.image,
                      shop: data.shop,
                      quantity: quantity,
                      foodType: data.foodType,
                    }))
                  }
                }
              } }
              disabled={quantity === 0}
              aria-label="Add to cart"
            > 
              <FaShoppingCart size={14} className="sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
    </div>
  )
}

export default FoodCard
