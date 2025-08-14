import React from "react";

interface ModalProps {
  mensaje: string;
  onClose: () => void;
}

const Modal: React.FC<ModalProps> = ({ mensaje, onClose }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-xs text-center">
        <div className="mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="mx-auto h-12 w-12 text-green-500"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold mb-2">
          Gracias por tu calificación
        </h2>
        <p className="text-gray-600 mb-4">{mensaje}</p>
        <button
          onClick={onClose}
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

export default Modal;
