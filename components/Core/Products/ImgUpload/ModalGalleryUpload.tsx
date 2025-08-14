import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed top-0 left-0 w-full h-full bg-black  bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-md">
        <p className="text-lg font-semibold mb-4">Warning</p>
        <p className="text-gray-700">
          Solo se pueden subir un máximo de 4 imagenes.
        </p>
        <button
          onClick={onClose}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded-md"
        >
          OK
        </button>
      </div>
    </div>
  );
};

export default Modal;
