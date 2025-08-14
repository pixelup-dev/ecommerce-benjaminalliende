/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState, ChangeEvent, useCallback } from "react";
import axios from "axios";
import { getCookie } from "cookies-next";
import toast from "react-hot-toast";
import Cropper from "react-easy-crop";
import imageCompression from "browser-image-compression";
import Modal from "@/components/Core/Modals/ModalSeo";
import { getCroppedImg } from "@/lib/cropImage";
import ReactDOM from "react-dom";

interface CrearUsuarioFormProps {
  onClose: () => void;
  fetchData: any;
}

const CrearUsuarioForm: React.FC<CrearUsuarioFormProps> = ({
  onClose,
  fetchData,
}) => {
  const [avatarImage, setAvatarImage] = useState<string | null>(null);
  const [avatarImageFile, setAvatarImageFile] = useState<File | null>(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    avatarImage: {
      name: "",
      type: "",
      size: null,
      data: "",
    },
  });

  const [imageToCrop, setImageToCrop] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const handleChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        setImageToCrop(result);
        setAvatarImageFile(file);
        setIsModalOpen(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleCrop = async () => {
    if (!imageToCrop) return;

    try {
      const croppedImage = await getCroppedImg(imageToCrop, croppedAreaPixels);
      const options = {
        maxSizeMB: 1,
        maxWidthOrHeight: 800,
        useWebWorker: true,
        initialQuality: 0.9,
      };
      const compressedFile = await imageCompression(
        croppedImage as File,
        options
      );
      const base64 = await convertToBase64(compressedFile);

      setAvatarImage(base64);
      setFormData((prevFormData: any) => ({
        ...prevFormData,
        avatarImage: {
          name: avatarImageFile?.name || "avatar",
          type: compressedFile.type,
          size: compressedFile.size,
          data: base64,
        },
      }));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Error al recortar/comprimir la imagen:", error);
    }
  };

  const convertToBase64 = (file: Blob) => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleClearImage = () => {
    setAvatarImage(null);
    setAvatarImageFile(null);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const token = String(getCookie("AdminTokenAuth"));
      const newUser = {
        ...formData,
        statusCode: "ACTIVE",
        roleId: "ad944aa1-8fae-47e9-90b8-048a04cf86c1",
      };

      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL_BO_CLIENTE}/api/v1/users?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`,
        newUser,
        config
      );
      console.log("Usuario creado con éxito:", response.data);
      fetchData();
      toast.success("Usuario creado con éxito!");
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        avatarImage: {
          name: "",
          type: "",
          size: null,
          data: "",
        },
      });
      setAvatarImageFile(null);
      setAvatarImage(null);
      onClose();
    } catch (error) {
      console.log(error);
      toast.error("Error al crear el usuario.");
    }
  };

  const renderModal = () => {
    return (
      isModalOpen &&
      ReactDOM.createPortal(
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-lg mx-auto p-4 rounded shadow-lg">
            <Modal
              showModal={isModalOpen}
              onClose={() => setIsModalOpen(false)}
            >
              <div className="relative h-96 w-full">
                <Cropper
                  image={imageToCrop || ""}
                  crop={crop}
                  zoom={zoom}
                  aspect={1}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={handleCropComplete}
                />
              </div>
              <div className="flex justify-end mt-4 space-x-4">
                <button
                  onClick={handleCrop}
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                >
                  Recortar y Subir
                </button>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                >
                  Cancelar
                </button>
              </div>
            </Modal>
          </div>
        </div>,
        document.body
      )
    );
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full mx-auto"
      >
        {/* Campo para el nombre */}
        <div className="mb-4">
          <label
            htmlFor="firstname"
            className="block text-sm font-medium text-secondary"
          >
            Nombre*
          </label>
          <input
            type="text"
            id="firstname"
            name="firstname"
            value={formData.firstname}
            onChange={handleChange}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        {/* Campo para el apellido */}
        <div className="mb-4">
          <label
            htmlFor="lastname"
            className="block text-sm font-medium text-secondary"
          >
            Apellido*
          </label>
          <input
            type="text"
            id="lastname"
            name="lastname"
            value={formData.lastname}
            onChange={handleChange}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        {/* Campo para el email */}
        <div className="mb-2">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-secondary"
          >
            Correo electrónico*
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="mt-1 p-2 w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500"
            required
          />
        </div>
        {/* Campo para la imagen */}
        <h1 className="text-secondary text-left">Avatar</h1>
        <div className="my-2">
          <div className="flex justify-center">
            <input
              type="file"
              accept="image/*"
              id="avatarImage"
              className="hidden"
              onChange={handleImageChange}
            />
            {avatarImage ? (
              <div className="text-center">
                <div className="flex justify-center mt-2">
                  <div className="relative w-[150px] h-[150px] rounded-lg overflow-hidden">
                    <img
                      src={avatarImage}
                      alt="Avatar"
                      className="object-cover w-full h-full"
                    />
                    <button
                      className="absolute top-0 right-0 bg-red-500 hover:bg-red-700 text-white rounded-full p-1 m-1 text-xs"
                      onClick={handleClearImage}
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
                          d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mt-2">
                  <label
                    htmlFor="avatarImage"
                    className="text-center flex flex-col bg-white justify-center items-center border border-dashed border-dark/50 rounded-lg cursor-pointer w-[150px] h-[150px]"
                  >
                    <div className="flex flex-col justify-center items-center">
                      <svg
                        className="w-12 h-12 text-gray-400"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                        <span className="font-semibold">Subir Imagen</span>
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        PNG, JPG o Webp (800x800px)
                      </p>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
        {/* Botón de envío */}
        <div className="mb-4">
          <button
            type="submit"
            className="mt-8 w-full py-2 px-4 border border-transparent font-bold uppercase rounded-md shadow-sm text-black hover:text-secondary bg-secondary hover:bg-primary focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white"
          >
            Crear Usuario
          </button>
        </div>
      </form>
      {/* Renderizar el modal fuera del offcanvas */}
      {renderModal()}
    </>
  );
};

export default CrearUsuarioForm;
