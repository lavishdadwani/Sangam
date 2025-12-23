import React, { useState, useEffect } from 'react'
import { FaDrumstickBite, FaLeaf, FaStar, FaRegStar, FaMinus, FaPlus, FaShoppingCart } from 'react-icons/fa'
import { useDispatch, useSelector } from 'react-redux'
import { addToCart, updateQuantity, removeCartItem } from '../redux/userSlice'

const FoodCard = ({data}) => {
  const  dispatch = useDispatch()
  const  {cartItems} = useSelector(state => state.user) 
  const [quantity, setQuantity] = useState(0)
  
  // Check if item exists in cart and sync quantity
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
    
    // If item is already in cart, update quantity directly
    if (isInCart) {
      dispatch(updateQuantity({ id: data._id, quantity: newQty }))
    }
  }
  
  const handleDecrease = () =>{
    if(quantity > 0){
      const newQty = quantity - 1
      setQuantity(newQty)
      
      // If item is in cart, update quantity directly
      if (isInCart) {
        if (newQty === 0) {
          // Remove from cart if quantity becomes 0
          dispatch(removeCartItem(data._id))
        } else {
          dispatch(updateQuantity({ id: data._id, quantity: newQty }))
        }
      }
    }
  }
  return (
    <div className='w-[250px] rounded-2xl border-2 border-[#ff4d2d] bg-white shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col'>
        <div className='relative w-full h-[170px] flex justify-center items-center bg-white' >
            <div className='absolute top-3 right-3 bg-white rounded-full p-1 shadow'>
            {data.foodType =='veg' ? <FaLeaf className='text-green-600 text-lg' /> : <FaDrumstickBite className='text-red-600 text-lg' /> }
            </div>
            <img src={data.image} alt="" className='w-full h-full object-cover transition-transform duration-300 hover:scale-105' />
        </div>
        <div className='flex-1 flex flex-col p-4'>
          <h1 className='font-semibold text-gray-900 text-base truncate'>
            {data.name}
          </h1>
          <div className='flex items-center gap-1 mt-1'>
            {renderStars(data.rating?.average || 0)}
            <span className='text-xs text-gray-500'>
              {data?.rating.count || 0}
            </span>
          </div>

        </div>
        <div className='flex items-center justify-between mt-auto p-3'>
          <span className='font-bold text-gray-900 text-lg'>
            {data.price}
          </span>
          <div className='flex items-center border rounded-full overflow-hidden shadow-sm'>
            <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleDecrease}> 
            <FaMinus size={12} />
            </button>
            <span className="min-w-[20px] text-center font-medium">{quantity}</span>
            <button className='px-2 py-1 hover:bg-gray-100 transition' onClick={handleIncrease}> 
            <FaPlus size={12} />
            </button>
            <button 
              className={`${isInCart ? "bg-gray-800" : "bg-[#ff4d2d]" } text-white px-3 py-2 transition-colors hover:opacity-90 active:scale-95`} 
              onClick={ () =>{
                if (quantity > 0) {
                  if (isInCart) {
                    // Update quantity if already in cart
                    dispatch(updateQuantity({ id: data._id, quantity: quantity }))
                  } else {
                    // Add to cart if not in cart
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
              } }> 
              <FaShoppingCart size={16} />
            </button>
          </div>
        </div>
    </div>
  )
}

export default FoodCard
