import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { IoIosArrowRoundBack } from "react-icons/io";
import { FaUtensils } from "react-icons/fa";
import ItemAPI from "../../services/item"
import { setOwnerData } from "../redux/ownerSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import ButtonSquare from "../components/ButtonSquare";

const AddItem = () => {
    const navigate = useNavigate();
    const { shopData } = useSelector((state) => state.owner);

    const [name,setName] = useState('')
    const [price,setPrice] = useState(0)
    const [category,setCategory] = useState('')
    const [foodType,setFoodType] = useState('veg')
    const [frontendImage,setFrontendImage] = useState( null)
    const [backendImage,setBackendImage] = useState(null)
    const [loading,setLoading] = useState(false)
    const categories = ["Snacks",
    "main Course",
    "Desserts",
    "Pizza",
    "Burgers",
    "Sandwiches",
    "South Indian",
    "North Indian",
    "Chinese",
    "Fast Food",
    "Others",]
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
      formData.append('foodType',foodType)
      formData.append('category',category)
      formData.append('price',price)
      if(backendImage){
        formData.append('image',backendImage)
      }
      const result = await ItemAPI.create(formData)
      if (result.ok) {
        dispatch(setOwnerData(result.data.data));
        dispatch(openSnackbar("Item Created Successfully", "success"));
        navigate("/")
      } else {
        dispatch(openSnackbar(result.data?.message || "Error while creating Item", "error"));
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message || "Error while creating Item", "error"));
    }finally{
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
              Add Food
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                name="price"
                placeholder="0"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
                onChange={(e) => setPrice(e.target.value)}
                value={price}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Category
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
                onChange={(e) => setCategory(e.target.value)}
                value={category}
              > 
              <option value=''>Select Category </option>
              {categories.map((c,index)=>(
                <option value={c} key={index} >{c}</option>
              ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Select Food Type
              </label>
              <select
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-orange-500"
                onChange={(e) => setFoodType(e.target.value)}
                value={foodType}
              > 
              <option value='veg'>Veg </option>
              <option value='non veg'>Non Veg </option>
              </select>
            </div>
            <ButtonSquare type="submit" styleType="default" className="w-full" loading={loading}> Submit </ButtonSquare>
          </form>
        </div>
      </div>
    );
}

export default AddItem
