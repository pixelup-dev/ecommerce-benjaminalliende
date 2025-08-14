import React, { useEffect } from "react";

interface ModalProps {
  showModal: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string; // Opcional: Título del modal
}

const Modal: React.FC<ModalProps> = ({
  showModal,
  onClose,
  children,
  title,
}) => {
  useEffect(() => {
    // Cerrar modal al presionar Esc
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (showModal) {
      document.addEventListener("keydown", handleKeyDown);
    } else {
      document.removeEventListener("keydown", handleKeyDown);
    }

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [showModal, onClose]);

  if (!showModal) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
      aria-hidden={!showModal}
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div
        className="relative w-[400px] mx-2 p-4 pt-8 bg-white rounded-lg shadow-lg animate-fade-in-up"
        style={{ borderRadius: "var(--radius)" }}
      >
        <button
          onClick={onClose}
          className="absolute top-1 right-1 z-50 text-gray-500 hover:text-gray-800"
          aria-label="Cerrar modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="currentColor"
            className="h-6 w-6"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        {title && (
          <h2
            id="modal-title"
            className="text-xl font-semibold text-gray-800 mb-4"
          >
            {title}
          </h2>
        )}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
