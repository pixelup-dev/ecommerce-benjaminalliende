import React from "react";

const CustomButtonGroupAsArrows = ({ next, previous }: any) => {
  return (
    <div className="absolute inset-y-0 left-0 right-0 flex items-center justify-between px-4 pointer-events-none">
      <button
        className="bg-gray-200 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center pointer-events-auto hover:bg-gray-300"
        onClick={previous}
      >
        &#8592;
      </button>
      <button
        className="bg-gray-200 text-gray-700 rounded-full h-10 w-10 flex items-center justify-center pointer-events-auto hover:bg-gray-300"
        onClick={next}
      >
        &#8594;
      </button>
    </div>
  );
};

export default CustomButtonGroupAsArrows;
