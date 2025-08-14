import React from "react";

const StarCheckbox = ({
  isChecked,
  onChange,
}: {
  isChecked: boolean;
  onChange: () => void;
}) => {
  return (
    <label className="relative cursor-pointer">
      <input
        type="checkbox"
        checked={isChecked}
        onChange={onChange}
        className="absolute opacity-0 w-0 h-0"
      />
      <svg
        className={`w-10 h-10 ${
          isChecked ? "text-yellow-500" : "text-gray-400"
        }`}
        fill="currentColor"
        viewBox="0 0 20 20"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.95a1 1 0 00.95.69h4.163c.969 0 1.372 1.24.588 1.81l-3.37 2.452a1 1 0 00-.364 1.118l1.286 3.95c.3.921-.755 1.688-1.54 1.118l-3.37-2.452a1 1 0 00-1.176 0l-3.37 2.452c-.784.57-1.838-.197-1.54-1.118l1.286-3.95a1 1 0 00-.364-1.118L2.52 9.377c-.784-.57-.381-1.81.588-1.81h4.163a1 1 0 00.95-.69l1.286-3.95z" />
      </svg>
    </label>
  );
};

export default StarCheckbox;
