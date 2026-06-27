import React, { useEffect, useRef, useState } from "react";
import { IoIosSearch } from "react-icons/io";
import { FiShoppingCart } from "react-icons/fi";
import { RxCross2 } from "react-icons/rx";
import { useDispatch } from "react-redux";
import { setSearchItems, setUserData } from "../redux/userSlice";
import { clearOwnerData } from "../redux/ownerSlice";
import userAPI from "../../services/user/user";
import { openSnackbar } from "../redux/snackbarSlice";
import { FaPlus, FaBell } from "react-icons/fa";
import { TbReceipt2 } from "react-icons/tb";
import { useNavigate } from "react-router-dom";
import itemAPI from "../../services/item";
import LocationSelector from "./LocationSelector";
import ButtonSquare from "./ButtonSquare";
import NotificationDrawer, { LS_KEY } from "./NotificationDrawer";
import notificationAPI from "../../services/notification";

const Nav = ({ userData, currentCity,shopData, cartItems = [], myOrders = [] }) => {
  const navigate = useNavigate()
  const [showInfo, setShowInfo] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [query, setQuery] = useState('');
  const infoRef = useRef(null);
  const dispatch = useDispatch();
  if (!userData) return null;

  // Check for unread notifications (users only)
  useEffect(() => {
    if (userData.role !== "user") return;
    const lastSeen = localStorage.getItem(LS_KEY) ?? "0";
    notificationAPI.getNotifications().then((r) => {
      if (r.ok) {
        const count = (r.data.data ?? []).filter(
          (n) => new Date(n.createdAt).toISOString() > lastSeen
        ).length;
        setUnreadCount(count);
      }
    });
  }, [userData.role]);

  useEffect(() => {
    setShowInfo(false);
  }, [userData]);

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
    <>
    <nav className="w-full h-20 flex items-center justify-between gap-6 px-6 fixed top-0 z-[999] bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-200/60 transition-all duration-300">
      {showSearch && userData.role == "user" && (
        <div className="w-[calc(100%-2rem)] max-w-md h-16 bg-white shadow-lg rounded-lg items-center gap-3 flex fixed top-20 left-4 right-4 md:hidden border border-gray-200/80 animate-in fade-in slide-in-from-top-2 duration-200 z-[998]">
          <div className="flex items-center flex-shrink-0 overflow-hidden h-full border-r border-gray-200">
            <LocationSelector />
          </div>
          <div className="flex-1 flex items-center gap-2 px-3 min-w-0">
            <IoIosSearch size={20} className="text-[#ff4d2d] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search items..."
              className="py-2 px-1 text-sm text-gray-700 outline-0 w-full bg-transparent placeholder:text-gray-400 transition-all duration-200"
              onChange={(e)=> setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}
      <h1 className="text-2xl md:text-3xl font-bold text-[#ff4d2d] tracking-tight cursor-default flex-shrink-0">
        KT Mart
      </h1>
      {userData.role == "user" && (
        <div className="md:w-[60%] lg:w-[42%] h-16 bg-white shadow-md rounded-lg items-center gap-3 hidden md:flex border border-gray-200/80 transition-all duration-200">
          <div className="flex items-center flex-shrink-0 overflow-hidden h-full border-r border-gray-200">
            <LocationSelector />
          </div>
          <div className="flex-1 flex items-center gap-2.5 px-3 min-w-0">
            <IoIosSearch size={20} className="text-[#ff4d2d] flex-shrink-0" />
            <input
              type="text"
              placeholder="Search grocery items..."
              className="py-2 px-1 text-sm text-gray-700 outline-0 w-full bg-transparent placeholder:text-gray-400 transition-all duration-200"
              onChange={(e)=> setQuery(e.target.value)}
              value={query}
            />
          </div>
        </div>
      )}
      <div className="flex items-center gap-3 flex-shrink-0">
        {userData.role == "user" &&
          (showSearch ? (
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className="md:hidden p-2 text-[#ff4d2d] hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
              aria-label="Close search"
            >
              <RxCross2 size={22} />
            </button>
          ) : (
            <button
              onClick={() => setShowSearch((prev) => !prev)}
              className="md:hidden p-2 text-[#ff4d2d] hover:bg-gray-100 rounded-lg transition-colors duration-200 cursor-pointer"
              aria-label="Open search"
            >
              <IoIosSearch size={22} />
            </button>
          ))}
        {userData.role == "owner" ? (
          <>
            {shopData && (
              <>
              <button 
                className="hidden md:flex items-center gap-2 px-4 py-2 bg-[#ff4d2d] text-white font-medium rounded-lg hover:bg-[#ff3d1d] transition-colors duration-200 shadow-sm" 
                onClick={()=> navigate("/add-item")}
              >
                <FaPlus size={16} />
                <span>Add Item</span>
              </button>
              <button 
                className="md:hidden flex items-center justify-center p-2.5 bg-[#ff4d2d] text-white rounded-lg hover:bg-[#ff3d1d] transition-colors duration-200 shadow-sm" 
                onClick={()=> navigate("/add-item")}
                aria-label="Add item"
              >
                <FaPlus size={18} />
              </button>
              </>
            )}
            <button 
              className="hidden md:flex items-center gap-2 relative px-4 py-2 bg-[#ff4d2d]/10 text-[#ff4d2d] font-medium rounded-lg hover:bg-[#ff4d2d]/20 transition-colors duration-200" 
              onClick={()=> navigate("my-orders")}
            >
              <TbReceipt2 size={18} />
              <span>Orders </span>
              {myOrders?.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 text-[10px] font-semibold text-white bg-[#ff4d2d] rounded-full w-5 h-5 flex items-center justify-center">
                  {myOrders.length}
                </span>
              )}
            </button>
            <button 
              className="md:hidden flex items-center justify-center relative p-2.5 bg-gray-50 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors duration-200" 
              onClick={()=> navigate("my-orders")}
              aria-label="My orders"
            >
              <TbReceipt2 size={18} />
              {myOrders?.length > 0 && (
                <span className="absolute -right-1.5 -top-1.5 text-[10px] font-semibold text-white bg-[#ff4d2d] rounded-full w-5 h-5 flex items-center justify-center">
                  {myOrders.length}
                </span>
              )}
            </button>
           
          </>
        ) : (
          <>
            {userData.role == "user" && (
              <button
                className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => { setShowNotifications(true); setUnreadCount(0); }}
                aria-label="Notifications"
              >
                <FaBell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute -right-1 -top-1 text-[10px] font-semibold text-white bg-[#ff4d2d] rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
            )}
            {userData.role == "user" && (
              <button
                className="relative p-2 text-[#ff4d2d] hover:bg-gray-100 rounded-lg transition-colors duration-200"
                onClick={() => navigate("/cart")}
                aria-label="Shopping cart"
              >
                <FiShoppingCart size={22} />
                {cartItems.length > 0 && (
                  <span className="absolute -right-1 -top-1 text-[10px] font-semibold text-white bg-[#ff4d2d] rounded-full w-5 h-5 flex items-center justify-center">
                    {cartItems.length}
                  </span>
                )}
              </button>
            )}
            <button 
              className="hidden md:flex items-center px-4 py-2 bg-[#ff4d2d]/10 text-[#ff4d2d] text-sm font-medium rounded-lg hover:bg-[#ff4d2d]/20 transition-colors duration-200" 
              onClick={()=> navigate("my-orders")}
            >
              My Orders
            </button>
          </>
        )}

        <div className="relative" ref={infoRef}>
          <button
            onClick={() => setShowInfo((prev) => !prev)}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-[#ff4d2d] text-white text-sm font-semibold hover:bg-[#ff3d1d] transition-colors duration-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#ff4d2d] focus:ring-offset-2"
            aria-label="User menu"
          >
            {userData?.fullName?.slice(0, 1).toUpperCase() || "U"}
          </button>
          {showInfo && (
            <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2 flex flex-col z-[9999] border border-gray-200 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="text-sm font-semibold text-gray-900 px-3 py-2 border-b border-gray-100">
                {userData?.fullName || "User"}
              </div>
              {userData.role == "user" && (
                <button
                  className="md:hidden text-left text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded transition-colors duration-150"
                  onClick={() => {
                    navigate("my-orders");
                    setShowInfo(false);
                  }}
                >
                  My Orders
                </button>
              )}
              {userData.role == "user" && (
                <button
                  className="text-left text-sm text-gray-700 hover:bg-gray-50 px-3 py-2 rounded transition-colors duration-150"
                  onClick={() => {
                    navigate("/my-complaints");
                    setShowInfo(false);
                  }}
                >
                  My Complaints
                </button>
              )}
              <button
                className="text-left text-sm text-[#ff4d2d] hover:bg-red-50 px-3 py-2 rounded transition-colors duration-150 font-medium"
                onClick={() => {
                  handleLogOut();
                  setShowInfo(false);
                }}
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
    {showNotifications && (
      <NotificationDrawer onClose={() => setShowNotifications(false)} />
    )}
    </>
  );
};

export default Nav;
