import React, { useEffect, useState } from "react";
import Nav from "./Navbar";
import { useSelector } from "react-redux";
import { categories } from "../categories";
import CategoryCard from "./CategoryCard";
import HorizontalScrollSection from "./HorizontalScrollSection";
import FoodCard from "./FoodCard";
import { useNavigate } from "react-router-dom";
import itemAPI from "../../services/item"

const UserDashboard = () => {
  const { userData, currentCity, shopsInMyCity = [], itemsInMyCity = [], cartItems, searchItems, myOrders } = useSelector((state) => state.user);

  const [updatedItemsList, setUpdatedItemsList] = useState([])
  const navigate = useNavigate()
  const handleFilterByCategory = (category) =>{
    if(category === "All"){
        setUpdatedItemsList(itemsInMyCity)
    }else{
        const filteredList = itemsInMyCity.filter( i => i.category === category)
        setUpdatedItemsList(filteredList)
    }
  }
  useEffect(() => {
    setUpdatedItemsList(itemsInMyCity)
  }, [itemsInMyCity]);


  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6 overflow-y-auto">
      <Nav userData={userData} currentCity={currentCity} cartItems={cartItems} myOrders={myOrders} />
      {searchItems && searchItems.length > 0 && (
        <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
            <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2">
                Search Result
            </h1>
            <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
                {searchItems.map(item =>(
                    <FoodCard data={item} key={item._id} />
                ))}
            </div>
        </div>
      )}
      <HorizontalScrollSection
        title="Inspiration for your first order"
        items={categories}
        containerClassName="mt-[80px]"
        renderItem={(category, index) => (
          <CategoryCard name={category.category} image={category.image} key={index} onClick={()=> handleFilterByCategory(category.category)} />
        )}
      />

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
