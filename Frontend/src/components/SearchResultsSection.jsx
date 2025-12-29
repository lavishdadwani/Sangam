import React from "react";

const SearchResultsSection = ({ items = [], renderItem, title = "Search Results", emptyMessage = "No results found" }) => {
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-6xl flex flex-col gap-5 items-start p-5 bg-white shadow-md rounded-2xl mt-4">
      <h1 className="text-gray-900 text-2xl sm:text-3xl font-semibold border-b border-gray-200 pb-2 w-full">
        {title}
      </h1>
      <div className="w-full h-auto flex flex-wrap gap-6 justify-center">
        {items.map((item, index) => renderItem(item, index))}
      </div>
    </div>
  );
};

export default SearchResultsSection;

