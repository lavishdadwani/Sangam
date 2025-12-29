import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { FaUtensils, FaRupeeSign, FaList, FaLeaf } from "react-icons/fa";
import ItemAPI from "../../services/item"
import { setOwnerData } from "../redux/ownerSlice";
import { openSnackbar } from "../redux/snackbarSlice";
import ButtonSquare from "../components/ButtonSquare";
import ImageUpload from "../components/ImageUpload";
import BackButton from "../components/BackButton";
import InputText from "../components/InputText";
import InputSelect from "../components/InputSelect";
import { CATEGORIES } from "../constants/categories";

const AddItem = () => {
    const navigate = useNavigate();
    const { shopData } = useSelector((state) => state.owner);

    const [backendImage, setBackendImage] = useState(null);
    const [loading, setLoading] = useState(false);
    const dispatch = useDispatch();

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError,
        clearErrors,
    } = useForm({
        defaultValues: {
            name: '',
            price: 0,
            category: '',
            foodType: 'veg'
        }
    });

    const handleImageChange = (file) => {
        setBackendImage(file);
        // Clear image error when file is selected
        if (file) {
            clearErrors("image");
        }
    };

    const onSubmit = async (data) => {
        // Validate image if required
        if (!backendImage) {
            setError("image", {
                type: "required",
                message: "Please upload an image"
            });
            return;
        }

        try {
            setLoading(true);
            const formData = new FormData();
            formData.append('name', data.name);
            formData.append('foodType', data.foodType);
            formData.append('category', data.category);
            formData.append('price', data.price);
            formData.append('image', backendImage);
            const result = await ItemAPI.create(formData);
      if (result.ok) {
        dispatch(setOwnerData(result.data.data));
        dispatch(openSnackbar("Item Created Successfully", "success"));
                navigate("/");
      } else {
        dispatch(openSnackbar(result.data?.message || "Error while creating Item", "error"));
      }
    } catch (err) {
      console.error(err);
      dispatch(openSnackbar(err.message || "Error while creating Item", "error"));
        } finally {
            setLoading(false);
    }
    };
    return (
      <div className="flex justify-center flex-col items-center p-4 sm:p-6 bg-gradient-to-br from-orange-50 via-white to-orange-50 relative min-h-screen">
        {/* Back Button */}
        <div className="absolute top-4 left-4 sm:top-6 sm:left-6 z-10">
          <div className="bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-shadow">
            <BackButton size={28} />
          </div>
        </div>

        {/* Main Card */}
        <div className="max-w-2xl w-full bg-white shadow-2xl rounded-3xl p-6 sm:p-10 border border-orange-100/50 mt-12 sm:mt-16 transform transition-all duration-300 hover:shadow-3xl">
          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-5 rounded-full mb-5 shadow-lg transform transition-transform duration-300 hover:scale-105">
              <FaUtensils className="text-[#ff4d2d] w-12 h-12 sm:w-16 sm:h-16" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mb-2">
              Add Food Item
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">Fill in the details to add a new item to your menu</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            {/* Name Field */}
            <InputText
              label="Item Name"
              labelIcon={FaUtensils}
                type="text"
                name="name"
              placeholder="e.g., Margherita Pizza"
              icon={FaUtensils}
              required
              error={errors.name}
              register={register("name", {
                required: "Item name is required",
                minLength: {
                  value: 2,
                  message: "Item name must be at least 2 characters"
                },
                maxLength: {
                  value: 100,
                  message: "Item name must be less than 100 characters"
                }
              })}
            />

            {/* Image Upload Field */}
            <ImageUpload
              label="Item Image"
              onImageChange={handleImageChange}
              maxSize={5}
                accept="image/*"
              required
              error={errors.image?.message}
            />

            {/* Price Field */}
            <InputText
              label="Price"
              labelIcon={FaRupeeSign}
                type="number"
                name="price"
              placeholder="0.00"
              icon={FaRupeeSign}
              min="0"
              step="0.01"
              required
              error={errors.price}
              register={register("price", {
                required: "Price is required",
                min: {
                  value: 0.01,
                  message: "Price must be greater than 0"
                },
                valueAsNumber: true
              })}
              />

            {/* Category Field */}
            <InputSelect
              label="Category"
              labelIcon={FaList}
              name="category"
              icon={FaList}
              options={[
                { value: '', label: 'Select a category' },
                ...CATEGORIES.map(c => ({ value: c, label: c }))
              ]}
              required
              error={errors.category}
              register={register("category", {
                required: "Please select a category",
                validate: (value) => value !== '' || "Please select a category"
              })}
            />

            {/* Food Type Field */}
            <InputSelect
              label="Food Type"
              labelIcon={FaLeaf}
              name="foodType"
              icon={FaLeaf}
              options={[
                { value: 'veg', label: 'Vegetarian' },
                { value: 'non veg', label: 'Non-Vegetarian' }
              ]}
              required
              error={errors.foodType}
              register={register("foodType", {
                required: "Please select a food type"
              })}
            />

            {/* Submit Button */}
            <div className="pt-4">
              <ButtonSquare 
                type="submit" 
                styleType="default" 
                className="w-full py-3.5 text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]" 
                loading={loading}
              > 
                Add Item
              </ButtonSquare>
            </div>
          </form>
        </div>
      </div>
    );
}

export default AddItem
