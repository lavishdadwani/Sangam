import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import ShopAPI from "../../services/shop"
import { setOwnerData } from "../redux/ownerSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import { ClipLoader } from "react-spinners";

const CreateEditShop = () => {
  const navigate = useNavigate();
  const { shopData } = useSelector((state) => state.owner);
  const { currentCity, currentState, currentAddress } = useSelector((state) => state.user);
  const [name,setName] = useState(shopData?.name || '')
  const [address,setAddress] = useState(shopData?.address || currentAddress)
  const [city,setCity] = useState(shopData?.city || currentCity)
  const [state,setState] = useState(shopData?.state || currentState)
  const [frontendImage,setFrontendImage] = useState(shopData?.image || null)
  const [backendImage,setBackendImage] = useState(null)
  const [loading,setLoading] = useState(false)
  const dispatch = useDispatch()
  const handleImage = (e) =>{
    const file = e.target.files[0]
    setBackendImage(file)
    setFrontendImage(URL.createObjectURL(file))
  }
const  handleSubmit = async (e) => {
  try {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData()
    formData.append('name',name)
    formData.append('city',city)
    formData.append('state',state)
    formData.append('address',address)
    if(backendImage){
      formData.append('image',backendImage)
    }
    const result = await ShopAPI.createEditShop(formData)
    if (result.ok) {
      const shop = result.data.data;
      dispatch(setOwnerData(shop));
      const statusNote = shop.status && shop.status !== 'active'
        ? ` Status: ${shop.status} — pending admin review.` : '';
      dispatch(openSnackbar(`Shop saved successfully.${statusNote}`, "success"));
      navigate("/")
    } else {
      dispatch(openSnackbar(result.data?.message || "Error while creating Shop", "error"));
    }
  } catch (err) {
    console.error(err);
    dispatch(openSnackbar(err.message || "Error while creating Shop", "error"));
  } finally {
    setLoading(false)
  }
}
  return (
    <div className="flex justify-center flex-col items-center p-6 bg-gradient-to-br from-orange-50 relative to-white min-h-screen">
      <div
        className="absolute top-[20px] left-[20px] z-[10] mb-[10px]"
        onClick={() => navigate("/")}
      >
        <IoIosArrowRoundBack size={35} className="text-[#ff4d2d]" />
      </div>
      <div className="max-w-lg w-full bg-white shadow-xl rounded-2xl p-8 border border-orange-100">
        <div className="flex flex-col items-center mb-6">
          <div className="bg-orange-100 p-4 rounded-full mb-4">
            <FaUtensils className="text-[#ff4d2d] w-16 h-16" />
          </div>
          <div className="text=3xl font-extrabold text-gray-900">
            {shopData ? "Edit Shop" : "Add Shop"}
          </div>
        </div>
        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              name="name"
              placeholder="Enter Shop Name"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
              onChange={(e) => setName(e.target.value)}
              value={name}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Image
            </label>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
              onChange={handleImage}
              
            />
            {frontendImage && <div className="mt-4">
              <img src={frontendImage} alt="UIImage" className="w-full h-48 object-cover rounded-lg border" />
            </div>}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter City"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
              onChange={(e) => setCity(e.target.value)}
              value={city}
            />
            </div>
            <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter State"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
              onChange={(e) => setState(e.target.value)}
              value={state}
            />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              name="address"
              placeholder="Enter your Address"
              className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
              onChange={(e) => setAddress(e.target.value)}
              value={address}
            />
          </div>
          <button className="w-full bg-[#ff4d2d] text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:bg-orange-600 hover:shadow-lg transition-all duration-200 cursor-pointer">
          {loading && <ClipLoader size={20} color="white" />  } Submit
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateEditShop;
