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
        <button className="absolute top-4 left-4 z-20 flex items-center cursor-pointer gap-2 bg-black/50 hover:bg-black/70 text-white px-3 py-2 rounded-full shadow transition" onClick={()=> navigate("/")}>
            <FaArrowLeft /> 
            <span>Back</span>
        </button>
      {shopDetails && (
        <div className="relative w-full h-64 md:h-80 lg:h-96">
          <img src={shopDetails.shop.image} alt="" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/70 to-black/30 flex flex-col justify-center items-center text-center px-4">
            <FaStore className="text-white text-4xl mb-3 drop-shadow-md" />
            <h1 className="text-3xl md:text-5xl font-extrabold text-white drop-shadow-lg">
              {shopDetails.shop.name}
            </h1>
            <div className="flex items-center gap-[10px]">
              <FaLocationDot size={22} color="red" />
              <p className="text-lg font-medium text-gray-200 mt-[10px]">{shopDetails.shop.address}</p>
            </div>
          </div>
        </div>
      )}
      <div className="max-w-xxl max-auto px-6 py-10">
        <h2 className="flex items-center justify-center gap-3 text-3xl font-bold mb-10 text-gray-800"><FaUtensils color="red" /> Our Menu</h2>

        {shopDetails?.items.length > 0 ? (
            <div className="flex flex-wrap justify-center gap-8">
                {shopDetails?.items.map((item,index) =>(
                    <FoodCard data={item} />
                ))}
            </div>
        ):(
            <div>
                <p className="text-center text-gray-500 text-lg">No Items Available</p>
            </div>
        )}
      </div>
    </div>
  );
};

export default Shop;
