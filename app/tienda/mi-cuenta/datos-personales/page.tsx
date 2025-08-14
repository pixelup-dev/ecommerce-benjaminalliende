/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import { useState, useEffect } from "react";
import { getCookie } from "cookies-next";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import { obtenerClienteID } from "@/app/utils/obtenerClienteID";
import toast from "react-hot-toast";

const DatosPersonales: React.FC<any> = () => {
  const Token = getCookie("ClientTokenAuth");
  const decodeToken = Token ? jwtDecode(Token) : null;

  const [formData, setFormData] = useState({
    regions: [],
    communes: [],
    selectedRegion: "",
    selectedCommune: "",
    firstName: "",
    lastName: "",
    address: "",
    email: "",
    phone: "",
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    repeatNewPassword: "",
    showCurrentPassword: false,
    showNewPassword: false,
    showRepeatNewPassword: false,
  });

  const [errors, setErrors] = useState<string[]>([]);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  // Función para obtener y actualizar los datos del usuario
  const fetchData = async () => {
    const id = decodeToken?.sub;
    try {
      const userData = await obtenerClienteID(id, Token);
      const userDataInfo = userData.customer;

      setFormData((prevData) => ({
        ...prevData,
        firstName: userDataInfo.firstname || "",
        lastName: userDataInfo.lastname || "",
        email: userDataInfo.email || "",
        phone: userDataInfo.phoneNumber || "",
        address: userDataInfo.addressLine1 || "",
        selectedRegion: userDataInfo.commune.region.id || "",
        selectedCommune: userDataInfo.commune.id || "",
      }));

      if (userDataInfo.commune.region.id) {
        fetchCommunes(userDataInfo.commune.region.id);
      }
    } catch (error) {
      console.error("Error " + error);
    }
  };

  useEffect(() => {
    fetchData(); // Llama a fetchData al montar el componente
    fetchRegions(); // También llama a fetchRegions
  }, []); // Los corchetes vacíos indican que se ejecuta una sola vez al montar

  const fetchRegions = async () => {
    try {
      const Pais = "CL";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setFormData((prevData) => ({
        ...prevData,
        regions: response.data.regions,
      }));
    } catch (error) {
      console.error("Error fetching regions:", error);
    }
  };

  const fetchCommunes = async (regionId: any) => {
    try {
      const Pais = "CL";
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/countries/${Pais}/regions/${regionId}/communes?siteId=${process.env.NEXT_PUBLIC_API_URL_SITEID}`
      );
      setFormData((prevData) => ({
        ...prevData,
        communes: response.data.communes,
      }));
    } catch (error) {
      console.error("Error fetching communes:", error);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));

    if (name === "selectedRegion") {
      setFormData((prevData) => ({
        ...prevData,
        selectedCommune: "",
        communes: [],
      }));
      if (value) {
        fetchCommunes(value);
      }
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const toggleShowPassword = (field: string) => {
    setPasswordData((prevData: any) => ({
      ...prevData,
      [field]: !prevData[field],
    }));
  };

  const validateEmail = (email: string) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  };

  const validatePhone = (phone: string) => {
    const regex = /^[0-9]{9}$/;
    return regex.test(phone);
  };

  const validateForm = () => {
    const validationErrors = [];
    if (!validateEmail(formData.email)) {
      validationErrors.push("El correo no es válido.");
    }
    if (!validatePhone(formData.phone)) {
      validationErrors.push("El número de celular no es válido.");
    }
    setErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const validatePasswordForm = () => {
    const validationErrors = [];
    if (passwordData.newPassword.length < 8) {
      validationErrors.push(
        "La nueva contraseña debe tener al menos 8 caracteres."
      );
    }
    if (passwordData.newPassword !== passwordData.repeatNewPassword) {
      validationErrors.push("Las nuevas contraseñas no coinciden.");
    }
    setPasswordErrors(validationErrors);
    return validationErrors.length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      try {
        const id = decodeToken?.sub;
        const payload = {
          firstname: formData.firstName,
          lastname: formData.lastName,
          phoneNumber: formData.phone,
          addressLine1: formData.address,
          communeId: formData.selectedCommune,
        };
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
        const response = await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}?siteId=${SiteId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "application/json",
            },
          }
        );
        fetchData(); // Actualiza los datos del usuario después de enviar el formulario
        toast.success("Información actualizada con éxito!");
      } catch (error) {
        console.error("Error al actualizar la información del usuario:", error);
      }
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (validatePasswordForm()) {
      try {
        const id = decodeToken?.sub;
        const payload = {
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
          confirmNewPassword: passwordData.repeatNewPassword,
        };
        const SiteId = process.env.NEXT_PUBLIC_API_URL_SITEID;
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL_CLIENTE}/api/v1/customers/${id}/passwords?siteId=${SiteId}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${Token}`,
              "Content-Type": "application/json",
            },
          }
        );
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          repeatNewPassword: "",
          showCurrentPassword: false,
          showNewPassword: false,
          showRepeatNewPassword: false,
        });
        toast.success("¡Contraseña actualizada con éxito!");
      } catch (error: any) {
        console.error("Error al actualizar la contraseña:", error);
        if (
          error.response &&
          error.response.data &&
          error.response.data.code === 2
        ) {
          setPasswordErrors([
            "Credenciales inválidas: La contraseña actual es incorrecta.",
          ]);
        } else if (
          error.response &&
          error.response.data &&
          error.response.data.errors
        ) {
          setPasswordErrors(
            error.response.data.errors.map((err: any) => err.message)
          );
        } else {
          setPasswordErrors([
            "Error al actualizar la contraseña. Por favor, intenta nuevamente más tarde.",
          ]);
        }
      }
    }
  };

  return (
    <div className="pb-10 flex items-center justify-center relative ">
      <div className="relative z-10 mx-auto min-w-[400px] w-[90%] max-w-[800px] px-6 lg:px-8 py-20">
        <div
          className="bg-white shadow-xl"
          style={{ borderRadius: "var(--radius)" }}
        >
          <form
            onSubmit={handleSubmit}
            className=" p-7 mx-auto border-b"
          >
            <div className="mb-11">
              <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">
                Datos Personales
              </h1>
            </div>
            <div className="flex space-x-4 mb-6">
              <div className="w-1/2">
                <label className="block text-gray-700">Nombre*</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                  placeholder="Nombre"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
              <div className="w-1/2">
                <label className="block text-gray-700">Apellido*</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                  placeholder="Apellido"
                  style={{ borderRadius: "var(--radius)" }}
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700">Celular*</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Celular"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Región*</label>
              <select
                name="selectedRegion"
                value={formData.selectedRegion}
                onChange={handleInputChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value="">Selecciona una región</option>
                {formData.regions.map((region: any) => (
                  <option
                    key={region.id}
                    value={region.id}
                  >
                    {region.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Comuna*</label>
              <select
                name="selectedCommune"
                value={formData.selectedCommune}
                onChange={handleInputChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                style={{ borderRadius: "var(--radius)" }}
              >
                <option value="">Selecciona una comuna</option>
                {formData.communes.map((commune: any) => (
                  <option
                    key={commune.id}
                    value={commune.id}
                  >
                    {commune.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="mb-6">
              <label className="block text-gray-700">Dirección*</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Dirección"
                style={{ borderRadius: "var(--radius)" }}
              />
            </div>
            {errors.length > 0 && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                role="alert"
              >
                <p className="font-bold">Errores:</p>
                <ul>
                  {errors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-center">
              <button
                type="submit"
                className="bg-primary hover:bg-secondary text-white hover:text-primary font-bold py-2 px-4 rounded"
              >
                Actualizar Información
              </button>
            </div>
          </form>

          <form
            onSubmit={handlePasswordSubmit}
            className="p-7 mx-auto "
          >
            <div className="mb-11">
              <h1 className="text-gray-900 text-center font-manrope text-3xl font-bold leading-10 mb-2">
                Actualizar Contraseña
              </h1>
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700">Contraseña Actual*</label>
              <input
                type={passwordData.showCurrentPassword ? "text" : "password"}
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Contraseña Actual"
                style={{ borderRadius: "var(--radius)" }}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("showCurrentPassword")}
                className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-600"
              >
                {passwordData.showCurrentPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700">Nueva Contraseña*</label>
              <input
                type={passwordData.showNewPassword ? "text" : "password"}
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Nueva Contraseña"
                style={{ borderRadius: "var(--radius)" }}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("showNewPassword")}
                className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-600"
              >
                {passwordData.showNewPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
            <div className="mb-6 relative">
              <label className="block text-gray-700">
                Repetir Nueva Contraseña*
              </label>
              <input
                type={passwordData.showRepeatNewPassword ? "text" : "password"}
                name="repeatNewPassword"
                value={passwordData.repeatNewPassword}
                onChange={handlePasswordChange}
                className="shadow w-full h-12 text-gray-900 placeholder:text-gray-400 text-lg font-normal leading-7 border-gray-300 border focus:outline-none px-4"
                placeholder="Repetir Nueva Contraseña"
                style={{ borderRadius: "var(--radius)" }}
              />
              <button
                type="button"
                onClick={() => toggleShowPassword("showRepeatNewPassword")}
                className="absolute right-4 top-12 transform -translate-y-1/2 text-gray-600"
              >
                {passwordData.showRepeatNewPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                    />
                  </svg>
                )}
              </button>
            </div>
            {passwordErrors.length > 0 && (
              <div
                className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4"
                role="alert"
              >
                <p className="font-bold">Errores:</p>
                <ul>
                  {passwordErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}
            <div className="text-center">
              <button
                type="submit"
                className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
              >
                Actualizar Contraseña
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default DatosPersonales;
