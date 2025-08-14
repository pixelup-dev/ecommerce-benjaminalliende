import React, { useRef, useEffect } from "react";

interface ModalPesoImagenProps {
  showModal: boolean;
  onClose: () => void;
}

const ModalPesoImagen: React.FC<ModalPesoImagenProps> = ({ showModal, onClose }) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showModal, onClose]);

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm"></div>
      <div ref={modalRef} className="relative w-[95%] md:w-[80%] max-w-md bg-white rounded-lg shadow-xl overflow-hidden">
        <div className="sticky top-0 bg-white p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-semibold text-gray-900">
            Cómo reducir el peso de tus imágenes
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-6 h-6"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Reducir el peso de tus imágenes es una tarea importante para mejorar el rendimiento de tu sitio web.
            </p>
            <ol className="list-inside list-decimal space-y-2 text-sm text-gray-600">
              <li>
                Ingresa a la siguiente página{" "}
                <a
                  href="https://squoosh.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800"
                >
                  https://squoosh.app/
                </a>
              </li>
              <li>Selecciona la imagen que desees cargar.</li>
              <li>En el apartado de la derecha (Compress) selecciona la opcion &quot;Webp&quot;.</li>
              <li>Da click en el botón azul de la esquina inferior derecha</li>
            </ol>
            <p className="text-sm text-rosa">
              Recuerda que el peso máximo permitido es de 5MB. En caso de que no logres el peso necesario, intenta moviendo la barra de &quot;Quality&quot; para regular el peso/calidad.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModalPesoImagen;
