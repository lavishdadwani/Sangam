import React, { useEffect, useState } from "react";
import { FaArrowLeft, FaStore, FaUtensils } from "react-icons/fa";
import { FaLocationDot } from "react-icons/fa6";
import { useNavigate, useParams } from "react-router-dom";
import itemAPI from "../../services/item"
import { useDispatch } from "react-redux";
import { openSnackbar } from "../redux/snackbarSlice";
import FoodCard from "../components/FoodCard";

const Shop = ({ shop }) => {
  const { shopId } = useParams();
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [shopDetails, setShopDetails] = useState();

  useEffect(() => {
    fetchShopById(shopId)
  }, [shopId]);

  const fetchShopById = async (shopId) => {
    try {
      const result = await itemAPI.getItemByShop(shopId);

      if (result.ok) {
        setShopDetails(result.data.data);
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

  return (
    <div className="min-h-screen bg-gray-50">
        <button 
          className="absolute top-4 left-4 z-20 flex items-center cursor-pointer gap-2 bg-black/50 hover:bg-black/70 text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/10" 
          onClick={()=> navigate("/")}
        >
            <FaArrowLeft className="transition-transform duration-200 group-hover:-translate-x-1" /> 
            <span className="font-medium">Back</span>
        </button>
      {shopDetails && (
        <div className="relative w-full h-64 md:h-80 lg:h-96 overflow-hidden">
          <img 
            src={shopDetails.shop.image} 
            alt={shopDetails.shop.name} 
            className="w-full h-full object-cover transition-transform duration-700 hover:scale-105" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/75 via-black/50 to-black/40 flex flex-col justify-center items-center text-center px-4">
            <div className="transform translate-y-[-10px] opacity-0 animate-[fadeInUp_0.6s_ease-out_0.2s_forwards]">
              <FaStore className="text-white text-4xl md:text-5xl mb-4 drop-shadow-lg transition-transform duration-300 hover:scale-110" />
            </div>
            <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold text-white drop-shadow-lg mb-4 transform translate-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.4s_forwards] tracking-tight">
              {shopDetails.shop.name}
            </h1>
            <div className="flex items-center gap-2 transform translate-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.6s_forwards]">
              <FaLocationDot size={22} color="red" className="flex-shrink-0" />
              <p className="text-base md:text-lg font-medium text-gray-200 drop-shadow-md">{shopDetails.shop.address}</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 md:py-12">
        <div className="flex items-center justify-center gap-3 mb-10 md:mb-12 transform translate-y-4 opacity-0 animate-[fadeInUp_0.6s_ease-out_0.8s_forwards]">
          <FaUtensils color="red" size={28} className="transition-transform duration-300 hover:rotate-12" />
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-800 tracking-tight">Our Menu</h2>
        </div>

        {shopDetails?.items.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-6 md:gap-8">
                {shopDetails?.items.map((item,index) =>(
                    <div 
                      key={item._id || index}
                      className="opacity-0 transform translate-y-8 scale-95 animate-[fadeInUp_0.5s_ease-out_forwards]"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <FoodCard data={item} />
                    </div>
                ))}
            </div>
        ):(
            <div className="flex flex-col items-center justify-center min-h-[40vh] opacity-0 animate-[fadeIn_0.6s_ease-out_0.3s_forwards]">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-red-500/10 rounded-full blur-2xl animate-pulse"></div>
                <div className="relative bg-white p-6 rounded-full shadow-lg border-2 border-red-500/20">
                  <FaUtensils size={60} color="red" className="animate-bounce" style={{ animationDuration: '2s' }} />
                </div>
              </div>
              <h3 className="text-xl md:text-2xl font-bold text-gray-800 mb-2">
                No Items Available
              </h3>
              <p className="text-center text-gray-500 text-base md:text-lg max-w-md">
                This shop hasn't added any items to their menu yet. Check back later!
              </p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
