/* eslint-disable @next/next/no-img-element */
import React from "react";

const Thumbnail: React.FC<any> = ({ imageUrl, onDelete }) => {
  const handleDelete = () => {
    // Lógica para eliminar la imagen
    onDelete();
  };

  return (
    <div className="thumbnail-container">
      <img
        src={imageUrl}
        alt="Thumbnail"
        className="thumbnail-image"
      />
      <button
        onClick={handleDelete}
        className="delete-button"
      >
        Eliminar
      </button>
    </div>
  );
};

export default Thumbnail;
