import React from "react";
import Nav from "./Navbar";
import { useSelector } from "react-redux";
import { FaPen, FaUtensils, FaBan, FaClock } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import OwnerItemCard from "./OwnerItemCard";
const OwnerDashboard = () => {
  const navigate = useNavigate();
  const { userData, currentCity, myOrders } = useSelector((state) => state.user);
  const { shopData } = useSelector((state) => state.owner);


  return (
    <div className="w-full min-h-screen  flex flex-col items-center">
      <Nav userData={userData} currentCity={currentCity} shopData={shopData} myOrders={myOrders} />
      {/* Shop status banner */}
      {shopData?.status === 'suspended' && (
        <div className="w-full mt-20 bg-orange-50 border-b border-orange-200 px-6 py-4 flex items-center gap-3">
          <FaBan className="text-orange-500 flex-shrink-0 text-lg" />
          <div>
            <p className="font-semibold text-orange-800">Your shop has been suspended by admin</p>
            <p className="text-sm text-orange-600">Customers cannot see your shop until it is reactivated. Contact support for details.</p>
          </div>
        </div>
      )}
      {shopData?.status === 'rejected' && (
        <div className="w-full mt-20 bg-red-50 border-b border-red-200 px-6 py-4 flex items-center gap-3">
          <FaBan className="text-red-500 flex-shrink-0 text-lg" />
          <div>
            <p className="font-semibold text-red-800">Your shop registration has been rejected</p>
            <p className="text-sm text-red-600">Please contact support for more information.</p>
          </div>
        </div>
      )}
      {shopData?.status === 'pending' && (
        <div className="w-full mt-20 bg-yellow-50 border-b border-yellow-200 px-6 py-4 flex items-center gap-3">
          <FaClock className="text-yellow-500 flex-shrink-0 text-lg" />
          <div>
            <p className="font-semibold text-yellow-800">Your shop is pending admin review</p>
            <p className="text-sm text-yellow-600">It will be visible to customers once approved.</p>
          </div>
        </div>
      )}

      {!shopData && (
        <div className="flex justify-center items-center p-4 sm:p-6 mt-20 w-full">
          <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gary-100 hover:shadow-xl transition-shadow duration-300">
            <div className="flex flex-col items-center text-center">
              <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                Add your Restaurant
              </h2>
              <p className="text-gray-600 mb-4 text-sm sm:text-base">
                Join our groceries delivery platform and reach thousands of
                hungry customers every day.
              </p>
              <button
                className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate("/create-edit-shop")}
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      )}
      {shopData && (
        <div className="w-full flex flex-col items-center gap-6 px-4 sm:px-6 mt-20">
          <h1 className="text-2xl sm:text-3xl text-gray-900 flex items-center gap-3 mt-8 text-center">
            <FaUtensils className="text-[#ff4d2d] w-14 h-14" /> Welcome to{" "}
            {shopData.name}
          </h1>
          <div className="bg-white shadow-lg rounded-xl overflow-hidden border border-orange-100 hover:shadow-2xl transition-all duration-300 w-full max-w-3xl relative">
            <div className=" absolute top-4 right-4 bg-[#ff4d2d] text-white p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors cursor-pointer" onClick={() => navigate("/create-edit-shop")}>
                <FaPen size={20} />
            </div>
            <img src={shopData.image} alt={shopData.name} className="w-full h-48 sm:h-64 object-cover" />
          <div className="p-4 sm:p-6">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-bold text-gray-800">{shopData.name}</h1>
              {shopData.status && (
                <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${
                  shopData.status === 'active'    ? 'bg-green-50 text-green-700 border-green-200' :
                  shopData.status === 'pending'   ? 'bg-yellow-50 text-yellow-700 border-yellow-200' :
                  shopData.status === 'suspended' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-red-50 text-red-700 border-red-200'
                }`}>
                  {shopData.status.charAt(0).toUpperCase() + shopData.status.slice(1)}
                </span>
              )}
            </div>
            <p className="text-gray-500">{shopData.city},{shopData.state}</p>
            <p className="text-gray-500">{shopData.address}</p>
          </div>
          </div>
          {shopData?.items.length == 0 && (
             <div className="flex justify-center items-center p-4 sm:p-6 ">
             <div className="w-full max-w-md bg-white shadow-lg rounded-2xl p-6 border border-gary-100 hover:shadow-xl transition-shadow duration-300">
               <div className="flex flex-col items-center text-center">
                 <FaUtensils className="text-[#ff4d2d] w-16 h-16 sm:w-20 sm:h-20 mb-4" />
                 <h2 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                   Add your Food Item
                 </h2>
                 <p className="text-gray-600 mb-4 text-sm sm:text-base">
                   Share your delius creation with our customers by adding food menu 
                 </p>
                 <button
                   className="bg-[#ff4d2d] text-white px-5 sm:px-6 py-2 rounded-full font-medium shadow-md hover:bg-orange-600 transition-colors duration-200 cursor-pointer"
                   onClick={() => navigate("/add-item")}
                 >
                   Add Food
                 </button>
               </div>
             </div>
           </div>
          )}
          {shopData?.items.length > 0 && (
            <div className="flex flex-col items-center gap-4 w-full max-3xl">
               { shopData.items.map((item,index) =>(
                 <OwnerItemCard data={item} key={index} />
               ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OwnerDashboard;
