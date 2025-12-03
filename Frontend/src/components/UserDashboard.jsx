import React from "react";
import Nav from "./Navbar";
import { useSelector } from "react-redux";
import { categories } from "../categories";
import CategoryCard from "./CategoryCard";
import HorizontalScrollSection from "./HorizontalScrollSection";
import FoodCard from "./FoodCard";

const UserDashboard = () => {
  const { userData, currentCity, shopsInMyCity = [], itemsInMyCIty = [], cartItems } = useSelector((state) => state.user);

  return (
    <div className="w-screen min-h-screen flex flex-col gap-5 items-center bg-[#fff9f6 overflow-y-auto">
      <Nav userData={userData} currentCity={currentCity} cartItems={cartItems} />

      <HorizontalScrollSection
        title="Inspiration for your first order"
        items={categories}
        containerClassName="mt-[80px]"
        renderItem={(category, index) => (
          <CategoryCard name={category.category} image={category.image} key={index} />
        )}
      />

      <HorizontalScrollSection
        title={`Best Shop in ${currentCity || "your city"}`}
        items={shopsInMyCity}
        containerClassName=""
        emptyMessage="There are no shops in your area"
        renderItem={(shop, index) => (
          <CategoryCard name={shop.name} image={shop.image} key={shop.id || index} />
        )}
      />

      <HorizontalScrollSection
        title={`Suggested Food Items`}
        items={itemsInMyCIty}
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
