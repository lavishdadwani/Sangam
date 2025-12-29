import React, { useCallback, useEffect, useRef, useState } from "react";
import { FaCircleChevronLeft, FaCircleChevronRight } from "react-icons/fa6";
import { FaStore } from "react-icons/fa";

const HorizontalScrollSection = ({
  title,
  items = [],
  renderItem,
  emptyMessage = "No items found",
  containerClassName = "",
  scrollAmount = 220,
  showNavigation = true,
}) => {
  const scrollRef = useRef(null);
  const [showLeftButton, setShowLeftButton] = useState(false);
  const [showRightButton, setShowRightButton] = useState(true);

  const updateButtons = useCallback(() => {
    const element = scrollRef.current;
    if (!element) return;

    const { scrollLeft, clientWidth, scrollWidth } = element;
    setShowLeftButton(scrollLeft > 0);
    setShowRightButton(scrollLeft + clientWidth < scrollWidth - 1);
  }, []);

  const scrollHandler = (direction) => {
    if (!scrollRef.current) return;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -scrollAmount : scrollAmount,
      behavior: "smooth",
    });
  };

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    updateButtons();
    element.addEventListener("scroll", updateButtons);
    window.addEventListener("resize", updateButtons);

    return () => {
      element.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [items, updateButtons]);

  return (
    <div className={`w-full max-w-6xl flex flex-col gap-5 items-start p-[10px] ${containerClassName}`}>
      {title && (
        <h1 className="text-gray-800 text-2xl sm:text-3xl">
          {title}
        </h1>
      )}
      <div className="w-full relative">
        {showNavigation && showLeftButton && (
          <button
            className="absolute left-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
            onClick={() => scrollHandler("left")}
          >
            <FaCircleChevronLeft />
          </button>
        )}
        <div
          className="w-full flex flex-nowrap overflow-x-auto gap-4 pb-2 scrollbar-thin scrollbar-thumb-[#ff4d2d] scrollbar-track-transparent scroll-smooth"
          ref={scrollRef}
          style={{ WebkitOverflowScrolling: 'touch' }}
        >
          {items?.length > 0
            ? items.map((item, index) => renderItem(item, index))
            : (
              <div className="w-full flex flex-col items-center justify-center py-12 px-4 min-h-[200px]">
                <div className="flex flex-col items-center justify-center gap-4">
                  <div className="bg-gray-100 rounded-full p-6">
                    <FaStore className="text-gray-400 text-5xl" />
                  </div>
                  <div className="text-center">
                    <p className="text-gray-600 text-lg font-medium mb-1">
                      {emptyMessage}
                    </p>
                    <p className="text-gray-400 text-sm">
                      Check back later for new additions
                    </p>
                  </div>
                </div>
              </div>
            )
          }
        </div>
        {showNavigation && showRightButton && (
          <button
            className="absolute right-0 top-1/2 -translate-y-1/2 bg-[#ff4d2d] text-white p-2 rounded-full shadow-lg hover:bg-[#e64528] z-10"
            onClick={() => scrollHandler("right")}
          >
            <FaCircleChevronRight />
          </button>
        )}
      </div>
    </div>
  );
};

export default HorizontalScrollSection;

