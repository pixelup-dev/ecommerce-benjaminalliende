/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useState } from "react";

interface ImageData {
  name: string;
  type: string;
  size: number;
  base64: string;
}

const ImageToBase64Converter = () => {
  const [imagesData, setImagesData] = useState<ImageData[]>([]);

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newImagesData: ImageData[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      try {
        const base64 = await convertToBase64(file);
        newImagesData.push({
          name: file.name,
          type: file.type,
          size: file.size,
          base64: base64,
        });
      } catch (error) {
        console.error(`Error al convertir ${file.name}:`, error);
      }
    }

    setImagesData(newImagesData);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAllImages = () => {
    const allImagesJson = imagesData.map((img) => ({
      name: img.name,
      type: img.type,
      size: img.size,
      data: img.base64,
    }));
    copyToClipboard(JSON.stringify(allImagesJson, null, 2));
  };

  const downloadJson = () => {
    const allImagesJson = imagesData.map((img) => ({
      name: img.name,
      type: img.type,
      size: img.size,
      data: img.base64,
    }));
    const blob = new Blob([JSON.stringify(allImagesJson, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "imagenes_base64.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearImages = () => {
    setImagesData([]);
  };

  return (
    <div className="mx-auto p-6">
      <h2 className="text-xl font-bold mb-4">
        Convertidor de Imágenes a Base64
      </h2>

      <div className="mb-6">
        <label className="block mb-2">
          <span className="text-gray-700">Seleccionar imágenes</span>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-full file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100
                            mt-1"
          />
        </label>
      </div>

      {imagesData.length > 0 && (
        <>
          <div className="flex gap-4 mb-6">
            <button
              onClick={copyAllImages}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              Copiar Todas las Imágenes
            </button>
            <button
              onClick={downloadJson}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              Descargar JSON
            </button>
            <button
              onClick={clearImages}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Limpiar
            </button>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-semibold">Resultados:</h3>
              <p className="text-sm text-gray-600">
                Total: {imagesData.length}{" "}
                {imagesData.length === 1 ? "imagen" : "imágenes"}
              </p>
            </div>
            {imagesData.map((img, index) => (
              <div
                key={index}
                className="border rounded-lg p-4 bg-gray-50"
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{img.name}</p>
                    <p className="text-sm text-gray-600">Tipo: {img.type}</p>
                    <p className="text-sm text-gray-600">
                      Tamaño: {(img.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <button
                    onClick={() =>
                      copyToClipboard(
                        JSON.stringify(
                          {
                            name: img.name,
                            type: img.type,
                            size: img.size,
                            data: img.base64,
                          },
                          null,
                          2
                        )
                      )
                    }
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
                  >
                    Copiar JSON
                  </button>
                </div>
                <img
                  src={img.base64}
                  alt={img.name}
                  className="w-32 h-32 object-cover rounded"
                />
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ImageToBase64Converter;
