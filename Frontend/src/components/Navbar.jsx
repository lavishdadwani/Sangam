import React, { useEffect, useRef, useState } from "react";
import { FaLocationDot } from "react-icons/fa6";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { clearOwnerData } from "../redux/ownerSlice";
import userAPI from "../../services/user/user";
import { openSnackbar } from "../redux/snackbarSlice";
import { FaPlus } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import itemAPI from "../../services/item"

const Nav = ({ userData, currentCity,shopData, cartItems = [], myOrders = [] }) => {
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState('');
  const infoRef = useRef(null);
  const dispatch = useDispatch();
  if (!userData) return null;

  // Close info panel whenever the logged-in user changes (e.g., switching accounts/roles)
  useEffect(() => {
    setShowInfo(false);
  }, [userData]);

  // Close info panel when clicking outside
  useEffect(() => {
    if (!showInfo) return;
    const handleClickOutside = (e) => {
      if (infoRef.current && !infoRef.current.contains(e.target)) {
        setShowInfo(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showInfo]);
  const handleLogOut = async () => {
    try {
      const result = await userAPI.signOut();
      dispatch(setUserData(null));
      dispatch(clearOwnerData());
      console.log(result);
      dispatch(openSnackbar(result?.data?.message || "Logged out", "success"));
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if(query){
      handleSearchItems(query)
    }else{
      dispatch(setSearchItems(null));
    }
  }, [query]);

  const handleSearchItems = async (query) => {
    try {
      const result = await itemAPI.searchItems(query,currentCity) ;
  
      if (result.ok) {
        dispatch(setSearchItems(result.data.data));
      } else {
        dispatch(openSnackbar(result.data?.message || "Failed to sign in", "error"));
      }
  
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message, "error"));
    }
  }

  return (
    <div className="w-full h-[80px] flex items-center justify-between md:justify-between gap-[30px] px-[20px] fixed top-0 z-[999] bg-[#fff9f6] overflow-visible border-b border-gray-200/50 backdrop-blur-sm transition-all duration-300">
      {showSearch && userData.role == "user" && (
        <div className="w-[90%] h-[70px] bg-white shadow-xl rounded-xl items-center gap-[20px] flex fixed top-[80px] left-[5%] md:hidden border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[12px] border-r-[2px] border-gray-300 h-full">
            <FaLocationDot size={25} className="text-[#ff4d2d] transition-transform duration-200 hover:scale-110" />
            <div className="w-[80%] truncate text-gray-600 font-medium"> {currentCity} </div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px] px-2">
            <IoIosSearch size={25} className="text-[#ff4d2d] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search grocery items..."
              className="px-[10px] text-gray-700 outline-0 w-full bg-transparent placeholder:text-gray-400 transition-all duration-200 focus:placeholder:text-gray-300"
              onChange={(e)=> setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}
      <h1 className="text-3xl font-bold mb-2 text-[#ff4d2d] tracking-tight transition-transform duration-200 hover:scale-105 cursor-default">KT Mart</h1>
      {userData.role == "user" && (
        <div className="md:w-[60%] lg:w-[40%] h-[70px] bg-white shadow-xl rounded-xl items-center gap-[20px] hidden md:flex border border-gray-100 transition-all duration-300 hover:shadow-2xl">
          <div className="flex items-center w-[30%] overflow-hidden gap-[10px] px-[12px] border-r-[2px] border-gray-300 h-full">
            <FaLocationDot size={25} className="text-[#ff4d2d] transition-transform duration-200 hover:scale-110" />
            <div className="w-[80%] truncate text-gray-600 font-medium"> {currentCity}</div>
          </div>
          <div className="w-[80%] flex items-center gap-[10px] px-2">
            <IoIosSearch size={25} className="text-[#ff4d2d] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search grocery items..."
              className="px-[10px] text-gray-700 outline-0 w-full bg-transparent placeholder:text-gray-400 transition-all duration-200 focus:placeholder:text-gray-300"
              onChange={(e)=> setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-4">
        {userData.role == "user" &&
          (showSearch ? (
            <RxCross2
              size={25}
              className="text-[#ff4d2d] md:hidden transition-all duration-200 hover:scale-110 hover:rotate-90 cursor-pointer active:scale-95"
              onClick={() => setShowSearch((prev) => !prev)}
            />
          ) : (
            <IoIosSearch
              size={25}
              className="text-[#ff4d2d] md:hidden transition-all duration-200 hover:scale-110 cursor-pointer active:scale-95"
              onClick={() => setShowSearch((prev) => !prev)}
            />
          ))}
        {userData.role == "owner" ? (
          <>
            {shopData && (
              <>
              <button className="hidden md:flex items-center gap-2 px-4 py-2.5 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium transition-all duration-200 hover:bg-[#ff4d2d]/20 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md" onClick={()=> navigate("/add-item")}>
              <FaPlus size={18} className="transition-transform duration-200" />
              <span>Add Food Item</span>
            </button>
            <button className="md:hidden flex items-center justify-center gap-1 p-2.5 cursor-pointer rounded-full bg-[#ff4d2d]/10 text-[#ff4d2d] transition-all duration-200 hover:bg-[#ff4d2d]/20 hover:scale-110 active:scale-95 shadow-sm" onClick={()=> navigate("/add-item")}>
              <FaPlus size={20} />
            </button>
            </>
            )}
            <div className="hidden md:flex items-center gap-2 cursor-pointer relative px-4 py-2.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium transition-all duration-200 hover:bg-[#ff4d2d]/20 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md" onClick={()=> navigate("my-orders")}>
              <TbReceipt2 size={20} className="transition-transform duration-200" />
              <span>My Order</span>
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[7px] py-[2px] min-w-[20px] text-center shadow-md transition-transform duration-200 hover:scale-110">{myOrders?.length || 0}</span>
            </div>
            <div className="md:hidden flex items-center justify-center gap-2 cursor-pointer relative px-3 py-2.5 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium transition-all duration-200 hover:bg-[#ff4d2d]/20 hover:scale-110 active:scale-95 shadow-sm" onClick={()=> navigate("my-orders")}>
              <TbReceipt2 size={20} />
              <span className="absolute -right-2 -top-2 text-xs font-bold text-white bg-[#ff4d2d] rounded-full px-[7px] py-[2px] min-w-[20px] text-center shadow-md">0</span>
            </div>
           
          </>
        ) : (
          <>
            {userData.role == "user" && (
              <div className="relative cursor-pointer group transition-all duration-200" onClick={() => navigate("/cart")}>
                <FiShoppingCart size={25} className="text-[#ff4d2d] transition-all duration-200 group-hover:scale-110" />
                <span className="absolute right-[-9px] top-[-12px] text-xs font-bold text-white bg-[#ff4d2d] rounded-full w-5 h-5 flex items-center justify-center shadow-md transition-all duration-200 group-hover:scale-125 group-hover:shadow-lg">
                 {cartItems.length}
                </span>
              </div>
            )}
            <button className="hidden md:block px-4 py-2 rounded-lg bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#ff4d2d]/20 hover:scale-105 active:scale-95 shadow-sm hover:shadow-md" onClick={()=> navigate("my-orders")}>
              My Orders
            </button>
          </>
        )}

        <div className="relative" ref={infoRef}>
          <div
            className="w-[40px] h-[40px] rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-[18px] shadow-xl font-semibold cursor-pointer transition-all duration-200 hover:scale-110 hover:shadow-2xl active:scale-95"
            onClick={() => setShowInfo((prev) => !prev)}
          >
            {userData?.fullName?.slice(0, 1) || "U"}
          </div>
          {showInfo && (
            <div className="absolute right-0 mt-3 w-[200px] bg-white shadow-2xl rounded-xl p-4 flex flex-col gap-3 z-[9999] border border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-[17px] font-semibold text-gray-800 pb-2 border-b border-gray-100">
                {userData?.fullName || "User"}
              </div>
            {userData.role == "user" &&  <div className="md:hidden text-[#ff4d2d] font-semibold cursor-pointer transition-all duration-200 hover:translate-x-1 hover:opacity-80 py-1" onClick={()=> navigate("my-orders")}>
                My Orders
              </div>}
              <div
                className="text-[#ff4d2d] font-semibold cursor-pointer transition-all duration-200 hover:translate-x-1 hover:opacity-80 py-1"
                onClick={handleLogOut}
              >
                Log Out
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Nav;
