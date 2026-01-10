import React, { useEffect, useState } from "react";
import Nav from "./Navbar";
import { useSelector } from "react-redux";
import { categories } from "../categories";
import CategoryCard from "./CategoryCard";
import HorizontalScrollSection from "./HorizontalScrollSection";
import FoodCard from "./FoodCard";
import SearchResultsSection from "./SearchResultsSection";
import { useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const { userData, currentCity, shopsInMyCity = [], itemsInMyCity = [], cartItems, searchItems, myOrders } = useSelector((state) => state.user);

  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const [selectedCategory, setSelectedCategory] = useState(null)
  const navigate = useNavigate()
  
  const handleFilterByCategory = (category) =>{
    setSelectedCategory(category)
    if(category === "All"){
        setUpdatedItemsList(itemsInMyCity)
    }else{
        const filteredList = itemsInMyCity.filter( i => i.category === category)
        setUpdatedItemsList(filteredList)
    }
  }
  
  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
    setSelectedCategory(null) // Reset filter when items change
  }, [itemsInMyCity]);


  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6] overflow-y-auto">
      <Nav userData={userData} currentCity={currentCity} cartItems={cartItems} myOrders={myOrders} />
      
      <SearchResultsSection
        items={searchItems}
        title="Search Results"
        renderItem={(item) => <FoodCard data={item} key={item._id} />}
      />
      <HorizontalScrollSection
        title="Inspiration for your first order"
        items={categories}
        containerClassName="mt-[80px]"
        renderItem={(category, index) => (
          <CategoryCard 
            name={category.category} 
            image={category.image} 
            key={index} 
            onClick={()=> handleFilterByCategory(category.category)}
            isSelected={selectedCategory === category.category}
          />
        )}
      />
      
      {/* Active Filter Indicator */}
      {selectedCategory && (
        <div className="w-full flex items-center gap-3 px-5 py-3 mx-4 md:mx-6 lg:mx-8 bg-white rounded-xl shadow-md border border-[#ff4d2d]/20">
          <span className="text-sm text-gray-600">Filtered by:</span>
          <span className="px-4 py-1.5 bg-[#ff4d2d] text-white rounded-full text-sm font-semibold shadow-sm">
            {selectedCategory}
          </span>
          <button
            onClick={() => {
              setSelectedCategory(null)
              setUpdatedItemsList(itemsInMyCity)
            }}
            className="ml-auto text-sm text-[#ff4d2d] hover:text-[#e64323] font-medium hover:underline transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}

      <HorizontalScrollSection
        title={`Best Shop in ${currentCity || "your city"}`}
        items={shopsInMyCity}
        containerClassName=""
        emptyMessage="There are no shops in your area"
        renderItem={(shop, index) => (
          <CategoryCard name={shop.name} image={shop.image} key={shop._id || index} onClick={()=> navigate(`/shop/${shop._id}`)} />
        )}
      />

      <HorizontalScrollSection
        title={`Suggested Food Items`}
        items={updatedItemsList}
        containerClassName=""
        emptyMessage="There are no items in your area"
        renderItem={(item, index) => (
          <FoodCard data={item} key={item.id || index} />
        )}
      />
    </div>
  );
};

export default UserDashboard;
