import React from "react";
import { FiShoppingCart } from "react-icons/fi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import CartItemCard from "../components/CartItemCard";
import ButtonSquare from "../components/ButtonSquare";
import BackButton from "../components/BackButton";
import EmptyState from "../components/EmptyState";
import AnimatedCard from "../components/AnimatedCard";

const CartPage = () => {
  const navigate = useNavigate();
  const { cartItems , totalAmount } = useSelector((state) => state.user);
  return (
    <div className="min-h-screen bg-[#fff9f6] flex justify-center p-6 pt-24">
      <div className="w-full max-w-[800px]">
        <div className="flex items-center gap-[20px] mb-8">
          <BackButton />
          <h1 className="text-3xl font-bold text-start text-gray-800 tracking-tight">Your Cart</h1>
        </div>
        {!cartItems || cartItems.length === 0 ? (
            <EmptyState
              icon={FiShoppingCart}
              title="Your Cart is Empty"
              description="Looks like you haven't added anything to your cart yet. Start shopping to fill it up!"
              buttonText="Start Shopping"
              buttonRoute="/"
            />
        ) : (
            <>
            <div className="space-y-4">
                {cartItems.map((item, index) => (
                    <AnimatedCard 
                      key={item.id || index}
                      index={index}
                      delay={100}
                      animationType="slideInRight"
                      duration="0.4s"
                    >
                      <CartItemCard data={item} />
                    </AnimatedCard>
                ))}
            </div>
            <div className="mt-8 bg-white p-6 rounded-xl shadow-lg flex justify-between items-center border border-gray-200 transform transition-all duration-300 hover:shadow-xl">
                <h1 className="text-xl font-semibold text-gray-800">Total Amount</h1>
                <span className="text-2xl font-bold text-[#ff4d2d]">₹{totalAmount}</span>
            </div>
            <div className="mt-6 flex justify-end">
                <ButtonSquare 
                  styleType="default"
                  className="px-8 py-3.5 text-lg shadow-md hover:shadow-lg"
                  onClick={()=> navigate("/checkOut")}
                >
                  Proceed To Check Out
                </ButtonSquare>
            </div>
            </>
        )}
      </div>
    </div>
  );
};

export default CartPage;
